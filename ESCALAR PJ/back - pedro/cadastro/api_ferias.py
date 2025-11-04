

from flask import Blueprint, request, jsonify, session
from models import db, Ferias, Usuario, Escala, Notificacao
from auth import verificarAdmin
from datetime import datetime, timedelta

api_ferias = Blueprint('api_ferias', __name__)

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

def verificar_conflito_ferias(usuario_id, data_inicio, data_fim, excluir_id=None):

    if hasattr(data_inicio, 'date'):
        data_inicio = data_inicio.date()
    if hasattr(data_fim, 'date'):
        data_fim = data_fim.date()
    
    query = Ferias.query.filter(
        Ferias.usuario_id == usuario_id,
        Ferias.status.in_(['pendente', 'aprovada'])
    )

    if excluir_id:
        query = query.filter(Ferias.id != excluir_id)
    
    ferias_existentes = query.all()
    
    for ferias in ferias_existentes:
        
        if not (data_fim < ferias.data_inicio or data_inicio > ferias.data_fim):
            return True
    
    return False

@api_ferias.route('/ferias', methods=['GET'])
def listar_ferias():
    
    try:
        query = Ferias.query

        usuario_id = request.args.get('usuario_id')
        if usuario_id:
            query = query.filter_by(usuario_id=int(usuario_id))

        status = request.args.get('status')
        if status and status in ['pendente', 'aprovada', 'rejeitada']:
            query = query.filter_by(status=status)

        ano = request.args.get('ano')
        if ano:
            query = query.filter(db.extract('year', Ferias.data_inicio) == int(ano))

        mes = request.args.get('mes')
        if mes:
            query = query.filter(db.extract('month', Ferias.data_inicio) == int(mes))

        data_inicio = request.args.get('data_inicio')
        if data_inicio and validar_data(data_inicio):
            query = query.filter(Ferias.data_fim >= datetime.strptime(data_inicio, '%Y-%m-%d'))
        
        data_fim = request.args.get('data_fim')
        if data_fim and validar_data(data_fim):
            query = query.filter(Ferias.data_inicio <= datetime.strptime(data_fim, '%Y-%m-%d'))
        
        ferias = query.order_by(Ferias.data_solicitacao.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [f.to_dict() for f in ferias],
            'total': len(ferias)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar férias: {str(e)}'
        }), 500

@api_ferias.route('/ferias/<int:id>', methods=['GET'])
def buscar_ferias(id):
    
    try:
        ferias = Ferias.query.get(id)
        
        if not ferias:
            return jsonify({
                'success': False,
                'error': 'Férias não encontradas'
            }), 404
        
        return jsonify({
            'success': True,
            'data': ferias.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar férias: {str(e)}'
        }), 500

@api_ferias.route('/ferias/pendentes', methods=['GET'])
def listar_ferias_pendentes():
    
    try:
        ferias = Ferias.query.filter_by(status='pendente').order_by(Ferias.data_solicitacao.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [f.to_dict() for f in ferias],
            'total': len(ferias)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar férias pendentes: {str(e)}'
        }), 500

@api_ferias.route('/ferias/usuario/<int:usuario_id>', methods=['GET'])
def listar_ferias_usuario(usuario_id):
    
    try:
        ferias = Ferias.query.filter_by(usuario_id=usuario_id).order_by(Ferias.data_inicio.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [f.to_dict() for f in ferias],
            'total': len(ferias)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar férias do usuário: {str(e)}'
        }), 500

@api_ferias.route('/ferias', methods=['POST'])
def criar_ferias():
    
    try:
        data = request.get_json()

        campos_obrigatorios = ['usuario_id', 'data_inicio', 'data_fim']
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

        hoje = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        if data_inicio < hoje:
            return jsonify({
                'success': False,
                'error': 'Data de início não pode ser no passado'
            }), 400

        dias_ferias = calcular_dias_periodo(data_inicio, data_fim)

        if dias_ferias < 5:
            return jsonify({
                'success': False,
                'error': 'Período mínimo de férias é 5 dias'
            }), 400

        if dias_ferias > 30:
            return jsonify({
                'success': False,
                'error': 'Período máximo de férias é 30 dias'
            }), 400

        usuario = Usuario.query.get(data['usuario_id'])
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404

        if verificar_conflito_ferias(data['usuario_id'], data_inicio, data_fim):
            return jsonify({
                'success': False,
                'error': 'Já existe uma solicitação de férias aprovada ou pendente neste período'
            }), 400

        novas_ferias = Ferias(
            usuario_id=data['usuario_id'],
            data_inicio=data_inicio.date() if hasattr(data_inicio, 'date') else data_inicio,
            data_fim=data_fim.date() if hasattr(data_fim, 'date') else data_fim,
            observacao=data.get('observacao', ''),
            status='pendente'
        )
        
        db.session.add(novas_ferias)
        db.session.commit()

        coordenadores = Usuario.query.filter_by(cargo='coordenador').all()
        for coordenador in coordenadores:
            criar_notificacao(
                usuario_id=coordenador.id,
                mensagem=f'{usuario.nome} solicitou férias de {data_inicio.strftime("%d/%m/%Y")} a {data_fim.strftime("%d/%m/%Y")} ({dias_ferias} dias)',
                tipo='ferias'
            )
        
        return jsonify({
            'success': True,
            'message': 'Solicitação de férias criada com sucesso',
            'data': novas_ferias.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar férias: {str(e)}'
        }), 500

@api_ferias.route('/ferias/<int:id>/aprovar', methods=['PUT'])
@verificarAdmin
def aprovar_ferias(id):
    
    try:
        ferias = Ferias.query.get(id)
        
        if not ferias:
            return jsonify({
                'success': False,
                'error': 'Férias não encontradas'
            }), 404
        
        if ferias.status != 'pendente':
            return jsonify({
                'success': False,
                'error': f'Férias já foram {ferias.status}s'
            }), 400

        ferias.status = 'aprovada'
        ferias.data_resposta = datetime.now()

        data_atual = ferias.data_inicio
        while data_atual <= ferias.data_fim:
            
            escala = Escala.query.filter_by(
                usuario_id=ferias.usuario_id,
                data=data_atual
            ).first()
            
            if escala:
                
                escala.tipo = 'férias'
            else:
                
                nova_escala = Escala(
                    usuario_id=ferias.usuario_id,
                    data=data_atual,
                    tipo='férias'
                )
                db.session.add(nova_escala)
            
            data_atual += timedelta(days=1)
        
        db.session.commit()

        criar_notificacao(
            usuario_id=ferias.usuario_id,
            mensagem=f'Suas férias de {ferias.data_inicio.strftime("%d/%m/%Y")} a {ferias.data_fim.strftime("%d/%m/%Y")} foram aprovadas!',
            tipo='sucesso'
        )
        
        return jsonify({
            'success': True,
            'message': 'Férias aprovadas com sucesso',
            'data': ferias.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao aprovar férias: {str(e)}'
        }), 500

@api_ferias.route('/ferias/<int:id>/rejeitar', methods=['PUT'])
@verificarAdmin
def rejeitar_ferias(id):
    try:
        ferias = Ferias.query.get(id)
        
        if not ferias:
            return jsonify({
                'success': False,
                'error': 'Férias não encontradas'
            }), 404
        
        if ferias.status != 'pendente':
            return jsonify({
                'success': False,
                'error': f'Férias já foram {ferias.status}s'
            }), 400

        ferias.status = 'rejeitada'
        ferias.data_resposta = datetime.now()

        data = request.get_json()
        motivo_rejeicao = data.get('motivo_rejeicao', 'Não especificado') if data else 'Não especificado'
        
        db.session.commit()

        criar_notificacao(
            usuario_id=ferias.usuario_id,
            mensagem=f'Suas férias de {ferias.data_inicio.strftime("%d/%m/%Y")} a {ferias.data_fim.strftime("%d/%m/%Y")} foram rejeitadas. Motivo: {motivo_rejeicao}',
            tipo='aviso'
        )
        
        return jsonify({
            'success': True,
            'message': 'Férias rejeitadas',
            'data': ferias.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao rejeitar férias: {str(e)}'
        }), 500

@api_ferias.route('/ferias/<int:id>', methods=['DELETE'])
def cancelar_ferias(id):
    
    try:
        ferias = Ferias.query.get(id)
        
        if not ferias:
            return jsonify({
                'success': False,
                'error': 'Férias não encontradas'
            }), 404

        usuario_id = session.get('usuario_id')
        usuario_cargo = session.get('usuario_cargo')
        
        if usuario_cargo != 'coordenador' and ferias.usuario_id != usuario_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para cancelar estas férias'
            }), 403

        if usuario_cargo != 'coordenador' and ferias.status != 'pendente':
            return jsonify({
                'success': False,
                'error': 'Apenas férias pendentes podem ser canceladas'
            }), 400

        if ferias.status == 'aprovada':
            data_atual = ferias.data_inicio
            while data_atual <= ferias.data_fim:
                escala = Escala.query.filter_by(
                    usuario_id=ferias.usuario_id,
                    data=data_atual,
                    tipo='férias'
                ).first()
                
                if escala:
                    db.session.delete(escala)
                
                data_atual += timedelta(days=1)
        
        db.session.delete(ferias)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Férias canceladas com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao cancelar férias: {str(e)}'
        }), 500

@api_ferias.route('/ferias/estatisticas/<int:usuario_id>', methods=['GET'])
def estatisticas_ferias(usuario_id):
    
    try:
        ano_atual = datetime.now().year

        ferias_ano = Ferias.query.filter(
            Ferias.usuario_id == usuario_id,
            Ferias.status == 'aprovada',
            db.extract('year', Ferias.data_inicio) == ano_atual
        ).all()
        
        dias_usados = sum(f.dias for f in ferias_ano)
        dias_restantes = max(0, 30 - dias_usados)  

        hoje = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        proximas_ferias = Ferias.query.filter(
            Ferias.usuario_id == usuario_id,
            Ferias.status.in_(['aprovada', 'pendente']),
            Ferias.data_inicio >= hoje
        ).order_by(Ferias.data_inicio).all()
        
        return jsonify({
            'success': True,
            'data': {
                'ano': ano_atual,
                'dias_usados': dias_usados,
                'dias_restantes': dias_restantes,
                'direito_total': 30,
                'proximas_ferias': [f.to_dict() for f in proximas_ferias]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar estatísticas: {str(e)}'
        }), 500
