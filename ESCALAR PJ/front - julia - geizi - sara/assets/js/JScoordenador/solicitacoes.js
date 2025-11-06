/**
 * SOLICITAÇÕES - Sistema Escalar
 * Sistema de notificações para a página de solicitações
 */

// ========================================
// MODAL DE NOTIFICAÇÕES
// ========================================

const sino = document.getElementById('sinoNotificacoes');
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
        sino.style.position = 'relative';
        
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
        sino.appendChild(badge);
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
            <a href="#trocas" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404;" onclick="irParaTrocas(event)">
                <div class="fw-bold">${pedidosPendentes.trocas} ${pedidosPendentes.trocas > 1 ? 'Trocas' : 'Troca'}</div>
                <small class="text-muted">Aguardando aprovação</small>
            </a>
        `;
    }
    
    if (pedidosPendentes.ferias > 0) {
        html += `
            <a href="#ferias" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; color: #0c5460;" onclick="irParaFerias(event)">
                <div class="fw-bold">${pedidosPendentes.ferias} ${pedidosPendentes.ferias > 1 ? 'Férias' : 'Férias'}</div>
                <small class="text-muted">Aguardando aprovação</small>
            </a>
        `;
    }
    
    if (pedidosPendentes.atestados > 0) {
        html += `
            <a href="#atestados" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;" onclick="irParaAtestados(event)">
                <div class="fw-bold">${pedidosPendentes.atestados} ${pedidosPendentes.atestados > 1 ? 'Atestados' : 'Atestado'}</div>
                <small class="text-muted">Aguardando análise</small>
            </a>
        `;
    }
    
    html += '</div>';
    lista.innerHTML = html;
}

// Funções para navegar entre tabs
function irParaTrocas(e) {
    e.preventDefault();
    document.getElementById('trocas-tab').click();
    modal.classList.remove('ativo');
}

function irParaFerias(e) {
    e.preventDefault();
    document.getElementById('ferias-tab').click();
    modal.classList.remove('ativo');
}

function irParaAtestados(e) {
    e.preventDefault();
    document.getElementById('atestados-tab').click();
    modal.classList.remove('ativo');
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
    if (modal && modal.classList.contains('ativo') && !modal.contains(e.target) && sino && !sino.contains(e.target)) {
        modal.classList.remove('ativo');
    }
});

// Carrega notificações ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarNotificacoes();
});

// Atualiza a cada 15 segundos
setInterval(carregarNotificacoes, 15000);

console.log('✅ Sistema de notificações de solicitações carregado!');
