"""
Sistema de Login - Escalar
Servidor Flask pra autenticacao de usuarios do sistema
"""

import os
import sys
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_cors import CORS

# precisa adicionar o path do cadastro aqui pra importar models e auth
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'cadastro'))

from models import db, Usuario
from auth import autenticarUsuario, obterUsuarioAtual, gerarHashSenha

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chave-secreta-para-desenvolvimento'
# usa o mesmo banco do cadastro pra nao ter duplicacao
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'cadastro', 'instance', 'escalar.db'))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# habilita CORS senao da erro no frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:5001", "http://127.0.0.1:5001", "file://", "*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# inicializa o db
db.init_app(app)

@app.route('/')
def index():
    """
    redireciona pra dashboard se ja tiver logado, senao vai pro login
    """
    if 'usuario_id' in session:
        usuario = obterUsuarioAtual()
        if usuario:
            if usuario.nivel_acesso == 'administrador':
                return redirect(url_for('dashboardAdmin'))
            else:
                return redirect(url_for('dashboardColaborador'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    pagina de login principal
    """
    # se ja tiver sessao ativa, manda direto pro dashboard
    if 'usuario_id' in session:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')
        
        # checa se preencheu tudo
        if not email or not senha:
            flash('Por favor, preencha todos os campos.', 'warning')
            return render_template('login.html')
        
        # tenta autenticar
        usuario = autenticarUsuario(email, senha)
        
        if usuario:
            # Armazena dados na sessao
            session['usuario_id'] = usuario.id
            session['usuario_nome'] = usuario.nome
            session['usuario_apelido'] = usuario.apelido
            session['usuario_email'] = usuario.email
            session['usuario_nivel'] = usuario.nivel_acesso
            session['usuario_foto'] = usuario.foto
            
            flash(f'Bem-vindo, {usuario.apelido}!', 'success')
            
            # manda pro dashboard certo dependendo do nivel
            if usuario.nivel_acesso == 'administrador':
                return redirect(url_for('dashboardAdmin'))
            else:
                return redirect(url_for('dashboardColaborador'))
        else:
            flash('E-mail ou senha incorretos. Tente novamente.', 'danger')
    
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def apiLogin():
    """
    endpoint JSON pro frontend fazer login via JavaScript
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400
        
        email = dados.get('email', '').strip()
        senha = dados.get('senha', '')
        
        # validacao basica
        if not email or not senha:
            return jsonify({'error': 'E-mail e senha são obrigatórios'}), 400
        
        # tenta fazer a autenticacao
        usuario = autenticarUsuario(email, senha)
        
        if usuario:
            # Armazena dados na sessao
            session['usuario_id'] = usuario.id
            session['usuario_nome'] = usuario.nome
            session['usuario_apelido'] = usuario.apelido
            session['usuario_email'] = usuario.email
            session['usuario_nivel'] = usuario.nivel_acesso
            session['usuario_foto'] = usuario.foto
            
            return jsonify({
                'success': True,
                'message': f'Bem-vindo, {usuario.apelido}!',
                'usuario': {
                    'id': usuario.id,
                    'nome': usuario.nome,
                    'apelido': usuario.apelido,
                    'email': usuario.email,
                    'nivel_acesso': usuario.nivel_acesso,
                    'foto': usuario.foto
                },
                'redirect': '/dashboard-admin' if usuario.nivel_acesso == 'administrador' else '/dashboard-colaborador'
            }), 200
        else:
            return jsonify({'error': 'E-mail ou senha incorretos'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Erro ao processar login: {str(e)}'}), 500

@app.route('/logout')
def logout():
    """
    faz logout e limpa a sessao
    """
    nome = session.get('usuario_apelido', 'Usuário')
    session.clear()
    flash(f'Até logo, {nome}! Você saiu do sistema.', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard-admin')
def dashboardAdmin():
    """
    dashboard pros coordenadores
    """
    if 'usuario_id' not in session:
        flash('Você precisa estar logado para acessar esta página.', 'warning')
        return redirect(url_for('login'))
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        flash('Acesso negado. Área restrita para coordenadores.', 'danger')
        return redirect(url_for('dashboardColaborador'))
    
    # pega uns dados pra mostrar no dashboard
    total_colaboradores = Usuario.query.filter_by(nivel_acesso='comum').count()
    total_usuarios = Usuario.query.count()
    
    return render_template('dashboard_admin.html', 
                         usuario=usuario,
                         total_colaboradores=total_colaboradores,
                         total_usuarios=total_usuarios)

@app.route('/dashboard-colaborador')
def dashboardColaborador():
    """
    dashboard pros colaboradores normais
    """
    if 'usuario_id' not in session:
        flash('Você precisa estar logado para acessar esta página.', 'warning')
        return redirect(url_for('login'))
    
    usuario = obterUsuarioAtual()
    
    if not usuario:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('login'))
    
    return render_template('dashboard_colaborador.html', usuario=usuario)

@app.route('/perfil')
def perfil():
    """
    mostra o perfil do usuario logado
    """
    if 'usuario_id' not in session:
        flash('Você precisa estar logado para acessar esta página.', 'warning')
        return redirect(url_for('login'))
    
    usuario = obterUsuarioAtual()
    
    if not usuario:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('login'))
    
    return render_template('perfil.html', usuario=usuario)

@app.route('/trocar-senha', methods=['GET', 'POST'])
def trocarSenha():
    """
    pagina pra usuario mudar a senha dele
    """
    if 'usuario_id' not in session:
        flash('Você precisa estar logado para acessar esta página.', 'warning')
        return redirect(url_for('login'))
    
    usuario = obterUsuarioAtual()
    
    if not usuario:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        senha_atual = request.form.get('senha_atual')
        senha_nova = request.form.get('senha_nova')
        senha_confirmacao = request.form.get('senha_confirmacao')
        
        # verifica se preencheu tudo
        if not senha_atual or not senha_nova or not senha_confirmacao:
            flash('Todos os campos são obrigatórios.', 'warning')
            return render_template('trocar_senha.html', usuario=usuario)
        
        # checa se a senha atual ta certa
        from auth import verificarSenha, gerarHashSenha
        if not verificarSenha(usuario.senha, senha_atual):
            flash('Senha atual incorreta.', 'danger')
            return render_template('trocar_senha.html', usuario=usuario)
        
        # ve se as senhas novas batem
        if senha_nova != senha_confirmacao:
            flash('As senhas não coincidem.', 'danger')
            return render_template('trocar_senha.html', usuario=usuario)
        
        # senha tem que ter pelo menos 6 caracteres
        if len(senha_nova) < 6:
            flash('A nova senha deve ter pelo menos 6 caracteres.', 'warning')
            return render_template('trocar_senha.html', usuario=usuario)
        
        # atualiza senha no banco
        try:
            usuario.senha = gerarHashSenha(senha_nova)
            db.session.commit()
            flash('Senha alterada com sucesso!', 'success')
            return redirect(url_for('perfil'))
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao alterar senha: {str(e)}', 'danger')
    
    return render_template('trocar_senha.html', usuario=usuario)

@app.route('/verificar-sessao')
def verificarSessao():
    """
    endpoint pra checar se ta logado (pro JavaScript usar)
    """
    if 'usuario_id' in session:
        usuario = obterUsuarioAtual()
        if usuario:
            return jsonify({
                'logado': True,
                'usuario': {
                    'id': usuario.id,
                    'nome': usuario.nome,
                    'apelido': usuario.apelido,
                    'email': usuario.email,
                    'nivel_acesso': usuario.nivel_acesso,
                    'foto': usuario.foto
                }
            }), 200
    
    return jsonify({'logado': False}), 200

@app.route('/api/recuperar-senha', methods=['POST'])
def apiRecuperarSenha():
    """
    recupera senha usando email e CPF
    """
    import re
    
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400
        
        email = dados.get('email', '').strip()
        cpf = dados.get('cpf', '').replace('-', '').replace('.', '')
        
        # ve se preencheu os dois campos
        if not email or not cpf:
            return jsonify({'error': 'E-mail e CPF são obrigatórios'}), 400
        
        # limpa o CPF
        cpf_limpo = re.sub(r'\D', '', cpf)
        if len(cpf_limpo) != 11:
            return jsonify({'error': 'CPF inválido'}), 400
        
        # procura o usuario com esse email e cpf
        usuario = Usuario.query.filter_by(email=email, cpf=cpf_limpo).first()
        
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado com estes dados'}), 404
        
        # reseta pra senha padrao (cpf)
        nova_senha = cpf_limpo
        usuario.senha = gerarHashSenha(nova_senha)
        
        try:
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'Senha resetada com sucesso! Sua nova senha é: {nova_senha}. Faça login e altere sua senha.',
                'senha_temporaria': nova_senha
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Erro ao resetar senha: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro ao processar recuperação: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        # tenta conectar no banco pra ver se ta tudo ok
        try:
            total_usuarios = Usuario.query.count()
            print(f'Conectado ao banco de dados. Total de usuarios: {total_usuarios}')
        except Exception as e:
            print(f'Erro ao conectar ao banco de dados: {e}')
            print('Execute primeiro o sistema de cadastro para criar o banco.')
    
    print('\n' + '='*60)
    print('SERVIDOR DE LOGIN - ESCALAR')
    print('='*60)
    print('URL: http://127.0.0.1:5001')
    print('Pagina de Login: http://127.0.0.1:5001/login')
    print('\nCredenciais padrao:')
    print('   Admin: admin@escalar.com / admin123')
    print('   Colaboradores: [email] / [CPF]')
    print('='*60 + '\n')
    
    app.run(debug=True, host='0.0.0.0', port=5001)
