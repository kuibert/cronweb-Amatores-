<?php
/**
 * Sistema de autenticación y autorización
 * Amatores Cron Manager - Multi-usuario
 */

session_start();

// Configuración de usuarios web y sus permisos
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

// Lista blanca de usuarios Linux permitidos
$allowedLinuxUsers = ['melvin', 'raul'];

/**
 * Verificar si el usuario está autenticado
 */
function isAuthenticated() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Verificar si el usuario web puede acceder a un usuario Linux
 */
function canAccessLinuxUser($webUser, $linuxUser) {
    global $webUsers;
    
    if (!isset($webUsers[$webUser])) {
        return false;
    }
    
    return in_array($linuxUser, $webUsers[$webUser]['allowed_linux_users']);
}

/**
 * Validar usuario Linux
 */
function validateLinuxUser($user) {
    global $allowedLinuxUsers;
    
    // Verificar lista blanca
    if (!in_array($user, $allowedLinuxUsers)) {
        throw new Exception('Usuario no permitido');
    }
    
    // Sanitizar para prevenir inyección
    if (!preg_match('/^[a-z_][a-z0-9_-]*$/', $user)) {
        throw new Exception('Nombre de usuario inválido');
    }
    
    // Verificar que el usuario existe en el sistema
    exec("id -u " . escapeshellarg($user) . " 2>/dev/null", $output, $returnCode);
    if ($returnCode !== 0) {
        throw new Exception('Usuario no existe en el sistema');
    }
    
    return true;
}

/**
 * Obtener usuarios Linux permitidos para el usuario web actual
 */
function getAllowedLinuxUsers() {
    global $webUsers;
    
    if (!isAuthenticated()) {
        return [];
    }
    
    $webUser = $_SESSION['username'];
    
    if (!isset($webUsers[$webUser])) {
        return [];
    }
    
    return $webUsers[$webUser]['allowed_linux_users'];
}

/**
 * Registrar acción en log de auditoría
 */
function logAction($linuxUser, $action, $details = '') {
    $logFile = '/var/log/cronweb/audit.log';
    $timestamp = date('Y-m-d H:i:s');
    $webUser = $_SESSION['username'] ?? 'anonymous';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    $logEntry = sprintf(
        "[%s] WebUser: %s | IP: %s | LinuxUser: %s | Action: %s | Details: %s\n",
        $timestamp, $webUser, $ip, $linuxUser, $action, $details
    );
    
    @file_put_contents($logFile, $logEntry, FILE_APPEND);
}

/**
 * Requerir autenticación (usar en páginas protegidas)
 */
function requireAuth() {
    if (!isAuthenticated()) {
        if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            // Petición AJAX
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado', 'redirect' => 'login.php']);
        } else {
            // Petición normal
            header('Location: login.php');
        }
        exit;
    }
}

/**
 * Autenticar usuario
 */
function authenticate($username, $password) {
    global $webUsers;
    
    if (!isset($webUsers[$username])) {
        return false;
    }
    
    if (password_verify($password, $webUsers[$username]['password'])) {
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['login_time'] = time();
        
        logAction('system', 'LOGIN', "User $username logged in");
        return true;
    }
    
    return false;
}

/**
 * Cerrar sesión
 */
function logout() {
    $username = $_SESSION['username'] ?? 'unknown';
    logAction('system', 'LOGOUT', "User $username logged out");
    
    session_destroy();
    header('Location: login.php');
    exit;
}
