

from flask import Blueprint, request, jsonify, session
from models import db, Atestado, Usuario, Escala, Notificacao
from auth import verificarAdmin
from datetime import datetime, timedelta

api_atestados = Blueprint('api_atestados', __name__)

def validar_data(data_str):
    
    try:
        datetime.strptime(data_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def criar_notificacao(usuario_id, mensagem, tipo='info'):
    
    try:
        notificacao = Notificacao(
            usuario_id=usuario_id,
            mensagem=mensagem,
            lida=False
        )
        db.session.add(notificacao)
        db.session.commit()
        return True
    except Exception as e:
        print(f"Erro ao criar notificação: {str(e)}")
        return False

def calcular_dias_periodo(data_inicio, data_fim):
    
    delta = data_fim - data_inicio
    return delta.days + 1  

@api_atestados.route('/atestados', methods=['GET'])
def listar_atestados():
    
    try:
        query = Atestado.query

        usuario_id = request.args.get('usuario_id')
        if usuario_id:
            query = query.filter_by(usuario_id=int(usuario_id))

        status = request.args.get('status')
        if status and status in ['pendente', 'aceito', 'negado']:
            query = query.filter_by(status=status)

        data_inicio = request.args.get('data_inicio')
        if data_inicio and validar_data(data_inicio):
            query = query.filter(Atestado.data_fim >= datetime.strptime(data_inicio, '%Y-%m-%d'))
        
        data_fim = request.args.get('data_fim')
        if data_fim and validar_data(data_fim):
            query = query.filter(Atestado.data_inicio <= datetime.strptime(data_fim, '%Y-%m-%d'))

        ano = request.args.get('ano')
        if ano:
            query = query.filter(db.extract('year', Atestado.data_inicio) == int(ano))

        mes = request.args.get('mes')
        if mes:
            query = query.filter(db.extract('month', Atestado.data_inicio) == int(mes))
        
        atestados = query.order_by(Atestado.data_envio.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [a.to_dict() for a in atestados],
            'total': len(atestados)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar atestados: {str(e)}'
        }), 500

@api_atestados.route('/atestados/<int:id>', methods=['GET'])
def buscar_atestado(id):
    
    try:
        atestado = Atestado.query.get(id)
        
        if not atestado:
            return jsonify({
                'success': False,
                'error': 'Atestado não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': atestado.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar atestado: {str(e)}'
        }), 500

@api_atestados.route('/atestados/pendentes', methods=['GET'])
def listar_atestados_pendentes():
    
    try:
        atestados = Atestado.query.filter_by(status='pendente').order_by(Atestado.data_envio.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [a.to_dict() for a in atestados],
            'total': len(atestados)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar atestados pendentes: {str(e)}'
        }), 500

@api_atestados.route('/atestados/usuario/<int:usuario_id>', methods=['GET'])
def listar_atestados_usuario(usuario_id):
    
    try:
        atestados = Atestado.query.filter_by(usuario_id=usuario_id).order_by(Atestado.data_inicio.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [a.to_dict() for a in atestados],
            'total': len(atestados)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar atestados do usuário: {str(e)}'
        }), 500

@api_atestados.route('/atestados', methods=['POST'])
def criar_atestado():
    
    try:
        data = request.get_json()

        campos_obrigatorios = ['usuario_id', 'data_inicio', 'data_fim', 'motivo']
        for campo in campos_obrigatorios:
            if campo not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório ausente: {campo}'
                }), 400

        if not validar_data(data['data_inicio']) or not validar_data(data['data_fim']):
            return jsonify({
                'success': False,
                'error': 'Data inválida. Use formato YYYY-MM-DD'
            }), 400
        
        data_inicio = datetime.strptime(data['data_inicio'], '%Y-%m-%d')
        data_fim = datetime.strptime(data['data_fim'], '%Y-%m-%d')

        if data_inicio > data_fim:
            return jsonify({
                'success': False,
                'error': 'Data de início não pode ser posterior à data de fim'
            }), 400

        dias_atestado = calcular_dias_periodo(data_inicio, data_fim)

        if dias_atestado > 15:
            return jsonify({
                'success': False,
                'error': 'Atestados com mais de 15 dias requerem documentação adicional. Entre em contato com a coordenação.'
            }), 400

        usuario = Usuario.query.get(data['usuario_id'])
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404

        hoje = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        dias_retroativo = (hoje - data_inicio).days
        if dias_retroativo > 3:
            return jsonify({
                'success': False,
                'error': 'Atestados com mais de 3 dias retroativos devem ser enviados diretamente à coordenação'
            }), 400

        novo_atestado = Atestado(
            usuario_id=data['usuario_id'],
            data_inicio=data_inicio,
            data_fim=data_fim,
            motivo=data['motivo'],
            status='pendente'
        )
        
        db.session.add(novo_atestado)
        db.session.commit()

        coordenadores = Usuario.query.filter_by(cargo='coordenador').all()
        for coordenador in coordenadores:
            criar_notificacao(
                usuario_id=coordenador.id,
                mensagem=f'{usuario.nome} enviou atestado médico de {data_inicio.strftime("%d/%m/%Y")} a {data_fim.strftime("%d/%m/%Y")} ({dias_atestado} dias)',
                tipo='atestado'
            )
        
        return jsonify({
            'success': True,
            'message': 'Atestado enviado com sucesso',
            'data': novo_atestado.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar atestado: {str(e)}'
        }), 500

@api_atestados.route('/atestados/<int:id>/aceitar', methods=['PUT'])
@verificarAdmin
def aceitar_atestado(id):
    
    try:
        atestado = Atestado.query.get(id)
        
        if not atestado:
            return jsonify({
                'success': False,
                'error': 'Atestado não encontrado'
            }), 404
        
        if atestado.status != 'pendente':
            return jsonify({
                'success': False,
                'error': f'Atestado já foi {atestado.status}'
            }), 400

        atestado.status = 'aceito'
        atestado.data_resposta = datetime.now()

        data_atual = atestado.data_inicio
        while data_atual <= atestado.data_fim:
            
            escala = Escala.query.filter_by(
                usuario_id=atestado.usuario_id,
                data=data_atual
            ).first()
            
            if escala:
                
                escala.tipo = 'atestado'
            else:
                
                nova_escala = Escala(
                    usuario_id=atestado.usuario_id,
                    data=data_atual,
                    tipo='atestado'
                )
                db.session.add(nova_escala)
            
            data_atual += timedelta(days=1)
        
        db.session.commit()

        criar_notificacao(
            usuario_id=atestado.usuario_id,
            mensagem=f'Seu atestado médico de {atestado.data_inicio.strftime("%d/%m/%Y")} a {atestado.data_fim.strftime("%d/%m/%Y")} foi aceito',
            tipo='sucesso'
        )
        
        return jsonify({
            'success': True,
            'message': 'Atestado aceito com sucesso',
            'data': atestado.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao aceitar atestado: {str(e)}'
        }), 500

@api_atestados.route('/atestados/<int:id>/negar', methods=['PUT'])
@verificarAdmin
def negar_atestado(id):
    try:
        atestado = Atestado.query.get(id)
        
        if not atestado:
            return jsonify({
                'success': False,
                'error': 'Atestado não encontrado'
            }), 404
        
        if atestado.status != 'pendente':
            return jsonify({
                'success': False,
                'error': f'Atestado já foi {atestado.status}'
            }), 400

        atestado.status = 'negado'
        atestado.data_resposta = datetime.now()

        data = request.get_json()
        motivo_negacao = data.get('motivo_negacao', 'Não especificado') if data else 'Não especificado'
        
        db.session.commit()

        criar_notificacao(
            usuario_id=atestado.usuario_id,
            mensagem=f'Seu atestado médico de {atestado.data_inicio.strftime("%d/%m/%Y")} a {atestado.data_fim.strftime("%d/%m/%Y")} foi negado. Motivo: {motivo_negacao}',
            tipo='aviso'
        )
        
        return jsonify({
            'success': True,
            'message': 'Atestado negado',
            'data': atestado.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao negar atestado: {str(e)}'
        }), 500

@api_atestados.route('/atestados/<int:id>', methods=['DELETE'])
def remover_atestado(id):
    
    try:
        atestado = Atestado.query.get(id)
        
        if not atestado:
            return jsonify({
                'success': False,
                'error': 'Atestado não encontrado'
            }), 404

        usuario_id = session.get('usuario_id')
        usuario_cargo = session.get('usuario_cargo')
        
        if usuario_cargo != 'coordenador' and atestado.usuario_id != usuario_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para remover este atestado'
            }), 403

        if usuario_cargo != 'coordenador' and atestado.status != 'pendente':
            return jsonify({
                'success': False,
                'error': 'Apenas atestados pendentes podem ser removidos'
            }), 400

        if atestado.status == 'aceito':
            data_atual = atestado.data_inicio
            while data_atual <= atestado.data_fim:
                escala = Escala.query.filter_by(
                    usuario_id=atestado.usuario_id,
                    data=data_atual,
                    tipo='atestado'
                ).first()
                
                if escala:
                    db.session.delete(escala)
                
                data_atual += timedelta(days=1)
        
        db.session.delete(atestado)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Atestado removido com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao remover atestado: {str(e)}'
        }), 500

@api_atestados.route('/atestados/estatisticas/<int:usuario_id>', methods=['GET'])
def estatisticas_atestados(usuario_id):
    
    try:
        ano_atual = datetime.now().year

        atestados_ano = Atestado.query.filter(
            Atestado.usuario_id == usuario_id,
            db.extract('year', Atestado.data_inicio) == ano_atual
        ).all()

        total_atestados = len(atestados_ano)
        aceitos = [a for a in atestados_ano if a.status == 'aceito']
        pendentes = [a for a in atestados_ano if a.status == 'pendente']
        negados = [a for a in atestados_ano if a.status == 'negado']
        
        total_dias_afastado = sum(a.dias for a in aceitos)

        ultimos_atestados = Atestado.query.filter_by(
            usuario_id=usuario_id
        ).order_by(Atestado.data_envio.desc()).limit(5).all()
        
        return jsonify({
            'success': True,
            'data': {
                'ano': ano_atual,
                'total_atestados': total_atestados,
                'total_dias_afastado': total_dias_afastado,
                'por_status': {
                    'aceitos': len(aceitos),
                    'pendentes': len(pendentes),
                    'negados': len(negados)
                },
                'ultimos_atestados': [a.to_dict() for a in ultimos_atestados]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar estatísticas: {str(e)}'
        }), 500
