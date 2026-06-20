

import os
import sys
from flask import Flask, request, redirect, session, jsonify, send_from_directory
from flask_cors import CORS

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'cadastro'))

from models import db, Usuario
from auth import autenticarUsuario, obterUsuarioAtual, gerarHashSenha

# Importar Blueprints de API (depois de ajustar sys.path)
from api_escalas import api_escalas
from api_trocas import api_trocas
from api_ferias import api_ferias
from api_atestados import api_atestados
from api_notificacoes import api_notificacoes
from api_historico import api_historico

FRONTEND_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'front - julia - geizi - sara'))

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
    r"/*": {
        "origins": ["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:5001", "http://127.0.0.1:5001", "file://", "*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

db.init_app(app)

# Registrar Blueprints de API
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

print("✅ Todos os blueprints de API registrados no servidor 5001:")
print("   - /api/escalas")
print("   - /api/trocas")
print("   - /api/ferias")
print("   - /api/atestados")
print("   - /api/notificacoes")
print("   - /api/historico")

@app.route('/')
@app.route('/login')
@app.route('/login.html')
def login():
    
    return send_from_directory(FRONTEND_PATH, 'login.html')

@app.route('/api/login', methods=['POST'])
def apiLogin():
    
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400
        
        email = dados.get('email', '').strip()
        senha = dados.get('senha', '')

        if not email or not senha:
            return jsonify({'error': 'E-mail e senha são obrigatórios'}), 400

        usuario = autenticarUsuario(email, senha)
        
        if usuario:
            
            session['usuario_id'] = usuario.id
            session['usuario_nome'] = usuario.nome
            session['usuario_apelido'] = usuario.apelido
            session['usuario_email'] = usuario.email
            session['usuario_cargo'] = usuario.nivel_acesso
            session['usuario_foto'] = usuario.foto

            if usuario.nivel_acesso == 'administrador':
                redirect_url = '/calendario-admin'
            else:
                redirect_url = '/calendario-colaborador'
            
            return jsonify({
                'success': True,
                'message': f'Bem-vindo, {usuario.apelido or usuario.nome}!',
                'usuario_id': usuario.id,
                'usuario_nome': usuario.nome,
                'usuario_cargo': usuario.nivel_acesso,
                'usuario': {
                    'id': usuario.id,
                    'nome': usuario.nome,
                    'email': usuario.email,
                    'apelido': usuario.apelido,
                    'cargo': usuario.nivel_acesso,
                    'data_nascimento': usuario.data_nascimento.isoformat() if usuario.data_nascimento else None,
                    'turno': usuario.turno,
                    'cpf': usuario.cpf,
                    'escala': usuario.escala,
                    'local': usuario.local,
                    'foto': usuario.foto
                },
                'redirect': redirect_url
            }), 200
        else:
            return jsonify({'error': 'E-mail ou senha incorretos'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Erro ao processar login: {str(e)}'}), 500

@app.route('/logout')
def logout():
    
    session.clear()
    return redirect('/login')

@app.route('/calendario-admin')
def calendarioAdmin():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        return redirect('/calendario-colaborador')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'calendarioAdm.html'
    )

@app.route('/calendario-colaborador')
def calendarioColaborador():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'calendario.html'
    )

@app.route('/assets/<path:filename>')
def serveAssets(filename):
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'assets'),
        filename
    )

@app.route('/ccalendario.css')
def ccalendarioCss():
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'ccalendario.css'
    )

@app.route('/ccalendario.js')
def ccalendarioJs():
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'ccalendario.js'
    )

@app.route('/calendarioAdm.html')
def calendarioAdmHtml():
    
    return redirect('/calendario-admin')

@app.route('/quadroColaboradores.htm')
def quadroColaboradoresHtm():
    
    return redirect('/quadro-colaboradores')

@app.route('/quadroColaboradores.html')
def quadroColaboradoresHtml():
    
    return redirect('/quadro-colaboradores')

@app.route('/solicitacoes.html')
def solicitacoesHtml():
    
    return redirect('/solicitacoes')

@app.route('/cadastrarColaborador.html')
def cadastrarColaboradorHtml():
    
    return redirect('/cadastrar-colaborador')

@app.route('/historico.html/trocas.html')
@app.route('/historico/trocas.html')
@app.route('/trocas.html')
def trocasHtml():
    
    return redirect('/historico/trocas')

@app.route('/historico.html/ferias.html')
@app.route('/historico/ferias.html')
@app.route('/ferias.html')
def feriasHtml():
    
    return redirect('/historico/ferias')

@app.route('/historico.html/Atestados.html')
@app.route('/historico/Atestados.html')
@app.route('/Atestados.html')
def atestadosHtml():
    
    return redirect('/historico/atestados')

@app.route('/calendario.css')
def calendarioCss():
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'calendario.css'
    )

@app.route('/calendario.js')
def calendarioJs():
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'calendario.js'
    )

@app.route('/calendario.html')
def calendarioHtml():
    
    return redirect('/calendario-colaborador')

@app.route('/trocasDisponiveis.html')
def trocasDisponiveisHtml():
    
    return redirect('/trocas-disponiveis')

@app.route('/solicitarTroca.html')
def solicitarTrocaHtml():
    
    return redirect('/solicitar-troca')

@app.route('/cadastrarFerias.html')
def cadastrarFeriasHtml():
    
    return redirect('/cadastrar-ferias')

@app.route('/cadastrarAtestado.html')
def cadastrarAtestadoHtml():
    
    return redirect('/cadastrar-atestado')

@app.route('/minhasSolicitacoes.html')
def minhasSolicitacoesHtml():
    
    return redirect('/minhas-solicitacoes')

@app.route('/cadastrar-colaborador')
def cadastrarColaborador():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        return redirect('/calendario-colaborador')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'cadastrarColaborador.html'
    )

@app.route('/quadro-colaboradores')
def quadroColaboradores():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        return redirect('/calendario-colaborador')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'quadroColaboradores.html'
    )

@app.route('/solicitacoes')
def solicitacoes():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        return redirect('/calendario-colaborador')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'solicitacoes.html'
    )

@app.route('/historico/<tipo>')
def historico(tipo):
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        return redirect('/calendario-colaborador')

    arquivos_validos = {
        'atestados': 'Atestados.html',
        'ferias': 'ferias.html',
        'trocas': 'trocas.html'
    }
    
    if tipo not in arquivos_validos:
        return redirect('/calendario-admin')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador', 'historico.html'),
        arquivos_validos[tipo]
    )

@app.route('/minhas-solicitacoes')
def minhasSolicitacoes():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'minhasSolicitacoes.html'
    )

@app.route('/solicitar-troca')
def solicitarTroca():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'solicitarTroca.html'
    )

@app.route('/trocas-disponiveis')
def trocasDisponiveis():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'trocasDisponiveis.html'
    )

@app.route('/cadastrar-atestado')
def cadastrarAtestado():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'cadastrarAtestado.html'
    )

@app.route('/cadastrar-ferias')
def cadastrarFerias():
    
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'cadastrarFerias.html'
    )

@app.route('/verificar-sessao')
def verificarSessao():
    
    if 'usuario_id' in session:
        usuario = obterUsuarioAtual()
        if usuario:
            return jsonify({
                'logado': True,
                'usuario': {
                    'nome': usuario.nome,
                    'email': usuario.email,
                    'apelido': usuario.apelido,
                    'data_nascimento': usuario.data_nascimento.isoformat() if usuario.data_nascimento else None,
                    'turno': usuario.turno,
                    'cpf': usuario.cpf,
                    'escala': usuario.escala,
                    'local': usuario.local,
                    'foto': usuario.foto
                }
            }), 200
    
    return jsonify({'logado': False}), 200

@app.route('/recuperar-senha')
@app.route('/recuperarSenha.html')
def recuperarSenha():
    
    return send_from_directory(FRONTEND_PATH, 'recuperarSenha.html')

@app.route('/api/recuperar-senha', methods=['POST'])
def apiRecuperarSenha():
    
    import re
    
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400
        
        email = dados.get('email', '').strip()
        cpf = dados.get('cpf', '').replace('-', '').replace('.', '')

        if not email or not cpf:
            return jsonify({'error': 'E-mail e CPF são obrigatórios'}), 400

        cpf_limpo = re.sub(r'\D', '', cpf)
        if len(cpf_limpo) != 11:
            return jsonify({'error': 'CPF inválido. Digite 11 dígitos.'}), 400

        usuario = Usuario.query.filter_by(email=email, cpf=cpf_limpo).first()
        
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado com estes dados. Verifique email e CPF.'}), 404

        nova_senha = cpf_limpo
        usuario.senha = gerarHashSenha(nova_senha)
        
        try:
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'Senha resetada com sucesso! Use seu CPF ({cpf_limpo}) como nova senha no login.'
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Erro ao resetar senha: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro ao processar recuperação: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        
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
    print('\nCredenciais padrao (MySQL):')
    print('   Coordenadora: lais@exemplo.com / senha padrão')
    print('   Colaboradores: carlos/julia/pedro @exemplo.com / senha padrão')
    print('   IMPORTANTE: Senha padrao = CPF do usuario (sem formatação)')
    print('='*60 + '\n')
    
    app.run(debug=True, host='0.0.0.0', port=5001)
