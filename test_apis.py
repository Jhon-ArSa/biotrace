import requests

print("Probando APIs...")

try:
    # Probar API de trozo
    print("\n1. Probando /api/traz/trozo/TRZ-2024-LOT-000002")
    r1 = requests.get("http://localhost:5000/api/traz/trozo/TRZ-2024-LOT-000002", timeout=5)
    print(f"   Status: {r1.status_code}")
    if r1.status_code == 200:
        data = r1.json()
        print(f"   Success: {data.get('success')}")
        if data.get('trozo'):
            print(f"   Trozo: {data['trozo'].get('codigo_unico_trozo')}")
    else:
        print(f"   Error: {r1.text}")
    
    # Probar API de checkpoints
    print("\n2. Probando /api/traz/checkpoints/trozo/TRZ-2024-LOT-000002")
    r2 = requests.get("http://localhost:5000/api/traz/checkpoints/trozo/TRZ-2024-LOT-000002", timeout=5)
    print(f"   Status: {r2.status_code}")
    if r2.status_code == 200:
        data = r2.json()
        print(f"   Success: {data.get('success')}")
        checkpoints = data.get('checkpoints', [])
        print(f"   Checkpoints: {len(checkpoints)}")
        for cp in checkpoints[:3]:
            print(f"     - {cp.get('nombre_checkpoint')} ({cp.get('estado')})")
    else:
        print(f"   Error: {r2.text}")

except requests.exceptions.ConnectionError:
    print("\nERROR: No se puede conectar al servidor")
    print("Verifica que el servidor este corriendo en http://localhost:5000")
except requests.exceptions.Timeout:
    print("\nERROR: Timeout - El servidor tarda mucho en responder")
except Exception as e:
    print(f"\nERROR: {e}")
