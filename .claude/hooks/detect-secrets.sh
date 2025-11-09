#!/bin/bash

# Hook para detectar credenciales y secrets hardcodeados
# Bloquea commits con API keys, tokens, passwords expuestos

json_input=$(cat)

# Extraer file_path y content
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')
new_content=$(echo "$json_input" | jq -r '.tool_input.new_string // .tool_input.content // empty')

# Si no hay contenido para validar, salir
if [ -z "$new_content" ]; then
    # Si es un archivo existente, leer contenido
    if [ -f "$file_path" ]; then
        new_content=$(cat "$file_path")
    else
        exit 0
    fi
fi

# Excluir archivos de configuración permitidos y node_modules
if [[ "$file_path" =~ node_modules ]] || \
   [[ "$file_path" =~ \.env\.example$ ]] || \
   [[ "$file_path" =~ \.md$ ]] || \
   [[ "$file_path" =~ \.txt$ ]]; then
    exit 0
fi

filename=$(basename "$file_path")
secrets_found=0

echo "🔒 Validando seguridad: $filename"

# Patrones de secrets a detectar
declare -A patterns=(
    ["API Key"]='(api[_-]?key|apikey)["\s]*[:=]["\s]*[a-zA-Z0-9_\-]{20,}'
    ["Secret Key"]='(secret[_-]?key|secretkey)["\s]*[:=]["\s]*[a-zA-Z0-9_\-]{20,}'
    ["JWT Token"]='ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
    ["Password"]='(password|passwd|pwd)["\s]*[:=]["\s]*["\047][^"\047]{8,}["\047]'
    ["Private Key"]='BEGIN.*PRIVATE.*KEY'
    ["AWS Key"]='AKIA[0-9A-Z]{16}'
    ["Google API"]='AIza[0-9A-Za-z_-]{35}'
    ["GitHub Token"]='gh[pousr]_[A-Za-z0-9_]{36,}'
    ["Stripe Key"]='(sk|pk)_(test|live)_[0-9a-zA-Z]{24,}'
    ["Database URL"]='(mongodb|postgres|mysql):\/\/[^\s]+(:[^\s]+)?@[^\s]+'
)

# Buscar cada patrón
for secret_type in "${!patterns[@]}"; do
    pattern="${patterns[$secret_type]}"

    if echo "$new_content" | grep -qiE "$pattern"; then
        # Verificar que no sea un comentario de ejemplo
        matching_lines=$(echo "$new_content" | grep -inE "$pattern")

        # Filtrar comentarios y ejemplos comunes
        if ! echo "$matching_lines" | grep -qiE '(\/\/.*ejemplo|\/\/.*example|\/\*.*ejemplo|\/\*.*example|#.*ejemplo|#.*example|\.example|\.sample|TODO|FIXME|XXX)'; then
            echo "  ❌ DETECTADO: $secret_type"
            echo "$matching_lines" | head -3 | sed 's/^/     /'
            secrets_found=1
        fi
    fi
done

# Validaciones específicas por tipo de archivo
if [[ "$file_path" =~ \.(ts|js|svelte)$ ]]; then
    # Detectar console.log con datos sensibles
    if echo "$new_content" | grep -qE 'console\.log.*\b(password|token|secret|key|credential)\b'; then
        echo "  ⚠️  ADVERTENCIA: console.log con datos potencialmente sensibles"
        secrets_found=1
    fi

    # Detectar eval() o Function() (riesgo de seguridad)
    if echo "$new_content" | grep -qE '\b(eval|Function)\s*\('; then
        echo "  ⚠️  RIESGO: Uso de eval() o Function() detectado"
    fi
fi

echo ""

if [ $secrets_found -eq 1 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ VALIDACIÓN DE SEGURIDAD FALLIDA"
    echo ""
    echo "   Se detectaron credenciales o secrets hardcodeados."
    echo ""
    echo "   ✅ Soluciones:"
    echo "   1. Usar variables de entorno (.env)"
    echo "   2. Usar archivos de configuración (.env.local)"
    echo "   3. Usar servicios de secrets management"
    echo ""
    echo "   NO commitear credenciales reales en el código."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 2
fi

echo "✅ Sin secrets detectados"
exit 0
