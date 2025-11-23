<?php
/**
 * Servicio de gestión de logs
 */

namespace CronWeb\Services;

class LogService {
    
    private $logFile;
    private $config;
    
    public function __construct(string $linuxUser, array $config) {
        $pattern = $config['files']['execution_logs_pattern'];
        $filename = str_replace('{user}', $linuxUser, $pattern);
        $this->logFile = $config['paths']['data'] . '/' . $filename;
        $this->config = $config;
        
        if (!file_exists($this->logFile)) {
            file_put_contents($this->logFile, json_encode([]));
        }
    }
    
    public function addLog(string $command, string $status, string $output): void {
        $logs = $this->getLogs();
        
        $logs[] = [
            'timestamp' => date('Y-m-d H:i:s'),
            'command' => $command,
            'status' => $status,
            'output' => substr($output, 0, $this->config['cron']['log_output_limit'])
        ];
        
        // Mantener solo los últimos N logs
        if (count($logs) > $this->config['cron']['max_logs']) {
            $logs = array_slice($logs, -$this->config['cron']['max_logs']);
        }
        
        file_put_contents($this->logFile, json_encode($logs, JSON_PRETTY_PRINT));
    }
    
    public function getLogs(int $limit = 100): array {
        if (!file_exists($this->logFile)) {
            return [];
        }
        
        $content = file_get_contents($this->logFile);
        $logs = json_decode($content, true) ?: [];
        
        usort($logs, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        return array_slice($logs, 0, $limit);
    }
    
    public function clearLogs(): void {
        file_put_contents($this->logFile, json_encode([]));
    }
}
