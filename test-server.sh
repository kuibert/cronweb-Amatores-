#!/bin/bash
# Script de prueba para verificar la instalación en Ubuntu 24.04.3

echo "🧪 Probando instalación de Amatores Cron Manager"
echo "==============================================="

# Verificar sistema
echo "📋 Información del sistema:"
lsb_release -a
echo ""

# Verificar Apache
echo "🌐 Estado de Apache:"
if systemctl is-active --quiet apache2; then
    echo "✅ Apache está ejecutándose"
    apache2 -v | head -1
else
    echo "❌ Apache no está ejecutándose"
fi
echo ""

# Verificar PHP
echo "🐘 Estado de PHP:"
if command -v php8.3 &> /dev/null; then
    echo "✅ PHP 8.3 instalado"
    php8.3 -v | head -1
else
    echo "❌ PHP 8.3 no encontrado"
fi
echo ""

# Verificar archivos del proyecto
echo "📁 Archivos del proyecto:"
if [ -d "/var/www/html/cronweb-amatores" ]; then
    echo "✅ Directorio del proyecto existe"
    ls -la /var/www/html/cronweb-amatores/
else
    echo "❌ Directorio del proyecto no encontrado"
fi
echo ""

# Verificar permisos
echo "🔐 Permisos:"
ls -la /var/www/html/cronweb-amatores/src/ 2>/dev/null || echo "❌ Directorio src no encontrado"
echo ""

# Verificar crontab
echo "📅 Crontab:"
if command -v crontab &> /dev/null; then
    echo "✅ Crontab disponible"
    crontab -l 2>/dev/null || echo "No hay tareas en crontab"
else
    echo "❌ Crontab no disponible"
fi
echo ""

# Probar conectividad
echo "🌐 Probando conectividad:"
IP=$(hostname -I | awk '{print $1}')
echo "IP del servidor: $IP"
echo "URL: http://$IP/cronweb-amatores"

# Verificar puerto 80
if netstat -tuln | grep -q ":80 "; then
    echo "✅ Puerto 80 abierto"
else
    echo "❌ Puerto 80 no disponible"
fi

echo ""
echo "🏁 Prueba completada"