/**
 * CALENDÁRIO COORDENADOR - Sistema Escalar
 * Mostra todos os colaboradores que trabalham em cada dia
 */

console.log('📅 Carregando calendário do coordenador...');

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

let currentDate = new Date();
let todosUsuarios = [];
let todasEscalas = [];

// ========================================
// CARREGAR DADOS
// ========================================

async function carregarTodosUsuarios() {
    try {
        console.log('🔍 Buscando todos os usuários...');
        const response = await fetch('http://127.0.0.1:5000/api/usuarios');
        
        if (response.ok) {
            todosUsuarios = await response.json();
            console.log(`✅ ${todosUsuarios.length} usuários carregados`);
            return todosUsuarios;
        } else {
            console.error('❌ Erro ao carregar usuários:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        return [];
    }
}

async function carregarEscalasMes(year, month) {
    try {
        console.log(`📥 Buscando escalas de ${months[month]}/${year}...`);
        
        // Buscar escalas de TODOS os usuários do mês
        const response = await fetch(`http://127.0.0.1:5000/api/escalas?mes=${month + 1}&ano=${year}`);
        
        if (response.ok) {
            const data = await response.json();
            todasEscalas = data.escalas || [];
            console.log(`✅ ${todasEscalas.length} escalas carregadas`);
            return todasEscalas;
        } else {
            console.error('❌ Erro ao carregar escalas:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Erro ao carregar escalas:', error);
        return [];
    }
}

// ========================================
// PROCESSAMENTO DE DADOS
// ========================================

async function processarDadosDia(year, month, day) {
    const dataStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Filtrar escalas deste dia
    const escalasDoDia = todasEscalas.filter(e => e.data_plantao.startsWith(dataStr));
    
    // Buscar trocas aprovadas deste dia
    const trocasResponse = await fetch(`http://127.0.0.1:5000/api/trocas?status=aprovada`);
    let trocasDoDia = [];
    if (trocasResponse.ok) {
        const trocasData = await trocasResponse.json();
        const todasTrocas = trocasData.data || trocasData.trocas || [];
        trocasDoDia = todasTrocas.filter(t => t.data_solicitada.startsWith(dataStr));
    }
    
    // Buscar férias aprovadas que incluem este dia
    const feriasResponse = await fetch(`http://127.0.0.1:5000/api/ferias?status=aprovada`);
    let feriasDoDia = [];
    if (feriasResponse.ok) {
        const feriasData = await feriasResponse.json();
        const todasFerias = feriasData.data || feriasData.ferias || [];
        const dataAtual = new Date(year, month, day);
        feriasDoDia = todasFerias.filter(f => {
            const inicio = new Date(f.data_inicio);
            const fim = new Date(f.data_fim);
            return dataAtual >= inicio && dataAtual <= fim;
        });
    }
    
    // Buscar atestados aceitos que incluem este dia
    const atestadosResponse = await fetch(`http://127.0.0.1:5000/api/atestados?status=aceito`);
    let atestadosDoDia = [];
    if (atestadosResponse.ok) {
        const atestadosData = await atestadosResponse.json();
        const todosAtestados = atestadosData.data || atestadosData.atestados || [];
        const dataAtual = new Date(year, month, day);
        atestadosDoDia = todosAtestados.filter(a => {
            const inicio = new Date(a.data_inicio);
            const fim = new Date(a.data_fim);
            return dataAtual >= inicio && dataAtual <= fim;
        });
    }
    
    // Montar lista de colaboradores por status
    const colaboradoresPorStatus = {
        trabalho: [],
        folga: [],
        ferias: [],
        atestado: [],
        substituicao: []
    };
    
    // Processar cada escala do dia
    escalasDoDia.forEach(escala => {
        const usuario = todosUsuarios.find(u => u.id === escala.usuario_id);
        if (!usuario) return;
        
        let status = escala.tipo;
        
        // Verificar se tem atestado (prioridade máxima)
        const temAtestado = atestadosDoDia.some(a => a.usuario_id === usuario.id);
        if (temAtestado) {
            status = 'atestado';
        }
        
        // Verificar se tem férias
        const temFerias = feriasDoDia.some(f => f.usuario_id === usuario.id);
        if (temFerias && !temAtestado) {
            status = 'ferias';
        }
        
        // Verificar se tem troca
        const trocaComoSolicitante = trocasDoDia.find(t => t.solicitante_id === usuario.id);
        const trocaComoSubstituto = trocasDoDia.find(t => t.substituto_id === usuario.id);
        
        if (trocaComoSolicitante && !temFerias && !temAtestado) {
            status = 'folga'; // Foi substituído
        }
        if (trocaComoSubstituto && !temFerias && !temAtestado) {
            status = 'substituicao'; // Está substituindo
        }
        
        // Adicionar à lista do status apropriado
        if (colaboradoresPorStatus[status]) {
            colaboradoresPorStatus[status].push({
                nome: usuario.nome,
                apelido: usuario.apelido,
                turno: usuario.turno,
                local: usuario.local
            });
        }
    });
    
    return colaboradoresPorStatus;
}

// ========================================
// RENDERIZAÇÃO DO CALENDÁRIO
// ========================================

function populateSelectors() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    if (!monthSelect || !yearSelect) return;
    
    // Limpar seletores
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';
    
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Gerar lista de 7 meses (3 anteriores + atual + 3 próximos)
    for (let offset = -3; offset <= 3; offset++) {
        const data = new Date(anoAtual, mesAtual + offset, 1);
        const mes = data.getMonth();
        const ano = data.getFullYear();
        
        const option = document.createElement('option');
        option.value = JSON.stringify({ mes: mes, ano: ano });
        option.textContent = `${months[mes]} ${ano}`;
        
        if (offset === 0) {
            option.selected = true;
        }
        
        monthSelect.appendChild(option);
    }
    
    // Esconder seletor de ano (não usado)
    if (yearSelect.parentElement) {
        yearSelect.parentElement.style.display = 'none';
    }
    
    console.log('✅ Seletores populados');
}

async function generateCalendar(year, month) {
    const calendarGrid = document.getElementById('calendar-grid');
    
    if (!calendarGrid) {
        console.error('❌ Elemento calendar-grid não encontrado!');
        return;
    }
    
    // Mostrar loading
    calendarGrid.innerHTML = '<div class="text-center py-5" style="grid-column: 1 / -1;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    // Carregar dados
    await carregarTodosUsuarios();
    await carregarEscalasMes(year, month);
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    calendarGrid.innerHTML = ''; // Limpar loading
    
    // Células vazias antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarGrid.appendChild(emptyCell);
    }
    
    // Renderizar cada dia do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'border rounded p-2 bg-white';
        dayCell.style.minHeight = '120px';
        dayCell.style.cursor = 'pointer';
        
        // Número do dia
        const dayNumber = document.createElement('div');
        dayNumber.className = 'fw-bold fs-5 mb-2 text-dark';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Container para lista de colaboradores
        const colaboradoresContainer = document.createElement('div');
        colaboradoresContainer.className = 'small';
        colaboradoresContainer.style.fontSize = '0.75rem';
        
        // Processar dados do dia (inicialmente vazio, será preenchido ao clicar)
        const dataStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const escalasDoDia = todasEscalas.filter(e => e.data_plantao.startsWith(dataStr));
        
        // Mostrar preview: quantos colaboradores trabalham
        if (escalasDoDia.length > 0) {
            // Contar por tipo
            const trabalham = escalasDoDia.filter(e => e.tipo === 'trabalho' || e.tipo === 'substituicao').length;
            
            if (trabalham > 0) {
                const preview = document.createElement('div');
                preview.className = 'text-muted';
                preview.innerHTML = `<i class="bi bi-people-fill"></i> ${trabalham} ${trabalham === 1 ? 'colaborador' : 'colaboradores'}`;
                colaboradoresContainer.appendChild(preview);
            }
            
            // Adicionar nomes (primeiros 3)
            const usuarios = escalasDoDia
                .filter(e => e.tipo === 'trabalho' || e.tipo === 'substituicao')
                .slice(0, 3)
                .map(e => {
                    const usuario = todosUsuarios.find(u => u.id === e.usuario_id);
                    return usuario ? usuario.apelido || usuario.nome.split(' ')[0] : 'Desconhecido';
                });
            
            usuarios.forEach(nome => {
                const nomeDiv = document.createElement('div');
                nomeDiv.className = 'text-truncate text-primary';
                nomeDiv.textContent = `• ${nome}`;
                nomeDiv.style.fontSize = '0.7rem';
                colaboradoresContainer.appendChild(nomeDiv);
            });
            
            if (escalasDoDia.length > 3) {
                const mais = document.createElement('div');
                mais.className = 'text-muted fst-italic';
                mais.textContent = `+${escalasDoDia.length - 3} mais...`;
                mais.style.fontSize = '0.65rem';
                colaboradoresContainer.appendChild(mais);
            }
        }
        
        dayCell.appendChild(colaboradoresContainer);
        
        // Evento de clique para mostrar modal com todos os detalhes
        dayCell.addEventListener('click', () => mostrarDetalhesDia(year, month, day));
        
        calendarGrid.appendChild(dayCell);
    }
    
    console.log(`✅ Calendário gerado: ${months[month]} ${year}`);
}

function mostrarDetalhesDia(year, month, day) {
    console.log(`📅 Abrindo detalhes do dia ${day}/${month + 1}/${year}`);
    
    // Salvar data atual
    dataDiaAtual = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalhesDia'));
    modal.show();
    
    // Atualizar título
    const dataFormatada = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    const diaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const nomeDia = diaSemana[new Date(year, month, day).getDay()];
    document.getElementById('tituloDataModal').textContent = `${nomeDia}, ${dataFormatada}`;
    
    // Mostrar loading
    document.getElementById('modalLoading').classList.remove('d-none');
    document.getElementById('modalConteudo').classList.add('d-none');
    
    // Processar dados do dia
    processarEMostrarDia(year, month, day);
}

async function processarEMostrarDia(year, month, day) {
    const dataStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Filtrar escalas deste dia
    const escalasDoDia = todasEscalas.filter(e => e.data_plantao.startsWith(dataStr));
    
    console.log(`✅ ${escalasDoDia.length} escalas encontradas para ${dataStr}`);
    
    // Buscar trocas aprovadas deste dia
    let trocasDoDia = [];
    try {
        const trocasResponse = await fetch(`http://127.0.0.1:5000/api/trocas?status=aprovada`);
        if (trocasResponse.ok) {
            const trocasData = await trocasResponse.json();
            const todasTrocas = trocasData.data || trocasData.trocas || [];
            trocasDoDia = todasTrocas.filter(t => t.data_solicitada && t.data_solicitada.startsWith(dataStr));
            console.log(`✅ ${trocasDoDia.length} trocas aprovadas neste dia`);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar trocas:', error);
    }
    
    // Buscar férias aprovadas que incluem este dia
    let feriasDoDia = [];
    try {
        const feriasResponse = await fetch(`http://127.0.0.1:5000/api/ferias?status=aprovada`);
        if (feriasResponse.ok) {
            const feriasData = await feriasResponse.json();
            const todasFerias = feriasData.data || feriasData.ferias || [];
            const dataAtual = new Date(year, month, day);
            feriasDoDia = todasFerias.filter(f => {
                const inicio = new Date(f.data_inicio);
                const fim = new Date(f.data_fim);
                return dataAtual >= inicio && dataAtual <= fim;
            });
            console.log(`✅ ${feriasDoDia.length} colaboradores de férias`);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar férias:', error);
    }
    
    // Buscar atestados aceitos que incluem este dia
    let atestadosDoDia = [];
    try {
        const atestadosResponse = await fetch(`http://127.0.0.1:5000/api/atestados?status=aceito`);
        if (atestadosResponse.ok) {
            const atestadosData = await atestadosResponse.json();
            const todosAtestados = atestadosData.data || atestadosData.atestados || [];
            const dataAtual = new Date(year, month, day);
            atestadosDoDia = todosAtestados.filter(a => {
                const inicio = new Date(a.data_inicio);
                const fim = new Date(a.data_fim);
                return dataAtual >= inicio && dataAtual <= fim;
            });
            console.log(`✅ ${atestadosDoDia.length} colaboradores com atestado`);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar atestados:', error);
    }
    
    // Organizar colaboradores por status
    const colaboradoresPorStatus = {
        trabalho: [],
        folga: [],
        ferias: [],
        atestado: [],
        substituicao: []
    };
    
    // Processar cada escala do dia
    console.log(`🔍 Processando ${escalasDoDia.length} escalas...`);
    escalasDoDia.forEach(escala => {
        const usuario = todosUsuarios.find(u => u.id === escala.usuario_id);
        if (!usuario) {
            console.warn(`⚠️ Usuário não encontrado para escala ID ${escala.usuario_id}`);
            return;
        }
        
        let status = escala.tipo;
        let observacao = '';
        
        console.log(`👤 Processando ${usuario.nome} - tipo original: ${escala.tipo}`);
        
        // Verificar se tem atestado (prioridade máxima)
        const atestado = atestadosDoDia.find(a => a.usuario_id === usuario.id);
        if (atestado) {
            status = 'atestado';
            observacao = `CID: ${atestado.motivo || 'Não informado'}`;
            console.log(`  ✅ Atestado aplicado`);
        }
        
        // Verificar se tem férias
        const ferias = feriasDoDia.find(f => f.usuario_id === usuario.id);
        if (ferias && !atestado) {
            status = 'ferias';
            const inicio = new Date(ferias.data_inicio).toLocaleDateString('pt-BR');
            const fim = new Date(ferias.data_fim).toLocaleDateString('pt-BR');
            observacao = `Período: ${inicio} a ${fim}`;
            console.log(`  ✅ Férias aplicadas`);
        }
        
        // Verificar se tem troca
        const trocaComoSolicitante = trocasDoDia.find(t => t.solicitante_id === usuario.id);
        const trocaComoSubstituto = trocasDoDia.find(t => t.substituto_id === usuario.id);
        
        if (trocaComoSolicitante && !ferias && !atestado) {
            status = 'folga';
            const substituto = todosUsuarios.find(u => u.id === trocaComoSolicitante.substituto_id);
            observacao = substituto ? `Substituído por ${substituto.nome}` : 'Foi substituído';
            console.log(`  ✅ Troca aplicada (solicitante)`);
        }
        if (trocaComoSubstituto && !ferias && !atestado) {
            status = 'substituicao';
            const solicitante = todosUsuarios.find(u => u.id === trocaComoSubstituto.solicitante_id);
            observacao = solicitante ? `Substituindo ${solicitante.nome}` : 'Fazendo substituição';
            console.log(`  ✅ Troca aplicada (substituto)`);
        }
        
        console.log(`  📊 Status final: ${status}`);
        
        // Adicionar à lista do status apropriado
        if (colaboradoresPorStatus[status]) {
            colaboradoresPorStatus[status].push({
                id: usuario.id,
                nome: usuario.nome,
                apelido: usuario.apelido,
                turno: usuario.turno,
                local: usuario.local,
                escala: usuario.escala,
                observacao: observacao
            });
        } else {
            console.error(`❌ Status "${status}" não reconhecido!`);
        }
    });
    
    console.log('📊 Resultado final por status:', {
        trabalho: colaboradoresPorStatus.trabalho.length,
        folga: colaboradoresPorStatus.folga.length,
        ferias: colaboradoresPorStatus.ferias.length,
        atestado: colaboradoresPorStatus.atestado.length,
        substituicao: colaboradoresPorStatus.substituicao.length
    });
    
    // Renderizar no modal
    renderizarModalDetalhes(colaboradoresPorStatus);
}

function renderizarModalDetalhes(dados) {
    // Salvar dados para exportação
    dadosDiaAtual = dados;
    
    // Contar totais
    const totalTrabalho = dados.trabalho.length;
    const totalFolga = dados.folga.length;
    const totalFerias = dados.ferias.length;
    const totalAtestado = dados.atestado.length;
    const totalSubstituicao = dados.substituicao.length;
    const total = totalTrabalho + totalFolga + totalFerias + totalAtestado + totalSubstituicao;
    
    // Atualizar resumo
    document.getElementById('resumoTotal').textContent = `${total} ${total === 1 ? 'colaborador' : 'colaboradores'}`;
    
    // Atualizar badges
    document.getElementById('countTrabalho').textContent = totalTrabalho;
    document.getElementById('countFolga').textContent = totalFolga;
    document.getElementById('countFerias').textContent = totalFerias;
    document.getElementById('countAtestado').textContent = totalAtestado;
    document.getElementById('countSubstituicao').textContent = totalSubstituicao;
    
    // Renderizar listas
    renderizarListaColaboradores('listaTrabalho', dados.trabalho, 'trabalho');
    renderizarListaColaboradores('listaFolga', dados.folga, 'folga');
    renderizarListaColaboradores('listaFerias', dados.ferias, 'ferias');
    renderizarListaColaboradores('listaAtestado', dados.atestado, 'atestado');
    renderizarListaColaboradores('listaSubstituicao', dados.substituicao, 'substituicao');
    
    // Esconder loading, mostrar conteúdo
    document.getElementById('modalLoading').classList.add('d-none');
    document.getElementById('modalConteudo').classList.remove('d-none');
}

function renderizarListaColaboradores(elementId, colaboradores, tipo) {
    const container = document.getElementById(elementId);
    
    if (colaboradores.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4"><i class="bi bi-inbox"></i> Nenhum colaborador neste status</p>';
        return;
    }
    
    // Ordenar por nome
    colaboradores.sort((a, b) => a.nome.localeCompare(b.nome));
    
    let html = '<div class="list-group">';
    
    colaboradores.forEach(colab => {
        const icone = getIconePorStatus(tipo);
        const corBadge = getCorBadgePorStatus(tipo);
        
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">
                            ${icone} ${colab.nome}
                            ${colab.apelido ? `<span class="text-muted small">(${colab.apelido})</span>` : ''}
                        </h6>
                        <div class="small text-muted">
                            <i class="bi bi-clock"></i> ${colab.turno || 'Não informado'} • 
                            <i class="bi bi-geo-alt"></i> ${colab.local || 'Não informado'} • 
                            <i class="bi bi-calendar2-week"></i> ${colab.escala || 'Não informado'}
                        </div>
                        ${colab.observacao ? `<p class="mb-0 mt-2 small"><i class="bi bi-info-circle"></i> ${colab.observacao}</p>` : ''}
                    </div>
                    <span class="badge ${corBadge} ms-2">${tipo.toUpperCase()}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function getIconePorStatus(status) {
    const icones = {
        'trabalho': '<i class="bi bi-briefcase-fill text-primary"></i>',
        'folga': '<i class="bi bi-moon-fill text-secondary"></i>',
        'ferias': '<i class="bi bi-airplane-fill text-info"></i>',
        'atestado': '<i class="bi bi-file-medical-fill text-warning"></i>',
        'substituicao': '<i class="bi bi-arrow-repeat text-warning"></i>'
    };
    return icones[status] || '<i class="bi bi-person"></i>';
}

function getCorBadgePorStatus(status) {
    const cores = {
        'trabalho': 'bg-primary',
        'folga': 'bg-secondary',
        'ferias': 'bg-info',
        'atestado': 'bg-warning',
        'substituicao': 'bg-warning'
    };
    return cores[status] || 'bg-secondary';
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Variável global para armazenar dados do dia atual do modal
let dadosDiaAtual = null;
let dataDiaAtual = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Calendário Coordenador inicializado');
    
    // Inicializar seletores e calendário
    populateSelectors();
    await generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    
    // Event listener do seletor de mês
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        monthSelect.addEventListener('change', () => {
            const selecionado = JSON.parse(monthSelect.value);
            currentDate.setMonth(selecionado.mes);
            currentDate.setFullYear(selecionado.ano);
            generateCalendar(selecionado.ano, selecionado.mes);
        });
    }
    
    // Event listener do botão de exportar
    const btnExportar = document.getElementById('btnExportarDia');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarDadosDia);
    }
});

// ========================================
// EXPORTAÇÃO
// ========================================

function exportarDadosDia() {
    if (!dadosDiaAtual || !dataDiaAtual) {
        alert('Nenhum dado para exportar!');
        return;
    }
    
    console.log('📤 Exportando dados do dia...');
    
    // Preparar dados para exportação
    let texto = `RELATÓRIO DE ESCALAS - ${dataDiaAtual}\n`;
    texto += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    texto += `${'='.repeat(80)}\n\n`;
    
    // Adicionar cada categoria
    const categorias = [
        { nome: 'TRABALHO', dados: dadosDiaAtual.trabalho },
        { nome: 'FOLGA', dados: dadosDiaAtual.folga },
        { nome: 'FÉRIAS', dados: dadosDiaAtual.ferias },
        { nome: 'ATESTADO', dados: dadosDiaAtual.atestado },
        { nome: 'SUBSTITUIÇÃO', dados: dadosDiaAtual.substituicao }
    ];
    
    categorias.forEach(cat => {
        if (cat.dados.length > 0) {
            texto += `\n${cat.nome} (${cat.dados.length}):\n`;
            texto += `${'-'.repeat(80)}\n`;
            
            cat.dados.forEach((colab, index) => {
                texto += `${index + 1}. ${colab.nome}\n`;
                texto += `   Turno: ${colab.turno || 'Não informado'}\n`;
                texto += `   Local: ${colab.local || 'Não informado'}\n`;
                texto += `   Escala: ${colab.escala || 'Não informado'}\n`;
                if (colab.observacao) {
                    texto += `   Obs: ${colab.observacao}\n`;
                }
                texto += '\n';
            });
        }
    });
    
    // Calcular total
    const total = categorias.reduce((sum, cat) => sum + cat.dados.length, 0);
    texto += `\n${'='.repeat(80)}\n`;
    texto += `TOTAL: ${total} colaboradores\n`;
    
    // Criar arquivo e fazer download
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escalas_${dataDiaAtual.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Arquivo exportado com sucesso!');
}

// ========================================
// SISTEMA DE NOTIFICAÇÕES (PADRÃO QUADRO COLABORADORES)
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

// Carrega notificações ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarNotificacoes();
});

// Atualiza a cada 15 segundos
setInterval(carregarNotificacoes, 15000);

console.log('✅ Sistema de calendário do coordenador carregado!');
