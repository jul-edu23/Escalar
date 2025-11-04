/**
 * VALIDATIONS.JS - Validações Client-Side
 * Sistema Escalar - Gestão de Escalas
 * 
 * Validações reutilizáveis para todos os formulários
 */

// =====================================================
// VALIDAÇÕES DE FORMATO
// =====================================================

/**
 * Valida formato de email
 * @param {string} email 
 * @returns {boolean}
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida CPF (11 dígitos, com ou sem formatação)
 * @param {string} cpf 
 * @returns {boolean}
 */
function validarCPF(cpf) {
    const limpo = cpf.replace(/\D/g, '');
    return limpo.length === 11;
}

/**
 * Valida formato de data (YYYY-MM-DD ou DD/MM/YYYY)
 * @param {string} data 
 * @returns {boolean}
 */
function validarData(data) {
    const regexISO = /^\d{4}-\d{2}-\d{2}$/;
    const regexBR = /^\d{2}\/\d{2}\/\d{4}$/;
    
    if (!regexISO.test(data) && !regexBR.test(data)) {
        return false;
    }
    
    const date = new Date(data);
    return date instanceof Date && !isNaN(date);
}

/**
 * Valida se data é futura (maior ou igual a hoje)
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {boolean}
 */
function validarDataFutura(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataComparar = new Date(data);
    return dataComparar >= hoje;
}

/**
 * Valida se data está no passado (menor ou igual a hoje)
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {boolean}
 */
function validarDataPassada(data) {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    const dataComparar = new Date(data);
    return dataComparar <= hoje;
}

/**
 * Valida período (data_inicio <= data_fim)
 * @param {string} dataInicio 
 * @param {string} dataFim 
 * @returns {boolean}
 */
function validarPeriodo(dataInicio, dataFim) {
    return new Date(dataInicio) <= new Date(dataFim);
}

/**
 * Valida campo obrigatório (não vazio)
 * @param {any} valor 
 * @returns {boolean}
 */
function validarObrigatorio(valor) {
    return valor !== null && valor !== undefined && valor.toString().trim() !== '';
}

/**
 * Valida idade mínima (18 anos)
 * @param {string} dataNascimento - Data no formato YYYY-MM-DD
 * @returns {boolean}
 */
function validarIdadeMinima(dataNascimento, idadeMinima = 18) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade >= idadeMinima;
}

// =====================================================
// VALIDAÇÕES DE COMPRIMENTO
// =====================================================

/**
 * Valida comprimento mínimo
 * @param {string} valor 
 * @param {number} min 
 * @returns {boolean}
 */
function validarComprimentoMinimo(valor, min) {
    return valor.length >= min;
}

/**
 * Valida comprimento máximo
 * @param {string} valor 
 * @param {number} max 
 * @returns {boolean}
 */
function validarComprimentoMaximo(valor, max) {
    return valor.length <= max;
}

/**
 * Valida comprimento exato
 * @param {string} valor 
 * @param {number} length 
 * @returns {boolean}
 */
function validarComprimentoExato(valor, length) {
    return valor.length === length;
}

// =====================================================
// VALIDAÇÕES DE REGRAS DE NEGÓCIO
// =====================================================

/**
 * Valida período de férias (5 a 30 dias)
 * @param {string} dataInicio 
 * @param {string} dataFim 
 * @returns {object} { valido: boolean, dias: number, erro: string }
 */
function validarPeriodoFerias(dataInicio, dataFim) {
    if (!validarPeriodo(dataInicio, dataFim)) {
        return { valido: false, dias: 0, erro: 'Data de início deve ser anterior ou igual à data de fim' };
    }
    
    const dias = calcularDias(dataInicio, dataFim);
    
    if (dias < 5) {
        return { valido: false, dias, erro: 'Período mínimo de férias é 5 dias' };
    }
    
    if (dias > 30) {
        return { valido: false, dias, erro: 'Período máximo de férias é 30 dias' };
    }
    
    return { valido: true, dias, erro: null };
}

/**
 * Valida período de atestado (máximo 15 dias)
 * @param {string} dataInicio 
 * @param {string} dataFim 
 * @returns {object} { valido: boolean, dias: number, erro: string }
 */
function validarPeriodoAtestado(dataInicio, dataFim) {
    if (!validarPeriodo(dataInicio, dataFim)) {
        return { valido: false, dias: 0, erro: 'Data de início deve ser anterior ou igual à data de fim' };
    }
    
    const dias = calcularDias(dataInicio, dataFim);
    
    if (dias > 15) {
        return { valido: false, dias, erro: 'Período máximo de atestado é 15 dias' };
    }
    
    return { valido: true, dias, erro: null };
}

/**
 * Valida se valor está em lista de opções permitidas
 * @param {string} valor 
 * @param {array} opcoes 
 * @returns {boolean}
 */
function validarOpcao(valor, opcoes) {
    return opcoes.includes(valor);
}

/**
 * Valida escala (valores permitidos: 12x36, 6x1, 5x2, 5x1, 4x3)
 * @param {string} escala 
 * @returns {boolean}
 */
function validarEscala(escala) {
    const escalasPermitidas = ['12x36', '6x1', '5x2', '5x1', '4x3'];
    return validarOpcao(escala, escalasPermitidas);
}

/**
 * Valida turno (valores permitidos: diurno, noturno, misto)
 * @param {string} turno 
 * @returns {boolean}
 */
function validarTurno(turno) {
    const turnosPermitidos = ['diurno', 'noturno', 'misto'];
    return validarOpcao(turno, turnosPermitidos);
}

/**
 * Valida local (valores permitidos: Campus, CCE, CCV, CCO)
 * @param {string} local 
 * @returns {boolean}
 */
function validarLocal(local) {
    const locaisPermitidos = ['Campus', 'CCE', 'CCV', 'CCO'];
    return validarOpcao(local, locaisPermitidos);
}

/**
 * Valida cargo (valores permitidos: coordenador, colaborador)
 * @param {string} cargo 
 * @returns {boolean}
 */
function validarCargo(cargo) {
    const cargosPermitidos = ['coordenador', 'colaborador'];
    return validarOpcao(cargo, cargosPermitidos);
}

/**
 * Valida status (valores permitidos: pendente, aprovado, recusado)
 * @param {string} status 
 * @returns {boolean}
 */
function validarStatus(status) {
    const statusPermitidos = ['pendente', 'aprovado', 'recusado'];
    return validarOpcao(status, statusPermitidos);
}

// =====================================================
// UTILITÁRIOS
// =====================================================

/**
 * Calcula diferença em dias entre duas datas (inclusivo)
 * @param {string} dataInicio 
 * @param {string} dataFim 
 * @returns {number}
 */
function calcularDias(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diff = Math.abs(fim - inicio);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Formata CPF com máscara (XXX.XXX.XXX-XX)
 * @param {string} cpf 
 * @returns {string}
 */
function formatarCPF(cpf) {
    let value = cpf.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
}

/**
 * Remove formatação do CPF (apenas dígitos)
 * @param {string} cpf 
 * @returns {string}
 */
function limparCPF(cpf) {
    return cpf.replace(/\D/g, '');
}

/**
 * Formata data para exibição (DD/MM/YYYY)
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {string}
 */
function formatarDataBR(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

/**
 * Formata data para input (YYYY-MM-DD)
 * @param {string} data - Data no formato DD/MM/YYYY
 * @returns {string}
 */
function formatarDataISO(data) {
    const partes = data.split('/');
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return data;
}

// =====================================================
// VALIDAÇÃO COMPLETA DE FORMULÁRIO
// =====================================================

/**
 * Valida formulário de cadastro de colaborador
 * @param {object} dados 
 * @returns {object} { valido: boolean, erros: array }
 */
function validarFormularioCadastroColaborador(dados) {
    const erros = [];
    
    // Nome
    if (!validarObrigatorio(dados.nome)) {
        erros.push('Nome é obrigatório');
    } else if (!validarComprimentoMinimo(dados.nome, 3)) {
        erros.push('Nome deve ter no mínimo 3 caracteres');
    }
    
    // Email
    if (!validarObrigatorio(dados.email)) {
        erros.push('Email é obrigatório');
    } else if (!validarEmail(dados.email)) {
        erros.push('Email inválido');
    }
    
    // Apelido
    if (!validarObrigatorio(dados.apelido)) {
        erros.push('Apelido é obrigatório');
    }
    
    // CPF
    if (!validarObrigatorio(dados.cpf)) {
        erros.push('CPF é obrigatório');
    } else if (!validarCPF(dados.cpf)) {
        erros.push('CPF deve ter 11 dígitos');
    }
    
    // Data de Nascimento
    if (!validarObrigatorio(dados.data_nascimento)) {
        erros.push('Data de nascimento é obrigatória');
    } else if (!validarData(dados.data_nascimento)) {
        erros.push('Data de nascimento inválida');
    } else if (!validarIdadeMinima(dados.data_nascimento, 18)) {
        erros.push('Colaborador deve ter no mínimo 18 anos');
    }
    
    // Escala
    if (!validarObrigatorio(dados.escala)) {
        erros.push('Escala é obrigatória');
    } else if (!validarEscala(dados.escala)) {
        erros.push('Escala inválida');
    }
    
    // Turno
    if (!validarObrigatorio(dados.turno)) {
        erros.push('Turno é obrigatório');
    } else if (!validarTurno(dados.turno)) {
        erros.push('Turno inválido');
    }
    
    // Local
    if (!validarObrigatorio(dados.local)) {
        erros.push('Local é obrigatório');
    } else if (!validarLocal(dados.local)) {
        erros.push('Local inválido');
    }
    
    return {
        valido: erros.length === 0,
        erros
    };
}

/**
 * Valida formulário de solicitação de troca
 * @param {object} dados 
 * @returns {object} { valido: boolean, erros: array }
 */
function validarFormularioSolicitacaoTroca(dados) {
    const erros = [];
    
    // Data solicitada
    if (!validarObrigatorio(dados.data_solicitada)) {
        erros.push('Data da troca é obrigatória');
    } else if (!validarData(dados.data_solicitada)) {
        erros.push('Data da troca inválida');
    } else if (!validarDataFutura(dados.data_solicitada)) {
        erros.push('Data da troca deve ser futura');
    }
    
    // Local
    if (!validarObrigatorio(dados.local)) {
        erros.push('Local é obrigatório');
    } else if (!validarLocal(dados.local)) {
        erros.push('Local inválido');
    }
    
    // Motivo
    if (!validarObrigatorio(dados.motivo)) {
        erros.push('Motivo é obrigatório');
    } else if (!validarComprimentoMinimo(dados.motivo, 10)) {
        erros.push('Motivo deve ter no mínimo 10 caracteres');
    }
    
    return {
        valido: erros.length === 0,
        erros
    };
}

/**
 * Valida formulário de solicitação de férias
 * @param {object} dados 
 * @returns {object} { valido: boolean, erros: array, dias: number }
 */
function validarFormularioSolicitacaoFerias(dados) {
    const erros = [];
    
    // Data início
    if (!validarObrigatorio(dados.data_inicio)) {
        erros.push('Data de início é obrigatória');
    } else if (!validarData(dados.data_inicio)) {
        erros.push('Data de início inválida');
    } else if (!validarDataFutura(dados.data_inicio)) {
        erros.push('Data de início deve ser futura');
    }
    
    // Data fim
    if (!validarObrigatorio(dados.data_fim)) {
        erros.push('Data de fim é obrigatória');
    } else if (!validarData(dados.data_fim)) {
        erros.push('Data de fim inválida');
    }
    
    // Validar período
    let diasSolicitados = 0;
    if (validarObrigatorio(dados.data_inicio) && validarObrigatorio(dados.data_fim)) {
        const resultadoPeriodo = validarPeriodoFerias(dados.data_inicio, dados.data_fim);
        if (!resultadoPeriodo.valido) {
            erros.push(resultadoPeriodo.erro);
        }
        diasSolicitados = resultadoPeriodo.dias;
    }
    
    return {
        valido: erros.length === 0,
        erros,
        dias: diasSolicitados
    };
}

/**
 * Valida formulário de cadastro de atestado
 * @param {object} dados 
 * @returns {object} { valido: boolean, erros: array, dias: number }
 */
function validarFormularioCadastroAtestado(dados) {
    const erros = [];
    
    // Data início
    if (!validarObrigatorio(dados.data_inicio)) {
        erros.push('Data de início é obrigatória');
    } else if (!validarData(dados.data_inicio)) {
        erros.push('Data de início inválida');
    } else if (!validarDataPassada(dados.data_inicio)) {
        erros.push('Data de início deve ser no passado ou hoje');
    }
    
    // Data fim
    if (!validarObrigatorio(dados.data_fim)) {
        erros.push('Data de fim é obrigatória');
    } else if (!validarData(dados.data_fim)) {
        erros.push('Data de fim inválida');
    }
    
    // Motivo
    if (!validarObrigatorio(dados.motivo)) {
        erros.push('Motivo é obrigatório');
    } else if (!validarComprimentoMinimo(dados.motivo, 5)) {
        erros.push('Motivo deve ter no mínimo 5 caracteres');
    }
    
    // Validar período
    let diasAtestado = 0;
    if (validarObrigatorio(dados.data_inicio) && validarObrigatorio(dados.data_fim)) {
        const resultadoPeriodo = validarPeriodoAtestado(dados.data_inicio, dados.data_fim);
        if (!resultadoPeriodo.valido) {
            erros.push(resultadoPeriodo.erro);
        }
        diasAtestado = resultadoPeriodo.dias;
    }
    
    return {
        valido: erros.length === 0,
        erros,
        dias: diasAtestado
    };
}

/**
 * Valida formulário de login
 * @param {object} dados 
 * @returns {object} { valido: boolean, erros: array }
 */
function validarFormularioLogin(dados) {
    const erros = [];
    
    // Email
    if (!validarObrigatorio(dados.email)) {
        erros.push('Email é obrigatório');
    } else if (!validarEmail(dados.email)) {
        erros.push('Email inválido');
    }
    
    // Senha
    if (!validarObrigatorio(dados.senha)) {
        erros.push('Senha é obrigatória');
    }
    
    return {
        valido: erros.length === 0,
        erros
    };
}

// =====================================================
// APLICAR MÁSCARAS EM TEMPO REAL
// =====================================================

/**
 * Aplica máscara de CPF em um input
 * @param {HTMLInputElement} input 
 */
function aplicarMascaraCPF(input) {
    input.addEventListener('input', function(e) {
        e.target.value = formatarCPF(e.target.value);
    });
}

/**
 * Aplica máscara de data (DD/MM/YYYY) em um input
 * @param {HTMLInputElement} input 
 */
function aplicarMascaraData(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
            e.target.value = value;
        }
    });
}

// =====================================================
// EXPORTAÇÃO (para uso global)
// =====================================================

window.validarEmail = validarEmail;
window.validarCPF = validarCPF;
window.validarData = validarData;
window.validarDataFutura = validarDataFutura;
window.validarDataPassada = validarDataPassada;
window.validarPeriodo = validarPeriodo;
window.validarObrigatorio = validarObrigatorio;
window.validarIdadeMinima = validarIdadeMinima;
window.validarComprimentoMinimo = validarComprimentoMinimo;
window.validarComprimentoMaximo = validarComprimentoMaximo;
window.validarComprimentoExato = validarComprimentoExato;
window.validarPeriodoFerias = validarPeriodoFerias;
window.validarPeriodoAtestado = validarPeriodoAtestado;
window.validarOpcao = validarOpcao;
window.validarEscala = validarEscala;
window.validarTurno = validarTurno;
window.validarLocal = validarLocal;
window.validarCargo = validarCargo;
window.validarStatus = validarStatus;
window.calcularDias = calcularDias;
window.formatarCPF = formatarCPF;
window.limparCPF = limparCPF;
window.formatarDataBR = formatarDataBR;
window.formatarDataISO = formatarDataISO;
window.validarFormularioCadastroColaborador = validarFormularioCadastroColaborador;
window.validarFormularioSolicitacaoTroca = validarFormularioSolicitacaoTroca;
window.validarFormularioSolicitacaoFerias = validarFormularioSolicitacaoFerias;
window.validarFormularioCadastroAtestado = validarFormularioCadastroAtestado;
window.validarFormularioLogin = validarFormularioLogin;
window.aplicarMascaraCPF = aplicarMascaraCPF;
window.aplicarMascaraData = aplicarMascaraData;

console.log('✅ Validations.js carregado com sucesso!');
