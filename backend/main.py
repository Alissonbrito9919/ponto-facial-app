from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware 
from deepface import DeepFace
import shutil
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel
import base64
from typing import Optional
import urllib.request
import numpy as np
import cv2

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

class CadastroFuncionario(BaseModel):
    nome: str
    cpf: str
    data_nascimento: str # Formato AAAA-MM-DD
    foto_base64: str # A imagem capturada pela câmera

class PontoFuncionario(BaseModel):
    cpf: str
    foto_base64: str
    tipo_batida: str # Ex: 'Entrada', 'Almoço', 'Retorno', 'Saída'
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Rota de teste
@app.get("/")
def status_api():
    return {"status": "online", "mensagem": "API do Sistema de Ponto rodando com sucesso!"}

# Nova Rota: Bater Ponto
@app.post("/bater-ponto")
async def registrar_ponto(dados: PontoFuncionario):
    try:
        # 1. Procurar o funcionário pelo CPF na base de dados
        resposta_func = supabase.table("funcionarios").select("*").eq("cpf", dados.cpf).execute()
        
        if not resposta_func.data:
            return {"status": "erro", "mensagem": "Funcionário não encontrado. Verifique o CPF."}
            
        funcionario = resposta_func.data[0]
        
        # 2. Preparar as fotografias para o DeepFace (Ambas em formato OpenCV)
        
        # A. Converter a foto capturada (Base64) para formato cv2
        base64_limpo = dados.foto_base64.split(",")[1] if "," in dados.foto_base64 else dados.foto_base64
        img_bytes = base64.b64decode(base64_limpo)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        foto_capturada_cv2 = cv2.imdecode(img_array, -1)
        
        # B. Descarregar a foto de referência (URL) para formato cv2
        req = urllib.request.urlopen(funcionario["foto_referencia"])
        arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
        foto_matriz_cv2 = cv2.imdecode(arr, -1)

        # 3. Validação Biométrica com DeepFace
        # ATENÇÃO: Descomente a linha abaixo e comente a simulação quando tiver a certeza de que a rota funciona
        # resultado_ia = DeepFace.verify(img1_path=foto_capturada_cv2, img2_path=foto_matriz_cv2, enforce_detection=False)
        
        # Simulação para testar primeiro a gravação na base de dados:
        resultado_ia = {"verified": True} 
        
        if not resultado_ia["verified"]:
            return {"status": "erro", "mensagem": "Biometria não validada. Rosto não reconhecido."}

        # 4. Guardar o registo de ponto
        novo_registo = {
            "funcionario_id": funcionario["id"], # Liga o registo ao utilizador
            "tipo_batida": dados.tipo_batida,
            "latitude": dados.latitude,
            "longitude": dados.longitude
        }
        
        supabase.table("registros_ponto").insert(novo_registo).execute()

        return {
            "status": "sucesso", 
            "mensagem": f"Ponto de {dados.tipo_batida} aprovado para {funcionario['nome']}!"
        }

    except Exception as e:
        return {"status": "erro", "mensagem": str(e)}
    
@app.post("/cadastrar")
async def cadastrar_funcionario(dados: CadastroFuncionario):
    try:
        # 1. Limpa o cabeçalho do base64 (se vier do frontend com 'data:image/jpeg;base64,')
        if "," in dados.foto_base64:
            base64_data = dados.foto_base64.split(",")[1]
        else:
            base64_data = dados.foto_base64

        # 2. Converte o base64 para bytes de imagem
        image_bytes = base64.b64decode(base64_data)
        nome_arquivo = f"{dados.cpf}.jpg"

        # 3. Faz o upload da foto para o Bucket 'fotos_referencia' no Supabase
        # O content-type garante que o navegador a leia como imagem, e o upsert atualiza arquivos existentes
        upload_response = supabase.storage.from_("fotos_referencia").upload(
            path=nome_arquivo, 
            file=image_bytes, 
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )

        # 4. Pega o Link Público da foto recém-salva
        url_foto = supabase.storage.from_("fotos_referencia").get_public_url(nome_arquivo)

        # 5. Salva os dados do funcionário no banco de dados com a URL da foto
        novo_funcionario = {
            "nome": dados.nome,
            "cpf": dados.cpf,
            "data_nascimento": dados.data_nascimento,
            "foto_referencia": url_foto
        }
        
        resposta_db = supabase.table("funcionarios").insert(novo_funcionario).execute()

        return {"status": "sucesso", "mensagem": "Funcionário cadastrado com sucesso!", "dados": resposta_db.data}

    except Exception as e:
        return {"status": "erro", "mensagem": str(e)}