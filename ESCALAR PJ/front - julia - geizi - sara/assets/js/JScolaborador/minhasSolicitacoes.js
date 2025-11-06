/**
 * MINHAS SOLICITAÇÕES - Sistema Escalar
 * Sistema de notificações para colaboradores
 */

// ========================================
// MODAL DE NOTIFICAÇÕES
// ========================================

let notificacoesColaborador = {
    trocasAceitas: [],
    trocasRecusadas: [],
    trocasSolicitadas: [],
    feriasAceitas: [],
    feriasRecusadas: [],
    atestadosAceitos: [],
    atestadosRecusados: []
};

async function carregarNotificacoesColaborador() {
    try {
        const usuario_id = localStorage.getItem('usuario_id') || 1; // TODO: pegar do login
        
        // Carregar trocas do usuário
        const [trocasRes, feriasRes, atestadosRes] = await Promise.all([
            fetch(`http://127.0.0.1:5000/api/trocas?usuario_id=${usuario_id}`),
            fetch(`http://127.0.0.1:5000/api/ferias?usuario_id=${usuario_id}`),
            fetch(`http://127.0.0.1:5000/api/atestados?usuario_id=${usuario_id}`)
        ]);
        
        if (trocasRes.ok) {
            const trocas = await trocasRes.json();
            const dados = trocas.data || trocas;
            
            // Trocas onde eu sou o solicitante
            const minhasTrocas = dados.filter(t => t.solicitante_id == usuario_id);
            notificacoesColaborador.trocasAceitas = minhasTrocas.filter(t => t.status === 'aprovada');
            notificacoesColaborador.trocasRecusadas = minhasTrocas.filter(t => t.status === 'recusada');
            
            // Trocas onde alguém me indicou como substituto
            notificacoesColaborador.trocasSolicitadas = dados.filter(t => 
                t.substituto_id == usuario_id && t.status === 'pendente'
            );
        }
        
        if (feriasRes.ok) {
            const ferias = await feriasRes.json();
            const dados = ferias.data || ferias;
            notificacoesColaborador.feriasAceitas = dados.filter(f => f.status === 'aprovada');
            notificacoesColaborador.feriasRecusadas = dados.filter(f => f.status === 'rejeitada');
        }
        
        if (atestadosRes.ok) {
            const atestados = await atestadosRes.json();
            const dados = atestados.data || atestados;
            notificacoesColaborador.atestadosAceitos = dados.filter(a => a.status === 'aceito');
            notificacoesColaborador.atestadosRecusados = dados.filter(a => a.status === 'negado');
        }
        
        atualizarBadgeColaborador();
        renderizarNotificacoesColaborador();
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
    }
}

function atualizarBadgeColaborador() {
    const total = 
        notificacoesColaborador.trocasAceitas.length +
        notificacoesColaborador.trocasRecusadas.length +
        notificacoesColaborador.trocasSolicitadas.length +
        notificacoesColaborador.feriasAceitas.length +
        notificacoesColaborador.feriasRecusadas.length +
        notificacoesColaborador.atestadosAceitos.length +
        notificacoesColaborador.atestadosRecusados.length;
    
    // Criar badge se não existir
    const sinoLink = document.querySelector('a[href="#"] svg[viewBox="0 0 37 34"]')?.parentElement;
    if (!sinoLink) return;
    
    let badge = sinoLink.querySelector('.notification-badge');
    
    if (!badge && total > 0) {
        badge = document.createElement('span');
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge';
        badge.style.cssText = 'font-size: 0.7rem;';
        sinoLink.style.position = 'relative';
        sinoLink.appendChild(badge);
    }
    
    if (badge) {
        if (total > 0) {
            badge.textContent = total > 9 ? '9+' : total;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function renderizarNotificacoesColaborador() {
    const lista = document.getElementById('listaNotificacoes');
    if (!lista) return;
    
    const total = 
        notificacoesColaborador.trocasAceitas.length +
        notificacoesColaborador.trocasRecusadas.length +
        notificacoesColaborador.trocasSolicitadas.length +
        notificacoesColaborador.feriasAceitas.length +
        notificacoesColaborador.feriasRecusadas.length +
        notificacoesColaborador.atestadosAceitos.length +
        notificacoesColaborador.atestadosRecusados.length;
    
    if (total === 0) {
        lista.innerHTML = '<p class="text-center text-muted m-3">Sem notificações</p>';
        return;
    }
    
    let html = '<div class="p-3">';
    html += '<h6 class="mb-3 fw-bold">Minhas Notificações</h6>';
    
    // Trocas solicitadas para mim (alguém quer que eu substitua)
    notificacoesColaborador.trocasSolicitadas.forEach(troca => {
        const data = new Date(troca.data_solicitada).toLocaleDateString('pt-BR');
        html += `
            <a href="trocasDisponiveis.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404;">
                <div class="fw-bold">Nova solicitação de troca</div>
                <small class="text-muted">${troca.solicitante_nome} quer trocar com você - ${data}</small>
            </a>
        `;
    });
    
    // Trocas aceitas
    notificacoesColaborador.trocasAceitas.forEach(troca => {
        const data = new Date(troca.data_solicitada).toLocaleDateString('pt-BR');
        html += `
            <a href="minhasSolicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #d1e7dd; border-left: 4px solid #198754; color: #0a3622;">
                <div class="fw-bold">✓ Troca aprovada</div>
                <small class="text-muted">Sua troca de ${data} foi aprovada</small>
            </a>
        `;
    });
    
    // Trocas recusadas
    notificacoesColaborador.trocasRecusadas.forEach(troca => {
        const data = new Date(troca.data_solicitada).toLocaleDateString('pt-BR');
        html += `
            <a href="minhasSolicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;">
                <div class="fw-bold">✗ Troca recusada</div>
                <small class="text-muted">Sua troca de ${data} foi recusada</small>
            </a>
        `;
    });
    
    // Férias aceitas
    notificacoesColaborador.feriasAceitas.forEach(ferias => {
        const inicio = new Date(ferias.data_inicio).toLocaleDateString('pt-BR');
        html += `
            <a href="minhasSolicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #d1e7dd; border-left: 4px solid #198754; color: #0a3622;">
                <div class="fw-bold">✓ Férias aprovadas</div>
                <small class="text-muted">Suas férias a partir de ${inicio} foram aprovadas</small>
            </a>
        `;
    });
    
    // Férias recusadas
    notificacoesColaborador.feriasRecusadas.forEach(ferias => {
        const inicio = new Date(ferias.data_inicio).toLocaleDateString('pt-BR');
        html += `
            <a href="minhasSolicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;">
                <div class="fw-bold">✗ Férias recusadas</div>
                <small class="text-muted">Suas férias de ${inicio} foram recusadas</small>
            </a>
        `;
    });
    
    // Atestados aceitos
    notificacoesColaborador.atestadosAceitos.forEach(atestado => {
        const inicio = new Date(atestado.data_inicio).toLocaleDateString('pt-BR');
        html += `
            <a href="minhasSolicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #d1e7dd; border-left: 4px solid #198754; color: #0a3622;">
                <div class="fw-bold">✓ Atestado aceito</div>
                <small class="text-muted">Seu atestado de ${inicio} foi aceito</small>
            </a>
        `;
    });
    
    // Atestados recusados
    notificacoesColaborador.atestadosRecusados.forEach(atestado => {
        const inicio = new Date(atestado.data_inicio).toLocaleDateString('pt-BR');
        html += `
            <a href="minhasSolicitacoes.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;">
                <div class="fw-bold">✗ Atestado negado</div>
                <small class="text-muted">Seu atestado de ${inicio} foi negado</small>
            </a>
        `;
    });
    
    html += '</div>';
    lista.innerHTML = html;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const sinoLink = document.querySelector('a[href="#"] svg[viewBox="0 0 37 34"]')?.parentElement;
    const modal = document.getElementById('modalNotificacoes');
    const fechar = document.getElementById('fecharNotificacoes');
    
    if (sinoLink && modal) {
        sinoLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.toggle('ativo');
            if (modal.classList.contains('ativo')) {
                carregarNotificacoesColaborador();
            }
        });
    }
    
    if (fechar && modal) {
        fechar.addEventListener('click', function() {
            modal.classList.remove('ativo');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (modal && sinoLink && modal.classList.contains('ativo') && 
            !modal.contains(e.target) && !sinoLink.contains(e.target)) {
            modal.classList.remove('ativo');
        }
    });
    
    // Carrega notificações inicialmente
    carregarNotificacoesColaborador();
});

// Atualiza a cada 30 segundos
setInterval(carregarNotificacoesColaborador, 30000);

console.log('✅ Sistema de notificações de minhas solicitações carregado!');
