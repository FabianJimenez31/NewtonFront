SISTEMA DE VALIDACIÓN DE ARCHIVOS CORE - Newton CRM

=== ¿QUÉ ES UN ARCHIVO CORE? ===
Archivo crítico que requiere validación exhaustiva.

Identificación:
1. Nombre contiene .core. → auth.core.ts
2. Comentario @core o @critical en el código

=== FASE 1: AUTOMÁTICA (Hooks) ===

PRE-modificación:
- Extrae contrato (exports, tipos, interfaces)
- Ejecuta smoke test (compilación TS)
- Guarda baseline en /tmp/claude-test-results/

POST-modificación:
- Re-ejecuta smoke test
- Compara contrato con baseline
- BLOQUEA si hay errores de compilación
- Advierte si el contrato cambió

=== FASE 2: AGENTE ESPECIALIZADO ===

Claude ejecuta cuando detecta flags en:
/tmp/claude-test-results/*_needs_agent.flag

Comando para detectar:
.claude/hooks/check-phase2-needed.sh

Agente genera:
- Pruebas unitarias
- Pruebas de integración
- Validación de contratos
- Smoke tests completos

=== WORKFLOW ===

1. Usuario modifica archivo.core.ts
2. Hook PRE guarda baseline
3. Hook POST valida cambios
4. Si contrato cambió → crea flag para Fase 2
5. Claude detecta flag
6. Claude ejecuta agente con Task tool
7. Agente valida funcionalidad completa
8. Claude reporta resultados al usuario

Ver archivos .claude/hooks/*.sh para detalles técnicos
