"""
Funcoes de validacao para o cadastro de usuarios
"""

import re
from datetime import datetime, date
from models import Usuario

# Valores permitidos para cada campo
ESCALAS_VALIDAS = ['12x36', '6x1', '5x2', '5x1', '4x3']
TURNOS_VALIDOS = ['diurno', 'noturno', 'misto']
LOCAIS_VALIDOS = ['CCE', 'CCV', 'Campus', 'CCO']

def validarEmail(email):
    """
    Valida o formato do e-mail usando regex
    """
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(padrao, email) is not None

def validarCPF(cpf):
    """
    Valida o formato basico do CPF (apenas digitos e tamanho)
    """
    # Remove caracteres nao numericos
    cpf_limpo = re.sub(r'\D', '', cpf)
    
    # Verifica se tem 11 digitos
    if len(cpf_limpo) != 11:
        return False
    
    # Verifica se nao e uma sequencia repetida (ex: 111.111.111-11)
    if cpf_limpo == cpf_limpo[0] * 11:
        return False
    
    return True

def validarIdadeMinima(data_nascimento, idade_minima=18):
    """
    Valida se o usuario tem idade minima
    """
    hoje = date.today()
    idade = hoje.year - data_nascimento.year
    
    # Ajusta se ainda nao fez aniversario este ano
    if (hoje.month, hoje.day) < (data_nascimento.month, data_nascimento.day):
        idade -= 1
    
    return idade >= idade_minima

def verificarEmailUnico(email, usuario_id=None):
    """
    Verifica se o e-mail ja esta cadastrado no sistema
    """
    query = Usuario.query.filter_by(email=email)
    if usuario_id:
        query = query.filter(Usuario.id != usuario_id)
    return query.first() is None

def verificarCPFUnico(cpf, usuario_id=None):
    """
    Verifica se o CPF ja esta cadastrado no sistema
    """
    cpf_limpo = re.sub(r'\D', '', cpf)
    query = Usuario.query.filter_by(cpf=cpf_limpo)
    if usuario_id:
        query = query.filter(Usuario.id != usuario_id)
    return query.first() is None

def validarEscala(escala):
    """
    Valida se a escala esta entre os valores permitidos
    """
    return escala in ESCALAS_VALIDAS

def validarTurno(turno):
    """
    Valida se o turno esta entre os valores permitidos
    """
    return turno in TURNOS_VALIDOS

def validarLocal(local):
    """
    Valida se o local esta entre os valores permitidos
    """
    return local in LOCAIS_VALIDOS

def validarCadastroCompleto(dados):
    """
    Realiza todas as validacoes necessarias para o cadastro.
    Retorna uma tupla (valido, lista_de_erros).
    """
    erros = []
    
    # Validacao de e-mail
    if not validarEmail(dados['email']):
        erros.append('E-mail inválido.')
    elif not verificarEmailUnico(dados['email']):
        erros.append('E-mail já cadastrado no sistema.')
    
    # Validacao de CPF
    if not validarCPF(dados['cpf']):
        erros.append('CPF inválido.')
    elif not verificarCPFUnico(dados['cpf']):
        erros.append('CPF já cadastrado no sistema.')
    
    # Validacao de data de nascimento
    try:
        data_nasc = datetime.strptime(dados['data_nascimento'], '%Y-%m-%d').date()
        if not validarIdadeMinima(data_nasc):
            erros.append('O usuário deve ter pelo menos 18 anos.')
    except ValueError:
        erros.append('Data de nascimento inválida.')
    
    # Validacao de escala
    if not validarEscala(dados['escala']):
        erros.append(f'Escala inválida. Opções válidas: {", ".join(ESCALAS_VALIDAS)}')
    
    # Validacao de turno
    if not validarTurno(dados['turno']):
        erros.append(f'Turno inválido. Opções válidas: {", ".join(TURNOS_VALIDOS)}')
    
    # Validacao de local
    if not validarLocal(dados['local']):
        erros.append(f'Local inválido. Opções válidas: {", ".join(LOCAIS_VALIDOS)}')
    
    return (len(erros) == 0, erros)