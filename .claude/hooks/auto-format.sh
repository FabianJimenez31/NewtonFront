#!/bin/bash

# Hook PostToolUse para auto-formatear código con Prettier
# Se ejecuta después de Edit/Write en archivos de código

json_input=$(cat)

file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')

# Si no hay file_path, salir
if [ -z "$file_path" ]; then
    exit 0
fi

# Solo formatear archivos de código
if [[ ! "$file_path" =~ \.(ts|js|svelte|css|json|html)$ ]]; then
    exit 0
fi

# Excluir node_modules, dist, build
if [[ "$file_path" =~ (node_modules|dist|build|\.next) ]]; then
    exit 0
fi

# Verificar que el archivo existe
if [ ! -f "$file_path" ]; then
    exit 0
fi

filename=$(basename "$file_path")

# Verificar si prettier está disponible
if ! command -v npx &> /dev/null; then
    exit 0
fi

echo "✨ Auto-formateando: $filename"

# Intentar formatear con prettier
if npx prettier --write "$file_path" --log-level silent 2>/dev/null; then
    echo "✅ Código formateado correctamente"
else
    echo "⚠️  No se pudo formatear (prettier no configurado o error de sintaxis)"
fi

exit 0
