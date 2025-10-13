from sqlalchemy import Column, Integer, String
# Importa tipos de colunas e definições de SQLAlchemy:
# Column: define uma coluna em uma tabela.
# Integer: tipo inteiro (para IDs, por exemplo).
# String: tipo texto/varchar.

from .database import Base
# Importa a classe base (herdada do SQLAlchemy) que foi criada no arquivo database.py.
# Essa Base é usada para dizer:
# "todas as classes que herdarem de mim viram tabelas no banco".

class User(Base):
# Define uma classe Python chamada User.
# Herdar de Base significa: essa classe vai virar uma tabela no banco.    

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Cria uma coluna id:
    # Integer: inteiro.
    # primary_key=True: chave primária da tabela.
    # index=True: cria um índice para busca rápida.

    nome = Column(String, nullable=False)
    # Cria a coluna nome (texto).
    # nullable=False → não pode ser vazio.

    email = Column(String, unique=True, index=True, nullable=False)
    # Coluna email (texto).
    # unique=True → não pode haver dois iguais no banco.
    # index=True → melhora performance de busca.
    # nullable=False → obrigatório.

    senha_hash = Column(String, nullable=False)
    # Coluna senha_hash, onde armazenamos a senha já criptografada.
    # Nunca armazenamos senha pura em banco (boa prática de segurança).