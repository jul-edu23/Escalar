"""
funcoes de autenticacao e controle de acesso do sistema
"""

from functools import wraps
from flask import session, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from models import Usuario, db

def gerarHashSenha(senha):
    """
    gera hash seguro da senha
    """
    return generate_password_hash(senha)

def verificarSenha(senha_hash, senha):
    """
    checa se a senha bate com o hash
    """
    return check_password_hash(senha_hash, senha)

def autenticarUsuario(email, senha):
    """
    faz autenticacao do usuario com email e senha
    retorna o usuario se deu certo, None se nao
    """
    usuario = Usuario.query.filter_by(email=email).first()
    
    if usuario and verificarSenha(usuario.senha, senha):
        return usuario
    return None

def verificarAdmin(f):
    """
    decorator pra checar se o usuario é admin
    """
    @wraps(f)
    def decoratedFunction(*args, **kwargs):
        if 'usuario_id' not in session:
            flash('Você precisa estar logado para acessar esta página.', 'warning')
            return redirect(url_for('login'))
        
        usuario = Usuario.query.get(session['usuario_id'])
        if not usuario or usuario.nivel_acesso != 'administrador':
            flash('Acesso negado. Apenas administradores podem cadastrar usuários.', 'danger')
            return redirect(url_for('index'))
        
        return f(*args, **kwargs)
    return decoratedFunction

def obterUsuarioAtual():
    """
    pega o usuario que ta logado agora
    """
    if 'usuario_id' in session:
        return Usuario.query.get(session['usuario_id'])
    return None