#!/bin/bash

# Script de despliegue remoto para cronweb-Amatores en servidor Linux
# Uso: ./deploy-remote.sh usuario@servidor.com /ruta/destino

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Validar argumentos
if [ $# -lt 2 ]; then
    echo -e "${RED}Uso: $0 usuario@servidor.com /ruta/destino${NC}"
    echo "Ejemplo: $0 root@192.168.1.100 /var/www/cronweb"
    exit 1
fi

REMOTE_HOST=$1
DEPLOY_PATH=$2
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}=== Despliegue Remoto cronweb-Amatores ===${NC}"
echo "Host: $REMOTE_HOST"
echo "Ruta: $DEPLOY_PATH"
echo ""

# 1. Crear directorio remoto
echo -e "${YELLOW}[1/6] Creando directorio remoto...${NC}"
ssh "$REMOTE_HOST" "sudo mkdir -p $DEPLOY_PATH && sudo chown \$(whoami) $DEPLOY_PATH"

# 2. Copiar archivos
echo -e "${YELLOW}[2/6] Copiando archivos...${NC}"
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.qodo' \
    "$LOCAL_DIR/" "$REMOTE_HOST:$DEPLOY_PATH/"

# 3. Instalar dependencias
echo -e "${YELLOW}[3/6] Instalando dependencias...${NC}"
ssh "$REMOTE_HOST" << 'EOF'
sudo apt-get update
sudo apt-get install -y apache2 php8.3 php8.3-cli libapache2-mod-php8.3
sudo a2enmod rewrite
sudo a2enmod deflate
EOF

# 4. Configurar Apache
echo -e "${YELLOW}[4/6] Configurando Apache...${NC}"
VHOST_NAME=$(echo "$DEPLOY_PATH" | sed 's/\///g' | sed 's/var//g' | sed 's/www//g')
ssh "$REMOTE_HOST" << EOF
sudo tee /etc/apache2/sites-available/$VHOST_NAME.conf > /dev/null << 'VHOST'
<VirtualHost *:80>
    ServerName cronweb.local
    DocumentRoot $DEPLOY_PATH/public
    
    <Directory $DEPLOY_PATH/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(?!cron_manager\.php)(.*)$ index.html [QSA,L]
    </IfModule>
    
    ErrorLog \${APACHE_LOG_DIR}/cronweb-error.log
    CustomLog \${APACHE_LOG_DIR}/cronweb-access.log combined
</VirtualHost>
VHOST

sudo a2ensite $VHOST_NAME.conf
sudo apache2ctl configtest
sudo systemctl restart apache2
EOF

# 5. Configurar permisos
echo -e "${YELLOW}[5/6] Configurando permisos...${NC}"
ssh "$REMOTE_HOST" << EOF
sudo chown -R www-data:www-data $DEPLOY_PATH/public
sudo chmod -R 755 $DEPLOY_PATH/public
sudo chmod -R 775 $DEPLOY_PATH/public/cron_jobs.json $DEPLOY_PATH/public/execution_logs.json $DEPLOY_PATH/public/current_crontab.txt 2>/dev/null || true
EOF

# 6. Verificar instalación
echo -e "${YELLOW}[6/6] Verificando instalación...${NC}"
ssh "$REMOTE_HOST" << EOF
echo "✓ Apache status:"
sudo systemctl status apache2 --no-pager | head -3
echo ""
echo "✓ PHP version:"
php -v | head -1
echo ""
echo "✓ Archivos en servidor:"
ls -la $DEPLOY_PATH/public/ | head -10
EOF

echo ""
echo -e "${GREEN}=== Despliegue completado exitosamente ===${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Accede a: http://$(ssh "$REMOTE_HOST" "hostname -I" | awk '{print $1}')/cronweb"
echo "2. O configura el DNS para: cronweb.local"
echo "3. Verifica los logs: sudo tail -f /var/log/apache2/cronweb-error.log"
echo ""
