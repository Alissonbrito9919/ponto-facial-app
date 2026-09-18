import cv2

# Coloque o caminho exato da foto que está dando problema
caminho = r"C:\Users\aliss\OneDrive\Documentos\ponto_facial_app\backend\foto_referencia.jpg"

print("Tentando ler o arquivo...")
imagem = cv2.imread(caminho)

if imagem is None:
    print("❌ ERRO LEITURA: O Python não encontrou a imagem.")
    print("O problema é o Windows. Ele provavelmente escondeu a extensão real ou o arquivo está corrompido.")
else:
    print("✅ SUCESSO: A imagem foi encontrada e carregada!")
    print(f"Resolução da imagem: {imagem.shape}")