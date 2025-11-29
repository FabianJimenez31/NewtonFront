#!/bin/bash

echo "=== Configuración de Newton CRM en dev.inewton.ai ==="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build the application
echo -e "${BLUE}Paso 1: Building la aplicación...${NC}"
cd /home/debian/newton
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado${NC}"
echo ""

# Step 2: Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo -e "${BLUE}Paso 2: Instalando Nginx...${NC}"
    sudo apt update
    sudo apt install -y nginx
else
    echo -e "${GREEN}✅ Nginx ya está instalado${NC}"
fi
echo ""

# Step 3: Copy nginx configuration
echo -e "${BLUE}Paso 3: Configurando Nginx...${NC}"
sudo cp /home/debian/newton/nginx-config-dev.conf /etc/nginx/sites-available/newton-crm-dev
sudo ln -sf /etc/nginx/sites-available/newton-crm-dev /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en configuración de Nginx${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nginx configurado${NC}"
echo ""

# Step 4: Reload nginx
echo -e "${BLUE}Paso 4: Recargando Nginx...${NC}"
sudo systemctl reload nginx
sudo systemctl enable nginx

echo -e "${GREEN}✅ Nginx recargado${NC}"
echo ""

# Step 5: Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo -e "${BLUE}Paso 5: Instalando Certbot...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✅ Certbot ya está instalado${NC}"
fi
echo ""

# Step 6: Get SSL certificate
echo -e "${BLUE}Paso 6: Obteniendo certificado SSL...${NC}"
echo ""
echo "Se abrirá el wizard de Certbot. Sigue las instrucciones:"
echo "1. Ingresa tu email"
echo "2. Acepta los términos"
echo "3. (Opcional) Comparte tu email con EFF"
echo ""
read -p "Presiona ENTER para continuar..."

sudo certbot --nginx -d dev.inewton.ai

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
    echo ""
    echo "Tu aplicación está disponible en:"
    echo -e "${GREEN}https://dev.inewton.ai${NC}"
    echo ""
    echo "El certificado SSL se renovará automáticamente."
    echo ""
    echo "Para actualizar la aplicación en el futuro:"
    echo "  1. cd /home/debian/newton"
    echo "  2. git pull"
    echo "  3. npm install"
    echo "  4. npm run build"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Error al obtener certificado SSL${NC}"
    echo ""
    echo "Verifica que:"
    echo "  - El dominio dev.inewton.ai apunte a esta IP (158.69.204.107)"
    echo "  - El puerto 80 y 443 estén abiertos en el firewall"
    echo ""
    echo "La aplicación está funcionando en HTTP:"
    echo -e "${BLUE}http://dev.inewton.ai${NC}"
    echo ""
    echo "Puedes intentar obtener el certificado manualmente:"
    echo "  sudo certbot --nginx -d dev.inewton.ai"
fi
