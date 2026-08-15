import requests

BASE = 'http://localhost:8000/api/v1'
try:
    r = requests.post(f"{BASE}/auth/login", data={'username':'asdf@gmail.com','password':'TestPass123'})
    print('STATUS', r.status_code)
    try:
        print('JSON', r.json())
    except Exception:
        print('TEXT', r.text[:800])
except Exception as e:
    print('ERROR', e)
