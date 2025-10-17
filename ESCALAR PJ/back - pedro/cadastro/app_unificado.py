"""
Servidor unificado - Flask servindo API e arquivos estaticos.
Solucao para redes que bloqueiam multiplas portas.
"""

import os
import re
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Usuario
from auth import gerarHashSenha, autenticarUsuario, verificarAdmin, obterUsuarioAtual
from validations import validarCadastroCompleto, ESCALAS_VALIDAS, TURNOS_VALIDOS, LOCAIS_VALIDOS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chave-secreta-para-desenvolvimento'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///escalar.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS mais permissivo
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

# Inicializa o banco de dados
db.init_app(app)

# Caminho para os arquivos do frontend
FRONTEND_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'front - julia - geizi', 'userCoordenador')

@app.route('/')
def index():
    """
    Pagina inicial, redireciona para cadastro
    """
    return redirect('/cadastro')

@app.route('/cadastro')
def pagina_cadastro():
    """
    Serve a pagina HTML de cadastro
    """
    return send_from_directory(FRONTEND_PATH, 'cadastrarColaborador.html')

@app.route('/teste-conexao')
def pagina_teste():
    """
    Serve a pagina HTML de teste
    """
    return send_from_directory(FRONTEND_PATH, 'teste_conexao.html')

@app.route('/como-desativar-shields')
def pagina_shields():
    """
    Serve a pagina HTML de instrucoes Brave
    """
    return send_from_directory(FRONTEND_PATH, 'como_desativar_shields.html')

# Serve arquivos CSS
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """
    Serve arquivos CSS e outros assets
    """
    assets_path = os.path.join(os.path.dirname(FRONTEND_PATH), 'assets')
    return send_from_directory(assets_path, filename)

# Serve arquivos public
@app.route('/public/<path:filename>')
def serve_public(filename):
    """
    Serve arquivos da pasta public
    """
    public_path = os.path.join(FRONTEND_PATH, 'public')
    return send_from_directory(public_path, filename)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Pagina de login
    """
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')
        
        usuario = autenticarUsuario(email, senha)
        
        if usuario:
            session['usuario_id'] = usuario.id
            session['usuario_nome'] = usuario.nome
            session['usuario_nivel'] = usuario.nivel_acesso
            flash(f'Bem-vindo, {usuario.nome}!', 'success')
            return redirect(url_for('index'))
        else:
            flash('E-mail ou senha incorretos.', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """
    Realiza logout do usuario
    """
    session.clear()
    flash('Você saiu do sistema.', 'info')
    return redirect(url_for('login'))

@app.route('/api/cadastrar-colaborador', methods=['POST'])
def apiCadastrarColaborador():
    """
    API JSON para cadastro de colaboradores.
    Funciona na mesma porta do servidor.
    """
    try:
        # Coleta os dados do JSON
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400
        
        # Prepara dados para validação
        dados_validacao = {
            'nome': dados.get('nome', ''),
            'email': dados.get('email', ''),
            'apelido': dados.get('apelido', ''),
            'cpf': dados.get('cpf', ''),
            'data_nascimento': dados.get('data_nascimento', ''),
            'escala': dados.get('escala', ''),
            'turno': dados.get('turno', ''),
            'local': dados.get('local', '')
        }
        
        # Valida os dados
        valido, erros = validarCadastroCompleto(dados_validacao)
        
        if not valido:
            return jsonify({'errors': erros}), 400
        
        # Processa foto
        foto = dados.get('foto', 'default.jpg')
        
        # Remove caracteres nao numericos do CPF
        cpf_limpo = re.sub(r'\D', '', dados_validacao['cpf'])
        
        # Cria senha padrao (CPF)
        senha_padrao = cpf_limpo
        senha_hash = gerarHashSenha(senha_padrao)
        
        # Cria o novo usuário
        novo_usuario = Usuario(
            nome=dados_validacao['nome'],
            email=dados_validacao['email'],
            foto=foto,
            apelido=dados_validacao['apelido'],
            cpf=cpf_limpo,
            data_nascimento=datetime.strptime(dados_validacao['data_nascimento'], '%Y-%m-%d').date(),
            escala=dados_validacao['escala'],
            turno=dados_validacao['turno'],
            local=dados_validacao['local'],
            nivel_acesso='comum',
            senha=senha_hash
        )
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Colaborador cadastrado com sucesso!',
            'id': novo_usuario.id,
            'nome': novo_usuario.nome,
            'email': novo_usuario.email,
            'senha_padrao': senha_padrao
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao cadastrar colaborador: {str(e)}'}), 500

@app.route('/quadro-colaboradores')
@verificarAdmin
def quadroColaboradores():
    """
    Lista todos os colaboradores cadastrados
    """
    colaboradores = Usuario.query.all()
    return render_template('quadro_colaboradores.html', colaboradores=colaboradores)

def criarUsuarioAdmin():
    """
    Cria um usuario administrador padrao se nao existir
    """
    admin = Usuario.query.filter_by(email='admin@escalar.com').first()
    if not admin:
        admin = Usuario(
            nome='Administrador',
            email='admin@escalar.com',
            foto='default.jpg',
            apelido='Admin',
            cpf='00000000000',
            data_nascimento=datetime(1990, 1, 1).date(),
            escala='12x36',
            turno='diurno',
            local='Campus',
            nivel_acesso='administrador',
            senha=gerarHashSenha('admin123')
        )
        db.session.add(admin)
        db.session.commit()
        print('Usuario administrador criado: admin@escalar.com / admin123')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        criarUsuarioAdmin()
    
    print("\n" + "="*60)
    print("  SERVIDOR UNIFICADO - SOLUCAO PARA REDE UNIVERSITARIA")
    print("="*60)
    print("\nTudo rodando na MESMA PORTA: http://localhost:5000")
    print("\nAcesse:")
    print("   - Cadastro: http://localhost:5000/cadastro")
    print("   - Teste: http://localhost:5000/teste-conexao")
    print("\nSolucao para redes que bloqueiam multiplas portas!")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
