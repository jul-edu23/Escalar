from functools import wraps
from flask import session, redirect, url_for, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import Usuario, db

def gerarHashSenha(senha):
    return generate_password_hash(senha)

def verificarSenha(senha_hash, senha):
    return check_password_hash(senha_hash, senha)

def autenticarUsuario(email, senha):
    usuario = Usuario.query.filter_by(email=email).first()
    if usuario and verificarSenha(usuario.senha, senha):
        return usuario
    return None

def verificarAdmin(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        usuario = obterUsuarioAtual()
        # Aceitar tanto 'administrador' quanto 'coordenador' como admin
        if not usuario or usuario.nivel_acesso not in ['administrador', 'coordenador']:
            return jsonify({'error': 'Acesso negado. Apenas coordenadores podem acessar esta rota.'}), 403
        return f(*args, **kwargs)
    return decorador

def obterUsuarioAtual():
    if 'usuario_id' in session:
        return Usuario.query.get(session['usuario_id'])
    return None