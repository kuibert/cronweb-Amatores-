# Arquitectura del Proyecto CronWeb Amatores v2.0

## 📐 Estructura del Proyecto

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

## 🏗️ Patrón de Arquitectura

### Modelo-Vista-Controlador (MVC) Adaptado

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

## 🔄 Flujo de Datos

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

## 📦 Responsabilidades por Capa

### 1. Modelos (Models)
**Responsabilidad**: Representar datos y lógica de dominio

- **CronJob**: 
  - Propiedades de una tarea cron
  - Getters y setters
  - Conversión a array
  
- **CronValidator**:
  - Validar campos de expresiones cron
  - Validar rangos y formatos
  - Convertir schedule a string
  
- **CronExecutor**:
  - Ejecutar comandos con sudo
  - Actualizar crontab del sistema
  - Generar contenido de crontab

### 2. Servicios (Services)
**Responsabilidad**: Lógica de negocio y orquestación

- **CronService**:
  - CRUD de tareas cron
  - Persistencia en JSON
  - Coordinación con executor y logs
  
- **LogService**:
  - Agregar logs de ejecución
  - Obtener logs con límite
  - Limpiar logs antiguos

### 3. Controladores (Controllers)
**Responsabilidad**: Manejar peticiones HTTP

- **CronController**:
  - Recibir peticiones
  - Validar entrada
  - Llamar servicios
  - Formatear respuestas JSON

### 4. Configuración (Config)
**Responsabilidad**: Centralizar configuración

- Rutas de archivos
- Límites y parámetros
- Usuarios permitidos

## ✅ Ventajas de la Nueva Arquitectura

1. **Separación de Responsabilidades**
   - Cada clase tiene una única responsabilidad
   - Fácil de entender y mantener

2. **Reutilización de Código**
   - Servicios pueden usarse desde múltiples controladores
   - Modelos independientes del framework

3. **Testeable**
   - Cada componente puede probarse aisladamente
   - Mock de dependencias fácil

4. **Escalable**
   - Agregar nuevas funcionalidades sin modificar código existente
   - Fácil agregar nuevos endpoints

5. **Mantenible**
   - Código organizado y predecible
   - Fácil localizar bugs

## 🔄 Compatibilidad con Versión Anterior

La nueva arquitectura mantiene **100% de compatibilidad** con la API anterior:

- `cron_manager.php` (antiguo) sigue funcionando
- `cron_manager_v2.php` (nuevo) usa la nueva arquitectura
- Mismos endpoints y respuestas JSON
- Migración transparente para el frontend

## 🚀 Próximos Pasos

### Fase 2: Refactorizar Frontend
- Dividir `app.js` en módulos
- Crear `api-client.js` para llamadas AJAX
- Crear `ui-manager.js` para manipulación DOM
- Crear `validators.js` para validaciones cliente

### Fase 3: Mejoras Adicionales
- Agregar tests unitarios
- Implementar caché
- Agregar API de webhooks
- Dashboard de estadísticas

## 📝 Uso de la Nueva Arquitectura

### Desde PHP:
```php
require_once 'src/autoload.php';
use CronWeb\Controllers\CronController;

$config = require 'config/config.php';
$controller = new CronController('melvin', $config);

// Listar tareas
$jobs = $controller->list();

// Agregar tarea
$result = $controller->add([
    'command' => 'echo "Hola"',
    'description' => 'Test',
    'minute' => '0',
    'hour' => '9',
    'day' => '*',
    'month' => '*',
    'weekday' => '*'
]);
```

### Desde JavaScript:
```javascript
// Usar cron_manager_v2.php en lugar de cron_manager.php
fetch('cron_manager_v2.php?action=list&linux_user=melvin')
    .then(response => response.json())
    .then(data => console.log(data));
```

## 🔧 Mantenimiento

### Agregar nueva funcionalidad:
1. Crear método en `CronService` (lógica)
2. Crear método en `CronController` (endpoint)
3. Agregar case en `cron_manager_v2.php` (routing)
4. Actualizar frontend si es necesario

### Modificar validación:
1. Editar `CronValidator.php`
2. Los cambios se aplican automáticamente

### Cambiar formato de almacenamiento:
1. Editar `CronService.php`
2. Mantener interfaz pública igual
