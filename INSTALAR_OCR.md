# 🔧 Guía de Instalación: OCR para PDFs Escaneados

## 📋 Problema Actual

El error que aparece es:
```
[Error al aplicar OCR al PDF: Unable to get page count. Is poppler installed and in PATH?]
```

Esto significa que **falta Poppler**, una herramienta necesaria para procesar PDFs escaneados con OCR.

---

## ✅ Solución Rápida (Windows)

### Opción 1: Script Automático (MÁS FÁCIL)

1. **Abrir PowerShell como Administrador:**
   - Clic derecho en el menú Inicio → "Windows PowerShell (Administrador)"

2. **Ejecutar el script de instalación:**
   ```powershell
   cd D:\for\chatbotOsinfor
   PowerShell -ExecutionPolicy Bypass -File instalar_poppler.ps1
   ```

3. **Esperar a que termine la instalación**

4. **Cerrar TODOS los terminales** y abrir uno nuevo

5. **Verificar:**
   ```powershell
   pdftoppm -v
   ```
   Debería mostrar la versión de Poppler

6. **Reiniciar el servidor:**
   ```bash
   python app.py
   ```

---

### Opción 2: Chocolatey (Si ya lo tienes instalado)

```powershell
# Como Administrador:
choco install poppler -y
```

Luego cierra y vuelve a abrir el terminal.

---

### Opción 3: Instalación Manual

#### Paso 1: Descargar Poppler
1. Ve a: https://github.com/oschwartz10612/poppler-windows/releases/
2. Descarga `Release-24.08.0-0.zip` (última versión)
3. Extrae el ZIP

#### Paso 2: Instalar
1. Copia la carpeta extraída a:
   ```
   C:\Program Files\poppler-24.08.0\
   ```

2. La estructura debe quedar así:
   ```
   C:\Program Files\poppler-24.08.0\
       └── poppler-24.08.0\
           └── Library\
               └── bin\
                   ├── pdftoppm.exe
                   ├── pdfinfo.exe
                   └── ...
   ```

#### Paso 3: Añadir al PATH
1. Presiona `Windows + R`
2. Escribe `sysdm.cpl` y Enter
3. Pestaña "Opciones avanzadas" → "Variables de entorno"
4. En "Variables del sistema", selecciona `Path` → "Editar"
5. Clic en "Nuevo" y añade:
   ```
   C:\Program Files\poppler-24.08.0\poppler-24.08.0\Library\bin
   ```
6. Clic en "Aceptar" en todas las ventanas

#### Paso 4: Verificar
1. **Cierra TODOS los terminales** (importante!)
2. Abre un nuevo terminal
3. Ejecuta:
   ```bash
   pdftoppm -v
   ```
4. Debería mostrar la versión

---

## 🧪 Probar que Funciona

### 1. Verificar instalación de Poppler
```bash
pdftoppm -v
```

Salida esperada:
```
pdftoppm version 24.08.0
```

### 2. Verificar instalación de Tesseract
```bash
tesseract --version
```

Si no está instalado, descargar de:
https://github.com/UB-Mannheim/tesseract/wiki

Durante la instalación de Tesseract:
- ✅ Marca "Add to PATH"
- ✅ Instala idioma español (spa)

### 3. Reiniciar el servidor
```bash
cd D:\for\chatbotOsinfor
python app.py
```

### 4. Probar en el chatbot
1. Ve a http://localhost:5000/chatbot
2. Sube tu PDF escaneado
3. Ahora debería procesarlo correctamente con OCR

---

## 📊 Cómo Saber si Funcionó

**ANTES (con error):**
```
📊 17 palabras · 91 caracteres
[Error al aplicar OCR al PDF: Unable to get page count...]
```

**DESPUÉS (funcionando):**
```
📊 2,345 palabras · 12,678 caracteres
📄 Contenido del documento:

RESOLUCIÓN GERENCIAL REGIONAL N° 107-2021-GRU-GGR-GERFFS

Considerando que...
[texto completo del PDF]
```

---

## 🎯 Dependencias Necesarias

### Para PDFs Escaneados:
1. **Poppler** ✅ (Para convertir PDF a imágenes)
2. **Tesseract OCR** ✅ (Para extraer texto de imágenes)
3. **pdf2image** ✅ (Ya instalado en requirements.txt)
4. **pytesseract** ✅ (Ya instalado en requirements.txt)

### Para PDFs con Texto Normal:
- Solo necesitas `pypdf` ✅ (Ya instalado)

---

## 🆘 Solución de Problemas

### Error: "pdftoppm no se reconoce como comando"
**Causa:** Poppler no está en el PATH o el terminal no se reinició.
**Solución:** 
1. Verifica que esté en el PATH
2. Cierra TODOS los terminales
3. Abre uno nuevo

### Error: "tesseract no se reconoce como comando"
**Causa:** Tesseract no está instalado.
**Solución:** 
1. Descargar: https://github.com/UB-Mannheim/tesseract/wiki
2. Durante instalación, marca "Add to PATH"
3. Instala idioma español

### El OCR funciona pero extrae mal el texto
**Causa:** PDF de baja calidad o idioma incorrecto.
**Solución:**
1. Verifica que el PDF tenga buena resolución
2. En `conversacion_a_texto_plano.py`, línea 32, verifica:
   ```python
   OCR_LANG = "spa"  # spa = español
   ```

### El servidor no reconoce los cambios
**Causa:** Caché del servidor o módulos no recargados.
**Solución:**
1. Detén el servidor (Ctrl + C)
2. Reinicia: `python app.py`
3. Recarga el navegador (Ctrl + F5)

---

## 💡 Verificación Completa

Ejecuta estos comandos para verificar que todo esté instalado:

```bash
# Verificar Python y dependencias
python --version
pip list | findstr pypdf
pip list | findstr pytesseract
pip list | findstr pdf2image

# Verificar herramientas del sistema
pdftoppm -v
tesseract --version

# Probar conversión
python -c "from conversacion_a_texto_plano import convert_to_text; print('OK')"
```

Todo debería funcionar sin errores.

---

## 🚀 Después de Instalar

1. **Reinicia el servidor:**
   ```bash
   python app.py
   ```

2. **Recarga el navegador:**
   - Presiona `Ctrl + F5` para limpiar caché

3. **Prueba de nuevo:**
   - Ve a http://localhost:5000/chatbot
   - Sube tu PDF: `R.G.R. 107-2021-GRU-GGR-GERFFS.pdf`
   - Debería extraer TODO el texto correctamente

4. **Haz una pregunta específica:**
   - "¿De qué trata esta resolución?"
   - "Resume el documento"
   - Etc.

---

## ✅ Resultado Esperado

Una vez que Poppler esté instalado correctamente, el chatbot podrá:

✅ Leer PDFs escaneados (sin texto seleccionable)  
✅ Extraer TODO el texto con OCR  
✅ Contar palabras y caracteres correctamente  
✅ Responder preguntas basándose en el contenido REAL del documento  
✅ Generar análisis automático completo  

---

**¡Instala Poppler y Tesseract, y el sistema funcionará al 100%!** 🎉
