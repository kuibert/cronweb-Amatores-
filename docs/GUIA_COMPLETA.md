# CronWeb Amatores - Guía Completa

## 📋 Índice
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Características](#características)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Arquitectura del Proyecto v2.0](#arquitectura-del-proyecto-v20)
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

## 🏗️ Arquitectura del Proyecto v2.0

### 📐 Estructura del Proyecto

```
cronweb_project/
├── config/
│   └── config.php              # Configuración centralizada
├── src/
│   ├── Models/                 # Modelos de datos
│   │   ├── CronJob.php        # Modelo de tarea cron
│   │   ├── CronValidator.php  # Validador de expresiones cron
│   │   └── CronExecutor.php   # Ejecutor de comandos
│   ├── Services/              # Lógica de negocio
│   │   ├── CronService.php    # Servicio principal de cron
│   │   └── LogService.php     # Servicio de logs
│   ├── Controllers/           # Controladores
│   │   └── CronController.php # Controlador de API
│   ├── Auth/                  # Autenticación (futuro)
│   └── autoload.php           # Autoloader de clases
├── public/
│   ├── cron_manager_v2.php    # API REST nueva arquitectura
│   ├── cron_manager.php       # API REST antigua (compatibilidad)
│   ├── index.php              # Interfaz web
│   ├── auth.php               # Autenticación
│   └── js/app.js              # Frontend JavaScript
└── test_architecture.php      # Tests de arquitectura
```

### 🏗️ Patrón de Arquitectura: Modelo-Vista-Controlador (MVC) Adaptado

**Modelos (Models)**
- `CronJob`: Representa una tarea cron con sus propiedades
- `CronValidator`: Valida expresiones cron
- `CronExecutor`: Ejecuta comandos y actualiza crontab del sistema

**Servicios (Services)**
- `CronService`: Orquesta operaciones CRUD de tareas cron
- `LogService`: Gestiona logs de ejecución

**Controladores (Controllers)**
- `CronController`: Maneja peticiones HTTP y coordina servicios

**Vistas (Views)**
- `index.php`: Interfaz HTML
- `app.js`: Lógica de presentación

### 🔄 Flujo de Datos

```
Cliente (Browser)
    ↓
app.js (AJAX)
    ↓
cron_manager_v2.php (API)
    ↓
CronController
    ↓
CronService
    ↓
CronJob / CronExecutor / LogService
    ↓
Sistema de archivos / Crontab
```

### 📦 Responsabilidades por Capa

#### 1. Modelos (Models)
**Responsabilidad**: Representar datos y lógica de dominio
- **CronJob**: Propiedades, Getters/Setters, conversión a array.
- **CronValidator**: Validar rangos y formatos de expresiones cron.
- **CronExecutor**: Ejecutar comandos con sudo y actualizar crontab.

#### 2. Servicios (Services)
**Responsabilidad**: Lógica de negocio y orquestación
- **CronService**: CRUD de tareas, persistencia en JSON, coordinación.
- **LogService**: Gestión de logs de ejecución.

#### 3. Controladores (Controllers)
**Responsabilidad**: Manejar peticiones HTTP
- **CronController**: Recibir peticiones, validar entrada, llamar servicios, formatear respuestas JSON.

#### 4. Configuración (Config)
**Responsabilidad**: Centralizar configuración (rutas, límites, usuarios).

### ✅ Ventajas de la Nueva Arquitectura

1.  **Separación de Responsabilidades**: Cada clase tiene un propósito único.
2.  **Reutilización de Código**: Los servicios y modelos son independientes.
3.  **Testeable**: Cada componente puede probarse de forma aislada.
4.  **Escalable**: Fácil de agregar nuevas funcionalidades.
5.  **Mantenible**: Código organizado y predecible.

### 🔄 Compatibilidad con Versión Anterior

La nueva arquitectura mantiene **100% de compatibilidad** con la API anterior. `cron_manager.php` (antiguo) sigue funcionando junto a `cron_manager_v2.php` (nuevo), garantizando una migración transparente.

---

## 📦 Instalación

### Método 1: Instalación Manual Detallada

#### Paso 0: Instalación de Dependencias del Servidor
Antes de configurar la aplicación, asegúrese de que el servidor tenga todo el software necesario. Estos comandos son para sistemas basados en Ubuntu/Debian.

1.  **Actualizar el sistema:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Instalar Apache, PHP y Git:**
    ```bash
    sudo apt install -y apache2 php libapache2-mod-php php-json git
    ```

3.  **Verificar que Apache esté funcionando:**
    ```bash
    sudo systemctl status apache2
    ```
    Puede abrir la IP del servidor en un navegador y debería ver la página de bienvenida de Apache.

#### 1. Clonar el Repositorio
```bash
cd /home/melvin
git clone https://github.com/kuibert/cronweb-Amatores-.git cronweb_project
cd cronweb_project
git checkout feature/multi-user
```

#### 2. Crear Usuario `raul` (si no existe)
```bash
sudo adduser raul
# Asignar contraseña: Soloyolase02
```

#### 3. Configurar Permisos de Sudo
Cree un nuevo archivo de configuración para evitar modificar `sudoers` directamente.
```bash
sudo nano /etc/sudoers.d/cronweb
```
Agregue el siguiente contenido para permitir que el servidor web (`www-data`) ejecute comandos en nombre de los usuarios `melvin` y `raul` sin contraseña:
```
www-data ALL=(melvin,raul) NOPASSWD: /usr/bin/crontab
www-data ALL=(melvin,raul) NOPASSWD: /bin/bash
www-data ALL=(melvin,raul) NOPASSWD: /home/melvin/wrapper_cron.sh
www-data ALL=(melvin,raul) NOPASSWD: /home/raul/wrapper_cron.sh
```

#### 4. Crear Directorio de Logs
```bash
sudo mkdir -p /var/log/cronweb
sudo chown www-data:www-data /var/log/cronweb
sudo chmod 755 /var/log/cronweb
```

#### 5. Copiar Scripts al Home de `raul`
```bash
sudo cp /home/melvin/cronweb_scripts/wrapper_cron.sh /home/raul/
sudo cp /home/melvin/cronweb_scripts/cron_logger.php /home/raul/
sudo chown raul:raul /home/raul/wrapper_cron.sh /home/raul/cron_logger.php
sudo chmod +x /home/raul/wrapper_cron.sh /home/raul/cron_logger.php
```

#### 6. Configurar Apache
Cree un archivo de host virtual para el sitio.
```bash
sudo nano /etc/apache2/sites-available/cronweb.conf
```
Contenido del archivo:
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
Habilite el nuevo sitio y recargue Apache:
```bash
sudo a2ensite cronweb
sudo systemctl reload apache2
```

#### 7. Desplegar Aplicación
Use el script de gestión para desplegar la aplicación en el directorio web.
```bash
sudo /home/melvin/cronweb_manager.sh deploy
```

#### 8. Configurar Permisos de Archivos JSON
El servidor web necesita poder escribir en los archivos de datos.
```bash
sudo chmod 666 /var/www/cronweb/public/cron_jobs_*.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_*.json
```

### Método 2: Despliegue Remoto con Scripts SSH

Este método es ideal para desplegar o actualizar una instancia en un servidor remoto desde su máquina de desarrollo.

#### Requisitos
- Acceso SSH al servidor remoto.
- `rsync` instalado localmente.
- Permisos de `sudo` en el servidor remoto.

#### Pasos

1.  **Dar permisos de ejecución a los scripts** en su máquina local:
    ```bash
    chmod +x deploy-remote.sh verify-deployment.sh update-remote.sh
    ```

2.  **Ejecutar el script de despliegue**:
    Este comando copiará los archivos del proyecto al directorio de destino en el servidor remoto.
    ```bash
    # Uso: ./deploy-remote.sh <usuario>@<servidor> <ruta_destino>
    ./deploy-remote.sh usuario@servidor.com /var/www/cronweb
    ```
    Ejemplo con IP:
    ```bash
    ./deploy-remote.sh root@192.168.1.100 /var/www/cronweb
    ```

3.  **Verificar el despliegue**:
    Este script se conecta por SSH y comprueba que los archivos existan en el servidor remoto.
    ```bash
    ./verify-deployment.sh usuario@servidor.com /var/www/cronweb
    ```

4.  **Actualizar una instalación existente**:
    Si solo necesita subir los cambios más recientes, use el script de actualización.
    ```bash
    ./update-remote.sh usuario@servidor.com /var/www/cronweb
    ```

---

## ⚙️ Configuración

### Usuarios Web (`auth.php`)
Edite el archivo `/var/www/cronweb/public/auth.php` para gestionar los usuarios que pueden acceder a la interfaz web.
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
En el mismo archivo, asegúrese de que la lista `allowedLinuxUsers` contiene todos los usuarios que gestionará el sistema.
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
1.  Abrir navegador: `http://<IP_DEL_SERVIDOR>/login.php`
2.  Ingresar credenciales.
3.  Seleccionar el usuario de Linux a gestionar desde el menú desplegable en la barra de navegación.

### Funciones Principales
-   **Crear Tarea**: Use el botón "Nueva Tarea", complete el formulario y guarde.
-   **Ejecutar Manualmente**: Haga clic en el ícono ▶️ en la lista de tareas.
-   **Habilitar/Deshabilitar**: Use los íconos ⏸️ y ▶️ para activar o desactivar una tarea sin borrarla.
-   **Editar/Eliminar**: Use los íconos ✏️ y 🗑️.
-   **Ver Logs**: Vaya a la sección "Logs" para ver el historial de ejecuciones.
-   **Exportar/Importar**: En "Configuración", puede respaldar o restaurar sus tareas desde un archivo JSON.

---

## 👥 Gestión de Usuarios

Esta guía detalla cómo agregar un nuevo usuario (ejemplo: "carlos") al sistema CronWeb Amatores.

### Paso 1: Crear el Usuario en el Sistema
```bash
sudo adduser carlos
```
Cuando se solicite, establezca una contraseña segura.

### Paso 2: Copiar Scripts Necesarios
Copie los scripts de ejecución y logging desde el directorio de scripts principal al `home` del nuevo usuario.
```bash
sudo cp /home/melvin/cronweb_scripts/wrapper_cron.sh /home/carlos/
sudo cp /home/melvin/cronweb_scripts/cron_logger.php /home/carlos/

# Establecer al nuevo usuario como propietario y dar permisos de ejecución
sudo chown carlos:carlos /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php
sudo chmod +x /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php
```

### Paso 3: Actualizar Configuración de Sudoers
Añada al nuevo usuario a la configuración de `sudo` para que el servidor web pueda actuar en su nombre.
```bash
sudo nano /etc/sudoers.d/cronweb
```
Modifique las líneas existentes para incluir a `carlos`:
```
# ANTES: www-data ALL=(melvin,raul) NOPASSWD: ...
# DESPUÉS:
www-data ALL=(melvin,raul,carlos) NOPASSWD: /usr/bin/crontab
www-data ALL=(melvin,raul,carlos) NOPASSWD: /bin/bash
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/melvin/wrapper_cron.sh
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/raul/wrapper_cron.sh
www-data ALL=(melvin,raul,carlos) NOPASSWD: /home/carlos/wrapper_cron.sh
```

### Paso 4: Crear Archivos JSON para el Nuevo Usuario
El sistema necesita archivos para almacenar las tareas y los logs del nuevo usuario.
```bash
echo '[]' | sudo tee /var/www/cronweb/public/cron_jobs_carlos.json
echo '[]' | sudo tee /var/www/cronweb/public/execution_logs_carlos.json

# Otorgar permisos de escritura para el servidor web
sudo chmod 666 /var/www/cronweb/public/cron_jobs_carlos.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_carlos.json
```

### Paso 5: Actualizar Sistema de Autenticación (`auth.php`)
Edite el archivo de configuración para que la aplicación web reconozca al nuevo usuario.
```bash
sudo nano /var/www/cronweb/public/auth.php
```
**1. Agregar Usuario Web:** Añada a `carlos` al array `$webUsers` y (si es necesario) a los permisos de `admin`.
```php
$webUsers = [
    'admin' => [
        'password' => password_hash('admin123', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['melvin', 'raul', 'carlos'] // <-- Añadir aquí
    ],
    // ... otros usuarios ...
    'carlos' => [ // <-- Añadir bloque completo
        'password' => password_hash('contraseña_de_carlos', PASSWORD_DEFAULT),
        'allowed_linux_users' => ['carlos']
    ]
];
```
**2. Actualizar Lista Blanca:** Añada a `carlos` al array `$allowedLinuxUsers`.
```php
$allowedLinuxUsers = ['melvin', 'raul', 'carlos'];
```

### Paso 6: Reiniciar Apache
Para que los cambios en la configuración de PHP surtan efecto.
```bash
sudo systemctl restart apache2
```

### Paso 7: Verificación
1.  **Probar acceso web**: Inicie sesión en la interfaz con el usuario `carlos`.
2.  **Verificar permisos de `crontab`**:
    ```bash
    sudo -u www-data sudo -u carlos crontab -l
    ```
    (Es normal que la salida sea "no crontab for carlos").
3.  **Crear una tarea desde la interfaz** y verificar que se guarda correctamente.

### Resumen de Comandos para Copiar y Pegar
```bash
# 1. Crear usuario
sudo adduser carlos

# 2. Copiar y configurar scripts
sudo cp /home/melvin/cronweb_scripts/wrapper_cron.sh /home/carlos/
sudo cp /home/melvin/cronweb_scripts/cron_logger.php /home/carlos/
sudo chown carlos:carlos /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php
sudo chmod +x /home/carlos/wrapper_cron.sh /home/carlos/cron_logger.php

# 3. Editar sudoers (acción manual)
sudo nano /etc/sudoers.d/cronweb

# 4. Crear archivos JSON
echo '[]' | sudo tee /var/www/cronweb/public/cron_jobs_carlos.json
echo '[]' | sudo tee /var/www/cronweb/public/execution_logs_carlos.json
sudo chmod 666 /var/www/cronweb/public/cron_jobs_carlos.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_carlos.json

# 5. Editar auth.php (acción manual)
sudo nano /var/www/cronweb/public/auth.php

# 6. Reiniciar Apache
sudo systemctl restart apache2
```


---

## 💾 Backup y Restauración

El script `/home/melvin/cronweb_manager.sh` centraliza la gestión.

-   **Crear Backup Manual**: `sudo /home/melvin/cronweb_manager.sh backup`
-   **Desplegar (con Backup Automático)**: `sudo /home/melvin/cronweb_manager.sh deploy`
-   **Restaurar un Backup**: `sudo /home/melvin/cronweb_manager.sh rollback <nombre_del_backup>`
-   **Ver Estado**: `sudo /home/melvin/cronweb_manager.sh status`

Los backups se guardan en `/home/melvin/cronweb_backups/`.

---

## 🔧 Solución de Problemas

### Problema: Los botones de la interfaz no responden.
**Solución:** Verifique los permisos de los archivos `.json`.
```bash
sudo chmod 666 /var/www/cronweb/public/cron_jobs_*.json
sudo chmod 666 /var/www/cronweb/public/execution_logs_*.json
```

### Problema: Error "Permission denied" al ejecutar tareas.
**Solución:** Revise la configuración en `/etc/sudoers.d/cronweb` y asegúrese de que la sintaxis es correcta.

### Problema: La interfaz no carga o muestra errores.
**Solución:** Revise los logs de error de Apache.
```bash
sudo tail -f /var/log/apache2/cronweb_error.log
```

---

## 🔒 Seguridad

-   **Autenticación**: Contraseñas hasheadas y gestión de sesiones.
-   **Autorización**: Roles que limitan el acceso de un usuario web a usuarios Linux específicos.
-   **Validación de Entradas**: Listas blancas y saneamiento para prevenir command injection.
-   **Auditoría**: Logs de acciones en `/var/log/cronweb/audit.log`.
-   **Sudo**: Permisos mínimos necesarios para operar.

**Recomendaciones para un entorno de producción**: Usar HTTPS, configurar un firewall (UFW), instalar Fail2ban y utilizar contraseñas fuertes.
