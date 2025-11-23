<?php
/**
 * Configuración centralizada de CronWeb Amatores
 */

return [
    'app' => [
        'name' => 'CronWeb Amatores',
        'version' => '2.0.0',
        'timezone' => 'America/Mexico_City'
    ],
    
    'paths' => [
        'data' => __DIR__ . '/../public',
        'logs' => '/var/log/cronweb',
        'temp' => sys_get_temp_dir()
    ],
    
    'files' => [
        'cron_jobs_pattern' => 'cron_jobs_{user}.json',
        'execution_logs_pattern' => 'execution_logs_{user}.json',
        'crontab_pattern' => 'current_crontab_{user}.txt'
    ],
    
    'cron' => [
        'max_logs' => 1000,
        'log_output_limit' => 500,
        'wrapper_script' => '/home/{user}/wrapper_cron.sh'
    ],
    
    'security' => [
        'allowed_linux_users' => ['melvin', 'raul'],
        'session_timeout' => 3600
    ]
];
