# Newton CRM Development Server Manager

Este documento describe cómo usar el servicio automatizado para mantener el servidor de desarrollo ejecutándose con hot-reload.

## Instalación Rápida

### Opción 1: Quick Start (Recomendado)

```bash
# Inicio rápido - detecta automáticamente la mejor opción
npm run dev:start

# Ver estado del servidor
npm run dev:status

# Detener el servidor
npm run dev:stop
```

### Opción 2: Configuración Inicial

```bash
# Ejecutar el asistente de configuración
npm run dev:setup
```

## Métodos de Ejecución Disponibles

### 1. Systemd Service (Linux/Servidores)

**Ventajas:**
- Se reinicia automáticamente si falla
- Se inicia con el sistema
- Integración a nivel de sistema operativo

**Instalación:**
```bash
sudo ./service-manager.sh install
sudo ./service-manager.sh start
```

**Comandos:**
```bash
# Instalar servicio
sudo ./service-manager.sh install

# Iniciar servidor
sudo ./service-manager.sh start

# Detener servidor
sudo ./service-manager.sh stop

# Ver logs en tiempo real
sudo ./service-manager.sh logs

# Habilitar inicio automático
sudo ./service-manager.sh enable

# Ver estado
sudo ./service-manager.sh status
```

### 2. PM2 Process Manager (Desarrollo)

**Ventajas:**
- Monitoreo en tiempo real
- Gestión de logs avanzada
- Recargas sin downtime
- Dashboard visual

**Instalación de PM2:**
```bash
npm install -g pm2
```

**Comandos:**
```bash
# Iniciar con PM2
./pm2-manager.sh start

# Ver logs
./pm2-manager.sh logs

# Monitor en tiempo real
./pm2-manager.sh monitor

# Reiniciar
./pm2-manager.sh restart

# Recarga sin downtime
./pm2-manager.sh reload

# Configurar inicio automático
./pm2-manager.sh startup
```

### 3. NPM Simple (Básico)

```bash
# Ejecución directa (sin auto-restart)
npm run dev
```

## Scripts NPM Disponibles

```json
{
  "dev": "vite dev",              // Desarrollo normal
  "dev:start": "Inicia servidor con auto-restart",
  "dev:stop": "Detiene el servidor",
  "dev:restart": "Reinicia el servidor",
  "dev:status": "Verifica estado del servidor",
  "dev:setup": "Configura el servicio",
  "dev:logs": "Muestra logs del servidor"
}
```

## Uso Recomendado

### Para Desarrollo Local
```bash
# 1. Configurar PM2 (solo primera vez)
npm run dev:setup
# Seleccionar opción 2 (PM2)

# 2. Iniciar servidor
npm run dev:start

# 3. Ver logs cuando necesites
npm run dev:logs

# 4. El servidor se reinicia automáticamente en caso de error
```

### Para Servidores de Producción/Staging
```bash
# 1. Instalar servicio systemd (solo primera vez)
sudo ./service-manager.sh install

# 2. Habilitar inicio automático
sudo ./service-manager.sh enable

# 3. Iniciar servidor
sudo ./service-manager.sh start

# El servidor ahora:
# - Se ejecuta en segundo plano
# - Se reinicia si falla
# - Se inicia con el sistema
```

## Verificación del Estado

```bash
# Ver si el servidor está corriendo
npm run dev:status

# Verificar puerto 5173
lsof -i:5173

# Ver logs de PM2
pm2 logs newton-dev

# Ver logs de systemd
sudo journalctl -u newton-dev -f
```

## Acceso al Servidor

Una vez iniciado, el servidor estará disponible en:
- **URL Local:** http://localhost:5173
- **URL Red:** http://[TU_IP]:5173
- **Hot Reload:** Activo automáticamente

## Solución de Problemas

### El servidor no inicia

```bash
# Verificar que el puerto no esté ocupado
lsof -i:5173

# Matar proceso en el puerto si es necesario
kill -9 $(lsof -t -i:5173)

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Reiniciar servicio
npm run dev:restart
```

### PM2 no encuentra el proceso

```bash
# Listar todos los procesos PM2
pm2 list

# Eliminar proceso huérfano
pm2 delete newton-dev

# Reiniciar
npm run dev:start
```

### Systemd no funciona

```bash
# Ver logs detallados
sudo journalctl -u newton-dev -n 50

# Recargar daemon
sudo systemctl daemon-reload

# Reinstalar servicio
sudo ./service-manager.sh uninstall
sudo ./service-manager.sh install
```

## Archivos del Sistema

```
/home/debian/newton/
├── dev-server.sh           # Script principal
├── service-manager.sh      # Gestor systemd
├── pm2-manager.sh          # Gestor PM2
├── ecosystem.config.cjs    # Config PM2
├── newton-dev.service      # Definición systemd
└── logs/                   # Directorio de logs
    ├── pm2-error.log
    ├── pm2-out.log
    └── pm2-combined.log
```

## Características

✅ **Auto-restart:** El servidor se reinicia automáticamente si falla
✅ **Hot-reload:** Los cambios en el código se reflejan inmediatamente
✅ **Logs persistentes:** Los logs se guardan para debugging
✅ **Inicio con el sistema:** Opción para iniciar automáticamente al boot
✅ **Monitoreo:** Herramientas para ver el estado y rendimiento
✅ **Múltiples backends:** Systemd, PM2 o NPM simple

## Notas Importantes

1. **Desarrollo:** Usa PM2 para mejor experiencia de desarrollo
2. **Producción:** Usa systemd para mayor estabilidad
3. **Puerto:** El servidor siempre usa el puerto 5173
4. **Permisos:** Systemd requiere sudo, PM2 no
5. **Logs:** Se guardan en `./logs/` para PM2 y en journalctl para systemd

## Comandos Útiles Adicionales

```bash
# Ver todos los procesos Node
ps aux | grep node

# Ver uso de memoria
pm2 monit

# Limpiar logs
pm2 flush

# Backup configuración PM2
pm2 save

# Restaurar configuración PM2
pm2 resurrect
```