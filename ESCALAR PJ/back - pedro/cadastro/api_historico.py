

from flask import Blueprint, request, jsonify, session
from models import db, HistoricoAcao, Usuario
from auth import verificarAdmin
from datetime import datetime

api_historico = Blueprint('api_historico', __name__)

@api_historico.route('/historico', methods=['GET'])
@verificarAdmin
def listar_historico():
    
    try:
        query = HistoricoAcao.query

        usuario_id = request.args.get('usuario_id')
        if usuario_id:
            query = query.filter_by(usuario_id=int(usuario_id))

        acao = request.args.get('acao')
        if acao:
            query = query.filter_by(acao=acao)

        data_inicio = request.args.get('data_inicio')
        if data_inicio:
            try:
                data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d')
                query = query.filter(HistoricoAcao.data_acao >= data_inicio_dt)
            except ValueError:
                pass
        
        data_fim = request.args.get('data_fim')
        if data_fim:
            try:
                data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d')
                
                data_fim_dt = data_fim_dt.replace(hour=23, minute=59, second=59)
                query = query.filter(HistoricoAcao.data_acao <= data_fim_dt)
            except ValueError:
                pass

        ano = request.args.get('ano')
        if ano:
            query = query.filter(db.extract('year', HistoricoAcao.data_acao) == int(ano))

        mes = request.args.get('mes')
        if mes:
            query = query.filter(db.extract('month', HistoricoAcao.data_acao) == int(mes))

        limit = request.args.get('limit', 100)
        try:
            limit = int(limit)
        except ValueError:
            limit = 100
        
        historico = query.order_by(HistoricoAcao.data_acao.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': [h.to_dict() for h in historico],
            'total': len(historico)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar histórico: {str(e)}'
        }), 500

@api_historico.route('/historico/<int:id>', methods=['GET'])
@verificarAdmin
def buscar_historico(id):
    
    try:
        historico = HistoricoAcao.query.get(id)
        
        if not historico:
            return jsonify({
                'success': False,
                'error': 'Registro de histórico não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': historico.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar histórico: {str(e)}'
        }), 500

@api_historico.route('/historico/coordenador/<int:usuario_id>', methods=['GET'])
@verificarAdmin
def listar_historico_coordenador(usuario_id):
    
    try:
        
        usuario = Usuario.query.get(usuario_id)
        if not usuario or usuario.cargo != 'coordenador':
            return jsonify({
                'success': False,
                'error': 'Usuário não é coordenador'
            }), 400
        
        historico = HistoricoAcao.query.filter_by(usuario_id=usuario_id).order_by(HistoricoAcao.data_acao.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [h.to_dict() for h in historico],
            'total': len(historico)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar histórico do coordenador: {str(e)}'
        }), 500

@api_historico.route('/historico/acoes-disponiveis', methods=['GET'])
@verificarAdmin
def listar_acoes_disponiveis():
    
    try:
        
        acoes = db.session.query(HistoricoAcao.acao).distinct().all()
        acoes_lista = [acao[0] for acao in acoes]
        
        return jsonify({
            'success': True,
            'data': sorted(acoes_lista),
            'total': len(acoes_lista)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar ações disponíveis: {str(e)}'
        }), 500

@api_historico.route('/historico', methods=['POST'])
@verificarAdmin
def registrar_acao():
    
    try:
        data = request.get_json()

        campos_obrigatorios = ['usuario_id', 'acao', 'detalhes']
        for campo in campos_obrigatorios:
            if campo not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório ausente: {campo}'
                }), 400

        usuario = Usuario.query.get(data['usuario_id'])
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404
        
        if usuario.cargo != 'coordenador':
            return jsonify({
                'success': False,
                'error': 'Apenas coordenadores podem ter ações registradas no histórico'
            }), 403

        novo_historico = HistoricoAcao(
            usuario_id=data['usuario_id'],
            acao=data['acao'],
            detalhes=data['detalhes'],
            data_acao=datetime.now()
        )
        
        db.session.add(novo_historico)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ação registrada no histórico com sucesso',
            'data': novo_historico.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao registrar ação: {str(e)}'
        }), 500

@api_historico.route('/historico/estatisticas', methods=['GET'])
@verificarAdmin
def estatisticas_historico():
    
    try:
        query = HistoricoAcao.query

        ano = request.args.get('ano')
        if ano:
            query = query.filter(db.extract('year', HistoricoAcao.data_acao) == int(ano))
        
        mes = request.args.get('mes')
        if mes:
            query = query.filter(db.extract('month', HistoricoAcao.data_acao) == int(mes))
        
        historico = query.all()

        total_acoes = len(historico)

        acoes_por_tipo = {}
        for h in historico:
            acoes_por_tipo[h.acao] = acoes_por_tipo.get(h.acao, 0) + 1

        acoes_por_coordenador = {}
        for h in historico:
            nome_coordenador = h.usuario.nome if h.usuario else 'Desconhecido'
            acoes_por_coordenador[nome_coordenador] = acoes_por_coordenador.get(nome_coordenador, 0) + 1

        acoes_mais_frequentes = sorted(acoes_por_tipo.items(), key=lambda x: x[1], reverse=True)[:5]

        if historico:
            primeira_acao = min(h.data_acao for h in historico)
            ultima_acao = max(h.data_acao for h in historico)
        else:
            primeira_acao = None
            ultima_acao = None
        
        return jsonify({
            'success': True,
            'data': {
                'total_acoes': total_acoes,
                'acoes_por_tipo': acoes_por_tipo,
                'acoes_por_coordenador': acoes_por_coordenador,
                'acoes_mais_frequentes': [{'acao': acao, 'quantidade': qtd} for acao, qtd in acoes_mais_frequentes],
                'periodo': {
                    'primeira_acao': primeira_acao.isoformat() if primeira_acao else None,
                    'ultima_acao': ultima_acao.isoformat() if ultima_acao else None
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar estatísticas: {str(e)}'
        }), 500

@api_historico.route('/historico/<int:id>', methods=['DELETE'])
@verificarAdmin
def remover_historico(id):
    
    try:
        historico = HistoricoAcao.query.get(id)
        
        if not historico:
            return jsonify({
                'success': False,
                'error': 'Registro de histórico não encontrado'
            }), 404
        
        db.session.delete(historico)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Registro removido do histórico'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao remover histórico: {str(e)}'
        }), 500
