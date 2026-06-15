# 🚀 Despliegue Rápido en Render (5 minutos)

## Paso 1: Subir a GitHub
```bash
git add .
git commit -m "Listo para despliegue"
git push origin main
```

## Paso 2: Crear servicio en Render
1. Ve a [render.com](https://render.com) → Login
2. Click "New +" → "Web Service"
3. Conectar tu repositorio de GitHub
4. Render detectará automáticamente la configuración

## Paso 3: Configurar (automático)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- Click "Create Web Service"

## Paso 4: Esperar
- 5-10 minutos para el primer despliegue
- Tu URL será: `https://tu-nombre-app.onrender.com`

## ✅ Listo!
Tu demo estará en línea y funcionando.

**Nota**: En el plan gratis, la app "duerme" después de 15 min sin uso.
La primera carga después tomará ~30 segundos.

---

## 🔧 Opcional: Agregar API Keys
En Render Dashboard → Environment Variables:
- `GROQ_API_KEY` (para chatbot con IA real)
- `GEMINI_API_KEY` (alternativa)

Si no las agregas, funcionará en modo demo.
