"""
Sistema de autenticacao e controle de acesso
"""

from functools import wraps
from flask import session, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from models import Usuario, db

def gerarHashSenha(senha):
    """
    Gera um hash seguro da senha
    """
    return generate_password_hash(senha)

def verificarSenha(senha_hash, senha):
    """
    Verifica se a senha corresponde ao hash
    """
    return check_password_hash(senha_hash, senha)

def autenticarUsuario(email, senha):
    """
    Autentica um usuario verificando email e senha.
    Retorna o usuario se autenticado, None caso contrario.
    """
    usuario = Usuario.query.filter_by(email=email).first()
    
    if usuario and verificarSenha(usuario.senha, senha):
        return usuario
    return None

def verificarAdmin(f):
    """
    Decorator para verificar se o usuario e administrador
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
    Retorna o usuario atual logado
    """
    if 'usuario_id' in session:
        return Usuario.query.get(session['usuario_id'])
    return None