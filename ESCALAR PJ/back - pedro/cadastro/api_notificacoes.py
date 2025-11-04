

from flask import Blueprint, request, jsonify, session
from models import db, Notificacao, Usuario
from datetime import datetime

api_notificacoes = Blueprint('api_notificacoes', __name__)

@api_notificacoes.route('/notificacoes', methods=['GET'])
def listar_notificacoes():
    
    try:
        
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            usuario_id = session.get('usuario_id')
        
        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id não fornecido'
            }), 400
        
        query = Notificacao.query.filter_by(usuario_id=int(usuario_id))

        lida = request.args.get('lida')
        if lida is not None:
            lida_bool = lida.lower() == 'true'
            query = query.filter_by(lida=lida_bool)

        limit = request.args.get('limit', 50)
        try:
            limit = int(limit)
        except ValueError:
            limit = 50
        
        notificacoes = query.order_by(Notificacao.data_envio.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': [n.to_dict() for n in notificacoes],
            'total': len(notificacoes)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar notificações: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/<int:id>', methods=['GET'])
def buscar_notificacao(id):
    
    try:
        notificacao = Notificacao.query.get(id)
        
        if not notificacao:
            return jsonify({
                'success': False,
                'error': 'Notificação não encontrada'
            }), 404

        usuario_id = session.get('usuario_id')
        if usuario_id and notificacao.usuario_id != usuario_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para ver esta notificação'
            }), 403
        
        return jsonify({
            'success': True,
            'data': notificacao.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar notificação: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/nao-lidas', methods=['GET'])
def listar_notificacoes_nao_lidas():
    
    try:
        
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            usuario_id = session.get('usuario_id')
        
        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id não fornecido'
            }), 400
        
        notificacoes = Notificacao.query.filter_by(
            usuario_id=int(usuario_id),
            lida=False
        ).order_by(Notificacao.data_envio.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [n.to_dict() for n in notificacoes],
            'total': len(notificacoes)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar notificações não lidas: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/contador', methods=['GET'])
def contador_nao_lidas():
    
    try:
        
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            usuario_id = session.get('usuario_id')
        
        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id não fornecido'
            }), 400
        
        count = Notificacao.query.filter_by(
            usuario_id=int(usuario_id),
            lida=False
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'nao_lidas': count
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao contar notificações: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes', methods=['POST'])
def criar_notificacao():
    
    try:
        data = request.get_json()

        if 'usuario_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo obrigatório ausente: usuario_id'
            }), 400
        
        if 'mensagem' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo obrigatório ausente: mensagem'
            }), 400

        usuario = Usuario.query.get(data['usuario_id'])
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404

        nova_notificacao = Notificacao(
            usuario_id=data['usuario_id'],
            mensagem=data['mensagem'],
            link=data.get('link', ''),
            lida=data.get('lida', False)
        )
        
        db.session.add(nova_notificacao)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notificação criada com sucesso',
            'data': nova_notificacao.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar notificação: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/<int:id>/marcar-lida', methods=['PUT'])
def marcar_lida(id):
    
    try:
        notificacao = Notificacao.query.get(id)
        
        if not notificacao:
            return jsonify({
                'success': False,
                'error': 'Notificação não encontrada'
            }), 404

        usuario_id = session.get('usuario_id')
        if usuario_id and notificacao.usuario_id != usuario_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para modificar esta notificação'
            }), 403
        
        notificacao.lida = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notificação marcada como lida',
            'data': notificacao.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao marcar notificação: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/<int:id>/marcar-nao-lida', methods=['PUT'])
def marcar_nao_lida(id):
    
    try:
        notificacao = Notificacao.query.get(id)
        
        if not notificacao:
            return jsonify({
                'success': False,
                'error': 'Notificação não encontrada'
            }), 404

        usuario_id = session.get('usuario_id')
        if usuario_id and notificacao.usuario_id != usuario_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para modificar esta notificação'
            }), 403
        
        notificacao.lida = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notificação marcada como não lida',
            'data': notificacao.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao marcar notificação: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/marcar-todas-lidas', methods=['PUT'])
def marcar_todas_lidas():
    
    try:
        
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            usuario_id = session.get('usuario_id')
        
        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id não fornecido'
            }), 400

        notificacoes = Notificacao.query.filter_by(
            usuario_id=int(usuario_id),
            lida=False
        ).all()
        
        count = 0
        for notificacao in notificacoes:
            notificacao.lida = True
            count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{count} notificações marcadas como lidas',
            'total': count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao marcar notificações: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/<int:id>', methods=['DELETE'])
def remover_notificacao(id):
    
    try:
        notificacao = Notificacao.query.get(id)
        
        if not notificacao:
            return jsonify({
                'success': False,
                'error': 'Notificação não encontrada'
            }), 404

        usuario_id = session.get('usuario_id')
        if usuario_id and notificacao.usuario_id != usuario_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para remover esta notificação'
            }), 403
        
        db.session.delete(notificacao)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notificação removida com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao remover notificação: {str(e)}'
        }), 500

@api_notificacoes.route('/notificacoes/limpar-lidas', methods=['DELETE'])
def limpar_notificacoes_lidas():
    
    try:
        
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            usuario_id = session.get('usuario_id')
        
        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id não fornecido'
            }), 400

        notificacoes = Notificacao.query.filter_by(
            usuario_id=int(usuario_id),
            lida=True
        ).all()
        
        count = 0
        for notificacao in notificacoes:
            db.session.delete(notificacao)
            count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{count} notificações removidas',
            'total': count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao limpar notificações: {str(e)}'
        }), 500
