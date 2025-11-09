#!/bin/bash

# Hook PreToolUse para validación de archivos CORE antes de modificarlos
# Detecta archivos core por: *.core.ts o comentario @core/@critical
# Ejecuta: smoke test + extracción de contrato + baseline

json_input=$(cat)

# Extraer file_path
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')

# Si no hay file_path, salir
if [ -z "$file_path" ]; then
    exit 0
fi

# Directorio de resultados
RESULTS_DIR="/tmp/claude-test-results"
mkdir -p "$RESULTS_DIR"

# Obtener nombre base y extensión
filename=$(basename "$file_path")
file_ext="${filename##*.}"

# Función para verificar si es archivo core
is_core_file() {
    local file="$1"

    # Método 1: Nombre contiene .core. (ej: auth.core.ts)
    if [[ "$filename" =~ \.core\. ]]; then
        return 0
    fi

    # Método 2: Archivo existe y tiene marcador @core o @critical
    if [ -f "$file" ]; then
        if grep -q -E '^\s*(//|/\*|\*)\s*@(core|critical)' "$file"; then
            return 0
        fi
    fi

    # Método 3: Contenido nuevo tiene marcador @core o @critical
    local new_content=$(echo "$json_input" | jq -r '.tool_input.content // empty')
    if [ -n "$new_content" ]; then
        if echo "$new_content" | grep -q -E '^\s*(//|/\*|\*)\s*@(core|critical)'; then
            return 0
        fi
    fi

    return 1
}

# Verificar si es archivo core
if ! is_core_file "$file_path"; then
    # No es archivo core, permitir sin validación
    exit 0
fi

echo "🔍 ARCHIVO CORE DETECTADO: $filename"
echo ""

# Verificar que sea TypeScript/JavaScript
if [[ ! "$file_ext" =~ ^(ts|js|svelte)$ ]]; then
    echo "⚠️  Archivo core no es TS/JS/Svelte, omitiendo validación técnica"
    exit 0
fi

# Hash del archivo para identificarlo
file_hash=$(echo -n "$file_path" | md5sum | cut -d' ' -f1)
baseline_file="$RESULTS_DIR/${file_hash}_baseline.json"
marker_file="$RESULTS_DIR/${file_hash}_marker.txt"

# Si el archivo existe, extraer su contrato
if [ -f "$file_path" ]; then
    echo "📋 Extrayendo contrato actual del archivo..."

    # Extraer exports, interfaces, types, functions
    contract=$(cat "$file_path" | grep -E '^\s*(export|interface|type|class|function|const|let|var)\s+' | sed 's/^\s*//' || echo "")

    # Guardar baseline
    cat > "$baseline_file" << EOF
{
  "file_path": "$file_path",
  "filename": "$filename",
  "timestamp": "$(date -Iseconds)",
  "contract": $(echo "$contract" | jq -Rs .)
}
EOF

    echo "✅ Baseline guardado en: ${baseline_file##*/}"
    echo ""

    # Smoke test: Intentar compilar con TypeScript (si está disponible)
    if command -v npx &> /dev/null && [ -f "$file_path" ]; then
        echo "🔥 Ejecutando smoke test (compilación TypeScript)..."

        if npx tsc --noEmit --skipLibCheck "$file_path" 2>/dev/null; then
            echo "✅ Smoke test PASADO: El archivo compila correctamente"
        else
            echo "⚠️  Smoke test: Advertencias de compilación detectadas"
            echo "   (Esto no bloquea la edición, pero revisa el código)"
        fi
        echo ""
    fi
else
    echo "📝 Archivo nuevo, no hay baseline previa"
    echo ""
fi

# Crear marker para PostToolUse
echo "$file_path" > "$marker_file"

# Crear flag especial para que Claude sepa que debe ejecutar Fase 2
phase2_marker="$RESULTS_DIR/${file_hash}_needs_agent.flag"
touch "$phase2_marker"

echo "⚠️  ADVERTENCIA: Este archivo es CORE/CRÍTICO"
echo "   - Se ha guardado un baseline de su contrato"
echo "   - Después de modificarlo se validará automáticamente"
echo "   - Claude ejecutará pruebas completas si es necesario"
echo ""
echo "✅ Validación PRE completada. Puedes continuar con la edición."

exit 0
