

from flask import Blueprint, request, jsonify, session
from models import db, Troca, Usuario, Escala, Notificacao
from auth import verificarAdmin
from datetime import datetime

api_trocas = Blueprint('api_trocas', __name__)

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

@api_trocas.route('/trocas', methods=['GET'])
def listar_trocas():
    
    try:
        query = Troca.query

        usuario_id = request.args.get('usuario_id')
        if usuario_id:
            query = query.filter_by(solicitante_id=int(usuario_id))

        substituto_id = request.args.get('substituto_id')
        if substituto_id:
            query = query.filter_by(substituto_id=int(substituto_id))

        status = request.args.get('status')
        if status and status in ['pendente', 'aprovada', 'recusada']:
            query = query.filter_by(status=status)

        data_inicio = request.args.get('data_inicio')
        if data_inicio and validar_data(data_inicio):
            query = query.filter(Troca.data_solicitada >= datetime.strptime(data_inicio, '%Y-%m-%d'))
        
        data_fim = request.args.get('data_fim')
        if data_fim and validar_data(data_fim):
            query = query.filter(Troca.data_solicitada <= datetime.strptime(data_fim, '%Y-%m-%d'))
        
        trocas = query.order_by(Troca.data_solicitacao.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [troca.to_dict() for troca in trocas],
            'total': len(trocas)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar trocas: {str(e)}'
        }), 500

@api_trocas.route('/trocas/<int:id>', methods=['GET'])
def buscar_troca(id):
    
    try:
        troca = Troca.query.get(id)
        
        if not troca:
            return jsonify({
                'success': False,
                'error': 'Troca não encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'data': troca.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar troca: {str(e)}'
        }), 500

@api_trocas.route('/trocas/pendentes', methods=['GET'])
def listar_trocas_pendentes():
    
    try:
        trocas = Troca.query.filter_by(status='pendente').order_by(Troca.data_solicitacao.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [troca.to_dict() for troca in trocas],
            'total': len(trocas)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar trocas pendentes: {str(e)}'
        }), 500

@api_trocas.route('/trocas/usuario/<int:usuario_id>', methods=['GET'])
def listar_trocas_usuario(usuario_id):
    
    try:
        
        trocas_solicitadas = Troca.query.filter_by(solicitante_id=usuario_id).all()
        trocas_recebidas = Troca.query.filter_by(substituto_id=usuario_id).all()

        todas_trocas = list({troca.id: troca for troca in (trocas_solicitadas + trocas_recebidas)}.values())
        todas_trocas.sort(key=lambda x: x.data_solicitacao, reverse=True)
        
        return jsonify({
            'success': True,
            'data': [troca.to_dict() for troca in todas_trocas],
            'total': len(todas_trocas)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar trocas do usuário: {str(e)}'
        }), 500

@api_trocas.route('/trocas', methods=['POST'])
def criar_troca():
    
    try:
        data = request.get_json()

        # Campos obrigatórios (substituto_id é opcional)
        campos_obrigatorios = ['solicitante_id', 'data_solicitada', 'motivo']
        for campo in campos_obrigatorios:
            if campo not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório ausente: {campo}'
                }), 400

        if not validar_data(data['data_solicitada']):
            return jsonify({
                'success': False,
                'error': 'Data inválida. Use formato YYYY-MM-DD'
            }), 400

        usuario = Usuario.query.get(data['solicitante_id'])
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário solicitante não encontrado'
            }), 404
        
        # Valida substituto apenas se foi informado
        substituto_id = data.get('substituto_id')
        if substituto_id:
            usuario_destino = Usuario.query.get(substituto_id)
            if not usuario_destino:
                return jsonify({
                    'success': False,
                    'error': 'Usuário substituto não encontrado'
                }), 404

            if data['solicitante_id'] == substituto_id:
                return jsonify({
                    'success': False,
                    'error': 'Não é possível solicitar troca consigo mesmo'
                }), 400

        data_plantao = datetime.strptime(data['data_solicitada'], '%Y-%m-%d')
        escala = Escala.query.filter_by(
            usuario_id=data['solicitante_id'],
            data_plantao=data_plantao
        ).first()
        
        if not escala:
            return jsonify({
                'success': False,
                'error': 'Não existe plantão agendado para essa data'
            }), 404

        troca_existente = Troca.query.filter_by(
            solicitante_id=data['solicitante_id'],
            data_solicitada=data_plantao,
            status='pendente'
        ).first()
        
        if troca_existente:
            return jsonify({
                'success': False,
                'error': 'Já existe uma solicitação de troca pendente para essa data'
            }), 400

        nova_troca = Troca(
            solicitante_id=data['solicitante_id'],
            substituto_id=substituto_id,  # Pode ser None
            data_solicitada=data_plantao,
            motivo=data['motivo'],
            status='pendente',
            data_solicitacao=datetime.now()
        )
        
        db.session.add(nova_troca)
        db.session.commit()

        # Só notifica o substituto se foi indicado
        if substituto_id:
            criar_notificacao(
                usuario_id=substituto_id,
                mensagem=f'{usuario.nome} solicitou troca de plantão para {data["data_solicitada"]}',
                tipo='info'
            )
        
        # Notifica coordenadores
        coordenadores = Usuario.query.filter_by(nivel_acesso='coordenador').all()
        for coord in coordenadores:
            criar_notificacao(
                usuario_id=coord.id,
                mensagem=f'{usuario.nome} solicitou troca de plantão para {data["data_solicitada"]}' + 
                         (' (sem substituto indicado)' if not substituto_id else ''),
                tipo='troca'
            )
        
        return jsonify({
            'success': True,
            'message': 'Solicitação de troca criada com sucesso',
            'data': nova_troca.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar troca: {str(e)}'
        }), 500

@api_trocas.route('/trocas/<int:id>/aprovar', methods=['PUT'])
@verificarAdmin
def aprovar_troca(id):
    
    try:
        troca = Troca.query.get(id)
        
        if not troca:
            return jsonify({
                'success': False,
                'error': 'Troca não encontrada'
            }), 404
        
        if troca.status != 'pendente':
            return jsonify({
                'success': False,
                'error': f'Troca já foi {troca.status}'
            }), 400

        # Busca a escala do solicitante
        escala_solicitante = Escala.query.filter_by(
            usuario_id=troca.solicitante_id,
            data_plantao=troca.data_solicitada
        ).first()
        
        if not escala_solicitante:
            return jsonify({
                'success': False,
                'error': 'Escala do solicitante não encontrada'
            }), 404

        # Se houver substituto indicado, troca as escalas
        if troca.substituto_id:
            escala_destino = Escala.query.filter_by(
                usuario_id=troca.substituto_id,
                data_plantao=troca.data_solicitada
            ).first()

            if escala_destino:
                # Troca os usuários das escalas
                escala_solicitante.usuario_id, escala_destino.usuario_id = \
                    escala_destino.usuario_id, escala_solicitante.usuario_id
            else:
                # Se o substituto não tem escala para essa data, apenas marca como folga
                escala_solicitante.tipo = 'substituição'
        else:
            # Sem substituto indicado - apenas marca a troca como aprovada
            # O coordenador terá que designar alguém manualmente
            escala_solicitante.tipo = 'folga'

        troca.status = 'aprovada'
        troca.data_resposta = datetime.now()
        
        db.session.commit()

        # Notifica o solicitante
        criar_notificacao(
            usuario_id=troca.solicitante_id,
            mensagem=f'Sua solicitação de troca para {troca.data_solicitada.strftime("%d/%m/%Y")} foi aprovada!',
            tipo='info'
        )
        
        # Notifica o substituto (se houver)
        if troca.substituto_id:
            criar_notificacao(
                usuario_id=troca.substituto_id,
                mensagem=f'Troca de plantão para {troca.data_solicitada.strftime("%d/%m/%Y")} foi aprovada!',
                tipo='info'
            )
        
        return jsonify({
            'success': True,
            'message': 'Troca aprovada com sucesso',
            'data': troca.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao aprovar troca: {str(e)}'
        }), 500

@api_trocas.route('/trocas/<int:id>/recusar', methods=['PUT'])
@verificarAdmin
def recusar_troca(id):
    try:
        troca = Troca.query.get(id)
        
        if not troca:
            return jsonify({
                'success': False,
                'error': 'Troca não encontrada'
            }), 404
        
        if troca.status != 'pendente':
            return jsonify({
                'success': False,
                'error': f'Troca já foi {troca.status}'
            }), 400

        troca.status = 'recusada'
        troca.data_resposta = datetime.now()

        data = request.get_json()
        motivo_recusa = data.get('motivo_recusa', 'Não especificado') if data else 'Não especificado'
        
        db.session.commit()

        criar_notificacao(
            usuario_id=troca.solicitante_id,
            mensagem=f'Sua solicitação de troca para {troca.data_solicitada.strftime("%d/%m/%Y")} foi recusada. Motivo: {motivo_recusa}',
            tipo='info'
        )
        
        return jsonify({
            'success': True,
            'message': 'Troca recusada',
            'data': troca.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao recusar troca: {str(e)}'
        }), 500

@api_trocas.route('/trocas/<int:id>', methods=['DELETE'])
def cancelar_troca(id):
    
    try:
        troca = Troca.query.get(id)
        
        if not troca:
            return jsonify({
                'success': False,
                'error': 'Troca não encontrada'
            }), 404

        usuario_id = session.get('usuario_id')
        usuario_cargo = session.get('usuario_cargo')
        
        if usuario_cargo != 'coordenador' and troca.solicitante_id != usuario_id:
            return jsonify({
                'success': False,
                'error': 'Você não tem permissão para cancelar esta troca'
            }), 403

        if usuario_cargo != 'coordenador' and troca.status != 'pendente':
            return jsonify({
                'success': False,
                'error': 'Apenas trocas pendentes podem ser canceladas'
            }), 400

        if troca.status == 'pendente':
            criar_notificacao(
                usuario_id=troca.substituto_id,
                mensagem=f'A solicitação de troca de plantão para {troca.data_solicitada.strftime("%d/%m/%Y")} foi cancelada',
                tipo='info'
            )
        
        db.session.delete(troca)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Troca cancelada com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao cancelar troca: {str(e)}'
        }), 500
