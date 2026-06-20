

from flask import Blueprint, request, jsonify
from models import db, Escala, Usuario
from auth import verificarAdmin
from datetime import datetime, date

api_escalas = Blueprint('api_escalas', __name__)

@api_escalas.route('/escalas', methods=['GET'])
def listarEscalas():
    
    try:
        query = Escala.query

        usuario_id = request.args.get('usuario_id', type=int)
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        tipo = request.args.get('tipo')
        
        if usuario_id:
            query = query.filter_by(usuario_id=usuario_id)
        
        if data_inicio:
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            query = query.filter(Escala.data_plantao >= data_inicio_obj)
        
        if data_fim:
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
            query = query.filter(Escala.data_plantao <= data_fim_obj)
        
        if tipo:
            query = query.filter_by(tipo=tipo)
        
        escalas = query.order_by(Escala.data_plantao.desc()).all()
        
        return jsonify({
            'success': True,
            'escalas': [escala.to_dict() for escala in escalas],
            'total': len(escalas)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar escalas: {str(e)}'}), 500

@api_escalas.route('/escalas/<int:id>', methods=['GET'])
def buscarEscala(id):
    
    try:
        escala = Escala.query.get(id)
        
        if not escala:
            return jsonify({'error': 'Escala não encontrada'}), 404
        
        return jsonify({
            'success': True,
            'escala': escala.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar escala: {str(e)}'}), 500

@api_escalas.route('/escalas/usuario/<int:usuario_id>', methods=['GET'])
def listarEscalasPorUsuario(usuario_id):
    
    try:
        usuario = Usuario.query.get(usuario_id)
        
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        escalas = Escala.query.filter_by(usuario_id=usuario_id)\
                              .order_by(Escala.data_plantao.desc())\
                              .all()
        
        return jsonify({
            'success': True,
            'usuario': usuario.nome,
            'escalas': [escala.to_dict() for escala in escalas],
            'total': len(escalas)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar escalas do usuário: {str(e)}'}), 500

@api_escalas.route('/escalas', methods=['POST'])
@verificarAdmin
def criarEscala():
    
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400

        usuario_id = dados.get('usuario_id')
        data_plantao_str = dados.get('data_plantao')
        tipo = dados.get('tipo')
        
        if not usuario_id or not data_plantao_str or not tipo:
            return jsonify({'error': 'Campos obrigatórios: usuario_id, data_plantao, tipo'}), 400

        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        try:
            data_plantao = datetime.strptime(data_plantao_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Data inválida. Use formato YYYY-MM-DD'}), 400

        tipos_validos = ['trabalho', 'folga', 'férias', 'atestado', 'substituição']
        if tipo not in tipos_validos:
            return jsonify({'error': f'Tipo inválido. Use: {", ".join(tipos_validos)}'}), 400

        conflito = Escala.query.filter_by(
            usuario_id=usuario_id,
            data_plantao=data_plantao
        ).first()
        
        if conflito:
            return jsonify({'error': f'Já existe uma escala para este usuário na data {data_plantao_str}'}), 400

        nova_escala = Escala(
            usuario_id=usuario_id,
            data_plantao=data_plantao,
            tipo=tipo,
            observacao=dados.get('observacao')
        )
        
        db.session.add(nova_escala)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Escala criada com sucesso!',
            'escala': nova_escala.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar escala: {str(e)}'}), 500

@api_escalas.route('/escalas/<int:id>', methods=['PUT'])
@verificarAdmin
def atualizarEscala(id):
    
    try:
        escala = Escala.query.get(id)
        
        if not escala:
            return jsonify({'error': 'Escala não encontrada'}), 404
        
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado recebido'}), 400

        if 'data_plantao' in dados:
            try:
                escala.data_plantao = datetime.strptime(dados['data_plantao'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Data inválida. Use formato YYYY-MM-DD'}), 400
        
        if 'tipo' in dados:
            tipos_validos = ['trabalho', 'folga', 'férias', 'atestado', 'substituição']
            if dados['tipo'] not in tipos_validos:
                return jsonify({'error': f'Tipo inválido. Use: {", ".join(tipos_validos)}'}), 400
            escala.tipo = dados['tipo']
        
        if 'observacao' in dados:
            escala.observacao = dados['observacao']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Escala atualizada com sucesso!',
            'escala': escala.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar escala: {str(e)}'}), 500

@api_escalas.route('/escalas/<int:id>', methods=['DELETE'])
@verificarAdmin
def deletarEscala(id):
    
    try:
        escala = Escala.query.get(id)
        
        if not escala:
            return jsonify({'error': 'Escala não encontrada'}), 404
        
        db.session.delete(escala)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Escala removida com sucesso!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover escala: {str(e)}'}), 500

@api_escalas.route('/escalas/mes', methods=['GET'])
def listarEscalasMes():
    
    try:
        ano = request.args.get('ano', type=int)
        mes = request.args.get('mes', type=int)
        usuario_id = request.args.get('usuario_id', type=int)
        
        if not ano or not mes:
            return jsonify({'error': 'Parâmetros obrigatórios: ano, mes'}), 400

        if mes < 1 or mes > 12:
            return jsonify({'error': 'Mês inválido (1-12)'}), 400

        from calendar import monthrange
        primeiro_dia = date(ano, mes, 1)
        ultimo_dia = date(ano, mes, monthrange(ano, mes)[1])
        
        query = Escala.query.filter(
            Escala.data_plantao >= primeiro_dia,
            Escala.data_plantao <= ultimo_dia
        )
        
        if usuario_id:
            query = query.filter_by(usuario_id=usuario_id)
        
        escalas = query.order_by(Escala.data_plantao).all()
        
        return jsonify({
            'success': True,
            'periodo': f'{mes:02d}/{ano}',
            'escalas': [escala.to_dict() for escala in escalas],
            'total': len(escalas)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar escalas do mês: {str(e)}'}), 500
