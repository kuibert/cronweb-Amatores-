#!/bin/bash
# Instalación optimizada para Ubuntu Server 24.04.3 LTS

echo "🐧 Amatores Cron Manager - Ubuntu 24.04.3 LTS"
echo "=============================================="

# Verificar versión de Ubuntu
if ! grep -q "24.04" /etc/os-release; then
    echo "⚠️  Advertencia: Este script está optimizado para Ubuntu 24.04"
fi

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar paquetes necesarios
echo "🔧 Instalando Apache y PHP 8.3..."
sudo apt install -y \
    apache2 \
    php8.3 \
    libapache2-mod-php8.3 \
    php8.3-json \
    php8.3-cli \
    php8.3-common \
    php8.3-curl \
    cron

# Verificar instalación
echo "✅ Verificando instalación..."
php8.3 -v
apache2 -v

# Configurar proyecto
echo "📁 Configurando proyecto..."
sudo mkdir -p /var/www/html/cronweb-amatores

# Copiar archivos
sudo cp -r public/* /var/www/html/cronweb-amatores/
sudo cp -r src /var/www/html/cronweb-amatores/
sudo cp .htaccess /var/www/html/cronweb-amatores/

# Configurar permisos
echo "🔐 Configurando permisos..."
sudo chown -R www-data:www-data /var/www/html/cronweb-amatores
sudo chmod -R 755 /var/www/html/cronweb-amatores
sudo chmod -R 777 /var/www/html/cronweb-amatores/src

# Habilitar módulos Apache
echo "⚙️  Configurando Apache..."
sudo a2enmod rewrite
sudo a2enmod php8.3

# Configurar permisos de crontab para Ubuntu 24.04
echo "📅 Configurando crontab..."
sudo usermod -a -G crontab www-data
sudo chmod u+s /usr/bin/crontab

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
sudo systemctl enable apache2
sudo systemctl restart apache2
sudo systemctl enable cron
sudo systemctl restart cron

# Verificar estado
echo "🔍 Verificando estado de servicios..."
sudo systemctl status apache2 --no-pager -l
sudo systemctl status cron --no-pager -l

# Mostrar información final
echo ""
echo "✅ ¡Instalación completada exitosamente!"
echo "🌐 URL: http://$(hostname -I | awk '{print $1}')/cronweb-amatores"
echo "📂 Directorio: /var/www/html/cronweb-amatores"
echo ""
echo "🔧 Comandos útiles:"
echo "   sudo systemctl status apache2"
echo "   sudo tail -f /var/log/apache2/error.log"
echo "   crontab -l"