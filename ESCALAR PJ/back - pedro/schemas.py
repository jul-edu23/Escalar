from pydantic import BaseModel, EmailStr
# BaseModel: classe base do Pydantic que permite criar "modelos de dados".
# EmailStr: tipo especial do Pydantic que valida automaticamente se o texto é um email válido.

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    # Esse schema define como os dados de criação de usuário devem ser enviados na API.
    # O cliente deve enviar um JSON com esses três campos.
    # {
    #  "nome": "Pedro",
    #  "email": "pedro@teste.com",
    #  "senha": "123456"
    # }
    # Se mandar email: "não é email", o FastAPI já rejeita com erro 422 (Unprocessable Entity) antes mesmo do código rodar.



class UserLogin(BaseModel):
    email: EmailStr
    senha: str
    # Esse schema é usado no login.
    # O cliente só precisa enviar email + senha.
    # {
    #   "email": "pedro@teste.com",
    #   "senha": "123456"
    # }




class UserResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    # Esse schema define o que vamos responder ao cliente depois que o usuário for criado/buscado.
    # Contém apenas id, nome e email (não inclui senha_hash).
    # Assim, mesmo que no banco exista a senha criptografada, ela nunca aparece para o cliente.

    class Config:
        orm_mode = True
        # Diz ao Pydantic que o schema pode receber objetos ORM do SQLAlchemy (como nosso User do models.py) e 
        # convertê-los automaticamente para JSON.

        # novo_user = User(id=1, nome="Pedro", email="pedro@teste.com", senha_hash="xxxx")
        # return novo_user

        # {
        #   "id": 1,
        #   "nome": "Pedro",
        #   "email": "pedro@teste.com"
        # }

        # Sem o orm_mode, isso quebraria, porque o Pydantic não entenderia os objetos ORM.
