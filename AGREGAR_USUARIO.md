# Guía para Agregar Nuevos Usuarios

## 📝 Pasos para Agregar un Nuevo Usuario Linux

Esta guía te ayudará a agregar un nuevo usuario (ejemplo: "carlos") al sistema CronWeb Amatores.

---

## Paso 1: Crear el Usuario en el Sistema

```bash
sudo adduser carlos
```

Cuando se solicite, establecer una contraseña segura.

---

## Paso 2: Copiar Scripts Necesarios

```bash
# Copiar wrapper_cron.sh
sudo cp /home/melvin/wrapper_cron.sh /home/carlos/

# Copiar cron_logger.php
sudo cp /home/melvin/cron_logger.php /home/carlos/

# Establecer permisos correctos
sudo chown carlos:carlos /home/carlos/wrapper_cron.sh
sudo chown carlos:carlos /home/carlos/cron_logger.php
sudo chmod +x /home/carlos/wrapper_cron.sh
sudo chmod +x /home/carlos/cron_logger.php
```

---

## Paso 3: Actualizar Configuración de Sudoers

```bash
sudo nano /etc/sudoers.d/cronweb
```

Modificar las líneas existentes para incluir `carlos`:

**ANTES:**
```
www-data ALL=(melvin,raul) NOPASSWD: /usr/bin/crontab
www-data ALL=(melvin,raul) NOPASSWD: /bin/bash
www-data ALL=(melvin,raul) NOPASSWD: /home/melvin/wrapper_cron.sh
www-data ALL=(melvin,raul) NOPASSWD: /home/raul/wrapper_cron.sh
```

**DESPUÉS:**
```
www-data ALL=(melvin,raul,carlos) NOPASSWD: /usr/bin/crontab
www-data ALL=(melvin,raul,carlos) NOPASSWD: /bin/bash
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/melvin/wrapper_cron.sh
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/raul/wrapper_cron.sh
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/carlos/wrapper_cron.sh
```

Guardar y salir (Ctrl+X, Y, Enter).

---

## Paso 4: Crear Archivos JSON para el Nuevo Usuario

```bash
# Crear archivo de tareas
echo '[]' | sudo tee /var/www/cronweb/public/cron_jobs_carlos.json

# Crear archivo de logs
echo '[]' | sudo tee /var/www/cronweb/public/execution_logs_carlos.json

# Establecer permisos de escritura
sudo chmod 666 /var/www/cronweb/public/cron_jobs_carlos.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_carlos.json
```

---

## Paso 5: Actualizar Sistema de Autenticación

```bash
sudo nano /var/www/cronweb/public/auth.php
```

### 5.1 Agregar Usuario Web

Buscar la sección `$webUsers` y agregar:

```php
$webUsers = [
    'admin' => [
        'password' => password_hash('admin123', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['melvin', 'raul', 'carlos']  // Agregar carlos aquí
    ],
    'melvin' => [
        'password' => password_hash('Soloyolase01', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['melvin']
    ],
    'raul' => [
        'password' => password_hash('Soloyolase02', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['raul']
    ],
    // AGREGAR ESTE BLOQUE:
    'carlos' => [
        'password' => password_hash('contraseña_de_carlos', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['carlos']
    ]
];
```

### 5.2 Actualizar Lista Blanca

Buscar `$allowedLinuxUsers` y modificar:

```php
$allowedLinuxUsers = ['melvin', 'raul', 'carlos'];
```

Guardar y salir.

---

## Paso 6: Reiniciar Apache

```bash
sudo systemctl restart apache2
```

---

## Paso 7: Verificar la Instalación

### 7.1 Verificar que el usuario puede ejecutar crontab
```bash
sudo -u www-data sudo -u carlos crontab -l
```

Debería mostrar "no crontab for carlos" (esto es normal).

### 7.2 Verificar archivos JSON
```bash
ls -la /var/www/cronweb/public/*carlos.json
```

Debería mostrar:
```
-rw-rw-rw- 1 root root ... cron_jobs_carlos.json
-rw-rw-rw- 1 root root ... execution_logs_carlos.json
```

### 7.3 Probar acceso web
1. Ir a http://192.168.80.143/login.php
2. Ingresar:
   - Usuario: `carlos`
   - Contraseña: `contraseña_de_carlos`
3. Verificar que aparece "Usuario: carlos" en el dropdown

---

## Paso 8: Crear Backup

```bash
sudo /home/melvin/cronweb_manager.sh backup
```

---

## 🎉 ¡Listo!

El nuevo usuario "carlos" ya puede:
- ✅ Iniciar sesión en la interfaz web
- ✅ Crear y gestionar sus propias tareas cron
- ✅ Ver sus logs de ejecución
- ✅ Ejecutar tareas manualmente

---

## 🔄 Resumen de Comandos (Copiar y Pegar)

```bash
# 1. Crear usuario
sudo adduser carlos

# 2. Copiar scripts
sudo cp /home/melvin/wrapper_cron.sh /home/carlos/
sudo cp /home/melvin/cron_logger.php /home/carlos/
sudo chown carlos:carlos /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php
sudo chmod +x /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php

# 3. Editar sudoers (manual)
sudo nano /etc/sudoers.d/cronweb

# 4. Crear archivos JSON
echo '[]' | sudo tee /var/www/cronweb/public/cron_jobs_carlos.json
echo '[]' | sudo tee /var/www/cronweb/public/execution_logs_carlos.json
sudo chmod 666 /var/www/cronweb/public/cron_jobs_carlos.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_carlos.json

# 5. Editar auth.php (manual)
sudo nano /var/www/cronweb/public/auth.php

# 6. Reiniciar Apache
sudo systemctl restart apache2

# 7. Crear backup
sudo /home/melvin/cronweb_manager.sh backup
```

---

## ⚠️ Notas Importantes

1. **Contraseña Segura:** Usar una contraseña fuerte para el nuevo usuario
2. **Backup Antes:** Siempre crear un backup antes de hacer cambios
3. **Probar Primero:** Probar el acceso antes de dar acceso a usuarios finales
4. **Documentar:** Anotar las credenciales en un lugar seguro
5. **Permisos:** Verificar que los archivos JSON tengan permisos 666

---

## 🔧 Solución de Problemas

### Problema: "Permission denied" al ejecutar tareas
**Solución:** Verificar que sudoers incluya al nuevo usuario

### Problema: No aparece en el dropdown
**Solución:** Verificar que esté en `$allowedLinuxUsers` en auth.php

### Problema: No puede escribir en JSON
**Solución:** 
```bash
sudo chmod 666 /var/www/cronweb/public/cron_jobs_carlos.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_carlos.json
```

---

## 📞 Ayuda

Para más información, consultar `DOCUMENTACION.md`
