#!/bin/bash

# Hook para limpiar archivos de test después de ejecutar comandos de testing
# Se ejecuta DESPUÉS de: npm test, npm run test, vitest, jest, etc.

json_input=$(cat)

# Extraer el comando ejecutado
command=$(echo "$json_input" | jq -r '.tool_input.command // empty')

# Si no hay comando, salir
if [ -z "$command" ]; then
    exit 0
fi

# Detectar si es un comando de testing
is_test_command=false

if [[ "$command" =~ (npm[[:space:]]+test|npm[[:space:]]+run[[:space:]]+test) ]] || \
   [[ "$command" =~ ^(vitest|jest|playwright|cypress) ]] || \
   [[ "$command" =~ (npx[[:space:]]+(vitest|jest|playwright|cypress)) ]]; then
    is_test_command=true
fi

# Si no es un comando de test, salir
if [ "$is_test_command" = false ]; then
    exit 0
fi

echo "🧹 Detectado comando de testing. Limpiando archivos de test..."

# Directorio del proyecto
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/home/debian/newton}"

# Contador de archivos eliminados
count=0

# Buscar y eliminar archivos de test (excluyendo node_modules y archivos de configuración)
while IFS= read -r file; do
    filename=$(basename "$file")

    # NO eliminar archivos de configuración
    if [[ "$filename" =~ ^(vitest|jest|playwright|cypress)\.config\.(ts|js|mjs)$ ]] || \
       [[ "$filename" =~ ^setup\.test\.(ts|js)$ ]] || \
       [[ "$filename" =~ ^test\.setup\.(ts|js)$ ]]; then
        continue
    fi

    # Eliminar el archivo
    rm -f "$file"
    echo "  🗑️  Eliminado: ${file#$PROJECT_DIR/}"
    ((count++))
done < <(find "$PROJECT_DIR" -path "$PROJECT_DIR/node_modules" -prune -o -type f \( -name "*.test.ts" -o -name "*.test.js" -o -name "*.test.svelte" -o -name "test-*.ts" -o -name "test-*.js" -o -name "test-*.svelte" \) -print 2>/dev/null)

if [ $count -eq 0 ]; then
    echo "  ✨ No se encontraron archivos de test para limpiar"
else
    echo "  ✅ Limpieza completada: $count archivo(s) eliminado(s)"
fi

exit 0
