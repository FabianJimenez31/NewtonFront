Definición de especificaciones por módulo

Esta especificación describe cada módulo de la plataforma y las funcionalidades que debe proporcionar. Se detalla la finalidad, la lógica interna y cómo se reflejan los resultados en otras partes del sistema, usando como ejemplo el módulo Lifecycle para ilustrar la estructura solicitada.

1. Módulo Lifecycle (Gestión de etapas del ciclo de vida)

Objetivo: Permitir a los administradores definir las etapas por las que pasará un contacto durante su interacción con la empresa y utilizar estas etapas para clasificar, filtrar y automatizar conversaciones en toda la plataforma.

Funciones clave:
	1.	Definición de etapas
	•	Ofrecer una interfaz para crear, editar, reordenar y eliminar etapas de ciclo de vida, tanto principales (p. ej. New Lead, Hot Lead, Payment, Crédito, Customer) como etapas de pérdida (Cold Lead). Cada etapa debe tener un nombre, descripción opcional y orden de aparición.
	•	Las etapas creadas aquí se reflejarán en el panel de conversación del Inbox, en el Dashboard (embudo de conversión) y en el módulo Contacts para cada registro.
	2.	Visibilidad y uso en el sistema
	•	Permitir marcar las etapas como visibles o no visibles en Inbox y Contacts, según se requiera.
	•	Proporcionar API o eventos internos para que otros módulos (Workflows, AI Agents) puedan leer y actualizar la etapa de un contacto.
	3.	Clasificación del lead
	•	La clasificación de un contacto en una etapa se hará de tres maneras:
	1.	Manual: el agente puede cambiar la etapa en la barra lateral de cada conversación o desde el detalle de contacto.
	2.	Automatizada por Workflow: reglas configuradas que, en función de eventos (p. ej. respuesta a un formulario, compra exitosa), actualizan la etapa del contacto.
	3.	Por AI Agents: agentes de IA que, al interpretar las respuestas del cliente, actualizan la etapa según la lógica definida.
	•	Ejemplo: si un contacto paga una factura, el Workflow «Payment» actualiza la etapa a Payment. Si el cliente solicita un crédito, un AI Agent entrenado detecta la intención y cambia la etapa a Crédito.
	4.	Notificaciones y disparadores
	•	Cada cambio de etapa debe generar un evento interno que pueda usarse para estadísticas o activar automatizaciones (por ejemplo, notificar a un supervisor cuando un lead avanza a Hot Lead).

2. Módulo Dashboard

Objetivo: Proporcionar un resumen visual del estado de la operación y el rendimiento del equipo.

Funciones clave:
	•	Mostrar el embudo de lifecycle con recuento y porcentaje de contactos en cada etapa.
	•	Mostrar métricas de contactos (abiertos, asignados, sin asignar) y la tasa de conversión general.
	•	Listar miembros del equipo con su presencia y número de conversaciones asignadas.
	•	Mostrar alertas del plan de suscripción.

3. Módulo Onboarding

Objetivo: Guiar al usuario en los pasos iniciales para poner en marcha el workspace.

Funciones clave:
	•	Checklist editable de tareas (conectar canales, configurar lifecycle, crear AI Agents, invitar equipos) con indicador de progreso.
	•	Enlaces a recursos de formación (videos, documentación) y contacto a soporte.

4. Módulo Inbox

Objetivo: Centralizar la atención de conversaciones y llamadas.

Funciones clave:
	•	Pestañas para conversaciones y llamadas con filtros All, Mine, Unassigned.
	•	Filtros por etapa de lifecycle y tags.
	•	Panel de conversación con historial, área de respuesta y herramientas (adjuntos, snippets, AI Assist, notas internas).
	•	Capacidad de reasignar la conversación y cambiar la etapa de lifecycle en tiempo real.
	•	Registro de llamadas y mensajes; si no hay canales de llamadas habilitados, mostrar advertencia.

5. Módulo Contacts

Objetivo: Gestionar y almacenar información de contactos.

Funciones clave:
	•	Tabla con datos básicos y filtros por etapas y segmentos.
	•	Panel de detalle con campos editables (email, teléfono, país, idioma), historial, tags y stage actual.
	•	Integración con Lifecycle para actualizar la etapa y con los módulos de importación/exportación de datos.

6. Módulo AI Agents

Objetivo: Automatizar conversaciones mediante agentes basados en IA.

Funciones clave:
	•	Plantillas predefinidas de agentes (receptionist, sales, support) que definen comportamientos base.
	•	Opción de crear un agente desde cero, definiendo su intención y reglas de enrutamiento.
	•	Sección para cargar fuentes de conocimiento y entrenar al agente.
	•	Acciones: responder preguntas, actualizar etapas de lifecycle, asignar a agentes humanos o escalar conversaciones.
	•	Chat de prueba para validar respuestas antes de publicar.

7. Módulo Broadcasts

Objetivo: Enviar mensajes masivos a segmentos de contactos.

Funciones clave:
	•	Creación de difusiones con nombre y etiquetas.
	•	Selección de audiencia mediante segmentos o filtros avanzados.
	•	Editor de mensajes con variables personalizadas y archivos adjuntos.
	•	Programación y envío inmediato o diferido, con verificación de políticas de cada canal.
	•	Reporte de métricas de entrega y recepción.

8. Módulo Workflows

Objetivo: Automatizar procesos mediante reglas y acciones.

Funciones clave:
	•	Constructor visual con bloques de acciones, condiciones y eventos.
	•	Plantillas clasificadas por categorías (Auto‑Responder, Routing & Assignment, Business Processes, Supervision & Reporting, Meta/TikTok Ads).
	•	Acciones disponibles: enviar mensajes, esperar, asignar agentes, actualizar campos, consultar condiciones y disparar integraciones externas.
	•	Capacidad de iniciar flujos manualmente o automáticamente según triggers (nuevo contacto, cambio de etapa, clic en anuncio, etc.).

9. Módulo Reports

Objetivo: Analizar el rendimiento de las conversaciones, mensajes y operaciones.

Funciones clave:
	•	Informes de lifecycle con tasas de conversión y embudos.
	•	Informes de conversaciones y respuestas con volumen de chats, tiempos de respuesta y cierre.
	•	Informes de llamadas (si se habilitan canales de llamadas).
	•	Informes de mensajes por canal y calidad de entrega.
	•	Informes de contactos (altas, bajas, fusiones).
	•	Informes de asignaciones, leaderboard de agentes, métricas individuales de usuarios y resultados de broadcasts.

10. Módulo Settings

Objetivo: Proporcionar configuración a nivel de organización, workspace y usuario.

Funciones clave:
	1.	Organization settings
	•	Edición de datos de la organización, administración de usuarios y roles.
	•	Configuración de seguridad (SAML, 2FA).
	•	Gestión de workspaces, tarifas de WhatsApp y facturación.
	2.	Workspace settings
	•	General: nombre del workspace, zona horaria, política de inactividad.
	•	Usuarios y equipos: añadir usuarios y crear equipos.
	•	Canales e integraciones: conectar y gestionar canales; integrar con CRM y herramientas externas.
	•	Widgets de crecimiento: crear widgets de chat.
	•	Inbox settings: definir campos de contacto, etapas de lifecycle, categorías de closing notes, snippets, tags, AI Assist, AI Prompts y configuración de llamadas.
	•	Data settings: gestionar archivos, importar contactos y exportar datos.
	3.	Personal settings
	•	Perfil del usuario con datos personales, idioma, tema y autenticación de dos factores.
	•	Preferencias de notificaciones: sonidos de mensajes/llamadas, notificaciones push, de escritorio y por correo electrónico.

Conclusión

Esta definición de módulos especifica la finalidad y la lógica de cada área de la plataforma, ilustrando cómo se interrelacionan. El módulo de Lifecycle sirve como ejemplo: las etapas configuradas se reflejan a lo largo de la plataforma y permiten clasificar a los leads de manera manual, automatizada o mediante IA, generando disparadores para estadísticas y flujos. Siguiendo este patrón, cada módulo establece responsabilidades claras y puntos de integración con los demás.
