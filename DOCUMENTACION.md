# CronWeb Amatores - Documentación Completa

## 📋 Índice
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Características](#características)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Arquitectura](#arquitectura)
5. [Instalación](#instalación)
6. [Configuración](#configuración)
7. [Uso](#uso)
8. [Gestión de Usuarios](#gestión-de-usuarios)
9. [Backup y Restauración](#backup-y-restauración)
10. [Solución de Problemas](#solución-de-problemas)
11. [Seguridad](#seguridad)

---

## 📖 Descripción del Proyecto

**CronWeb Amatores** es una interfaz web moderna para gestionar tareas cron en sistemas Linux. Desarrollado como proyecto para el curso de Sistemas Operativos, permite a múltiples usuarios administrar sus crontabs de forma segura y eficiente a través de una interfaz intuitiva.

### Información del Proyecto
- **Nombre:** CronWeb Amatores
- **Versión:** 2.0 (Multi-usuario)
- **Curso:** Sistemas Operativos
- **Tecnologías:** PHP 8.3, Bootstrap 5, JavaScript ES6
- **Servidor:** Apache 2.4 en Ubuntu 24.04.3 LTS
- **URL de Acceso:** http://192.168.80.143

---

## ✨ Características

### Funcionalidades Principales
- ✅ **Gestión Multi-Usuario:** Soporte para múltiples usuarios Linux (melvin, raul)
- ✅ **Autenticación y Autorización:** Sistema de login con roles y permisos
- ✅ **Dashboard Interactivo:** Visualización de estadísticas en tiempo real
- ✅ **CRUD Completo:** Crear, leer, actualizar y eliminar tareas cron
- ✅ **Ejecución Manual:** Ejecutar tareas bajo demanda sin esperar al cron
- ✅ **Habilitar/Deshabilitar:** Activar o desactivar tareas sin eliminarlas
- ✅ **Sistema de Logs:** Registro detallado de todas las ejecuciones
- ✅ **Filtros y Búsqueda:** Buscar tareas por comando, descripción o estado
- ✅ **Sincronización Automática:** Los cambios se reflejan inmediatamente en el crontab del servidor
- ✅ **Backup Automático:** Respaldo antes de cada despliegue
- ✅ **Plantillas Predefinidas:** Tareas comunes (diaria, semanal, mensual, backup)
- ✅ **Exportar/Importar:** Respaldo y restauración de tareas en formato JSON
- ✅ **Tema Claro/Oscuro:** Interfaz adaptable a preferencias del usuario
- ✅ **Responsive Design:** Compatible con dispositivos móviles

### Dashboard
- **Total Tareas:** Contador de todas las tareas
- **Activas:** Tareas habilitadas en el crontab
- **Inactivas:** Tareas deshabilitadas
- **Sin Ejecutar:** Tareas nuevas o editadas que requieren ejecución

### Sistema de Logs
- Registro de todas las ejecuciones (éxito/error)
- Filtrado por estado (éxito, error, todos)
- Búsqueda por comando o salida
- Limitado a 50 registros más recientes
- Muestra descripción de la tarea y salida del comando

---

## 🖥️ Requisitos del Sistema

### Software Requerido
- **Sistema Operativo:** Ubuntu 24.04.3 LTS (o compatible)
- **Servidor Web:** Apache 2.4+
- **PHP:** 8.3+
- **Git:** Para control de versiones
- **Sudo:** Permisos configurados para www-data

### Usuarios del Sistema
- **melvin:** Usuario principal (contraseña: Soloyolase01)
- **raul:** Usuario secundario (contraseña: Soloyolase02)
- **www-data:** Usuario del servidor web Apache

### Puertos
- **80:** HTTP (Apache)
- **22:** SSH (opcional, para administración remota)

---

## 🏗️ Arquitectura

### Estructura del Proyecto
```
cronweb_project/
├── public/
│   ├── index.php              # Interfaz principal (requiere autenticación)
│   ├── login.php              # Página de inicio de sesión
│   ├── logout.php             # Cierre de sesión
│   ├── auth.php               # Sistema de autenticación
│   ├── cron_manager.php       # Backend API (gestión de tareas)
│   ├── cron_jobs_melvin.json  # Tareas del usuario melvin
│   ├── cron_jobs_raul.json    # Tareas del usuario raul
│   ├── execution_logs_melvin.json  # Logs de melvin
│   ├── execution_logs_raul.json    # Logs de raul
│   ├── css/
│   │   └── style.css          # Estilos personalizados
│   └── js/
│       └── app.js             # Lógica del frontend
├── .git/                      # Repositorio Git
└── README.md                  # Documentación básica
```

### Archivos del Sistema
```
/home/melvin/
├── wrapper_cron.sh            # Script wrapper para ejecutar comandos
├── cron_logger.php            # Script para registrar logs
└── cronweb_manager.sh         # Script de gestión (backup/deploy/rollback)

/home/raul/
├── wrapper_cron.sh            # Script wrapper para raul
└── cron_logger.php            # Script de logs para raul

/var/www/cronweb/              # Directorio de producción
└── public/                    # Archivos web públicos

/var/log/cronweb/
└── audit.log                  # Log de auditoría del sistema

/home/melvin/cronweb_backups/  # Directorio de backups
└── cronweb_backup_YYYYMMDD_HHMMSS/
```

### Flujo de Datos
```
Usuario Web → Login (auth.php)
    ↓
Dashboard (index.php) → Selecciona Usuario Linux
    ↓
Frontend (app.js) → API Request (cron_manager.php)
    ↓
Backend valida permisos → Ejecuta operación
    ↓
Actualiza JSON → Sincroniza crontab del servidor
    ↓
Respuesta → Actualiza interfaz
```

---

## 📦 Instalación

### 1. Clonar el Repositorio
```bash
cd /home/melvin
git clone https://github.com/kuibert/cronweb-Amatores-.git cronweb_project
cd cronweb_project
git checkout feature/multi-user
```

### 2. Crear Usuario Raul (si no existe)
```bash
sudo adduser raul
# Contraseña: Soloyolase02
```

### 3. Configurar Sudoers
```bash
sudo nano /etc/sudoers.d/cronweb
```
Agregar:
```
www-data ALL=(melvin,raul) NOPASSWD: /usr/bin/crontab
www-data ALL=(melvin,raul) NOPASSWD: /bin/bash
www-data ALL=(melvin,raul) NOPASSWD: /home/melvin/wrapper_cron.sh
www-data ALL=(melvin,raul) NOPASSWD: /home/raul/wrapper_cron.sh
```

### 4. Crear Directorio de Logs
```bash
sudo mkdir -p /var/log/cronweb
sudo chown www-data:www-data /var/log/cronweb
sudo chmod 755 /var/log/cronweb
```

### 5. Copiar Scripts al Home de Raul
```bash
sudo cp /home/melvin/wrapper_cron.sh /home/raul/
sudo cp /home/melvin/cron_logger.php /home/raul/
sudo chown raul:raul /home/raul/wrapper_cron.sh /home/raul/cron_logger.php
sudo chmod +x /home/raul/wrapper_cron.sh /home/raul/cron_logger.php
```

### 6. Configurar Apache
```bash
sudo nano /etc/apache2/sites-available/cronweb.conf
```
Contenido:
```apache
<VirtualHost *:80>
    ServerName 192.168.80.143
    DocumentRoot /var/www/cronweb/public
    
    <Directory /var/www/cronweb/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/cronweb_error.log
    CustomLog ${APACHE_LOG_DIR}/cronweb_access.log combined
</VirtualHost>
```

Habilitar sitio:
```bash
sudo a2ensite cronweb
sudo systemctl reload apache2
```

### 7. Desplegar Aplicación
```bash
sudo /home/melvin/cronweb_manager.sh deploy
```

### 8. Configurar Permisos de Archivos JSON
```bash
sudo chmod 666 /var/www/cronweb/public/cron_jobs_*.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_*.json
```

---

## ⚙️ Configuración

### Usuarios Web (auth.php)
```php
$webUsers = [
    'admin' => [
        'password' => password_hash('admin123', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['melvin', 'raul']
    ],
    'melvin' => [
        'password' => password_hash('Soloyolase01', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['melvin']
    ],
    'raul' => [
        'password' => password_hash('Soloyolase02', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['raul']
    ]
];
```

### Lista Blanca de Usuarios Linux
```php
$allowedLinuxUsers = ['melvin', 'raul'];
```

### Credenciales de Acceso
| Usuario Web | Contraseña | Acceso a Usuarios Linux |
|-------------|------------|------------------------|
| admin | admin123 | melvin, raul |
| melvin | Soloyolase01 | melvin |
| raul | Soloyolase02 | raul |

---

## 🚀 Uso

### Acceso a la Aplicación
1. Abrir navegador: http://192.168.80.143/login.php
2. Ingresar credenciales
3. Seleccionar usuario Linux en el dropdown del navbar

### Crear una Tarea
1. Ir a "Listar Tareas" o hacer clic en "Nueva Tarea"
2. Llenar el formulario:
   - **Comando:** El comando a ejecutar (ej: `echo "Hola mundo"`)
   - **Descripción:** Descripción opcional
   - **Programación:** Minuto, Hora, Día, Mes, Día de la semana
3. Hacer clic en "Guardar"
4. La tarea se agrega automáticamente al crontab del servidor

### Ejecutar una Tarea Manualmente
1. Ir a "Listar Tareas"
2. Hacer clic en el botón ▶️ (Ejecutar)
3. Confirmar la ejecución
4. Ver el resultado en la alerta y en los logs

### Habilitar/Deshabilitar una Tarea
1. Ir a "Listar Tareas"
2. Hacer clic en el botón ⏸️ (Desactivar) o ▶️ (Habilitar)
3. La tarea se elimina/agrega del crontab automáticamente

### Editar una Tarea
1. Ir a "Listar Tareas"
2. Hacer clic en el botón ✏️ (Editar)
3. Modificar los campos necesarios
4. Hacer clic en "Actualizar"
5. La tarea se marca como "Sin Ejecutar" hasta que se ejecute

### Eliminar una Tarea
1. Ir a "Listar Tareas"
2. Hacer clic en el botón 🗑️ (Eliminar)
3. Confirmar la eliminación
4. La tarea se elimina del JSON y del crontab

### Ver Logs
1. Ir a "Logs"
2. Usar filtros:
   - **Estado:** Todos, Solo éxitos, Solo errores
   - **Búsqueda:** Por comando o salida
3. Ver detalles de cada ejecución

### Exportar/Importar Tareas
**Exportar:**
1. Ir a "Configuración"
2. Hacer clic en "Exportar Todas las Tareas"
3. Se descarga un archivo JSON

**Importar:**
1. Ir a "Configuración"
2. Hacer clic en "Importar Tareas"
3. Seleccionar archivo JSON
4. Las tareas se agregan al sistema

---

## 👥 Gestión de Usuarios

### Agregar un Nuevo Usuario Linux

#### 1. Crear el Usuario en el Sistema
```bash
sudo adduser carlos
# Establecer contraseña
```

#### 2. Copiar Scripts Necesarios
```bash
sudo cp /home/melvin/wrapper_cron.sh /home/carlos/
sudo cp /home/melvin/cron_logger.php /home/carlos/
sudo chown carlos:carlos /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php
sudo chmod +x /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php
```

#### 3. Actualizar Sudoers
```bash
sudo nano /etc/sudoers.d/cronweb
```
Agregar `carlos` a todas las líneas:
```
www-data ALL=(melvin,raul,carlos) NOPASSWD: /usr/bin/crontab
www-data ALL=(melvin,raul,carlos) NOPASSWD: /bin/bash
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/melvin/wrapper_cron.sh
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/raul/wrapper_cron.sh
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/carlos/wrapper_cron.sh
```

#### 4. Crear Archivos JSON
```bash
echo '[]' | sudo tee /var/www/cronweb/public/cron_jobs_carlos.json
echo '[]' | sudo tee /var/www/cronweb/public/execution_logs_carlos.json
sudo chmod 666 /var/www/cronweb/public/cron_jobs_carlos.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_carlos.json
```

#### 5. Actualizar auth.php
Editar `/var/www/cronweb/public/auth.php`:
```php
$webUsers = [
    // ... usuarios existentes ...
    'carlos' => [
        'password' => password_hash('contraseña_carlos', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['carlos']
    ]
];

$allowedLinuxUsers = ['melvin', 'raul', 'carlos'];
```

#### 6. Actualizar cron_logger.php de Carlos
Editar `/home/carlos/cron_logger.php` para asegurar que use el archivo correcto.

#### 7. Reiniciar Apache
```bash
sudo systemctl restart apache2
```

---

## 💾 Backup y Restauración

### Script de Gestión
El script `/home/melvin/cronweb_manager.sh` proporciona comandos para gestionar backups.

### Crear Backup Manual
```bash
sudo /home/melvin/cronweb_manager.sh backup
```

### Desplegar (con Backup Automático)
```bash
sudo /home/melvin/cronweb_manager.sh deploy
```

### Restaurar un Backup
```bash
# Listar backups disponibles
ls -lt /home/melvin/cronweb_backups/

# Restaurar un backup específico
sudo /home/melvin/cronweb_manager.sh rollback cronweb_backup_YYYYMMDD_HHMMSS
```

### Ver Estado
```bash
sudo /home/melvin/cronweb_manager.sh status
```

### Ubicación de Backups
- **Directorio:** `/home/melvin/cronweb_backups/`
- **Formato:** `cronweb_backup_YYYYMMDD_HHMMSS/`
- **Contenido:** Copia completa del proyecto

### Backup Estable Recomendado
```
cronweb_backup_20251123_035353
```
Este backup contiene la versión estable con todas las funcionalidades operativas.

---

## 🔧 Solución de Problemas

### Problema: Los botones no funcionan
**Causa:** Permisos incorrectos en archivos JSON  
**Solución:**
```bash
sudo chmod 666 /var/www/cronweb/public/cron_jobs_*.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_*.json
```

### Problema: Error "Permission denied" al ejecutar tareas
**Causa:** Sudoers no configurado correctamente  
**Solución:**
```bash
sudo visudo -f /etc/sudoers.d/cronweb
# Verificar que www-data tenga permisos NOPASSWD
```

### Problema: Las tareas no se sincronizan con el crontab
**Causa:** Permisos del archivo temporal  
**Solución:** Ya está corregido en la versión actual con `chmod($tempFile, 0644)`

### Problema: No se pueden ver los logs
**Causa:** Archivo de logs no existe o sin permisos  
**Solución:**
```bash
sudo touch /var/www/cronweb/public/execution_logs_melvin.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_melvin.json
```

### Problema: La interfaz no carga
**Causa:** Apache no configurado o sesión no iniciada  
**Solución:**
```bash
# Verificar Apache
sudo systemctl status apache2

# Verificar logs
sudo tail -f /var/log/apache2/cronweb_error.log
```

### Problema: "No autenticado" al hacer peticiones
**Causa:** Sesión expirada  
**Solución:** Cerrar sesión y volver a iniciar

### Ver Logs del Sistema
```bash
# Logs de Apache
sudo tail -f /var/log/apache2/cronweb_error.log

# Logs de auditoría
sudo tail -f /var/log/cronweb/audit.log

# Logs del sistema cron
sudo tail -f /var/log/syslog | grep CRON
```

---

## 🔒 Seguridad

### Nivel de Seguridad Implementado
**Nivel 2 - Intermedio**

### Medidas de Seguridad

#### 1. Autenticación
- Sistema de login con usuario y contraseña
- Contraseñas hasheadas con `password_hash()` (bcrypt)
- Sesiones PHP para mantener estado de autenticación

#### 2. Autorización
- Control de acceso basado en roles
- Cada usuario web solo puede acceder a sus usuarios Linux asignados
- Validación de permisos en cada petición

#### 3. Validación de Entrada
- Lista blanca de usuarios Linux permitidos
- Validación de nombres de usuario con regex
- Sanitización de comandos con `escapeshellarg()`
- Validación de campos de cron (minuto, hora, día, mes, día de semana)

#### 4. Auditoría
- Log de todas las acciones en `/var/log/cronweb/audit.log`
- Registro de login/logout
- Registro de operaciones CRUD
- Registro de ejecuciones de tareas

#### 5. Protección de Archivos
- Archivos PHP fuera del DocumentRoot cuando es posible
- Permisos restrictivos en archivos de configuración
- `.htaccess` para proteger archivos sensibles (si se implementa)

#### 6. Configuración Sudo
- Permisos NOPASSWD solo para comandos específicos
- Restricción a usuarios específicos (melvin, raul)
- No se permite ejecución arbitraria de comandos

### Recomendaciones Adicionales

#### Para Producción
1. **HTTPS:** Implementar certificado SSL/TLS
2. **Firewall:** Configurar UFW para limitar acceso
3. **Fail2ban:** Protección contra fuerza bruta
4. **Contraseñas Fuertes:** Cambiar contraseñas por defecto
5. **Backups Regulares:** Automatizar backups diarios
6. **Monitoreo:** Implementar alertas de seguridad

#### Comandos de Seguridad
```bash
# Habilitar firewall
sudo ufw enable
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp

# Instalar fail2ban
sudo apt install fail2ban

# Cambiar contraseñas
sudo passwd melvin
sudo passwd raul
```

---

## 📊 Comandos Útiles

### Ver Crontabs
```bash
# Ver crontab de melvin
crontab -l

# Ver crontab de raul
sudo crontab -u raul -l

# Ver todos los crontabs
for user in melvin raul; do 
  echo "=== $user ==="; 
  sudo crontab -u $user -l 2>/dev/null || echo "Sin crontab"; 
done
```

### Ver Tareas en JSON
```bash
# Ver tareas de melvin
cat /var/www/cronweb/public/cron_jobs_melvin.json | jq .

# Contar tareas habilitadas
cat /var/www/cronweb/public/cron_jobs_melvin.json | grep '"enabled": true' | wc -l

# Contar tareas deshabilitadas
cat /var/www/cronweb/public/cron_jobs_melvin.json | grep '"enabled": false' | wc -l
```

### Ver Logs
```bash
# Ver logs de ejecución
cat /var/www/cronweb/public/execution_logs_melvin.json | jq .

# Ver últimos 10 logs
cat /var/www/cronweb/public/execution_logs_melvin.json | jq '.[-10:]'

# Ver solo errores
cat /var/www/cronweb/public/execution_logs_melvin.json | jq '.[] | select(.status == "error")'
```

### Gestión del Proyecto
```bash
# Ver estado de Git
cd /home/melvin/cronweb_project
git status

# Ver commits recientes
git log --oneline -10

# Ver diferencias
git diff

# Crear backup
sudo /home/melvin/cronweb_manager.sh backup

# Desplegar
sudo /home/melvin/cronweb_manager.sh deploy

# Restaurar
sudo /home/melvin/cronweb_manager.sh rollback cronweb_backup_YYYYMMDD_HHMMSS
```

---

## 📝 Notas Finales

### Problemas Conocidos
1. **Botón "Ejecutar" en Dashboard:** El botón de ejecutar en la sección "Sin Ejecutar" del dashboard no funciona correctamente. Usar el botón de ejecutar en "Listar Tareas" como alternativa.

### Mejoras Futuras
- Notificaciones por email cuando una tarea falla
- Historial de cambios en tareas
- Estadísticas de ejecución (gráficas)
- API REST completa
- Soporte para variables de entorno
- Editor de cron con autocompletado
- Validación de sintaxis de comandos
- Previsualización de próximas ejecuciones

### Contacto y Soporte
- **Repositorio:** https://github.com/kuibert/cronweb-Amatores-
- **Branch Principal:** feature/multi-user
- **Desarrolladores:** Equipo Amatores

---

## 📄 Licencia
Este proyecto fue desarrollado con fines educativos para el curso de Sistemas Operativos.

---

**Última actualización:** 23 de Noviembre de 2025  
**Versión del documento:** 1.0
