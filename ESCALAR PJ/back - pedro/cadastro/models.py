"""
models do banco de dados - tabela de usuarios
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Usuario(db.Model):
    """
    tabela usuarios - guarda os dados de todo mundo
    """
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    foto = db.Column(db.String(200), nullable=True)
    apelido = db.Column(db.String(50), nullable=False)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    escala = db.Column(db.String(20), nullable=False)
    turno = db.Column(db.String(20), nullable=False)
    local = db.Column(db.String(20), nullable=False)
    nivel_acesso = db.Column(db.String(20), default='comum')
    senha = db.Column(db.String(200), nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Usuario {self.nome}>'