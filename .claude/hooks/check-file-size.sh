#!/bin/bash

# Leer JSON de Claude Code
json_input=$(cat)

# Extraer el nombre del archivo
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')

# Si no hay file_path, salir
if [ -z "$file_path" ]; then
    exit 0
fi

# Excluir archivos de documentación (.md, .txt, .rst)
if [[ "$file_path" =~ \.(md|txt|rst)$ ]]; then
    exit 0
fi

# Contar líneas
if [ -f "$file_path" ]; then
    line_count=$(wc -l < "$file_path")
else
    content=$(echo "$json_input" | jq -r '.tool_input.content // empty')
    if [ -n "$content" ]; then
        line_count=$(echo "$content" | wc -l)
    else
        exit 0
    fi
fi

# Validar límite de 300 líneas
if [ "$line_count" -gt 300 ]; then
    echo "❌ ERROR: El archivo '$file_path' tiene $line_count líneas."
    echo "   Límite máximo: 300 líneas."
    echo "   Por favor, divide el archivo en módulos más pequeños."
    exit 2
fi

echo "✅ Validación OK: $line_count líneas"
exit 0
