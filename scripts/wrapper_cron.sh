#!/bin/bash
# Wrapper para ejecutar comandos cron y registrar en logs

COMMAND="$1"
OUTPUT=$(eval "$COMMAND" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    STATUS="success"
else
    STATUS="error"
fi

# Registrar en logs de la aplicación
/usr/bin/php /home/melvin/cron_logger.php "$COMMAND" "$OUTPUT" "$STATUS"