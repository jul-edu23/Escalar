from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, auth, database

app = FastAPI()

# criar banco ao rodar
models.Base.metadata.create_all(bind=database.engine)

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # @app.post("/register"): cria uma rota HTTP POST acessível em /register.
    # response_model=schemas.UserResponse: o que será devolvido na resposta seguirá esse modelo (id, nome, email).
    # user: schemas.UserCreate: o FastAPI valida automaticamente a entrada com o modelo Pydantic (nome, email, senha).
    # db: Session = Depends(database.get_db): injeta uma conexão com o banco de dados (usando SQLAlchemy).

    usuario_existente = db.query(models.User).filter(models.User.email == user.email).first()
    # Consulta no banco se já existe um usuário com o mesmo email.
    # db.query(models.User) → seleciona a tabela users.
    # .filter(models.User.email == user.email) → aplica condição "onde email == email informado".
    # .first() → pega o primeiro resultado encontrado (ou None se não houver).

    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email já registrado")
    # Se já existe, lança uma exceção HTTP 400 (Bad Request).
    # detail → mensagem que será enviada ao cliente (front-end).


    novo_user = models.User(
        nome=user.nome,
        email=user.email,
        senha_hash=auth.hash_senha(user.senha)
    )
    db.add(novo_user)
    db.commit()
    db.refresh(novo_user)
    return novo_user

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    # Rota POST /login
    # Recebe email e senha.
    # Conexão com banco injetada automaticamente.

    usuario = db.query(models.User).filter(models.User.email == user.email).first()
    # Busca no banco o usuário com aquele email.
    # Se não encontrar → usuario = None.

    if not usuario or not auth.verificar_senha(user.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    # Se usuário não existe OU a senha não bate com o hash, retorna erro 401 (Unauthorized).
    # auth.verificar_senha() usa bcrypt para comparar a senha digitada com a senha criptografada salva.

    token = auth.criar_token({"sub": usuario.email})
    # Se login é válido, gera um token JWT.
    # O payload tem {"sub": usuario.email} → o sub (“subject”) indica quem é o dono do token.
    # Esse token também tem uma data de expiração configurada em auth.py.

    return {"access_token": token, "token_type": "bearer"}
    # Retorna o token no formato padrão OAuth2 (com token_type = "bearer").
    # O front-end deve guardar esse token e enviá-lo em cada requisição protegida dentro do header:
    # Authorization: Bearer <token>
