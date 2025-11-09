#!/bin/bash

# Hook para validar nomenclatura de archivos de test
# Solo permite: *.test.{ts,js,svelte} o test-*.{ts,js,svelte}
# Bloquea: *.spec.*, *_test.*, *_spec.*, prueba-*, *.prueba.*

json_input=$(cat)

# Extraer file_path
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')

# Si no hay file_path, salir
if [ -z "$file_path" ]; then
    exit 0
fi

# Obtener el nombre base del archivo
filename=$(basename "$file_path")

# Verificar si es un archivo de configuración de tests (permitido)
if [[ "$filename" =~ ^(vitest|jest|playwright|cypress)\.config\.(ts|js|mjs)$ ]] || \
   [[ "$filename" =~ ^setup\.test\.(ts|js)$ ]] || \
   [[ "$filename" =~ ^test\.setup\.(ts|js)$ ]]; then
    echo "✅ Archivo de configuración de tests permitido: $filename"
    exit 0
fi

# Patrones BLOQUEADOS (spec, prueba, etc.)
if [[ "$filename" =~ \.spec\. ]] || \
   [[ "$filename" =~ _spec\. ]] || \
   [[ "$filename" =~ _test\. ]] || \
   [[ "$filename" =~ prueba ]] || \
   [[ "$filename" =~ \.prueba\. ]]; then
    echo "❌ ERROR: Nomenclatura de test NO permitida: '$filename'"
    echo "   "
    echo "   Solo se permite el término 'test' en los nombres de archivo."
    echo "   "
    echo "   Formatos válidos:"
    echo "   ✅ archivo.test.ts"
    echo "   ✅ archivo.test.js"
    echo "   ✅ test-archivo.ts"
    echo "   ✅ test-archivo.js"
    echo "   "
    echo "   Formatos NO permitidos:"
    echo "   ❌ archivo.spec.ts (usa .test.ts)"
    echo "   ❌ archivo_test.ts (usa .test.ts o test-archivo.ts)"
    echo "   ❌ prueba-archivo.ts (usa test-archivo.ts)"
    exit 2
fi

# Verificar si parece ser un archivo de test (contiene 'test' en el nombre)
if [[ "$filename" =~ \.test\. ]] || [[ "$filename" =~ ^test- ]]; then
    # Verificar que use extensiones válidas
    if [[ "$filename" =~ \.(ts|js|svelte)$ ]]; then
        echo "✅ Nomenclatura de test válida: $filename"
        exit 0
    fi
fi

# Si llegamos aquí, no es un archivo de test, permitir
exit 0
