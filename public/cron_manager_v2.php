<?php
/**
 * Amatores Cron Manager v2.0 - API REST con nueva arquitectura
 * Mantiene compatibilidad con la API anterior
 */

require_once __DIR__ . '/../src/autoload.php';
require_once 'auth.php';

use CronWeb\Controllers\CronController;

requireAuth();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Cargar configuración
$config = require __DIR__ . '/../config/config.php';

// Obtener usuario Linux de la petición
$linuxUser = $_GET['linux_user'] ?? $_POST['linux_user'] ?? $_SESSION['current_linux_user'] ?? null;

if (!$linuxUser) {
    $allowed = getAllowedLinuxUsers();
    $linuxUser = $allowed[0] ?? 'melvin';
}

// Validar permisos
try {
    validateLinuxUser($linuxUser);
    if (!canAccessLinuxUser($_SESSION['username'], $linuxUser)) {
        throw new Exception('No tienes permiso para acceder a este usuario');
    }
} catch (Exception $e) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

$_SESSION['current_linux_user'] = $linuxUser;

// Crear controlador
$controller = new CronController($linuxUser, $config);

// Procesar acción
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            echo json_encode($controller->list());
            break;
            
        case 'add':
            $data = json_decode($_POST['data'], true);
            echo json_encode($controller->add($data));
            break;
            
        case 'toggle':
            $index = (int)$_POST['index'];
            echo json_encode($controller->toggle($index));
            break;
            
        case 'edit':
            $index = (int)$_POST['index'];
            $data = json_decode($_POST['data'], true);
            echo json_encode($controller->edit($index, $data));
            break;
            
        case 'delete':
            $index = (int)$_POST['index'];
            echo json_encode($controller->delete($index));
            break;
            
        case 'run':
            $index = (int)$_POST['index'];
            echo json_encode($controller->run($index));
            break;
            
        case 'logs':
            echo json_encode($controller->getLogs());
            break;
            
        case 'clear_logs':
            echo json_encode($controller->clearLogs());
            break;
            
        case 'export':
            $jobs = $controller->export();
            header('Content-Disposition: attachment; filename="cron_backup.json"');
            echo json_encode($jobs, JSON_PRETTY_PRINT);
            break;
            
        case 'import':
            $data = json_decode($_POST['data'], true);
            echo json_encode($controller->import($data));
            break;
            
        case 'crontab':
            echo $controller->getCrontab();
            break;
        
        case 'get_linux_users':
            echo json_encode([
                'success' => true,
                'users' => getAllowedLinuxUsers(),
                'current' => $linuxUser
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
    
    // Log de auditoría
    if (in_array($action, ['add', 'edit', 'delete', 'toggle', 'run'])) {
        logAction($linuxUser, strtoupper($action), 'Operación ejecutada');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
