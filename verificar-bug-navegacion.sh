#!/bin/bash

echo "🔍 VERIFICACIÓN DEL ESTADO DEL BUG DE NAVEGACIÓN"
echo "================================================"
echo ""

# 1. Verificar que el código está en el repositorio
echo "1️⃣ Verificando código en archivos..."
if grep -q "getLibroBySlug" Backend/src/controllers/libro.controller.ts; then
  echo "   ✅ Código de getLibroBySlug encontrado en libro.controller.ts"
else
  echo "   ❌ Código de getLibroBySlug NO encontrado"
fi

if grep -q "slug/:slug" Backend/src/routes/libro.routes.ts; then
  echo "   ✅ Ruta /slug/:slug encontrada en libro.routes.ts"
else
  echo "   ❌ Ruta /slug/:slug NO encontrada"
fi

echo ""

# 2. Verificar si el backend está corriendo
echo "2️⃣ Verificando si backend está corriendo..."
if lsof -ti:3000 >/dev/null 2>&1; then
  echo "   ✅ Backend corriendo en puerto 3000 (PID: $(lsof -ti:3000))"
else
  echo "   ❌ Backend NO está corriendo en puerto 3000"
  echo "   💡 Inicia el backend con: cd Backend && npm run dev"
  exit 1
fi

echo ""

# 3. Probar el endpoint
echo "3️⃣ Probando endpoint GET /api/libros/slug/1984..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/libros/slug/1984)

if [ "$response" = "200" ]; then
  echo "   ✅ Endpoint funciona correctamente (200 OK)"
  echo ""
  echo "4️⃣ Datos del libro:"
  curl -s http://localhost:3000/api/libros/slug/1984 | jq '{id, titulo, autores, tiene_imagen: (.imagen != null), tiene_descripcion: (.descripcion != null)}'
else
  echo "   ❌ Endpoint NO funciona (HTTP $response)"
  echo ""
  echo "   🚨 PROBLEMA DETECTADO:"
  echo "   El código está en los archivos pero el endpoint no responde."
  echo "   Esto significa que el backend NO se ha reiniciado."
  echo ""
  echo "   🔧 SOLUCIÓN:"
  echo "   1. Ve a la terminal donde corre el backend"
  echo "   2. Presiona Ctrl+C para detenerlo"
  echo "   3. Ejecuta: npm run dev"
  echo "   4. Vuelve a ejecutar este script para verificar"
fi

echo ""
echo "================================================"
