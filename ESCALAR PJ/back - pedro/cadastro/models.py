

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Usuario(db.Model):
    
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    apelido = db.Column(db.String(50))
    data_nascimento = db.Column(db.Date)
    email = db.Column(db.String(100), unique=True, nullable=False)
    foto = db.Column(db.String(255), default='default.jpg')
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    turno = db.Column(db.Enum('diurno', 'noturno', 'misto'), default='diurno')
    escala = db.Column(db.Enum('12x36', '6x1', '5x2', '5x1', '4x3'), default='12x36')
    local = db.Column(db.Enum('CCE', 'CCV', 'Campus', 'CCO'), default='Campus')
    senha = db.Column(db.String(255), nullable=False)
    nivel_acesso = db.Column(db.String(20), default='comum')
    status = db.Column(db.Enum('ativo', 'inativo'), default='ativo')
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Usuario {self.nome}>'
    
    def to_dict(self):
        
        return {
            'id': self.id,
            'nome': self.nome,
            'apelido': self.apelido,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'email': self.email,
            'foto': self.foto,
            'cpf': self.cpf,
            'turno': self.turno,
            'escala': self.escala,
            'local': self.local,
            'cargo': self.nivel_acesso,
            'status': self.status,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

class Escala(db.Model):
    
    __tablename__ = 'escalas'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data_plantao = db.Column(db.Date, nullable=False)
    tipo = db.Column(db.Enum('trabalho', 'folga', 'férias', 'atestado', 'substituição'), 
                     nullable=False)
    observacao = db.Column(db.String(255))

    usuario = db.relationship('Usuario', backref='escalas', lazy=True)
    
    def __repr__(self):
        return f'<Escala {self.usuario_id} - {self.data_plantao}>'
    
    def to_dict(self):
        
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nome': self.usuario.nome if self.usuario else None,
            'data_plantao': self.data_plantao.isoformat() if self.data_plantao else None,
            'tipo': self.tipo,
            'observacao': self.observacao
        }

class Troca(db.Model):
    
    __tablename__ = 'trocas'
    
    id = db.Column(db.Integer, primary_key=True)
    solicitante_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    substituto_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    data_solicitada = db.Column(db.Date, nullable=False)
    motivo = db.Column(db.String(255))
    status = db.Column(db.Enum('pendente', 'aprovada', 'recusada'), default='pendente')
    data_solicitacao = db.Column(db.DateTime, default=datetime.utcnow)

    solicitante = db.relationship('Usuario', foreign_keys=[solicitante_id], 
                                 backref='trocas_solicitadas', lazy=True)
    substituto = db.relationship('Usuario', foreign_keys=[substituto_id], 
                                backref='trocas_substituidas', lazy=True)
    
    def __repr__(self):
        return f'<Troca {self.id} - {self.status}>'
    
    def to_dict(self):
        
        return {
            'id': self.id,
            'solicitante_id': self.solicitante_id,
            'solicitante_nome': self.solicitante.nome if self.solicitante else None,
            'solicitante_local': self.solicitante.local if self.solicitante else None,
            'substituto_id': self.substituto_id,
            'substituto_nome': self.substituto.nome if self.substituto else None,
            'data_solicitada': self.data_solicitada.isoformat() if self.data_solicitada else None,
            'motivo': self.motivo,
            'status': self.status,
            'data_solicitacao': self.data_solicitacao.isoformat() if self.data_solicitacao else None
        }

class Ferias(db.Model):
    
    __tablename__ = 'ferias'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data_inicio = db.Column(db.Date, nullable=False)
    data_fim = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('pendente', 'aprovada', 'rejeitada'), default='pendente')
    observacao = db.Column(db.String(255))
    data_solicitacao = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship('Usuario', backref='ferias', lazy=True)
    
    def __repr__(self):
        return f'<Ferias {self.id} - {self.status}>'
    
    def to_dict(self):
        
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nome': self.usuario.nome if self.usuario else None,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'status': self.status,
            'observacao': self.observacao,
            'data_solicitacao': self.data_solicitacao.isoformat() if self.data_solicitacao else None
        }

class Atestado(db.Model):
    
    __tablename__ = 'atestados'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data_inicio = db.Column(db.Date, nullable=False)
    data_fim = db.Column(db.Date, nullable=False)
    motivo = db.Column(db.String(255))
    status = db.Column(db.Enum('pendente', 'aceito', 'negado'), default='pendente')
    data_envio = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship('Usuario', backref='atestados', lazy=True)
    
    def __repr__(self):
        return f'<Atestado {self.id} - {self.status}>'
    
    def to_dict(self):
        
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nome': self.usuario.nome if self.usuario else None,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'motivo': self.motivo,
            'status': self.status,
            'data_envio': self.data_envio.isoformat() if self.data_envio else None
        }

class Notificacao(db.Model):
    
    __tablename__ = 'notificacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    link = db.Column(db.String(255))
    lida = db.Column(db.Boolean, default=False)
    data_envio = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship('Usuario', backref='notificacoes', lazy=True)
    
    def __repr__(self):
        return f'<Notificacao {self.id} - Lida: {self.lida}>'
    
    def to_dict(self):
        
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'mensagem': self.mensagem,
            'link': self.link,
            'lida': self.lida,
            'data_envio': self.data_envio.isoformat() if self.data_envio else None
        }
    
    def marcar_como_lida(self):
        
        self.lida = True
        db.session.commit()

class HistoricoAcao(db.Model):
    
    __tablename__ = 'historico_acoes'
    
    id = db.Column(db.Integer, primary_key=True)
    coordenador_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    acao = db.Column(db.String(255))
    data_hora = db.Column(db.DateTime, default=datetime.utcnow)

    coordenador = db.relationship('Usuario', backref='historico_acoes', lazy=True)
    
    def __repr__(self):
        return f'<HistoricoAcao {self.id} - {self.acao[:30]}>'
    
    def to_dict(self):
        
        return {
            'id': self.id,
            'coordenador_id': self.coordenador_id,
            'coordenador_nome': self.coordenador.nome if self.coordenador else None,
            'acao': self.acao,
            'data_hora': self.data_hora.isoformat() if self.data_hora else None
        }
