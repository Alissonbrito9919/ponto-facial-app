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
import tempfile # Biblioteca nativa adicionada para lidar com arquivos no Render

# Carrega as senhas do arquivo .env (funciona no ambiente local)
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Trava a aplicação e imprime o que o Render está vendo
if not url or not key:
    chaves_do_sistema = list(os.environ.keys())
    raise ValueError(f"⚠ ERRO CRÍTICO: Chaves ausentes. O Render só conhece estas chaves: {chaves_do_sistema}")

# Conecta ao banco de dados do Supabase
supabase: Client = create_client(url, key)

app = FastAPI(title="API Ponto Facial")

# Configuração de permissões de rede
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

class CadastroFuncionario(BaseModel):
    nome: str
    cpf: str
    data_nascimento: str 
    foto_base64: str 

class PontoFuncionario(BaseModel):
    cpf: str
    foto_base64: str
    tipo_batida: str 
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/")
def status_api():
    return {"status": "online", "mensagem": "API do Sistema de Ponto rodando com sucesso!"}

@app.post("/bater-ponto")
async def registrar_ponto(dados: PontoFuncionario):
    # Usa a pasta temporária correta do sistema (evita problemas de permissão na nuvem)
    dir_temp = tempfile.gettempdir()
    caminho_captura = os.path.join(dir_temp, f"temp_captura_{dados.cpf}.jpg")
    caminho_referencia = os.path.join(dir_temp, f"temp_referencia_{dados.cpf}.jpg")
    
    try:
        # 1. Procurar o funcionário pelo CPF
        resposta_func = supabase.table("funcionarios").select("*").eq("cpf", dados.cpf).execute()
        
        if not resposta_func.data:
            return {"status": "erro", "mensagem": "Funcionário não encontrado. Verifique o CPF."}
            
        funcionario = resposta_func.data[0]
        
        # 2. Preparar as fotografias
        base64_limpo = dados.foto_base64.split(",")[1] if "," in dados.foto_base64 else dados.foto_base64
        with open(caminho_captura, "wb") as f:
            f.write(base64.b64decode(base64_limpo))
        
        # Baixar foto de referência
        urllib.request.urlretrieve(funcionario["foto_referencia"], caminho_referencia)

        # 3. Validação Biométrica com DeepFace
        resultado_ia = DeepFace.verify(
            img1_path=caminho_captura, 
            img2_path=caminho_referencia, 
            enforce_detection=False
        )
        
        # 4. Limpar o disco
        if os.path.exists(caminho_captura): os.remove(caminho_captura)
        if os.path.exists(caminho_referencia): os.remove(caminho_referencia)

        # 5. Avaliar o resultado
        if not resultado_ia["verified"]:
            return {"status": "erro", "mensagem": "Biometria não validada. Rosto não reconhecido."}

        # 6. Guardar o registro
        novo_registo = {
            "funcionario_id": funcionario["id"], 
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
        if os.path.exists(caminho_captura): os.remove(caminho_captura)
        if os.path.exists(caminho_referencia): os.remove(caminho_referencia)
        return {"status": "erro", "mensagem": str(e)}
    
@app.post("/cadastrar")
async def cadastrar_funcionario(dados: CadastroFuncionario):
    try:
        if "," in dados.foto_base64:
            base64_data = dados.foto_base64.split(",")[1]
        else:
            base64_data = dados.foto_base64

        image_bytes = base64.b64decode(base64_data)
        nome_arquivo = f"{dados.cpf}.jpg"

        upload_response = supabase.storage.from_("fotos_referencia").upload(
            path=nome_arquivo, 
            file=image_bytes, 
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )

        url_foto = supabase.storage.from_("fotos_referencia").get_public_url(nome_arquivo)

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