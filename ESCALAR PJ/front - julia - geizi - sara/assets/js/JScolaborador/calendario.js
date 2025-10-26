// modal de notificações

const sino = document.querySelector('g[clip-path="url(#clip0_205_352)"]');
        const modal = document.getElementById('modalNotificacoes');
        const fechar = document.getElementById('fecharNotificacoes');
        const lista = document.getElementById('listaNotificacoes');

        // Exemplo de notificações (pode ser substituído por dados vindos do servidor)
        const notificacoes = [
            { texto: 'Solicitação de troca: Aprovado', link: '#', lida: false },
            { texto: 'Atestado 20/09 a 22/09: Aceito', link: '#', lida: true },
            { texto: 'Solicitação: indique a data para reposição da troca com Maria', link: '#', lida: false },
            { texto: 'Pedido de férias para 01/09/2026 a 30/09/2026: Negado', link: '#', lida: true }
        ];

        function renderNotificacoes() {
            if (notificacoes.length === 0) {
                lista.innerHTML = '<p class="text-center text-muted m-3">Sem notificações</p>';
                return;
            }
            lista.innerHTML = notificacoes.map((n, i) => `
      <a href="${n.link}" class="d-block px-3 py-2 notificacao-item ${n.lida ? 'lida' : 'nao-lida'}" data-index="${i}">
        ${n.texto}
      </a>
    `).join('');
        }

        // alterna exibição do modal
        sino.addEventListener('click', () => {
            modal.classList.toggle('ativo');
        });

        fechar.addEventListener('click', () => {
            modal.classList.remove('ativo');
        });

        // marca notificação como lida ao clicar
        lista.addEventListener('click', (e) => {
            const item = e.target.closest('.notificacao-item');
            if (!item) return;
            const index = item.dataset.index;
            notificacoes[index].lida = true;
            renderNotificacoes();
        });

        renderNotificacoes();

// FIM DO MODAL DE NOTIFICAÇÕES