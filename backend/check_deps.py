import importlib
mods = ['pdfplumber', 'docx', 'pptx', 'PIL', 'pytesseract', 'google.generativeai', 'fastapi', 'uvicorn']
for name in mods:
    try:
        m = importlib.import_module(name)
        print(f"OK {name}: {getattr(m, '__file__', 'built-in')[:120]}")
    except Exception as e:
        print(f"MISSING {name}: {e}")
