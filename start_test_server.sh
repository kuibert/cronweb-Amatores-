#!/bin/bash
# Script para iniciar servidor de testing local

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     SERVIDOR DE TESTING - CRONWEB AMATORES V2.0               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "test_complete.php" ]; then
    echo "❌ Error: Ejecutar desde el directorio del proyecto"
    exit 1
fi

# Ejecutar tests automatizados primero
echo "📋 Ejecutando tests automatizados..."
echo ""
php test_complete.php

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Tests automatizados fallaron. Revisar errores antes de continuar."
    exit 1
fi

echo ""
echo "✅ Tests automatizados pasados correctamente"
echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""
echo "🌐 Iniciando servidor PHP de desarrollo..."
echo ""
echo "   URL: http://localhost:8000"
echo "   Directorio: $(pwd)/public"
echo ""
echo "📝 Para testing manual:"
echo "   - Abrir http://localhost:8000/index-v2.html (nueva versión)"
echo "   - Abrir http://localhost:8000/index.php (versión original)"
echo ""
echo "⚠️  NOTA: Este es un servidor de desarrollo, NO usar en producción"
echo ""
echo "   Presiona Ctrl+C para detener el servidor"
echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""

# Iniciar servidor PHP
cd public
php -S localhost:8000
