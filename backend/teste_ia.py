from deepface import DeepFace

foto_ref = r"C:\Users\aliss\OneDrive\Documentos\ponto_facial_app\backend\foto_referencia.jpg"
foto_teste = r"C:\Users\aliss\OneDrive\Documentos\ponto_facial_app\backend\foto_estranho.jpg"

print("--- INICIANDO COMPARAÇÃO FACIAL ---")

try:
    # Usando a função verify com o detector que validamos no diagnóstico
    resultado = DeepFace.verify(
        img1_path = foto_ref,
        img2_path = foto_teste,
        detector_backend = "mtcnn",
        enforce_detection = False
    )

    print("\n--- RESULTADO DA ANÁLISE ---")
    
    if resultado["verified"]:
        print("✅ SUCESSO: O sistema confirmou que é a mesma pessoa!")
    else:
        print("❌ NEGADO: O sistema achou os rostos muito diferentes.")
        
    print("Nível de similaridade (distância):", round(resultado["distance"], 4))

except Exception as e:
    print(f"\n❌ ERRO DURANTE A ANÁLISE. Detalhe: {e}")