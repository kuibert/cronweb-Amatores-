#!/bin/bash
# Script para configurar permisos de crontab en Ubuntu

echo "=== Configurando permisos de crontab ==="

# Opción 1: Usar www-data (más simple)
echo "Configurando permisos para www-data..."
sudo usermod -a -G crontab www-data

# Opción 2: Crear usuario específico (más seguro)
read -p "¿Crear usuario específico 'cronweb'? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo adduser --system --group cronweb
    sudo usermod -a -G crontab cronweb
    
    # Cambiar propietario de archivos
    sudo chown -R cronweb:cronweb /var/www/html/cronweb-amatores/src
    
    echo "✅ Usuario 'cronweb' creado y configurado"
fi

# Configurar permisos del binario crontab
sudo chmod u+s /usr/bin/crontab

# Verificar configuración
echo "=== Verificando configuración ==="
ls -la /usr/bin/crontab
groups www-data

echo "✅ Configuración completada!"