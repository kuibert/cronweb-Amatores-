/**
 * Validadores para campos de cron y formularios
 */

const Validators = {
    
    validateCronField(value, type) {
        value = value.trim();
        if (!value) return '*';
        
        const limits = {
            minute: [0, 59],
            hour: [0, 23],
            day: [1, 31],
            month: [1, 12],
            weekday: [0, 7]
        };
        
        // Asterisco válido
        if (value === '*') return true;
        
        // Patrón */N
        if (/^\*\/\d+$/.test(value)) return true;
        
        // Rango N-M
        if (/^\d+-\d+$/.test(value)) {
            const [start, end] = value.split('-').map(Number);
            const [min, max] = limits[type];
            return start >= min && end <= max && start <= end;
        }
        
        // Número simple
        if (/^\d+$/.test(value)) {
            const num = parseInt(value);
            const [min, max] = limits[type];
            return num >= min && num <= max;
        }
        
        // Lista separada por comas
        if (value.includes(',')) {
            return value.split(',').every(v => this.validateCronField(v.trim(), type));
        }
        
        return false;
    },
    
    validateCommand(command) {
        if (!command || command.trim().length === 0) {
            return { valid: false, message: 'El comando es requerido' };
        }
        
        if (command.length > 500) {
            return { valid: false, message: 'El comando es demasiado largo (máximo 500 caracteres)' };
        }
        
        return { valid: true };
    },
    
    validateSchedule(schedule) {
        const fields = ['minute', 'hour', 'day', 'month', 'weekday'];
        
        for (const field of fields) {
            if (!schedule[field]) {
                return { valid: false, message: `El campo ${field} es requerido` };
            }
            
            if (!this.validateCronField(schedule[field], field)) {
                return { valid: false, message: `Valor inválido para ${field}: ${schedule[field]}` };
            }
        }
        
        return { valid: true };
    },
    
    sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '');
    },
    
    getCronDescription(schedule) {
        const { minute, hour, day, month, weekday } = schedule;
        
        // Casos comunes
        if (minute === '0' && hour === '0' && day === '*' && month === '*' && weekday === '*') {
            return 'Diariamente a medianoche';
        }
        
        if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
            return `Diariamente a las ${hour}:00`;
        }
        
        if (minute === '0' && hour === '0' && day === '1' && month === '*' && weekday === '*') {
            return 'Mensualmente el día 1 a medianoche';
        }
        
        if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday !== '*') {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return `Semanalmente los ${days[weekday]} a las ${hour}:00`;
        }
        
        if (minute.startsWith('*/')) {
            const interval = minute.substring(2);
            return `Cada ${interval} minutos`;
        }
        
        return `${minute} ${hour} ${day} ${month} ${weekday}`;
    }
};

window.Validators = Validators;
