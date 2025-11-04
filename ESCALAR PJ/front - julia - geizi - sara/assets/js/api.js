/**
 * API.JS - Cliente JavaScript para comunicação com Backend REST
 * Sistema Escalar - Gestão de Escalas
 * 
 * Base URL: http://localhost:5000/api
 */

const API_BASE_URL = 'http://localhost:5000/api';

// =====================================================
// CONFIGURAÇÃO GERAL
// =====================================================

/**
 * Configuração padrão para todas as requisições
 */
const defaultHeaders = {
    'Content-Type': 'application/json'
};

// =====================================================
// FUNÇÕES HELPER PRINCIPAIS
// =====================================================

/**
 * Função genérica para fazer requisições HTTP
 * @param {string} endpoint - Endpoint da API (ex: '/escalas')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object|null} body - Corpo da requisição (para POST/PUT)
 * @param {object} customHeaders - Headers customizados
 * @returns {Promise<object>} Resposta da API
 */
async function fazerRequisicao(endpoint, method = 'GET', body = null, customHeaders = {}) {
    const options = {
        method: method,
        headers: { ...defaultHeaders, ...customHeaders },
        credentials: 'include' // Importante para sessões
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.error || data.message || 'Erro na requisição',
                data: data
            };
        }

        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

/**
 * Mostra mensagem de sucesso ao usuário
 * @param {string} mensagem 
 */
function mostrarSucesso(mensagem) {
    // Implementar de acordo com o design do sistema
    alert(`✅ ${mensagem}`);
}

/**
 * Mostra mensagem de erro ao usuário
 * @param {string} mensagem 
 */
function mostrarErro(mensagem) {
    // Implementar de acordo com o design do sistema
    alert(`❌ ${mensagem}`);
}

/**
 * Mostra loading state
 * @param {boolean} ativo 
 */
function mostrarLoading(ativo) {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = ativo ? 'block' : 'none';
    }
}

// =====================================================
// API ESCALAS
// =====================================================

const EscalasAPI = {
    /**
     * Lista todas as escalas com filtros opcionais
     * @param {object} filtros - {usuario_id, tipo, mes, ano}
     */
    async listar(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const queryString = params.toString();
        const endpoint = queryString ? `/escalas?${queryString}` : '/escalas';
        return await fazerRequisicao(endpoint);
    },

    /**
     * Busca escala por ID
     */
    async buscar(id) {
        return await fazerRequisicao(`/escalas/${id}`);
    },

    /**
     * Lista escalas de um usuário
     */
    async listarPorUsuario(usuarioId) {
        return await fazerRequisicao(`/escalas/usuario/${usuarioId}`);
    },

    /**
     * Lista escalas de um mês específico
     */
    async listarPorMes(ano, mes) {
        return await fazerRequisicao(`/escalas/mes?ano=${ano}&mes=${mes}`);
    },

    /**
     * Cria nova escala (coordenador apenas)
     */
    async criar(dados) {
        return await fazerRequisicao('/escalas', 'POST', dados);
    },

    /**
     * Atualiza escala (coordenador apenas)
     */
    async atualizar(id, dados) {
        return await fazerRequisicao(`/escalas/${id}`, 'PUT', dados);
    },

    /**
     * Deleta escala (coordenador apenas)
     */
    async deletar(id) {
        return await fazerRequisicao(`/escalas/${id}`, 'DELETE');
    }
};

// =====================================================
// API TROCAS
// =====================================================

const TrocasAPI = {
    /**
     * Lista todas as trocas com filtros
     */
    async listar(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const queryString = params.toString();
        const endpoint = queryString ? `/trocas?${queryString}` : '/trocas';
        return await fazerRequisicao(endpoint);
    },

    /**
     * Lista trocas pendentes
     */
    async listarPendentes() {
        return await fazerRequisicao('/trocas/pendentes');
    },

    /**
     * Lista trocas de um usuário (solicitante ou substituto)
     */
    async listarPorUsuario(usuarioId) {
        return await fazerRequisicao(`/trocas/usuario/${usuarioId}`);
    },

    /**
     * Busca troca por ID
     */
    async buscar(id) {
        return await fazerRequisicao(`/trocas/${id}`);
    },

    /**
     * Solicita troca de plantão
     */
    async solicitar(dados) {
        return await fazerRequisicao('/trocas', 'POST', dados);
    },

    /**
     * Aprova troca (coordenador apenas)
     */
    async aprovar(id) {
        return await fazerRequisicao(`/trocas/${id}/aprovar`, 'PUT');
    },

    /**
     * Recusa troca (coordenador apenas)
     */
    async recusar(id, motivo) {
        return await fazerRequisicao(`/trocas/${id}/recusar`, 'PUT', { motivo_recusa: motivo });
    },

    /**
     * Deleta troca
     */
    async deletar(id) {
        return await fazerRequisicao(`/trocas/${id}`, 'DELETE');
    }
};

// =====================================================
// API FÉRIAS
// =====================================================

const FeriasAPI = {
    /**
     * Lista todas as férias com filtros
     */
    async listar(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const queryString = params.toString();
        const endpoint = queryString ? `/ferias?${queryString}` : '/ferias';
        return await fazerRequisicao(endpoint);
    },

    /**
     * Lista férias pendentes
     */
    async listarPendentes() {
        return await fazerRequisicao('/ferias/pendentes');
    },

    /**
     * Lista férias de um usuário
     */
    async listarPorUsuario(usuarioId) {
        return await fazerRequisicao(`/ferias/usuario/${usuarioId}`);
    },

    /**
     * Busca férias por ID
     */
    async buscar(id) {
        return await fazerRequisicao(`/ferias/${id}`);
    },

    /**
     * Busca estatísticas de férias de um usuário
     */
    async estatisticas(usuarioId) {
        return await fazerRequisicao(`/ferias/estatisticas/${usuarioId}`);
    },

    /**
     * Solicita férias
     */
    async solicitar(dados) {
        return await fazerRequisicao('/ferias', 'POST', dados);
    },

    /**
     * Aprova férias (coordenador apenas)
     */
    async aprovar(id) {
        return await fazerRequisicao(`/ferias/${id}/aprovar`, 'PUT');
    },

    /**
     * Rejeita férias (coordenador apenas)
     */
    async rejeitar(id, motivo) {
        return await fazerRequisicao(`/ferias/${id}/rejeitar`, 'PUT', { motivo_rejeicao: motivo });
    }
};

// =====================================================
// API ATESTADOS
// =====================================================

const AtestadosAPI = {
    /**
     * Lista todos os atestados com filtros
     */
    async listar(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const queryString = params.toString();
        const endpoint = queryString ? `/atestados?${queryString}` : '/atestados';
        return await fazerRequisicao(endpoint);
    },

    /**
     * Lista atestados pendentes
     */
    async listarPendentes() {
        return await fazerRequisicao('/atestados/pendentes');
    },

    /**
     * Lista atestados de um usuário
     */
    async listarPorUsuario(usuarioId) {
        return await fazerRequisicao(`/atestados/usuario/${usuarioId}`);
    },

    /**
     * Busca atestado por ID
     */
    async buscar(id) {
        return await fazerRequisicao(`/atestados/${id}`);
    },

    /**
     * Busca estatísticas de atestados de um usuário
     */
    async estatisticas(usuarioId) {
        return await fazerRequisicao(`/atestados/estatisticas/${usuarioId}`);
    },

    /**
     * Envia atestado
     */
    async enviar(dados) {
        return await fazerRequisicao('/atestados', 'POST', dados);
    },

    /**
     * Aceita atestado (coordenador apenas)
     */
    async aceitar(id) {
        return await fazerRequisicao(`/atestados/${id}/aceitar`, 'PUT');
    },

    /**
     * Nega atestado (coordenador apenas)
     */
    async negar(id, motivo) {
        return await fazerRequisicao(`/atestados/${id}/negar`, 'PUT', { motivo_negacao: motivo });
    }
};

// =====================================================
// API NOTIFICAÇÕES
// =====================================================

const NotificacoesAPI = {
    /**
     * Lista notificações de um usuário
     */
    async listar(usuarioId, lida = null) {
        const params = new URLSearchParams({ usuario_id: usuarioId });
        if (lida !== null) {
            params.append('lida', lida);
        }
        return await fazerRequisicao(`/notificacoes?${params.toString()}`);
    },

    /**
     * Lista notificações não lidas
     */
    async listarNaoLidas(usuarioId) {
        return await fazerRequisicao(`/notificacoes/nao-lidas?usuario_id=${usuarioId}`);
    },

    /**
     * Conta notificações não lidas (para badge)
     */
    async contarNaoLidas(usuarioId) {
        return await fazerRequisicao(`/notificacoes/contador?usuario_id=${usuarioId}`);
    },

    /**
     * Busca notificação por ID
     */
    async buscar(id) {
        return await fazerRequisicao(`/notificacoes/${id}`);
    },

    /**
     * Cria notificação
     */
    async criar(dados) {
        return await fazerRequisicao('/notificacoes', 'POST', dados);
    },

    /**
     * Marca notificação como lida
     */
    async marcarLida(id) {
        return await fazerRequisicao(`/notificacoes/${id}/marcar-lida`, 'PUT');
    },

    /**
     * Marca notificação como não lida
     */
    async marcarNaoLida(id) {
        return await fazerRequisicao(`/notificacoes/${id}/marcar-nao-lida`, 'PUT');
    },

    /**
     * Marca todas as notificações como lidas
     */
    async marcarTodasLidas(usuarioId) {
        return await fazerRequisicao(`/notificacoes/marcar-todas-lidas?usuario_id=${usuarioId}`, 'PUT');
    },

    /**
     * Limpa notificações lidas
     */
    async limparLidas(usuarioId) {
        return await fazerRequisicao(`/notificacoes/limpar-lidas?usuario_id=${usuarioId}`, 'DELETE');
    }
};

// =====================================================
// API HISTÓRICO (coordenador apenas)
// =====================================================

const HistoricoAPI = {
    /**
     * Lista histórico com filtros
     */
    async listar(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const queryString = params.toString();
        const endpoint = queryString ? `/historico?${queryString}` : '/historico';
        return await fazerRequisicao(endpoint);
    },

    /**
     * Busca registro de histórico por ID
     */
    async buscar(id) {
        return await fazerRequisicao(`/historico/${id}`);
    },

    /**
     * Lista histórico de um coordenador
     */
    async listarPorCoordenador(coordenadorId) {
        return await fazerRequisicao(`/historico/coordenador/${coordenadorId}`);
    },

    /**
     * Lista ações disponíveis
     */
    async acoesDisponiveis() {
        return await fazerRequisicao('/historico/acoes-disponiveis');
    },

    /**
     * Busca estatísticas do histórico
     */
    async estatisticas() {
        return await fazerRequisicao('/historico/estatisticas');
    },

    /**
     * Registra ação no histórico
     */
    async registrar(dados) {
        return await fazerRequisicao('/historico', 'POST', dados);
    },

    /**
     * Remove registro do histórico
     */
    async deletar(id) {
        return await fazerRequisicao(`/historico/${id}`, 'DELETE');
    }
};

// =====================================================
// SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL
// =====================================================

class SistemaNotificacoes {
    constructor(usuarioId) {
        this.usuarioId = usuarioId;
        this.intervalo = null;
        this.badge = null;
    }

    /**
     * Inicia monitoramento de notificações
     * @param {number} intervaloMs - Intervalo de atualização em milissegundos (padrão: 30s)
     */
    iniciar(intervaloMs = 30000) {
        // Busca elemento do badge
        this.badge = document.querySelector('.notification-badge') || 
                    document.querySelector('#notification-count');

        // Atualiza imediatamente
        this.atualizar();

        // Configura atualização periódica
        this.intervalo = setInterval(() => this.atualizar(), intervaloMs);
    }

    /**
     * Para monitoramento
     */
    parar() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
        }
    }

    /**
     * Atualiza contador de notificações
     */
    async atualizar() {
        try {
            const { contador } = await NotificacoesAPI.contarNaoLidas(this.usuarioId);
            
            if (this.badge) {
                if (contador > 0) {
                    this.badge.textContent = contador > 99 ? '99+' : contador;
                    this.badge.style.display = 'inline-block';
                    this.badge.classList.add('active');
                } else {
                    this.badge.style.display = 'none';
                    this.badge.classList.remove('active');
                }
            }

            // Evento customizado para outras partes da aplicação
            window.dispatchEvent(new CustomEvent('notificacoesAtualizadas', {
                detail: { contador }
            }));

        } catch (error) {
            console.error('Erro ao atualizar notificações:', error);
        }
    }
}

// =====================================================
// VALIDAÇÕES DE FORMULÁRIO
// =====================================================

const Validacoes = {
    /**
     * Valida email
     */
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Valida CPF (formato e dígitos)
     */
    cpf(cpf) {
        const limpo = cpf.replace(/\D/g, '');
        return limpo.length === 11;
    },

    /**
     * Valida data (formato YYYY-MM-DD)
     */
    data(data) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(data)) return false;
        
        const date = new Date(data);
        return date instanceof Date && !isNaN(date);
    },

    /**
     * Valida se data é futura
     */
    dataFutura(data) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataComparar = new Date(data);
        return dataComparar >= hoje;
    },

    /**
     * Valida período (data_inicio < data_fim)
     */
    periodo(dataInicio, dataFim) {
        return new Date(dataInicio) <= new Date(dataFim);
    },

    /**
     * Valida campo obrigatório
     */
    obrigatorio(valor) {
        return valor !== null && valor !== undefined && valor.toString().trim() !== '';
    }
};

// =====================================================
// UTILITÁRIOS
// =====================================================

const Utils = {
    /**
     * Formata data para exibição (DD/MM/YYYY)
     */
    formatarData(data) {
        const d = new Date(data);
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const ano = d.getFullYear();
        return `${dia}/${mes}/${ano}`;
    },

    /**
     * Formata data para input (YYYY-MM-DD)
     */
    formatarDataInput(data) {
        const d = new Date(data);
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    },

    /**
     * Obtém ID do usuário logado (da sessão)
     */
    obterUsuarioId() {
        // Implementar de acordo com o sistema de sessão
        // Pode ser de localStorage, sessionStorage ou cookie
        return localStorage.getItem('usuario_id') || sessionStorage.getItem('usuario_id');
    },

    /**
     * Calcula diferença em dias entre duas datas
     */
    calcularDias(dataInicio, dataFim) {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        const diff = Math.abs(fim - inicio);
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }
};

// =====================================================
// EXPORTAÇÃO (para uso em outros arquivos)
// =====================================================

// Torna disponível globalmente
window.EscalasAPI = EscalasAPI;
window.TrocasAPI = TrocasAPI;
window.FeriasAPI = FeriasAPI;
window.AtestadosAPI = AtestadosAPI;
window.NotificacoesAPI = NotificacoesAPI;
window.HistoricoAPI = HistoricoAPI;
window.SistemaNotificacoes = SistemaNotificacoes;
window.Validacoes = Validacoes;
window.Utils = Utils;
window.mostrarSucesso = mostrarSucesso;
window.mostrarErro = mostrarErro;
window.mostrarLoading = mostrarLoading;

console.log('✅ API.js carregado com sucesso!');
