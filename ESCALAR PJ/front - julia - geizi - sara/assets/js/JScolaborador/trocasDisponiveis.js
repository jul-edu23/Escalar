/**
 * TROCAS DISPONÍVEIS - Sistema Escalar
 * Mostra solicitações de troca SEM substituto indicado para que outros colaboradores possam se oferecer
 */

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let trocasDisponiveis = [];
let usuarioLogado = null;
let trocaSelecionada = null;

// ========================================
// CARREGAR DADOS
// ========================================

async function carregarDadosUsuario() {
    const usuario_id = localStorage.getItem('usuario_id');
    if (!usuario_id) {
        window.location.href = '../login.html';
        return null;
    }
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/usuarios`);
        const usuarios = await response.json();
        usuarioLogado = usuarios.find(u => u.id == usuario_id);
        return usuarioLogado;
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        return null;
    }
}

async function carregarTrocasDisponiveis() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/trocas/disponiveis');
        const resultado = await response.json();
        
        if (resultado.success) {
            // Filtrar para não mostrar as próprias solicitações do usuário logado
            trocasDisponiveis = resultado.data.filter(troca => 
                troca.solicitante_id != usuarioLogado?.id
            );
            renderizarTrocas();
        } else {
            mostrarMensagem('Erro ao carregar trocas: ' + resultado.error, 'danger');
        }
    } catch (error) {
        console.error('Erro ao carregar trocas disponíveis:', error);
        mostrarMensagem('Erro ao conectar com o servidor', 'danger');
    }
}

// ========================================
// RENDERIZAÇÃO
// ========================================

function renderizarTrocas() {
    const container = document.querySelector('.container-cinza');
    
    if (!container) return;
    
    if (trocasDisponiveis.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 4rem; color: var(--cinza);"></i>
                <h4 class="mt-3 text-muted">Nenhuma troca disponível no momento</h4>
                <p class="text-muted">Quando algum colaborador solicitar troca sem indicar substituto, aparecerá aqui.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    trocasDisponiveis.forEach((troca, index) => {
        const dataSolicitada = new Date(troca.data_solicitada);
        const dataFormatada = dataSolicitada.toLocaleDateString('pt-BR');
        const diaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][dataSolicitada.getDay()];
        
        const fotoUrl = troca.solicitante_foto && troca.solicitante_foto !== 'default.jpg' 
            ? `../assets/img/${troca.solicitante_foto}` 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(troca.solicitante_nome)}&background=00466c&color=fff&size=80`;
        
        html += `
            <div class="pedidoSubstituir mb-4" data-troca-id="${troca.id}">
                <div class="container justify-content-center">
                    <div class="row align-items-center">
                        <!-- Foto de Perfil -->
                        <div class="col-12 col-md-6 col-lg-1 text-center mb-3 mb-lg-0">
                            <div class="fotoPerfil" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; margin: 0 auto; background: var(--cinza);">
                                <img src="${fotoUrl}" alt="${troca.solicitante_nome}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                        </div>
                        
                        <!-- Informações -->
                        <div class="col-12 col-md-6 col-lg-8 mb-3 mb-lg-0">
                            <h4 class="mb-2">Substituição Disponível</h4>
                            <p class="mb-1"><strong>Nome:</strong> <span>${troca.solicitante_nome}</span></p>
                            <p class="mb-1"><strong>Local:</strong> <span>${troca.solicitante_local}</span></p>
                            <p class="mb-1"><strong>Turno:</strong> <span>${troca.solicitante_turno}</span></p>
                            <p class="mb-0"><strong>Motivo:</strong> <span>${troca.motivo || 'Não informado'}</span></p>
                        </div>
                        
                        <!-- Data e Botão -->
                        <div class="col-12 col-md-12 col-lg-3 text-md-start text-lg-end">
                            <p class="mb-2"><strong>Data:</strong> <span>${dataFormatada}</span></p>
                            <p class="mb-3 text-muted"><small>${diaSemana}</small></p>
                            <button type="button" class="btn btn-azul mt-2 mt-md-0" onclick="abrirModalProposta(${troca.id})">
                                <i class="bi bi-arrow-left-right me-2"></i>Propor Troca
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ========================================
// MODAL - PROPOR TROCA
// ========================================

function abrirModalProposta(trocaId) {
    trocaSelecionada = trocasDisponiveis.find(t => t.id === trocaId);
    
    if (!trocaSelecionada) {
        mostrarMensagem('Troca não encontrada', 'danger');
        return;
    }
    
    const dataFormatada = new Date(trocaSelecionada.data_solicitada).toLocaleDateString('pt-BR');
    
    // Atualizar conteúdo do primeiro modal
    const modal1 = document.getElementById('exampleModalToggle');
    const bodyModal1 = modal1.querySelector('.modal-body');
    bodyModal1.innerHTML = `
        <h5>Substituir:</h5>
        <p><span>${trocaSelecionada.solicitante_nome}</span></p>
        <h5>Em:</h5>
        <p><span>${dataFormatada}</span></p>
        <h5>Local:</h5>
        <p><span>${trocaSelecionada.solicitante_local}</span></p>
        <h5>Turno:</h5>
        <p><span>${trocaSelecionada.solicitante_turno}</span></p>
        ${trocaSelecionada.motivo ? `<h5>Motivo:</h5><p><span>${trocaSelecionada.motivo}</span></p>` : ''}
    `;
    
    // Mostrar modal
    const modalBootstrap = new bootstrap.Modal(modal1);
    modalBootstrap.show();
}

async function confirmarProposta() {
    if (!trocaSelecionada || !usuarioLogado) {
        mostrarMensagem('Erro ao processar proposta', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/trocas/${trocaSelecionada.id}/propor-substituicao`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                substituto_id: usuarioLogado.id
            })
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            // Fechar modais
            const modais = document.querySelectorAll('.modal');
            modais.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            });
            
            mostrarMensagem('✅ Proposta enviada com sucesso! O coordenador será notificado.', 'success');
            
            // Recarregar lista
            await carregarTrocasDisponiveis();
        } else {
            mostrarMensagem('❌ ' + resultado.error, 'danger');
        }
    } catch (error) {
        console.error('Erro ao enviar proposta:', error);
        mostrarMensagem('Erro ao conectar com o servidor', 'danger');
    }
}

// ========================================
// UTILITÁRIOS
// ========================================

function mostrarMensagem(mensagem, tipo = 'info') {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.querySelector('.alert-flutuante');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }
    
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show alert-flutuante`;
    alerta.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alerta);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        alerta.remove();
    }, 5000);
}

// ========================================
// SISTEMA DE NOTIFICAÇÕES (PADRÃO MINHAS SOLICITAÇÕES)
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

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Carregando trocas disponíveis...');
    
    // Carregar dados do usuário logado
    await carregarDadosUsuario();
    
    if (!usuarioLogado) {
        mostrarMensagem('Erro ao carregar dados do usuário. Faça login novamente.', 'danger');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 2000);
        return;
    }
    
    // Carregar trocas disponíveis
    await carregarTrocasDisponiveis();
    
    // Configurar botão de confirmação no segundo modal
    const btnConfirmar = document.getElementById('btnConfirmarProposta');
    if (btnConfirmar) {
        btnConfirmar.onclick = confirmarProposta;
    }
    
    // Inicializar sistema de notificações
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
    
    // Carregar notificações inicialmente
    carregarNotificacoesColaborador();
    
    console.log('✅ Trocas disponíveis carregadas!');
});

// Atualizar lista de trocas a cada 60 segundos
setInterval(async () => {
    if (usuarioLogado) {
        await carregarTrocasDisponiveis();
    }
}, 60000);

// Atualizar notificações a cada 30 segundos
setInterval(carregarNotificacoesColaborador, 30000);

console.log('✅ Sistema de trocas disponíveis e notificações carregado!');