

import os
import re
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_cors import CORS
from models import db, Usuario
from auth import gerarHashSenha, autenticarUsuario, verificarAdmin, obterUsuarioAtual
from validations import validarCadastroCompleto, ESCALAS_VALIDAS, TURNOS_VALIDOS, LOCAIS_VALIDOS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chave-secreta-para-desenvolvimento'

DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASS', 'escalar123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'escalar')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000", "http://127.0.0.1:8000", "file://", "*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

db.init_app(app)

from api_escalas import api_escalas
from api_trocas import api_trocas
from api_ferias import api_ferias
from api_atestados import api_atestados
from api_notificacoes import api_notificacoes
from api_historico import api_historico

app.register_blueprint(api_escalas, url_prefix='/api')
app.register_blueprint(api_trocas, url_prefix='/api')
app.register_blueprint(api_ferias, url_prefix='/api')
app.register_blueprint(api_atestados, url_prefix='/api')
app.register_blueprint(api_notificacoes, url_prefix='/api')
app.register_blueprint(api_historico, url_prefix='/api')

print(" Todos os blueprints de API registrados:")
print("   - /api/escalas")
print("   - /api/trocas")
print("   - /api/ferias")
print("   - /api/atestados")
print("   - /api/notificacoes")
print("   - /api/historico")

@app.route('/')
def index():
    
    from datetime import datetime
    return render_template('index.html', now=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')
        
        usuario = autenticarUsuario(email, senha)
        
        if usuario:
            session['usuario_id'] = usuario.id
            session['usuario_nome'] = usuario.nome
            session['usuario_cargo'] = usuario.cargo
            flash(f'Bem-vindo, {usuario.nome}!', 'success')
            return redirect(url_for('index'))
        else:
            flash('E-mail ou senha incorretos.', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    
    session.clear()
    flash('Você saiu do sistema.', 'info')
    return redirect(url_for('login'))

@app.route('/cadastrar-colaborador', methods=['GET', 'POST'])
@verificarAdmin
def cadastrarColaborador():
    
    if request.method == 'POST':
        
        dados = {
            'nome': request.form.get('nome'),
            'apelido': request.form.get('apelido'),
            'data_nascimento': request.form.get('data_nascimento'),
            'email': request.form.get('email'),
            'cpf': request.form.get('cpf'),
            'turno': request.form.get('turno', 'diurno'),
            'escala': request.form.get('escala', '12x36'),
            'local': request.form.get('local', 'Campus'),
            'foto': request.form.get('foto', 'default.jpg')
        }

        if not dados['nome'] or not dados['email'] or not dados['cpf']:
            flash('Nome, email e CPF são obrigatórios.', 'danger')
            return render_template('cadastrar_colaborador.html', dados=dados)

        cpf_limpo = re.sub(r'\D', '', dados['cpf'])

        if len(cpf_limpo) != 11:
            flash('CPF deve ter 11 dígitos.', 'danger')
            return render_template('cadastrar_colaborador.html', dados=dados)

        if Usuario.query.filter_by(email=dados['email']).first():
            flash('E-mail já cadastrado.', 'danger')
            return render_template('cadastrar_colaborador.html', dados=dados)

        if Usuario.query.filter_by(cpf=cpf_limpo).first():
            flash('CPF já cadastrado.', 'danger')
            return render_template('cadastrar_colaborador.html', dados=dados)

        senha_padrao = cpf_limpo
        senha_hash = gerarHashSenha(senha_padrao)

        data_nasc = None
        if dados['data_nascimento']:
            try:
                data_nasc = datetime.strptime(dados['data_nascimento'], '%Y-%m-%d').date()
            except:
                pass

        novo_usuario = Usuario(
            nome=dados['nome'],
            apelido=dados['apelido'] or dados['nome'].split()[0],
            data_nascimento=data_nasc,
            email=dados['email'],
            foto=dados['foto'],
            cpf=cpf_limpo,
            turno=dados['turno'],
            escala=dados['escala'],
            local=dados['local'],
            cargo='colaborador',
            status='ativo',
            senha=senha_hash
        )
        
        try:
            db.session.add(novo_usuario)
            db.session.commit()
            flash(f'Colaborador {dados["nome"]} cadastrado com sucesso! Senha padrão: {senha_padrao}', 'success')
            return redirect(url_for('quadroColaboradores'))
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao cadastrar colaborador: {str(e)}', 'danger')
    
    return render_template('cadastrar_colaborador.html',
                           escalas=ESCALAS_VALIDAS,
                           turnos=TURNOS_VALIDOS,
                           locais=LOCAIS_VALIDOS)

@app.route('/api/cadastrar-colaborador', methods=['POST'])
def apiCadastrarColaborador():
    
    try:
        
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400

        nome = dados.get('nome', '').strip()
        email = dados.get('email', '').strip()
        cpf = dados.get('cpf', '').strip()
        apelido = dados.get('apelido', '').strip() or nome.split()[0] if nome else ''
        data_nascimento = dados.get('data_nascimento', '').strip()
        turno = dados.get('turno', 'diurno')
        escala = dados.get('escala', '12x36')
        local = dados.get('local', 'Campus')
        foto = dados.get('foto', 'default.jpg')
        
        if not nome or not email or not cpf:
            return jsonify({'error': 'Nome, email e CPF são obrigatórios'}), 400

        cpf_limpo = re.sub(r'\D', '', cpf)

        if len(cpf_limpo) != 11:
            return jsonify({'error': 'CPF deve ter 11 dígitos'}), 400

        if Usuario.query.filter_by(email=email).first():
            return jsonify({'error': 'E-mail já cadastrado'}), 400

        if Usuario.query.filter_by(cpf=cpf_limpo).first():
            return jsonify({'error': 'CPF já cadastrado'}), 400

        senha_padrao = cpf_limpo
        senha_hash = gerarHashSenha(senha_padrao)

        data_nasc = None
        if data_nascimento:
            try:
                data_nasc = datetime.strptime(data_nascimento, '%Y-%m-%d').date()
            except:
                pass

        novo_usuario = Usuario(
            nome=nome,
            apelido=apelido,
            data_nascimento=data_nasc,
            email=email,
            foto=foto,
            cpf=cpf_limpo,
            turno=turno,
            escala=escala,
            local=local,
            cargo='colaborador',
            status='ativo',
            senha=senha_hash
        )
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Colaborador cadastrado com sucesso!',
            'id': novo_usuario.id,
            'nome': novo_usuario.nome,
            'apelido': novo_usuario.apelido,
            'email': novo_usuario.email,
            'senha_padrao': senha_padrao
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao cadastrar colaborador: {str(e)}'}), 500

@app.route('/quadro-colaboradores')
@verificarAdmin
def quadroColaboradores():
    
    colaboradores = Usuario.query.all()
    return render_template('quadro_colaboradores.html', colaboradores=colaboradores)

def criarUsuarioAdmin():

    coordenador = Usuario.query.filter_by(cargo='coordenador').first()
    if coordenador:
        print(f'Coordenador já existe no banco: {coordenador.email}')
        return

    print('AVISO: Nenhum coordenador encontrado no MySQL. Criando usuário padrão...')
    cpf_admin = '00000000000'
    admin = Usuario(
        nome='Coordenador Padrão',
        email='coordenador@escalar.com',
        cpf=cpf_admin,
        cargo='coordenador',
        status='ativo',
        senha=gerarHashSenha(cpf_admin)
    )
    db.session.add(admin)
    db.session.commit()
    print(f'Coordenador padrão criado: coordenador@escalar.com / senha: {cpf_admin}')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        criarUsuarioAdmin()
    app.run(debug=True, host='0.0.0.0', port=5000)