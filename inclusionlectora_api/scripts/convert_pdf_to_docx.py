import sys
from pdf2docx import Converter

if len(sys.argv) != 3:
    print("Se requieren dos argumentos: input y output")
    sys.exit(1)

pdf_file = sys.argv[1]
docx_file = sys.argv[2]

try:
    cv = Converter(pdf_file)
    cv.convert(docx_file, start=0, end=None)
    cv.close()
    print("Conversión completada.")
except Exception as e:
    print(f"Error durante la conversión: {e}")
    sys.exit(1)
