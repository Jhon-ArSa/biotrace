#!/usr/bin/env python3
"""
Script para verificar que todo esté listo para desplegar en Render
"""

import os
import sys
from pathlib import Path

def check_file(filename, required=True):
    """Verifica si un archivo existe"""
    if Path(filename).exists():
        print(f"✅ {filename}")
        return True
    else:
        symbol = "❌" if required else "⚠️"
        print(f"{symbol} {filename} {'(REQUERIDO)' if required else '(Opcional)'}")
        return not required

def check_content(filename, search_text, description):
    """Verifica que un archivo contenga cierto texto"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            if search_text in content:
                print(f"✅ {description}")
                return True
            else:
                print(f"❌ {description}")
                return False
    except:
        print(f"❌ No se puede leer {filename}")
        return False

def main():
    print("="*60)
    print("🔍 VERIFICACIÓN PRE-DESPLIEGUE PARA RENDER")
    print("="*60 + "\n")
    
    all_ok = True
    
    # Archivos requeridos
    print("📁 Archivos Requeridos:")
    all_ok &= check_file("requirements.txt")
    all_ok &= check_file("app.py")
    all_ok &= check_file(".gitignore")
    print()
    
    # Archivos opcionales pero recomendados
    print("📁 Archivos Recomendados:")
    check_file("render.yaml", required=False)
    check_file(".renderignore", required=False)
    check_file("README.md", required=False)
    print()
    
    # Verificar contenido de requirements.txt
    print("🔍 Verificando requirements.txt:")
    all_ok &= check_content("requirements.txt", "gunicorn", "gunicorn incluido")
    all_ok &= check_content("requirements.txt", "opencv-python-headless", 
                            "opencv-python-headless (versión sin GUI)")
    print()
    
    # Verificar app.py
    print("🔍 Verificando app.py:")
    all_ok &= check_content("app.py", "os.environ.get('PORT'", 
                            "Puerto configurado desde variable de entorno")
    all_ok &= check_content("app.py", "host='0.0.0.0'", 
                            "Host configurado como 0.0.0.0")
    print()
    
    # Verificar estructura de directorios
    print("📂 Verificando estructura:")
    check_file("biotrace/index.html", required=False)
    check_file("static/style.css", required=False)
    check_file("database/db_manager.py", required=False)
    print()
    
    # Git
    print("🔄 Verificando Git:")
    if Path(".git").exists():
        print("✅ Repositorio Git inicializado")
        # Verificar si hay cambios sin commit
        import subprocess
        try:
            result = subprocess.run(["git", "status", "--porcelain"], 
                                  capture_output=True, text=True)
            if result.stdout.strip():
                print("⚠️  Hay cambios sin commit")
                print("   Ejecuta: git add . && git commit -m 'Preparar despliegue'")
            else:
                print("✅ No hay cambios pendientes")
        except:
            print("⚠️  No se puede verificar el estado de Git")
    else:
        print("❌ No hay repositorio Git (ejecuta: git init)")
        all_ok = False
    print()
    
    # Resumen
    print("="*60)
    if all_ok:
        print("✅ TODO LISTO PARA DESPLEGAR EN RENDER!")
        print("\nPróximos pasos:")
        print("1. git add . && git commit -m 'Listo para Render'")
        print("2. git push origin main")
        print("3. Ir a render.com y crear un Web Service")
        print("\n📖 Ver DESPLIEGUE_RENDER.md para guía completa")
    else:
        print("❌ HAY PROBLEMAS QUE RESOLVER")
        print("\nRevisa los errores marcados con ❌ arriba")
    print("="*60)
    
    return 0 if all_ok else 1

if __name__ == "__main__":
    sys.exit(main())
