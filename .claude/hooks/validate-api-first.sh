#!/bin/bash

# Hook para validar arquitectura API First
# Garantiza separación: Components → Stores → Services → API

json_input=$(cat)

file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')
new_content=$(echo "$json_input" | jq -r '.tool_input.new_string // .tool_input.content // empty')

# Si no hay contenido, salir
if [ -z "$new_content" ]; then
    if [ -f "$file_path" ]; then
        new_content=$(cat "$file_path")
    else
        exit 0
    fi
fi

# Solo validar archivos TypeScript/Svelte
if [[ ! "$file_path" =~ \.(ts|js|svelte)$ ]]; then
    exit 0
fi

# Excluir archivos de test, configuración y node_modules
if [[ "$file_path" =~ (\.test\.|test-|node_modules|\.config\.) ]]; then
    exit 0
fi

filename=$(basename "$file_path")
violations=0

echo "🏗️  Validando arquitectura API First: $filename"

# Detectar tipo de archivo por ruta
is_component=0
is_store=0
is_service=0

if [[ "$file_path" =~ /components/ ]] || [[ "$file_path" =~ \.svelte$ ]]; then
    is_component=1
elif [[ "$file_path" =~ /stores/ ]] || [[ "$file_path" =~ \.store\. ]]; then
    is_store=1
elif [[ "$file_path" =~ /services/ ]] || [[ "$file_path" =~ \.service\. ]]; then
    is_service=1
fi

# REGLA 1: Componentes NO deben hacer llamadas fetch directas
if [ $is_component -eq 1 ]; then
    if echo "$new_content" | grep -qE '\bfetch\s*\('; then
        # Verificar que no sea import o tipo
        if echo "$new_content" | grep -E '\bfetch\s*\(' | grep -qvE '(import.*fetch|type.*fetch|interface.*fetch)'; then
            echo "  ❌ VIOLACIÓN: Componente hace fetch() directamente"
            echo "     Los componentes deben usar stores, no llamar APIs directamente"
            violations=1
        fi
    fi

    # Componentes no deben tener lógica de negocio compleja
    if echo "$new_content" | grep -qE 'class\s+\w+\s*(extends|implements)'; then
        echo "  ⚠️  ADVERTENCIA: Componente con lógica de clase"
        echo "     Considera mover lógica compleja a services o stores"
    fi
fi

# REGLA 2: Stores NO deben tener lógica de negocio
if [ $is_store -eq 1 ]; then
    # Stores no deben hacer validaciones de negocio complejas
    complex_logic=$(echo "$new_content" | grep -cE '(if.*else.*if|switch.*case.*case.*case|for.*for|while.*while)')

    if [ "$complex_logic" -gt 5 ]; then
        echo "  ⚠️  ADVERTENCIA: Store con lógica compleja ($complex_logic bloques)"
        echo "     Los stores deben manejar estado, no lógica de negocio"
        echo "     Considera mover la lógica a services"
    fi
fi

# REGLA 3: Services deben ser puros (solo API calls)
if [ $is_service -eq 1 ]; then
    # Services no deben manipular DOM
    if echo "$new_content" | grep -qE '\b(document\.|window\.|localStorage\.|sessionStorage\.)'; then
        echo "  ❌ VIOLACIÓN: Service manipula DOM/Storage"
        echo "     Services deben ser puros (solo llamadas API)"
        echo "     Usa stores para estado/storage"
        violations=1
    fi

    # Services deben exportar funciones, no clases complejas
    if echo "$new_content" | grep -qE 'export\s+class\s+\w+Service'; then
        # Verificar que la clase solo tenga métodos async
        if echo "$new_content" | grep -E 'export\s+class' -A 50 | grep -qvE '(async|fetch|return)'; then
            echo "  ⚠️  ADVERTENCIA: Service con clase que puede tener estado"
            echo "     Considera usar funciones puras exportadas"
        fi
    fi
fi

# REGLA 4: NO usar mock data en archivos principales
if [[ ! "$file_path" =~ (mock|fixture|example|demo) ]]; then
    if echo "$new_content" | grep -qE '(const|let|var)\s+mock[A-Z]'; then
        echo "  ⚠️  ADVERTENCIA: Mock data detectado"
        echo "     El mock data debe estar en archivos separados"
    fi

    # Detectar arrays grandes de datos hardcodeados
    hardcoded_data=$(echo "$new_content" | grep -cE '^\s*\{.*:\s*["\047].*,.*:\s*["\047]')
    if [ "$hardcoded_data" -gt 10 ]; then
        echo "  ⚠️  ADVERTENCIA: Muchos datos hardcodeados ($hardcoded_data objetos)"
        echo "     Los datos deben venir de la API, no estar hardcodeados"
    fi
fi

# REGLA 5: Imports deben seguir jerarquía
# Components pueden importar stores/services
# Stores pueden importar services
# Services NO deben importar stores ni components

if [ $is_service -eq 1 ]; then
    if echo "$new_content" | grep -qE 'from.*\.(store|component|svelte)'; then
        echo "  ❌ VIOLACIÓN: Service importa stores o componentes"
        echo "     Los services deben ser independientes"
        echo "     Jerarquía: Components → Stores → Services → API"
        violations=1
    fi
fi

echo ""

if [ $violations -eq 1 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ VALIDACIÓN DE ARQUITECTURA FALLIDA"
    echo ""
    echo "   Arquitectura API First requiere:"
    echo "   📱 Components: UI + llamadas a stores"
    echo "   📦 Stores: Estado + llamadas a services"
    echo "   🔌 Services: API calls puros"
    echo "   🌐 API: Backend endpoints"
    echo ""
    echo "   Ver CLAUDE.md para más detalles"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 2
fi

echo "✅ Arquitectura API First cumplida"
exit 0
