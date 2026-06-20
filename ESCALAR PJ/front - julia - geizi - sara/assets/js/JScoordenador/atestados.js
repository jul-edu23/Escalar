/**
 * HISTÓRICO DE ATESTADOS - Sistema Escalar
 * Sistema de notificações para a página de histórico de atestados
 */

// ========================================
// MODAL DE NOTIFICAÇÕES
// ========================================

let pedidosPendentes = {
    trocas: 0,
    ferias: 0,
    atestados: 0
};

async function carregarPedidosPendentes() {
    try {
        const [trocasRes, feriasRes, atestadosRes] = await Promise.all([
            fetch('http://127.0.0.1:5000/api/trocas/pendentes'),
            fetch('http://127.0.0.1:5000/api/ferias/pendentes'),
            fetch('http://127.0.0.1:5000/api/atestados/pendentes')
        ]);

        if (trocasRes.ok) {
            const trocas = await trocasRes.json();
            pedidosPendentes.trocas = Array.isArray(trocas) ? trocas.length : (trocas.data?.length || 0);
        }

        if (feriasRes.ok) {
            const ferias = await feriasRes.json();
            pedidosPendentes.ferias = Array.isArray(ferias) ? ferias.length : (ferias.data?.length || 0);
        }

        if (atestadosRes.ok) {
            const atestados = await atestadosRes.json();
            pedidosPendentes.atestados = Array.isArray(atestados) ? atestados.length : (atestados.data?.length || 0);
        }

        atualizarBadgeNotificacoes();
        renderizarNotificacoes();
    } catch (error) {
        console.error('Erro ao carregar pedidos pendentes:', error);
    }
}

function atualizarBadgeNotificacoes() {
    const total = pedidosPendentes.trocas + pedidosPendentes.ferias + pedidosPendentes.atestados;
    const badge = document.getElementById('badgeNotificacoes');
    
    if (badge) {
        if (total > 0) {
            badge.textContent = total > 9 ? '9+' : total;
            badge.style.display = 'block';
            badge.classList.add('notification-badge');
        } else {
            badge.style.display = 'none';
            badge.classList.remove('notification-badge');
        }
    }
}

function renderizarNotificacoes() {
    const lista = document.getElementById('listaNotificacoes');
    if (!lista) return;
    
    const total = pedidosPendentes.trocas + pedidosPendentes.ferias + pedidosPendentes.atestados;

    if (total === 0) {
        lista.innerHTML = '<p class="text-center text-muted m-3">Sem notificações pendentes</p>';
        return;
    }

    let html = '<div class="p-3">';
    html += '<h6 class="mb-3 fw-bold">Solicitações Pendentes</h6>';

    if (pedidosPendentes.trocas > 0) {
        html += `
            <a href="../solicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404;">
                <div class="fw-bold">${pedidosPendentes.trocas} ${pedidosPendentes.trocas > 1 ? 'Trocas' : 'Troca'}</div>
                <small class="text-muted">Aguardando aprovação</small>
            </a>
        `;
    }

    if (pedidosPendentes.ferias > 0) {
        html += `
            <a href="../solicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; color: #0c5460;">
                <div class="fw-bold">${pedidosPendentes.ferias} ${pedidosPendentes.ferias > 1 ? 'Férias' : 'Férias'}</div>
                <small class="text-muted">Aguardando aprovação</small>
            </a>
        `;
    }

    if (pedidosPendentes.atestados > 0) {
        html += `
            <a href="../solicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;">
                <div class="fw-bold">${pedidosPendentes.atestados} ${pedidosPendentes.atestados > 1 ? 'Atestados' : 'Atestado'}</div>
                <small class="text-muted">Aguardando análise</small>
            </a>
        `;
    }

    html += '</div>';
    lista.innerHTML = html;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const sino = document.getElementById('sinoNotificacoes');
    const modal = document.getElementById('modalNotificacoes');
    const fechar = document.getElementById('fecharNotificacoes');

    if (sino && modal) {
        sino.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.toggle('ativo');
        });
    }

    if (fechar && modal) {
        fechar.addEventListener('click', function() {
            modal.classList.remove('ativo');
        });
    }

    document.addEventListener('click', function(e) {
        if (modal && sino && modal.classList.contains('ativo') && 
            !modal.contains(e.target) && !sino.contains(e.target)) {
            modal.classList.remove('ativo');
        }
    });

    // Carrega notificações
    carregarPedidosPendentes();
});

// Atualiza a cada 15 segundos
setInterval(carregarPedidosPendentes, 15000);

console.log('✅ Sistema de notificações de atestados carregado!');
