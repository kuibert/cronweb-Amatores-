<?php
/**
 * Validador de expresiones cron
 */

namespace CronWeb\Models;

class CronValidator {
    
    private const LIMITS = [
        'minute' => [0, 59],
        'hour' => [0, 23],
        'day' => [1, 31],
        'month' => [1, 12],
        'weekday' => [0, 7]
    ];
    
    public static function validateField(string $value, string $type): string {
        $value = trim($value);
        if (empty($value)) $value = '*';
        
        // Asterisco es válido
        if ($value === '*') return '*';
        
        // Patrón */N
        if (preg_match('/^\*\/\d+$/', $value)) {
            return $value;
        }
        
        // Rango N-M
        if (preg_match('/^(\d+)-(\d+)$/', $value, $matches)) {
            $start = (int)$matches[1];
            $end = (int)$matches[2];
            self::validateRange($start, $end, $type);
            return $value;
        }
        
        // Número simple
        if (is_numeric($value)) {
            $num = (int)$value;
            self::validateNumber($num, $type);
            return $value;
        }
        
        // Lista separada por comas
        if (strpos($value, ',') !== false) {
            return $value;
        }
        
        throw new \Exception("Formato inválido para $type: $value");
    }
    
    private static function validateRange(int $start, int $end, string $type): void {
        if (!isset(self::LIMITS[$type])) {
            throw new \Exception("Tipo de campo desconocido: $type");
        }
        
        [$min, $max] = self::LIMITS[$type];
        
        if ($start < $min || $end > $max || $start > $end) {
            throw new \Exception("Rango inválido para $type: $start-$end (permitido: $min-$max)");
        }
    }
    
    private static function validateNumber(int $num, string $type): void {
        if (!isset(self::LIMITS[$type])) {
            throw new \Exception("Tipo de campo desconocido: $type");
        }
        
        [$min, $max] = self::LIMITS[$type];
        
        if ($num < $min || $num > $max) {
            throw new \Exception("Valor inválido para $type: $num (permitido: $min-$max)");
        }
    }
    
    public static function validateSchedule(array $schedule): array {
        return [
            'minute' => self::validateField($schedule['minute'] ?? '*', 'minute'),
            'hour' => self::validateField($schedule['hour'] ?? '*', 'hour'),
            'day' => self::validateField($schedule['day'] ?? '*', 'day'),
            'month' => self::validateField($schedule['month'] ?? '*', 'month'),
            'weekday' => self::validateField($schedule['weekday'] ?? '*', 'weekday')
        ];
    }
    
    public static function scheduleToString(array $schedule): string {
        return sprintf(
            '%s %s %s %s %s',
            $schedule['minute'],
            $schedule['hour'],
            $schedule['day'],
            $schedule['month'],
            $schedule['weekday']
        );
    }
}
