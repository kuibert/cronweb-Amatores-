# cronweb-Amatores-
Interfaz web para gestionar tareas programadas con crontab - Sistemas Operativos

## 📋 Descripción
Aplicación web desarrollada por el equipo **Amatores** para administrar tareas cron de manera visual e intuitiva usando Bootstrap y PHP.

## ✨ Funcionalidades
- 📊 **Dashboard** con estadísticas de tareas
- 📋 **Listar tareas** cron existentes
- ➕ **Crear nuevas tareas** con formulario intuitivo
- 🔄 **Habilitar/Deshabilitar** tareas
- 🗑️ **Eliminar tareas** con confirmación
- 👁️ **Ver crontab** actual del sistema

## 🛠️ Tecnologías
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: PHP 8.3
- **Servidor**: Apache 2.4
- **SO**: Ubuntu Server 24.04.3 LTS

## 🚀 Instalación

### Desarrollo Local
```bash
git clone https://github.com/tu-usuario/cronweb-Amatores-.git
cd cronweb-Amatores-
php -S localhost:8000 -t public
```

### Producción Ubuntu 24.04.3 LTS
```bash
git clone https://github.com/tu-usuario/cronweb-Amatores-.git
cd cronweb-Amatores-
chmod +x ubuntu24-install.sh
./ubuntu24-install.sh
```

## 📁 Estructura del Proyecto
```
cronweb-Amatores-/
├── public/                 # Archivos web públicos
│   ├── index.html         # Interfaz principal
│   ├── css/style.css      # Estilos personalizados
│   └── js/app.js          # JavaScript frontend
├── src/                   # Backend PHP
│   └── cron_manager.php   # API para gestión de cron
├── deploy.sh              # Script de despliegue general
├── ubuntu24-install.sh    # Instalación Ubuntu 24.04.3
├── test-server.sh         # Script de verificación
└── README.md              # Documentación
```

## 🌐 Uso
1. Acceder a `http://servidor/cronweb-amatores`
2. Usar el sidebar para navegar entre funciones
3. Crear, listar, habilitar/deshabilitar tareas cron
4. Ver el crontab actual del sistema

## 👥 Equipo Amatores
Proyecto desarrollado para la materia de Sistemas Operativos

## 📄 Licencia
MIT License