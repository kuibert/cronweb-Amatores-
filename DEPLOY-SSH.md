# 🚀 Despliegue SSH Remoto - cronweb-Amatores

## Uso Rápido

### 1. Preparar
```bash
chmod +x deploy-remote.sh verify-deployment.sh update-remote.sh
```

### 2. Desplegar
```bash
./deploy-remote.sh usuario@servidor.com /var/www/cronweb
```

### 3. Verificar
```bash
./verify-deployment.sh usuario@servidor.com /var/www/cronweb
```

### 4. Acceder
```
http://IP_SERVIDOR/cronweb
```

---

## Ejemplos

```bash
# Con IP
./deploy-remote.sh root@192.168.1.100 /var/www/cronweb

# Con dominio
./deploy-remote.sh admin@servidor.com /var/www/cronweb
```

---

## Actualizar

```bash
./update-remote.sh usuario@servidor.com /var/www/cronweb
```

---

## Requisitos

- Acceso SSH al servidor
- rsync instalado localmente
- Ubuntu 20.04+ o Debian 10+
- Permisos sudo en servidor

---

## Solución de Problemas

### Error de permisos
```bash
ssh usuario@servidor.com
sudo chown -R www-data:www-data /var/www/cronweb/public
sudo systemctl restart apache2
```

### Ver logs
```bash
ssh usuario@servidor.com
sudo tail -50 /var/log/apache2/cronweb-error.log
```

### Reiniciar Apache
```bash
ssh usuario@servidor.com
sudo systemctl restart apache2
```
