#!/bin/bash

# Script para configurar HTTPS en Newton CRM
# Requiere: nginx, certbot

echo "=== Configuración HTTPS para Newton CRM ==="
echo ""

# Verificar si nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx no está instalado. Instalando..."
    sudo apt update
    sudo apt install -y nginx
fi

# Verificar si certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot no está instalado. Instalando..."
    sudo apt install -y certbot python3-certbot-nginx
fi

echo ""
echo "Necesitas un dominio apuntando a este servidor."
echo "Por ejemplo: crm.tudominio.com -> 158.69.204.107"
echo ""
read -p "Ingresa tu dominio (ej: crm.tudominio.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Dominio no proporcionado. Saliendo..."
    exit 1
fi

echo ""
echo "Creando configuración de Nginx para $DOMAIN..."

# Crear configuración de Nginx
sudo tee /etc/nginx/sites-available/newton-crm << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/newton-crm /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

if [ $? -eq 0 ]; then
    # Reload nginx
    sudo systemctl reload nginx

    echo ""
    echo "✅ Nginx configurado correctamente"
    echo ""
    echo "Ahora vamos a obtener el certificado SSL con Let's Encrypt..."
    echo ""

    # Obtener certificado SSL
    sudo certbot --nginx -d $DOMAIN

    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 ¡HTTPS configurado exitosamente!"
        echo ""
        echo "Accede a tu aplicación en: https://$DOMAIN"
        echo ""
        echo "El certificado se renovará automáticamente."
    else
        echo ""
        echo "❌ Error al obtener el certificado SSL"
        echo "Verifica que el dominio apunte a este servidor."
    fi
else
    echo ""
    echo "❌ Error en la configuración de Nginx"
fi
