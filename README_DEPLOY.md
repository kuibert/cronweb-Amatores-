# Despliegue en Ubuntu Server

## 📋 Requisitos Previos
- Ubuntu Server 24.04.3 LTS
- Acceso sudo
- Conexión a internet
- PHP 8.3 (incluido por defecto)

## 🚀 Instalación Automática

1. **Subir archivos al servidor**:
```bash
scp -r cronweb-Amatores-/ usuario@servidor:/tmp/
```

2. **Ejecutar script de instalación**:
```bash
cd /tmp/cronweb-Amatores-
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Instalación Manual

### 1. Instalar dependencias:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y apache2 php8.3 libapache2-mod-php8.3 php8.3-json php8.3-cli php8.3-common
```

### 2. Configurar proyecto:
```bash
# Crear directorio
sudo mkdir -p /var/www/html/cronweb-amatores

# Copiar archivos
sudo cp -r public/* /var/www/html/cronweb-amatores/
sudo cp -r src /var/www/html/cronweb-amatores/
sudo cp .htaccess /var/www/html/cronweb-amatores/

# Permisos
sudo chown -R www-data:www-data /var/www/html/cronweb-amatores
sudo chmod -R 755 /var/www/html/cronweb-amatores
sudo chmod -R 777 /var/www/html/cronweb-amatores/src
```

### 3. Configurar Apache:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 4. Configurar permisos de crontab:
```bash
# Permitir que www-data use crontab
sudo usermod -a -G crontab www-data

# O crear un usuario específico
sudo adduser cronweb
sudo usermod -a -G crontab cronweb
sudo chown cronweb:cronweb /var/www/html/cronweb-amatores/src
```

## 🌐 Acceso
- URL: `http://tu-servidor/cronweb-amatores`
- Puerto: 80 (HTTP) o 443 (HTTPS)

## 🔒 Seguridad Adicional

### Configurar HTTPS (Opcional):
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d tu-dominio.com
```

### Restringir acceso por IP:
Editar `/etc/apache2/sites-available/000-default.conf`:
```apache
<Directory "/var/www/html/cronweb-amatores">
    Require ip 192.168.1.0/24
    Require ip 10.0.0.0/8
</Directory>
```

## 🐛 Solución de Problemas

### Error de permisos de crontab:
```bash
sudo chmod u+s /usr/bin/crontab
```

### Ver logs de Apache:
```bash
sudo tail -f /var/log/apache2/error.log
```

### Verificar PHP:
```bash
php8.3 -v
sudo systemctl status apache2
sudo apache2ctl -M | grep php
```