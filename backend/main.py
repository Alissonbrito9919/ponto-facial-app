from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware 
from deepface import DeepFace
import shutil
import os
from dotenv import load_dotenv
from supabase import create_client, Client


# Carrega as senhas do arquivo .env
load_dotenv()

# Conecta ao banco de dados do Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI(title="API Ponto Facial")

# 2. Configuração de permissões de rede
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite o acesso de qualquer dispositivo no Wi-Fi
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# Rota de teste
@app.get("/")
def status_api():
    return {"status": "online", "mensagem": "API do Sistema de Ponto rodando com sucesso!"}

# Nova Rota: Bater Ponto
@app.post("/bater-ponto")
async def bater_ponto(foto: UploadFile = File(...)):
    # 1. Define onde salvar a foto recebida temporariamente
    caminho_temporario = f"C:/Users/aliss/OneDrive/Documentos/ponto_facial_app/backend/uploads/temp_{foto.filename}"
    
    try:
        # 2. Salva a imagem que o usuário enviou na nossa pasta backend
        with open(caminho_temporario, "wb") as buffer:
            shutil.copyfileobj(foto.file, buffer)
            
        # 3. Define a foto de referência (a sua que já está na pasta)
        foto_ref = r"C:\Users\aliss\OneDrive\Documentos\ponto_facial_app\backend\foto_referencia.jpg"
        
        # 4. Roda a biometria usando o MTCNN
        resultado = DeepFace.verify(
            img1_path = foto_ref,
            img2_path = caminho_temporario,
            detector_backend = "mtcnn",
            enforce_detection = False
        )
        
        # 5. Apaga a foto temporária para não lotar o servidor
        os.remove(caminho_temporario)
        
        # 6. Retorna a resposta para o frontend
        if resultado["verified"]:
            
            # ---LÓGICA DO SUPABASE AQUI ---
            dados_ponto = {
                "funcionario_id": "b2b6d9bd-e7c7-4769-b5bd-5e510fa94249", # Ex: "123e4567-e89b-12d3-a456-426614174000"
                "tipo_batida": "entrada"
            }
            # Insere na tabela 'registros_ponto'
            supabase.table("registros_ponto").insert(dados_ponto).execute()
            # ------------------------------------

            return {
                "sucesso": True, 
                "mensagem": "Ponto registrado e salvo no banco com sucesso!",
                "distancia": round(resultado["distance"], 4)
            }
        else:
            return {
                "sucesso": False, 
                "mensagem": "Acesso negado. Rosto não reconhecido.",
                "distancia": round(resultado["distance"], 4)
            }
            
    except Exception as e:
        # Se der erro, apaga a foto temporária também
        if os.path.exists(caminho_temporario):
            os.remove(caminho_temporario)
        return {"sucesso": False, "erro": str(e)}
    
