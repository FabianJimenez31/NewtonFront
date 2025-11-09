#!/bin/bash

# Hook PostToolUse para validación de archivos CORE después de modificarlos
# Compara contrato, ejecuta smoke test, detecta cambios críticos

json_input=$(cat)

# Extraer file_path
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')

# Si no hay file_path, salir
if [ -z "$file_path" ]; then
    exit 0
fi

# Directorio de resultados
RESULTS_DIR="/tmp/claude-test-results"

# Hash del archivo
file_hash=$(echo -n "$file_path" | md5sum | cut -d' ' -f1)
baseline_file="$RESULTS_DIR/${file_hash}_baseline.json"
marker_file="$RESULTS_DIR/${file_hash}_marker.txt"

# Verificar si hay marker (indica que se validó en PRE)
if [ ! -f "$marker_file" ]; then
    # No hay marker, no es archivo core o no pasó por PRE
    exit 0
fi

echo ""
echo "🔍 VALIDACIÓN POST-MODIFICACIÓN DE ARCHIVO CORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

filename=$(basename "$file_path")

# Verificar que el archivo aún exista
if [ ! -f "$file_path" ]; then
    echo "⚠️  Archivo eliminado durante la edición"
    rm -f "$marker_file"
    exit 0
fi

# Smoke test: Compilación TypeScript
echo "🔥 Ejecutando smoke test POST-modificación..."

compile_result=0
if command -v npx &> /dev/null; then
    if npx tsc --noEmit --skipLibCheck "$file_path" 2>/tmp/tsc-error.log; then
        echo "✅ Smoke test PASADO: El archivo compila correctamente"
        compile_result=0
    else
        echo "❌ Smoke test FALLIDO: El archivo NO compila"
        echo ""
        echo "Errores de compilación:"
        cat /tmp/tsc-error.log | head -20
        echo ""
        compile_result=1
    fi
else
    echo "⚠️  TypeScript no disponible, omitiendo smoke test"
fi

echo ""

# Extraer contrato actual
echo "📋 Extrayendo contrato POST-modificación..."

new_contract=$(cat "$file_path" | grep -E '^\s*(export|interface|type|class|function|const|let|var)\s+' | sed 's/^\s*//' || echo "")

# Comparar con baseline si existe
contract_changed=0
if [ -f "$baseline_file" ]; then
    old_contract=$(jq -r '.contract' "$baseline_file")

    if [ "$old_contract" != "$new_contract" ]; then
        echo "⚠️  CAMBIOS EN EL CONTRATO DETECTADOS:"
        echo ""
        echo "ANTES:"
        echo "$old_contract" | head -10
        echo ""
        echo "DESPUÉS:"
        echo "$new_contract" | head -10
        echo ""
        contract_changed=1
    else
        echo "✅ Contrato sin cambios (exports, tipos, interfaces intactos)"
    fi
else
    echo "ℹ️  No hay baseline previa (archivo nuevo)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Decisión final
if [ $compile_result -eq 1 ]; then
    echo "❌ VALIDACIÓN FALLIDA: Errores de compilación"
    echo ""
    echo "   El archivo core NO puede tener errores de compilación."
    echo "   Por favor, corrige los errores antes de continuar."
    echo ""
    # NO eliminar marker para que se re-valide
    exit 2
fi

if [ $contract_changed -eq 1 ]; then
    echo "⚠️  ADVERTENCIA: Contrato modificado en archivo CORE"
    echo ""
    echo "   Se detectaron cambios en exports/tipos/interfaces."
    echo "   Esto puede afectar a otros módulos que dependen de este archivo."
    echo ""
    echo "   🤖 Claude ejecutará pruebas completas (Fase 2) para validar"
    echo "      que la funcionalidad no se rompa."
    echo ""
fi

# Actualizar baseline con nueva versión
cat > "$baseline_file" << EOF
{
  "file_path": "$file_path",
  "filename": "$filename",
  "timestamp": "$(date -Iseconds)",
  "contract": $(echo "$new_contract" | jq -Rs .)
}
EOF

# Limpiar marker
rm -f "$marker_file"

echo "✅ Validación POST completada exitosamente"
echo ""

exit 0
