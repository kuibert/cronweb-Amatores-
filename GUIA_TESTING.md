# Guía de Testing - CronWeb Amatores v2.0

## 🎯 Objetivo

Verificar que la nueva arquitectura funciona correctamente antes de desplegar a producción.

## 📋 Prerequisitos

- PHP 7.4 o superior
- Acceso al servidor de desarrollo
- Navegador web moderno
- Credenciales de acceso

## 🚀 Inicio Rápido

### Opción 1: Tests Automatizados

```bash
cd /home/melvin/cronweb_project
php test_complete.php
```

**Resultado esperado**: 28/28 tests pasados ✓

### Opción 2: Servidor de Testing Local

```bash
cd /home/melvin/cronweb_project
./start_test_server.sh
```

Luego abrir en navegador:
- Nueva versión: http://localhost:8000/index-v2.html
- Versión original: http://localhost:8000/index.php

### Opción 3: Testing en Servidor de Desarrollo

Si tienes acceso al servidor:
- http://192.168.80.143/index-v2.html (nueva versión)
- http://192.168.80.143/index.php (versión original)

## 📝 Plan de Testing Paso a Paso

### PASO 1: Verificar Tests Automatizados (5 min)

```bash
php test_complete.php
```

✅ **Criterio de éxito**: Todos los tests pasan (28/28)

Si algún test falla, revisar el error antes de continuar.

---

### PASO 2: Testing de Backend API (10 min)

#### 2.1 Probar endpoint de listado

```bash
curl "http://localhost:8000/cron_manager_v2.php?action=list&linux_user=melvin"
```

✅ **Criterio de éxito**: Retorna JSON con array de tareas

#### 2.2 Probar endpoint de usuarios

```bash
curl "http://localhost:8000/cron_manager_v2.php?action=get_linux_users"
```

✅ **Criterio de éxito**: Retorna `{"success":true,"users":["melvin","raul"]}`

#### 2.3 Probar agregar tarea

```bash
curl -X POST "http://localhost:8000/cron_manager_v2.php" \
  -d "action=add" \
  -d 'data={"command":"echo test","description":"Test","minute":"0","hour":"9","day":"*","month":"*","weekday":"*"}' \
  -d "linux_user=melvin"
```

✅ **Criterio de éxito**: Retorna `{"success":true}`

---

### PASO 3: Testing de Frontend (15 min)

#### 3.1 Abrir interfaz nueva

Abrir en navegador: http://localhost:8000/index-v2.html

#### 3.2 Verificar consola del navegador

Presionar F12 y en consola ejecutar:

```javascript
console.log('ApiClient:', typeof ApiClient);
console.log('Validators:', typeof Validators);
console.log('UIManager:', typeof UIManager);
console.log('CronTemplates:', typeof CronTemplates);
```

✅ **Criterio de éxito**: Todos retornan "object"

#### 3.3 Verificar carga de datos

La página debe mostrar:
- Selector de usuarios
- Dashboard con contadores
- Tabla de tareas (puede estar vacía)

✅ **Criterio de éxito**: No hay errores en consola

---

### PASO 4: Testing de Operaciones CRUD (20 min)

#### 4.1 Agregar Tarea

1. Click en "Agregar Tarea" o abrir modal
2. Llenar formulario:
   - Comando: `echo "Prueba de testing"`
   - Descripción: `Tarea de prueba`
   - Horario: `0 9 * * *` (9:00 AM diario)
3. Click en "Guardar"

✅ **Criterio de éxito**: 
- Notificación de éxito
- Tarea aparece en tabla
- Dashboard actualizado

#### 4.2 Editar Tarea

1. Click en botón "Editar" (ícono lápiz)
2. Modificar descripción: `Tarea editada`
3. Cambiar horario: `0 10 * * *`
4. Click en "Guardar"

✅ **Criterio de éxito**:
- Notificación de éxito
- Cambios reflejados en tabla

#### 4.3 Ejecutar Tarea

1. Click en botón "Ejecutar" (ícono play)
2. Esperar respuesta

✅ **Criterio de éxito**:
- Notificación de ejecución
- Aparece en logs
- Última ejecución actualizada

#### 4.4 Desactivar/Activar Tarea

1. Click en botón "Toggle" (ícono pausa/play)
2. Verificar cambio de estado

✅ **Criterio de éxito**:
- Badge cambia de "Activa" a "Inactiva"
- Fila cambia de color

#### 4.5 Eliminar Tarea

1. Click en botón "Eliminar" (ícono basura)
2. Confirmar en diálogo
3. Verificar eliminación

✅ **Criterio de éxito**:
- Tarea desaparece de tabla
- Dashboard actualizado

---

### PASO 5: Testing de Plantillas (5 min)

1. Abrir formulario de agregar tarea
2. Seleccionar plantilla "Tarea Diaria"
3. Verificar que campos se llenan automáticamente

✅ **Criterio de éxito**: Campos se llenan con valores de plantilla

Probar al menos 3 plantillas diferentes.

---

### PASO 6: Testing Multi-Usuario (10 min)

#### 6.1 Como usuario melvin

1. Login con melvin / Soloyolase01
2. Crear 2 tareas de prueba
3. Verificar que se guardan

#### 6.2 Como usuario raul

1. Logout
2. Login con raul / Soloyolase02
3. Verificar que NO ve tareas de melvin
4. Crear 1 tarea de prueba

#### 6.3 Como admin

1. Logout
2. Login con admin / admin123
3. Cambiar selector a "melvin"
4. Verificar que ve tareas de melvin
5. Cambiar selector a "raul"
6. Verificar que ve tareas de raul

✅ **Criterio de éxito**: Aislamiento correcto entre usuarios

---

### PASO 7: Testing de Validaciones (5 min)

#### 7.1 Comando vacío

1. Intentar guardar tarea sin comando
2. Debe mostrar error

✅ **Criterio de éxito**: Mensaje de error claro

#### 7.2 Horario inválido

1. Ingresar minuto = 99
2. Intentar guardar
3. Debe mostrar error

✅ **Criterio de éxito**: Validación funciona

---

### PASO 8: Testing de Compatibilidad (5 min)

#### 8.1 Versión Original

1. Abrir http://localhost:8000/index.php
2. Verificar que funciona igual que antes
3. Crear una tarea
4. Verificar que se guarda

✅ **Criterio de éxito**: Versión original intacta

#### 8.2 API Original

```bash
curl "http://localhost:8000/cron_manager.php?action=list&linux_user=melvin"
```

✅ **Criterio de éxito**: API original funciona

---

### PASO 9: Testing de Sistema (10 min)

#### 9.1 Verificar crontab del sistema

```bash
crontab -l -u melvin
```

✅ **Criterio de éxito**: Muestra tareas activas con wrapper_cron.sh

#### 9.2 Sincronización

1. Crear tarea desde web
2. Verificar que aparece en crontab del sistema
3. Desactivar tarea desde web
4. Verificar que desaparece de crontab

✅ **Criterio de éxito**: Sincronización automática funciona

---

### PASO 10: Testing de Performance (5 min)

#### 10.1 Tiempo de carga

1. Abrir DevTools (F12)
2. Ir a Network
3. Recargar página
4. Verificar tiempo de carga

✅ **Criterio de éxito**: Carga en < 2 segundos

#### 10.2 Respuesta de API

1. Crear tarea
2. Verificar tiempo de respuesta en Network

✅ **Criterio de éxito**: Respuesta en < 1 segundo

---

## 📊 Resumen de Testing

### Checklist Rápida

- [ ] Tests automatizados: 28/28 ✓
- [ ] Backend API funciona
- [ ] Frontend carga correctamente
- [ ] CRUD completo funciona
- [ ] Plantillas funcionan
- [ ] Multi-usuario funciona
- [ ] Validaciones funcionan
- [ ] Compatibilidad verificada
- [ ] Sistema sincronizado
- [ ] Performance aceptable

### Tiempo Estimado Total

- Tests automatizados: 5 min
- Backend: 10 min
- Frontend: 15 min
- CRUD: 20 min
- Plantillas: 5 min
- Multi-usuario: 10 min
- Validaciones: 5 min
- Compatibilidad: 5 min
- Sistema: 10 min
- Performance: 5 min

**Total: ~90 minutos (1.5 horas)**

## 🚨 Problemas Comunes y Soluciones

### Problema: Tests automatizados fallan

**Solución**:
```bash
# Verificar permisos
chmod 666 public/*.json

# Verificar PHP
php -v  # Debe ser 7.4+
```

### Problema: Módulos JavaScript no cargan

**Solución**:
- Verificar consola del navegador
- Verificar que archivos existen en public/js/modules/
- Limpiar caché del navegador

### Problema: API retorna 403

**Solución**:
- Verificar que estás autenticado
- Verificar permisos de usuario
- Revisar auth.php

### Problema: Crontab no sincroniza

**Solución**:
```bash
# Verificar sudoers
sudo cat /etc/sudoers.d/cronweb

# Verificar wrapper_cron.sh
ls -la /home/melvin/wrapper_cron.sh
```

## ✅ Criterios de Aprobación

Para considerar el testing exitoso:

1. ✅ Todos los tests automatizados pasan (28/28)
2. ✅ Al menos 95% de tests manuales pasan
3. ✅ Sin errores críticos
4. ✅ Performance aceptable (< 2s carga, < 1s API)
5. ✅ Compatibilidad con versión anterior confirmada

## 🚀 Siguiente Paso

Si todos los tests pasan:

```bash
# Hacer commit de archivos de testing
git add test_complete.php TESTING_CHECKLIST.md GUIA_TESTING.md start_test_server.sh
git commit -m "test: Agregar suite completa de testing"

# Preparar para despliegue
# Ver DEPLOYMENT.md para instrucciones
```

## 📞 Soporte

Si encuentras problemas durante el testing:

1. Revisar logs: `/var/log/apache2/error.log`
2. Revisar consola del navegador
3. Ejecutar tests automatizados con verbose
4. Consultar DOCUMENTACION.md

---

**¡Buena suerte con el testing!** 🎉
