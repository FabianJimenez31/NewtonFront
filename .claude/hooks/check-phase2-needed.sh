#!/bin/bash

# Script helper para que Claude detecte si hay archivos core que necesitan Fase 2
# (pruebas completas con agente especializado)

RESULTS_DIR="/tmp/claude-test-results"

# Verificar si existe el directorio
if [ ! -d "$RESULTS_DIR" ]; then
    echo "No se encontraron archivos core pendientes de validación"
    exit 0
fi

# Buscar flags de Fase 2
phase2_flags=$(find "$RESULTS_DIR" -name "*_needs_agent.flag" 2>/dev/null)

if [ -z "$phase2_flags" ]; then
    echo "✅ No hay archivos core pendientes de pruebas completas"
    exit 0
fi

echo "⚠️  ARCHIVOS CORE DETECTADOS - REQUIEREN FASE 2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Listar archivos que necesitan Fase 2
for flag in $phase2_flags; do
    file_hash=$(basename "$flag" | sed 's/_needs_agent.flag//')
    baseline_file="$RESULTS_DIR/${file_hash}_baseline.json"

    if [ -f "$baseline_file" ]; then
        file_path=$(jq -r '.file_path' "$baseline_file")
        filename=$(jq -r '.filename' "$baseline_file")
        echo "📁 $filename"
        echo "   Ruta: $file_path"
        echo ""
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🤖 RECOMENDACIÓN:"
echo "   Claude debe ejecutar el agente especializado para:"
echo "   - Generar pruebas unitarias"
echo "   - Generar pruebas de integración"
echo "   - Validar contratos/interfaces"
echo "   - Ejecutar smoke tests completos"
echo ""

exit 0
