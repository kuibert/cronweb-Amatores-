<?php
/**
 * Script para registrar ejecuciones de cron en los logs de la aplicación
 */

function addCronLog($command, $output, $status = 'success') {
    // Detectar usuario desde el entorno
    $user = posix_getpwuid(posix_geteuid())['name'];
    $logFile = "/var/www/cronweb/public/execution_logs_{$user}.json";
    $logs = [];
    
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        $logs = json_decode($content, true) ?: [];
    }
    
    $logs[] = [
        'timestamp' => date('Y-m-d H:i:s'),
        'command' => $command,
        'status' => $status,
        'output' => substr($output, 0, 500)
    ];
    
    // Mantener solo los últimos 1000 logs
    if (count($logs) > 1000) {
        $logs = array_slice($logs, -1000);
    }
    
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
}

// Obtener comando y salida desde argumentos
if ($argc >= 3) {
    $command = $argv[1];
    $output = $argv[2];
    $status = ($argc >= 4) ? $argv[3] : 'success';
    
    addCronLog($command, $output, $status);
}
?>