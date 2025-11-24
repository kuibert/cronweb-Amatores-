# Checklist de Testing Manual - CronWeb Amatores v2.0

## ✅ Tests Automatizados

- [x] **28/28 tests pasados** ✓
- [x] Configuración cargada correctamente
- [x] Modelos funcionando
- [x] Servicios operativos
- [x] Controladores respondiendo
- [x] Integración completa
- [x] Archivos verificados
- [x] Compatibilidad confirmada

## 📋 Checklist de Testing Manual

### 1. Preparación del Entorno de Testing

```bash
# Copiar archivos a directorio de testing
cp -r /home/melvin/cronweb_project /home/melvin/cronweb_test

# O usar el proyecto actual
cd /home/melvin/cronweb_project
```

### 2. Testing Backend (PHP)

#### 2.1 API v2 - Endpoints Básicos

- [ ] **GET /cron_manager_v2.php?action=list**
  - Debe retornar array de tareas en JSON
  - Verificar estructura de respuesta

- [ ] **GET /cron_manager_v2.php?action=get_linux_users**
  - Debe retornar lista de usuarios permitidos
  - Verificar que incluye 'melvin' y 'raul'

- [ ] **GET /cron_manager_v2.php?action=logs**
  - Debe retornar array de logs
  - Verificar formato de timestamps

#### 2.2 API v2 - Operaciones CRUD

- [ ] **POST /cron_manager_v2.php?action=add**
  - Agregar tarea de prueba
  - Verificar respuesta success: true
  - Verificar que aparece en listado

- [ ] **POST /cron_manager_v2.php?action=edit**
  - Editar tarea creada
  - Verificar cambios aplicados

- [ ] **POST /cron_manager_v2.php?action=toggle**
  - Desactivar tarea
  - Verificar estado cambiado

- [ ] **POST /cron_manager_v2.php?action=delete**
  - Eliminar tarea de prueba
  - Verificar que desaparece del listado

#### 2.3 Compatibilidad con API v1

- [ ] **Verificar que cron_manager.php sigue funcionando**
  - Probar mismo endpoint con API antigua
  - Confirmar misma respuesta

### 3. Testing Frontend (JavaScript)

#### 3.1 Módulos JavaScript

Abrir consola del navegador y verificar:

```javascript
// Verificar que módulos están cargados
console.log(typeof ApiClient);     // "object"
console.log(typeof Validators);    // "object"
console.log(typeof UIManager);     // "object"
console.log(typeof CronTemplates); // "object"
```

- [ ] **ApiClient cargado**
- [ ] **Validators cargado**
- [ ] **UIManager cargado**
- [ ] **CronTemplates cargado**

#### 3.2 Funcionalidad de UI

- [ ] **Selector de usuarios**
  - Cambiar entre usuarios
  - Verificar que carga tareas del usuario seleccionado

- [ ] **Dashboard**
  - Verificar contadores actualizados
  - Total, Activas, Inactivas, Ejecutadas

- [ ] **Tabla de tareas**
  - Mostrar tareas correctamente
  - Botones de acción visibles

#### 3.3 Operaciones CRUD desde UI

- [ ] **Agregar tarea**
  - Abrir modal/formulario
  - Llenar campos
  - Guardar
  - Verificar notificación de éxito
  - Verificar que aparece en tabla

- [ ] **Editar tarea**
  - Click en botón editar
  - Modificar campos
  - Guardar
  - Verificar cambios

- [ ] **Activar/Desactivar tarea**
  - Click en toggle
  - Verificar cambio de estado visual
  - Verificar badge cambia

- [ ] **Ejecutar tarea**
  - Click en ejecutar
  - Verificar notificación
  - Verificar log generado

- [ ] **Eliminar tarea**
  - Click en eliminar
  - Confirmar diálogo
  - Verificar que desaparece

#### 3.4 Plantillas

- [ ] **Selector de plantillas**
  - Seleccionar plantilla "Tarea Diaria"
  - Verificar que campos se llenan automáticamente
  - Probar otras plantillas

#### 3.5 Validaciones

- [ ] **Validación de comando vacío**
  - Intentar guardar sin comando
  - Debe mostrar error

- [ ] **Validación de horario inválido**
  - Ingresar valor fuera de rango (ej: minuto = 99)
  - Debe mostrar error

- [ ] **Preview de horario**
  - Cambiar campos de horario
  - Verificar que preview se actualiza

### 4. Testing de Logs

- [ ] **Ver logs**
  - Navegar a sección de logs
  - Verificar que muestra logs recientes

- [ ] **Limpiar logs**
  - Click en limpiar logs
  - Confirmar
  - Verificar que se vacía la tabla

### 5. Testing de Import/Export

- [ ] **Exportar tareas**
  - Click en exportar
  - Verificar descarga de archivo JSON
  - Abrir archivo y verificar contenido

- [ ] **Importar tareas**
  - Seleccionar archivo JSON
  - Importar
  - Verificar que tareas se agregan

### 6. Testing Multi-Usuario

- [ ] **Login como melvin**
  - Usuario: melvin
  - Password: Soloyolase01
  - Verificar acceso

- [ ] **Crear tarea como melvin**
  - Agregar tarea de prueba
  - Verificar que se guarda

- [ ] **Logout y login como raul**
  - Usuario: raul
  - Password: Soloyolase02
  - Verificar acceso

- [ ] **Verificar aislamiento**
  - Confirmar que raul NO ve tareas de melvin
  - Confirmar que cada usuario tiene sus propias tareas

- [ ] **Login como admin**
  - Usuario: admin
  - Password: admin123
  - Verificar que puede cambiar entre usuarios

### 7. Testing de Crontab del Sistema

- [ ] **Verificar sincronización**
  ```bash
  crontab -l -u melvin
  ```
  - Debe mostrar tareas activas
  - Verificar que usa wrapper_cron.sh

- [ ] **Agregar tarea desde web**
  - Crear tarea nueva
  - Verificar que aparece en crontab del sistema

- [ ] **Desactivar tarea desde web**
  - Toggle tarea
  - Verificar que desaparece de crontab del sistema

### 8. Testing de Permisos

- [ ] **Verificar permisos de archivos JSON**
  ```bash
  ls -la /home/melvin/cronweb_project/public/*.json
  ```
  - Deben tener permisos 666 o rw-rw-rw-

- [ ] **Verificar sudoers**
  ```bash
  sudo cat /etc/sudoers.d/cronweb
  ```
  - Verificar que www-data tiene permisos NOPASSWD

### 9. Testing de Errores

- [ ] **Error de autenticación**
  - Intentar acceder sin login
  - Debe redirigir a login

- [ ] **Error de permisos**
  - Usuario melvin intenta acceder a tareas de raul
  - Debe mostrar error de permisos

- [ ] **Error de validación**
  - Ingresar datos inválidos
  - Debe mostrar mensaje de error claro

### 10. Testing de Compatibilidad de Navegadores

- [ ] **Chrome/Chromium**
  - Todas las funciones operativas
  - Sin errores en consola

- [ ] **Firefox**
  - Todas las funciones operativas
  - Sin errores en consola

- [ ] **Safari** (si disponible)
  - Todas las funciones operativas
  - Sin errores en consola

### 11. Testing de Performance

- [ ] **Tiempo de carga**
  - Página carga en < 2 segundos

- [ ] **Respuesta de API**
  - Operaciones responden en < 1 segundo

- [ ] **Sin memory leaks**
  - Usar herramientas de dev para verificar

### 12. Testing de Responsive Design

- [ ] **Desktop (1920x1080)**
  - Layout correcto
  - Todos los elementos visibles

- [ ] **Tablet (768x1024)**
  - Layout adaptado
  - Funcionalidad completa

- [ ] **Mobile (375x667)**
  - Layout móvil
  - Botones accesibles

## 📊 Resumen de Testing

### Tests Automatizados
- ✅ 28/28 tests pasados

### Tests Manuales
- [ ] Backend API v2: __/10
- [ ] Frontend Módulos: __/4
- [ ] Operaciones CRUD: __/5
- [ ] Multi-usuario: __/6
- [ ] Sistema: __/4
- [ ] Errores: __/3
- [ ] Navegadores: __/3
- [ ] Performance: __/3
- [ ] Responsive: __/3

**Total: __/41 tests manuales**

## 🚀 Criterios para Despliegue

Para considerar el sistema listo para producción:

- [x] ✅ Todos los tests automatizados pasados (28/28)
- [ ] ✅ Al menos 95% de tests manuales pasados (39/41)
- [ ] ✅ Sin errores críticos
- [ ] ✅ Performance aceptable
- [ ] ✅ Backup creado
- [ ] ✅ Plan de rollback preparado

## 📝 Notas de Testing

**Fecha de testing**: _______________

**Testeado por**: _______________

**Navegador usado**: _______________

**Versión PHP**: _______________

**Observaciones**:
```
[Espacio para notas]
```

## 🔧 Problemas Encontrados

| # | Descripción | Severidad | Estado |
|---|-------------|-----------|--------|
| 1 |             |           |        |
| 2 |             |           |        |
| 3 |             |           |        |

**Severidad**: Crítico / Alto / Medio / Bajo

## ✅ Aprobación Final

- [ ] Todos los tests críticos pasados
- [ ] Documentación revisada
- [ ] Backup verificado
- [ ] Equipo notificado

**Aprobado por**: _______________

**Fecha**: _______________

**Listo para desplegar**: [ ] SÍ  [ ] NO
