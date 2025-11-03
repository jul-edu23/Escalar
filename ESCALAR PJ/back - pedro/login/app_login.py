"""
Sistema de Login - Escalar
Servidor Flask pra autenticacao de usuarios do sistema
"""

import os
import sys
from flask import Flask, request, redirect, session, jsonify, send_from_directory
from flask_cors import CORS

# precisa adicionar o path do cadastro aqui pra importar models e auth
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'cadastro'))

from models import db, Usuario
from auth import autenticarUsuario, obterUsuarioAtual, gerarHashSenha

# caminho pro frontend
FRONTEND_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'front - julia - geizi - sara'))

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
@app.route('/login')
@app.route('/login.html')
def login():
    """
    Serve a pagina de login do frontend original
    """
    return send_from_directory(FRONTEND_PATH, 'login.html')

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
            
            # define o redirect baseado no nivel de acesso
            if usuario.nivel_acesso == 'administrador':
                redirect_url = '/calendario-admin'
            else:
                redirect_url = '/calendario-colaborador'
            
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
                'redirect': redirect_url
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
    session.clear()
    return redirect('/login')

@app.route('/calendario-admin')
def calendarioAdmin():
    """
    Serve o calendario do coordenador da pasta frontend original
    """
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
    """
    Serve o calendario do colaborador da pasta frontend original
    """
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
    """
    Serve arquivos CSS, JS e imagens da pasta assets do frontend
    """
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'assets'),
        filename
    )

# ==================== ROTAS PARA ARQUIVOS LOCAIS DAS PÁGINAS ====================

@app.route('/ccalendario.css')
def ccalendarioCss():
    """
    Serve o CSS local do calendario do coordenador
    """
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'ccalendario.css'
    )

@app.route('/ccalendario.js')
def ccalendarioJs():
    """
    Serve o JS local do calendario do coordenador
    """
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'ccalendario.js'
    )

@app.route('/calendarioAdm.html')
def calendarioAdmHtml():
    """
    Redirect de calendarioAdm.html para a rota correta
    """
    return redirect('/calendario-admin')

@app.route('/quadroColaboradores.htm')
def quadroColaboradoresHtm():
    """
    Redirect de quadroColaboradores.htm para a rota correta
    """
    return redirect('/quadro-colaboradores')

@app.route('/solicitacoes.html')
def solicitacoesHtml():
    """
    Redirect de solicitacoes.html para a rota correta
    """
    return redirect('/solicitacoes')

@app.route('/cadastrarColaborador.html')
def cadastrarColaboradorHtml():
    """
    Redirect de cadastrarColaborador.html para a rota correta
    """
    return redirect('/cadastrar-colaborador')

@app.route('/historico.html/trocas.html')
@app.route('/historico/trocas.html')
@app.route('/trocas.html')
def trocasHtml():
    """
    Redirect para historico de trocas
    """
    return redirect('/historico/trocas')

@app.route('/historico.html/ferias.html')
@app.route('/historico/ferias.html')
@app.route('/ferias.html')
def feriasHtml():
    """
    Redirect para historico de ferias
    """
    return redirect('/historico/ferias')

@app.route('/historico.html/Atestados.html')
@app.route('/historico/Atestados.html')
@app.route('/Atestados.html')
def atestadosHtml():
    """
    Redirect para historico de atestados
    """
    return redirect('/historico/atestados')

@app.route('/calendario.css')
def calendarioCss():
    """
    Serve o CSS local do calendario do colaborador
    """
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'calendario.css'
    )

@app.route('/calendario.js')
def calendarioJs():
    """
    Serve o JS local do calendario do colaborador
    """
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'calendario.js'
    )

# ==================== REDIRECTS PARA PÁGINAS DO COLABORADOR ====================

@app.route('/calendario.html')
def calendarioHtml():
    """
    Redirect de calendario.html para a rota correta
    """
    return redirect('/calendario-colaborador')

@app.route('/trocasDisponiveis.html')
def trocasDisponiveisHtml():
    """
    Redirect de trocasDisponiveis.html para a rota correta
    """
    return redirect('/trocas-disponiveis')

@app.route('/solicitarTroca.html')
def solicitarTrocaHtml():
    """
    Redirect de solicitarTroca.html para a rota correta
    """
    return redirect('/solicitar-troca')

@app.route('/cadastrarFerias.html')
def cadastrarFeriasHtml():
    """
    Redirect de cadastrarFerias.html para a rota correta
    """
    return redirect('/cadastrar-ferias')

@app.route('/cadastrarAtestado.html')
def cadastrarAtestadoHtml():
    """
    Redirect de cadastrarAtestado.html para a rota correta
    """
    return redirect('/cadastrar-atestado')

@app.route('/minhasSolicitacoes.html')
def minhasSolicitacoesHtml():
    """
    Redirect de minhasSolicitacoes.html para a rota correta
    """
    return redirect('/minhas-solicitacoes')

# ==================== ROTAS DO COORDENADOR ====================

@app.route('/cadastrar-colaborador')
def cadastrarColaborador():
    """
    Serve a pagina de cadastro de colaboradores (apenas admin)
    """
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
    """
    Serve a pagina com quadro de colaboradores (apenas admin)
    """
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        return redirect('/calendario-colaborador')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userCoordenador'),
        'quadroColaboradores.htm'
    )

@app.route('/solicitacoes')
def solicitacoes():
    """
    Serve a pagina de solicitacoes (apenas admin)
    """
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
    """
    Serve as paginas de historico (atestados, ferias, trocas)
    """
    if 'usuario_id' not in session:
        return redirect('/login')
    
    usuario = obterUsuarioAtual()
    
    if not usuario or usuario.nivel_acesso != 'administrador':
        return redirect('/calendario-colaborador')
    
    # Mapeia tipos validos
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

# ==================== ROTAS DO COLABORADOR ====================

@app.route('/minhas-solicitacoes')
def minhasSolicitacoes():
    """
    Serve a pagina de solicitacoes do colaborador
    """
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'minhasSolicitacoes.html'
    )

@app.route('/solicitar-troca')
def solicitarTroca():
    """
    Serve a pagina para solicitar troca de turno
    """
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'solicitarTroca.html'
    )

@app.route('/trocas-disponiveis')
def trocasDisponiveis():
    """
    Serve a pagina com trocas disponiveis
    """
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'trocasDisponiveis.html'
    )

@app.route('/cadastrar-atestado')
def cadastrarAtestado():
    """
    Serve a pagina para cadastrar atestado
    """
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'cadastrarAtestado.html'
    )

@app.route('/cadastrar-ferias')
def cadastrarFerias():
    """
    Serve a pagina para cadastrar ferias
    """
    if 'usuario_id' not in session:
        return redirect('/login')
    
    return send_from_directory(
        os.path.join(FRONTEND_PATH, 'userColaborador'),
        'cadastrarFerias.html'
    )

# ==================== FIM DAS ROTAS DE PÁGINAS ====================

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

@app.route('/recuperar-senha')
@app.route('/recuperarSenha.html')
def recuperarSenha():
    """
    Serve a pagina de recuperacao de senha
    """
    return send_from_directory(FRONTEND_PATH, 'recuperarSenha.html')

@app.route('/api/recuperar-senha', methods=['POST'])
def apiRecuperarSenha():
    """
    API para recuperar senha usando email e CPF
    """
    import re
    
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400
        
        email = dados.get('email', '').strip()
        cpf = dados.get('cpf', '').replace('-', '').replace('.', '')
        
        # Validacao basica
        if not email or not cpf:
            return jsonify({'error': 'E-mail e CPF são obrigatórios'}), 400
        
        # Limpa o CPF
        cpf_limpo = re.sub(r'\D', '', cpf)
        if len(cpf_limpo) != 11:
            return jsonify({'error': 'CPF inválido. Digite 11 dígitos.'}), 400
        
        # Procura o usuario com esse email e cpf
        usuario = Usuario.query.filter_by(email=email, cpf=cpf_limpo).first()
        
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado com estes dados. Verifique email e CPF.'}), 404
        
        # Reseta para senha padrao (CPF)
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
    print('   Admin: admin@escalar.com / 00000000000 (CPF)')
    print('   Colaboradores: [email] / [CPF]')
    print('   IMPORTANTE: Senha padrao sempre = CPF do usuario')
    print('='*60 + '\n')
    
    app.run(debug=True, host='0.0.0.0', port=5001)
