#!/bin/bash
# Script de despliegue para Ubuntu Server 24.04.3 LTS

echo "=== Amatores Cron Manager - Instalación en Ubuntu 24.04.3 LTS ==="

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Apache y PHP 8.3 (versión por defecto en Ubuntu 24.04)
sudo apt install -y apache2 php8.3 libapache2-mod-php8.3 php8.3-json php8.3-cli php8.3-common

# Crear directorio del proyecto
sudo mkdir -p /var/www/html/cronweb-amatores

# Copiar archivos (ejecutar desde el directorio del proyecto)
sudo cp -r public/* /var/www/html/cronweb-amatores/
sudo cp -r src /var/www/html/cronweb-amatores/

# Configurar permisos
sudo chown -R www-data:www-data /var/www/html/cronweb-amatores
sudo chmod -R 755 /var/www/html/cronweb-amatores
sudo chmod -R 777 /var/www/html/cronweb-amatores/src

# Habilitar mod_rewrite
sudo a2enmod rewrite

# Reiniciar Apache
sudo systemctl restart apache2

echo "✅ Instalación completada!"
echo "🌐 Accede a: http://tu-servidor/cronweb-amatores"
echo "⚠️  Asegúrate de que el usuario www-data tenga permisos de crontab"