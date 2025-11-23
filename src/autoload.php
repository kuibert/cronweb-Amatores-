<?php
/**
 * Autoloader simple para CronWeb
 */

spl_autoload_register(function ($class) {
    // Namespace base del proyecto
    $prefix = 'CronWeb\\';
    
    // Directorio base
    $baseDir = __DIR__ . '/';
    
    // Verificar si la clase usa el namespace del proyecto
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    // Obtener el nombre relativo de la clase
    $relativeClass = substr($class, $len);
    
    // Reemplazar namespace separators con directory separators
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    
    // Si el archivo existe, cargarlo
    if (file_exists($file)) {
        require $file;
    }
});
