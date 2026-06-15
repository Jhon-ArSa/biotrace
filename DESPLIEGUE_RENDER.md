# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar BioTrace OSINFOR en Render de forma gratuita.

## 📋 Prerequisitos

1. Cuenta en [GitHub](https://github.com)
2. Cuenta en [Render](https://render.com) (gratis)
3. Tu código subido a un repositorio de GitHub

---

## 🔧 Paso 1: Preparar tu Repositorio

### 1.1 Subir a GitHub (si aún no lo has hecho)

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar para despliegue en Render"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git branch -M main
git push -u origin main
```

### 1.2 Verificar archivos necesarios

Asegúrate de que estos archivos existan en tu repositorio:
- ✅ `requirements.txt` - Dependencias de Python
- ✅ `app.py` - Aplicación principal
- ✅ `render.yaml` - Configuración de Render (opcional pero recomendado)
- ✅ `.gitignore` - Archivos a ignorar

---

## 🌐 Paso 2: Desplegar en Render

### Opción A: Despliegue Automático (Recomendado)

1. **Ir a [Render Dashboard](https://dashboard.render.com)**
   - Inicia sesión o crea una cuenta

2. **Conectar con GitHub**
   - Click en "New +" → "Web Service"
   - Autoriza a Render para acceder a tus repositorios
   - Selecciona el repositorio `chatbotOsinfor`

3. **Configuración Automática**
   - Render detectará automáticamente el `render.yaml`
   - Revisa la configuración:
     - **Name**: `biotrace-osinfor` (puedes cambiarlo)
     - **Region**: Oregon (o el más cercano)
     - **Branch**: `main`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`

4. **Variables de Entorno (Opcional)**
   - En la sección "Environment Variables", agrega tus API keys:
     - `GROQ_API_KEY` = tu_key_de_groq (opcional)
     - `GEMINI_API_KEY` = tu_key_de_gemini (opcional)
     - `XAI_API_KEY` = tu_key_de_xai (opcional)
   - Si no las configuras, la app funcionará en "modo demo"

5. **Click en "Create Web Service"**
   - Render comenzará a construir y desplegar tu aplicación
   - Este proceso toma 5-10 minutos la primera vez

### Opción B: Despliegue Manual

Si prefieres configuración manual:

1. En Render Dashboard: "New +" → "Web Service"
2. Conectar repositorio de GitHub
3. Configurar manualmente:
   ```
   Name: biotrace-osinfor
   Region: Oregon
   Branch: main
   Root Directory: (dejar vacío)
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   Plan: Free
   ```

---

## 🎯 Paso 3: Verificar el Despliegue

### 3.1 Monitorear el Build

1. En el Dashboard de Render, verás el log de construcción
2. Espera a que aparezca: `==> Build successful 🎉`
3. Luego verá: `==> Deploying...`
4. Finalmente: `==> Your service is live 🎉`

### 3.2 Acceder a tu Aplicación

Tu aplicación estará disponible en:
```
https://biotrace-osinfor.onrender.com
```
(O el nombre que hayas elegido)

### 3.3 Verificar Funcionalidad

1. **Página Principal**: 
   - Debería cargar con las opciones: Titular, Chofer, Centro

2. **Sistema de Login**:
   - Probar con las credenciales de demo

3. **Chatbot**:
   - Verificar que el chatbot responda
   - Si configuraste API keys, usará IA real
   - Si no, funcionará en modo demo

---

## ⚠️ Limitaciones del Plan Gratuito

1. **Suspensión por Inactividad**:
   - Después de 15 minutos sin actividad, el servicio "duerme"
   - La primera petición después tomará ~30 segundos en "despertar"
   - Las siguientes serán instantáneas

2. **Recursos Limitados**:
   - 512 MB de RAM
   - CPU compartida
   - Suficiente para una demo/prototipo

3. **Base de Datos SQLite**:
   - Los datos se reinician cada vez que el servicio se redesplega
   - Para persistencia real, considera usar PostgreSQL (también gratis en Render)

---

## 🔄 Actualizaciones Automáticas

Render se sincroniza automáticamente con tu repositorio:
- Cada `git push` a la rama `main` disparará un nuevo despliegue
- El proceso toma 3-5 minutos
- Render mantiene la versión anterior hasta que la nueva esté lista

---

## 🐛 Solución de Problemas

### Error: "Build failed"
- Revisa el log de build en Render
- Verifica que `requirements.txt` esté correcto
- Asegúrate de usar Python 3.11

### Error: "Application failed to start"
- Revisa los logs en el Dashboard
- Verifica que el comando de inicio sea: `gunicorn app:app`
- Asegúrate de que el puerto se obtiene de `PORT` en `app.py`

### La aplicación está muy lenta
- Es normal en el plan gratuito después de inactividad
- Espera 30-60 segundos en la primera carga

### Base de datos se borra
- SQLite en Render no es persistente
- Para datos permanentes, migra a PostgreSQL:
  - En Render: "New +" → "PostgreSQL"
  - Actualiza `db_manager.py` para usar PostgreSQL

---

## 📊 Monitoreo

En el Dashboard de Render puedes ver:
- **Logs**: Click en "Logs" para ver la salida del servidor
- **Metrics**: CPU, RAM y tráfico de red
- **Events**: Historial de despliegues

---

## 🔒 Seguridad

Para producción real:
1. **No subas** tus API keys al repositorio
2. Usa las **Environment Variables** de Render
3. Configura **CORS** apropiadamente
4. Considera agregar autenticación más robusta

---

## 💰 Plan Gratuito vs Pagado

| Característica | Free | Paid ($7/mes) |
|----------------|------|---------------|
| Suspensión     | Sí (15 min) | No |
| CPU            | Compartida | Dedicada |
| RAM            | 512 MB | 2 GB+ |
| Build Minutes  | 400/mes | Ilimitado |
| Ideal para     | Demo/Desarrollo | Producción |

---

## 📞 Soporte

- **Documentación Render**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

---

## ✅ Checklist Final

Antes de desplegar, verifica:
- [ ] Código subido a GitHub
- [ ] `requirements.txt` actualizado
- [ ] `app.py` usa `PORT` de variable de entorno
- [ ] `.gitignore` configurado correctamente
- [ ] Probado localmente (`python app.py`)
- [ ] API keys configuradas (si las usas)

---

¡Listo! Tu aplicación BioTrace estará disponible en internet 🎉

**URL de tu demo**: `https://biotrace-osinfor.onrender.com`
(Compártela con quien quieras)
