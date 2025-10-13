from passlib.context import CryptContext
# CryptContext é a forma do Passlib gerenciar algoritmos de criptografia.


from datetime import datetime, timedelta
from jose import JWTError, jwt
# jwt é quem gera e valida tokens.
# JWTError captura erros quando o token é inválido ou expirou.


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Aqui definimos bcrypt como padrão (seguro, usado amplamente).
# deprecated="auto" → caso o algoritmo mude no futuro, ele sabe atualizar.


def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)
# Recebe a senha pura digitada pelo usuário.
# Retorna a senha criptografada.
# Exemplo: "123456" vira algo como: $2b$12$CwTycUXWue0Thq9StjUM0uJ8/

def verificar_senha(senha: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha, senha_hash)
# Compara a senha digitada (senha) com o hash salvo no banco (senha_hash).
# O bcrypt consegue verificar sem precisar “descriptografar” a senha.
# Retorna True se bater, False se não.


# chave secreta (troque depois por algo seguro)
SECRET_KEY = "supersecreta123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
# SECRET_KEY: chave usada para assinar os tokens.
# ATENCAO!!!!!!!!! Em produção, deve estar no .env (não no código).
# ALGORITHM: algoritmo de criptografia (HS256 é o mais comum).
# ACCESS_TOKEN_EXPIRE_MINUTES: tempo de vida do token (30 min aqui).

def criar_token(dados: dict):
    to_encode = dados.copy()
    expira = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expira})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token
# Recebe um dicionário de dados (exemplo: {"sub": "pedro@teste.com"}).
# Copia os dados para não alterar o original.
# Adiciona um campo de expiração (exp).
# Cria um token JWT com assinatura digital.
# Retorna uma string parecida com: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
# Decodifica e valida o token recebido.
# Se o token for válido e não tiver expirado → retorna o conteúdo (payload).
# Se for inválido ou expirado → retorna None.
# {
#   "sub": "pedro@teste.com",
#   "exp": 1735160000
# }