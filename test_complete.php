<?php
/**
 * Script de testing completo para CronWeb Amatores v2.0
 * Verifica que toda la funcionalidad esté operativa
 */

require_once __DIR__ . '/src/autoload.php';

use CronWeb\Controllers\CronController;
use CronWeb\Models\CronJob;
use CronWeb\Models\CronValidator;
use CronWeb\Services\CronService;
use CronWeb\Services\LogService;

echo "╔═══════════════════════════════════════════════════════════════╗\n";
echo "║     TEST COMPLETO - CRONWEB AMATORES V2.0                     ║\n";
echo "╚═══════════════════════════════════════════════════════════════╝\n\n";

$config = require __DIR__ . '/config/config.php';
$testsPassed = 0;
$testsFailed = 0;

function test($name, $callback) {
    global $testsPassed, $testsFailed;
    echo "Testing: $name ... ";
    try {
        $result = $callback();
        if ($result) {
            echo "✓ PASS\n";
            $testsPassed++;
        } else {
            echo "✗ FAIL\n";
            $testsFailed++;
        }
    } catch (Exception $e) {
        echo "✗ FAIL: " . $e->getMessage() . "\n";
        $testsFailed++;
    }
}

echo "═══ TESTS DE CONFIGURACIÓN ═══\n\n";

test("Cargar configuración", function() use ($config) {
    return isset($config['app']) && isset($config['paths']);
});

test("Verificar rutas de archivos", function() use ($config) {
    return file_exists($config['paths']['data']);
});

echo "\n═══ TESTS DE MODELOS ═══\n\n";

test("Crear instancia de CronJob", function() {
    $job = new CronJob([
        'command' => 'echo "test"',
        'description' => 'Test job',
        'schedule' => '0 9 * * *'
    ]);
    return $job->getCommand() === 'echo "test"';
});

test("Convertir CronJob a array", function() {
    $job = new CronJob(['command' => 'test']);
    $array = $job->toArray();
    return is_array($array) && isset($array['command']);
});

test("Toggle de CronJob", function() {
    $job = new CronJob(['enabled' => true]);
    $job->toggle();
    return !$job->isEnabled();
});

test("Validar campo cron válido", function() {
    $result = CronValidator::validateField('*/5', 'minute');
    return $result === '*/5';
});

test("Validar campo cron inválido", function() {
    try {
        CronValidator::validateField('99', 'minute');
        return false;
    } catch (Exception $e) {
        return true;
    }
});

test("Validar schedule completo", function() {
    $schedule = CronValidator::validateSchedule([
        'minute' => '0',
        'hour' => '9',
        'day' => '*',
        'month' => '*',
        'weekday' => '*'
    ]);
    return count($schedule) === 5;
});

test("Convertir schedule a string", function() {
    $schedule = ['minute' => '0', 'hour' => '9', 'day' => '*', 'month' => '*', 'weekday' => '*'];
    $string = CronValidator::scheduleToString($schedule);
    return $string === '0 9 * * *';
});

echo "\n═══ TESTS DE SERVICIOS ═══\n\n";

test("Crear instancia de CronService", function() use ($config) {
    $service = new CronService('melvin', $config);
    return $service instanceof CronService;
});

test("Crear instancia de LogService", function() use ($config) {
    $service = new LogService('melvin', $config);
    return $service instanceof LogService;
});

test("Obtener todas las tareas", function() use ($config) {
    $service = new CronService('melvin', $config);
    $jobs = $service->getAllJobs();
    return is_array($jobs);
});

test("Obtener logs", function() use ($config) {
    $service = new LogService('melvin', $config);
    $logs = $service->getLogs();
    return is_array($logs);
});

echo "\n═══ TESTS DE CONTROLADOR ═══\n\n";

test("Crear instancia de CronController", function() use ($config) {
    $controller = new CronController('melvin', $config);
    return $controller instanceof CronController;
});

test("Listar tareas desde controlador", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $jobs = $controller->list();
    return is_array($jobs);
});

test("Obtener logs desde controlador", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $logs = $controller->getLogs();
    return is_array($logs);
});

test("Obtener crontab desde controlador", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $crontab = $controller->getCrontab();
    return is_string($crontab);
});

echo "\n═══ TESTS DE INTEGRACIÓN ═══\n\n";

test("Agregar tarea de prueba", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $result = $controller->add([
        'command' => 'echo "Test automatizado"',
        'description' => 'Tarea de prueba automática',
        'minute' => '*/5',
        'hour' => '*',
        'day' => '*',
        'month' => '*',
        'weekday' => '*'
    ]);
    return $result['success'] === true;
});

test("Verificar tarea agregada", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $jobs = $controller->list();
    $found = false;
    foreach ($jobs as $job) {
        if (strpos($job['command'], 'Test automatizado') !== false) {
            $found = true;
            break;
        }
    }
    return $found;
});

test("Editar tarea de prueba", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $jobs = $controller->list();
    $index = count($jobs) - 1; // Última tarea
    
    $result = $controller->edit($index, [
        'command' => 'echo "Test editado"',
        'description' => 'Tarea editada',
        'minute' => '0',
        'hour' => '10',
        'day' => '*',
        'month' => '*',
        'weekday' => '*'
    ]);
    return $result['success'] === true;
});

test("Toggle tarea de prueba", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $jobs = $controller->list();
    $index = count($jobs) - 1;
    
    $result = $controller->toggle($index);
    return $result['success'] === true;
});

test("Eliminar tarea de prueba", function() use ($config) {
    $controller = new CronController('melvin', $config);
    $jobs = $controller->list();
    $index = count($jobs) - 1;
    
    $result = $controller->delete($index);
    return $result['success'] === true;
});

echo "\n═══ TESTS DE ARCHIVOS ═══\n\n";

test("Verificar archivo cron_manager_v2.php", function() {
    return file_exists(__DIR__ . '/public/cron_manager_v2.php');
});

test("Verificar módulos JavaScript", function() {
    $modules = [
        'api-client.js',
        'validators.js',
        'ui-manager.js',
        'templates.js'
    ];
    foreach ($modules as $module) {
        if (!file_exists(__DIR__ . '/public/js/modules/' . $module)) {
            return false;
        }
    }
    return true;
});

test("Verificar app-v2.js", function() {
    return file_exists(__DIR__ . '/public/js/app-v2.js');
});

test("Verificar autoloader", function() {
    return file_exists(__DIR__ . '/src/autoload.php');
});

echo "\n═══ TESTS DE COMPATIBILIDAD ═══\n\n";

test("Verificar archivos originales intactos", function() {
    return file_exists(__DIR__ . '/public/cron_manager.php') &&
           file_exists(__DIR__ . '/public/js/app.js') &&
           file_exists(__DIR__ . '/public/index.php');
});

test("Verificar auth.php", function() {
    return file_exists(__DIR__ . '/public/auth.php');
});

echo "\n╔═══════════════════════════════════════════════════════════════╗\n";
echo "║                      RESUMEN DE TESTS                         ║\n";
echo "╠═══════════════════════════════════════════════════════════════╣\n";
printf("║  Tests Pasados:  %-3d                                         ║\n", $testsPassed);
printf("║  Tests Fallados: %-3d                                         ║\n", $testsFailed);
printf("║  Total:          %-3d                                         ║\n", $testsPassed + $testsFailed);
echo "╠═══════════════════════════════════════════════════════════════╣\n";

if ($testsFailed === 0) {
    echo "║  ✓ TODOS LOS TESTS PASARON                                   ║\n";
    echo "║  La nueva arquitectura está lista para desplegar             ║\n";
    $exitCode = 0;
} else {
    echo "║  ✗ ALGUNOS TESTS FALLARON                                    ║\n";
    echo "║  Revisar errores antes de desplegar                          ║\n";
    $exitCode = 1;
}

echo "╚═══════════════════════════════════════════════════════════════╝\n";

exit($exitCode);
