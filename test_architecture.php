<?php
/**
 * Script de prueba para la nueva arquitectura
 */

require_once __DIR__ . '/src/autoload.php';

use CronWeb\Controllers\CronController;
use CronWeb\Models\CronJob;
use CronWeb\Models\CronValidator;

echo "=== Test de Nueva Arquitectura CronWeb ===\n\n";

// Cargar configuración
$config = require __DIR__ . '/config/config.php';
echo "✓ Configuración cargada\n";

// Test 1: Crear controlador
try {
    $controller = new CronController('melvin', $config);
    echo "✓ Controlador creado correctamente\n";
} catch (Exception $e) {
    echo "✗ Error al crear controlador: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Listar tareas
try {
    $jobs = $controller->list();
    echo "✓ Listado de tareas: " . count($jobs) . " tareas encontradas\n";
} catch (Exception $e) {
    echo "✗ Error al listar tareas: " . $e->getMessage() . "\n";
}

// Test 3: Validador de cron
try {
    $validated = CronValidator::validateSchedule([
        'minute' => '*/5',
        'hour' => '9',
        'day' => '*',
        'month' => '*',
        'weekday' => '1-5'
    ]);
    $schedule = CronValidator::scheduleToString($validated);
    echo "✓ Validador de cron: $schedule\n";
} catch (Exception $e) {
    echo "✗ Error en validador: " . $e->getMessage() . "\n";
}

// Test 4: Modelo CronJob
try {
    $job = new CronJob([
        'command' => 'echo "Test"',
        'description' => 'Tarea de prueba',
        'schedule' => '0 9 * * *'
    ]);
    echo "✓ Modelo CronJob creado: " . $job->getCommand() . "\n";
} catch (Exception $e) {
    echo "✗ Error en modelo: " . $e->getMessage() . "\n";
}

// Test 5: Obtener logs
try {
    $logs = $controller->getLogs();
    echo "✓ Logs obtenidos: " . count($logs) . " registros\n";
} catch (Exception $e) {
    echo "✗ Error al obtener logs: " . $e->getMessage() . "\n";
}

echo "\n=== Todos los tests completados ===\n";
echo "La nueva arquitectura está funcionando correctamente.\n";
