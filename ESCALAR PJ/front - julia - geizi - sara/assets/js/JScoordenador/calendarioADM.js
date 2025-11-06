/**
 * CALENDÁRIO ADMINISTRADOR - Sistema Escalar
 * Carrega e renderiza calendário mensal com escalas de TODOS os colaboradores
 */

// ========================================
// MODAL DE NOTIFICAÇÕES
// ========================================

const sino = document.querySelector('g[clip-path="url(#clip0_205_352)"]');
const modal = document.getElementById('modalNotificacoes');
const fechar = document.getElementById('fecharNotificacoes');
const lista = document.getElementById('listaNotificacoes');

let notificacoes = [];
let pedidosPendentes = {
    trocas: 0,
    ferias: 0,
    atestados: 0
};

async function carregarPedidosPendentes() {
    try {
        const [resTrocas, resFerias, resAtestados] = await Promise.all([
            fetch('http://127.0.0.1:5000/api/trocas/pendentes'),
            fetch('http://127.0.0.1:5000/api/ferias/pendentes'),
            fetch('http://127.0.0.1:5000/api/atestados/pendentes')
        ]);
        
        if (resTrocas.ok) {
            const dataTrocas = await resTrocas.json();
            pedidosPendentes.trocas = dataTrocas.data?.length || 0;
        }
        
        if (resFerias.ok) {
            const dataFerias = await resFerias.json();
            pedidosPendentes.ferias = dataFerias.data?.length || 0;
        }
        
        if (resAtestados.ok) {
            const dataAtestados = await resAtestados.json();
            pedidosPendentes.atestados = dataAtestados.data?.length || 0;
        }
        
        atualizarContadorNotificacoes();
        renderNotificacoes();
        
    } catch (error) {
        console.error('Erro ao carregar pedidos pendentes:', error);
    }
}

function atualizarContadorNotificacoes() {
    const total = pedidosPendentes.trocas + pedidosPendentes.ferias + pedidosPendentes.atestados;
    
    let badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.remove();
    }
    
    if (total > 0 && sino) {
        const sinoParent = sino.closest('a');
        if (sinoParent) {
            sinoParent.style.position = 'relative';
            
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.textContent = total > 9 ? '9+' : total;
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            sinoParent.appendChild(badge);
        }
    }
}

async function carregarNotificacoes() {
    await carregarPedidosPendentes();
}

function renderNotificacoes() {
    const total = pedidosPendentes.trocas + pedidosPendentes.ferias + pedidosPendentes.atestados;
    
    if (total === 0) {
        lista.innerHTML = '<p class="text-center text-muted m-3">Sem notificações pendentes</p>';
        return;
    }
    
    let html = '<div class="p-3">';
    html += '<h6 class="mb-3 fw-bold">Solicitações Pendentes</h6>';
    
    if (pedidosPendentes.trocas > 0) {
        html += `
            <a href="solicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404;">
                <div class="fw-bold">${pedidosPendentes.trocas} ${pedidosPendentes.trocas > 1 ? 'Trocas' : 'Troca'}</div>
                <small class="text-muted">Aguardando aprovação</small>
            </a>
        `;
    }
    
    if (pedidosPendentes.ferias > 0) {
        html += `
            <a href="solicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; color: #0c5460;">
                <div class="fw-bold">${pedidosPendentes.ferias} ${pedidosPendentes.ferias > 1 ? 'Férias' : 'Férias'}</div>
                <small class="text-muted">Aguardando aprovação</small>
            </a>
        `;
    }
    
    if (pedidosPendentes.atestados > 0) {
        html += `
            <a href="solicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;">
                <div class="fw-bold">${pedidosPendentes.atestados} ${pedidosPendentes.atestados > 1 ? 'Atestados' : 'Atestado'}</div>
                <small class="text-muted">Aguardando análise</small>
            </a>
        `;
    }
    
    html += '</div>';
    lista.innerHTML = html;
}

if (sino) {
    sino.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.toggle('ativo');
        if (modal.classList.contains('ativo')) {
            carregarNotificacoes();
        }
    });
}

if (fechar) {
    fechar.addEventListener('click', () => {
        modal.classList.remove('ativo');
    });
}

document.addEventListener('click', (e) => {
    if (modal.classList.contains('ativo') && !modal.contains(e.target) && !sino.contains(e.target)) {
        modal.classList.remove('ativo');
    }
});

setInterval(carregarNotificacoes, 15000);

// ========================================
// CALENDÁRIO DINÂMICO (VISÃO ADMINISTRATIVA)
// ========================================

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let escalasDoMes = [];
let usuarioSelecionado = null; // null = todos os usuários

const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Carrega escalas do mês do backend
 * Se usuarioSelecionado for null, carrega de todos
 */
async function carregarEscalas(mes, ano) {
    try {
        let url = `${window.location.origin}/api/escalas?mes=${mes + 1}&ano=${ano}`;
        
        if (usuarioSelecionado) {
            url += `&usuario_id=${usuarioSelecionado}`;
        }
        
        const response = await fetch(url, { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            escalasDoMes = data.escalas || [];
            renderizarCalendario();
        } else {
            console.error('Erro ao carregar escalas:', response.status);
            renderizarCalendario(); // Renderiza vazio
        }
    } catch (error) {
        console.error('Erro ao carregar escalas:', error);
        renderizarCalendario(); // Renderiza vazio
    }
}

/**
 * Busca escalas de uma data específica
 * @returns {Array} Array de escalas do dia (pode ter múltiplos usuários)
 */
function getEscalasDoDia(dia) {
    const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return escalasDoMes.filter(e => e.data_plantao === dataFormatada);
}

/**
 * Renderiza o calendário completo
 */
function renderizarCalendario() {
    const calendarGrid = document.getElementById('calendar-grid');
    const mesAnoTexto = document.getElementById('mes-ano');
    
    if (!calendarGrid || !mesAnoTexto) return;
    
    // Atualiza título
    mesAnoTexto.textContent = `${mesesNomes[mesAtual]} ${anoAtual}`;
    
    // Limpa grid
    calendarGrid.innerHTML = '';
    
    // Cabeçalho dos dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'text-center fw-bold p-2';
        header.textContent = dia;
        calendarGrid.appendChild(header);
    });
    
    // Primeiro dia do mês
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    
    // Último dia do mês
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();
    
    // Células vazias antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
        const vazio = document.createElement('div');
        calendarGrid.appendChild(vazio);
    }
    
    // Dias do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const celula = document.createElement('div');
        celula.className = 'border rounded p-2 position-relative';
        celula.style.minHeight = '90px';
        celula.style.overflow = 'hidden';
        
        const escalas = getEscalasDoDia(dia);
        
        // Número do dia
        const numeroDia = document.createElement('div');
        numeroDia.className = 'fw-bold mb-1';
        numeroDia.textContent = dia;
        celula.appendChild(numeroDia);
        
        // Se houver escalas
        if (escalas.length > 0) {
            // Modo simplificado: mostra primeira escala e contador
            const primeiraEscala = escalas[0];
            const tipo = primeiraEscala.tipo || 'trabalho';
            
            // Badge com tipo
            const badge = document.createElement('span');
            badge.className = `badge bg-primary mb-1`;
            badge.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            celula.appendChild(badge);
            
            // Nome do usuário (se disponível)
            if (primeiraEscala.usuario_nome) {
                const nomeUsuario = document.createElement('small');
                nomeUsuario.className = 'd-block text-truncate';
                nomeUsuario.textContent = primeiraEscala.usuario_nome;
                celula.appendChild(nomeUsuario);
            }
            
            // Se houver mais de uma escala no mesmo dia
            if (escalas.length > 1) {
                const contador = document.createElement('span');
                contador.className = 'badge bg-secondary position-absolute top-0 end-0 m-1';
                contador.textContent = `+${escalas.length - 1}`;
                contador.title = `${escalas.length} escalas neste dia`;
                celula.appendChild(contador);
            }
            
            // Tooltip com todas as escalas do dia
            celula.title = escalas.map(e => 
                `${e.usuario_nome || 'Sem nome'}: ${e.tipo || 'trabalho'}`
            ).join('\n');
        }
        
        calendarGrid.appendChild(celula);
    }
}

/**
 * Navegação do calendário
 */
function mesAnterior() {
    mesAtual--;
    if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
    }
    carregarEscalas(mesAtual, anoAtual);
}

function proximoMes() {
    mesAtual++;
    if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
    }
    carregarEscalas(mesAtual, anoAtual);
}

function mesAtualBtn() {
    mesAtual = new Date().getMonth();
    anoAtual = new Date().getFullYear();
    carregarEscalas(mesAtual, anoAtual);
}

// Event listeners dos botões de navegação
document.addEventListener('DOMContentLoaded', () => {
    const btnAnterior = document.getElementById('btn-mes-anterior');
    const btnProximo = document.getElementById('btn-proximo-mes');
    const btnHoje = document.getElementById('btn-mes-atual');
    
    if (btnAnterior) btnAnterior.addEventListener('click', mesAnterior);
    if (btnProximo) btnProximo.addEventListener('click', proximoMes);
    if (btnHoje) btnHoje.addEventListener('click', mesAtualBtn);
    
    // Carrega calendário inicial
    carregarEscalas(mesAtual, anoAtual);
    carregarNotificacoes();
});
