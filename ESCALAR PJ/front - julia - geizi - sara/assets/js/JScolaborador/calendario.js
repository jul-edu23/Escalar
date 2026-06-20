/**
 * CALENDÁRIO COLABORADOR - Sistema Escalar
 * Renderização do calendário mensal + Sistema de notificações + Google Calendar API
 */

console.log('📅 Carregando calendario.js...');

// ========================================
// CONFIGURAÇÃO GOOGLE CALENDAR API
// ========================================

const CLIENT_ID = '285030217849-bfh23rvicr0ciiuvrjgkvnkrboicvvca.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

console.log('🔑 CLIENT_ID configurado:', CLIENT_ID);

let tokenClient;
let isSignedIn = false;
let gapiInited = false;
let gisInited = false;

// ========================================
// VARIÁVEIS GLOBAIS E DADOS
// ========================================

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const statusClasses = {
    'trabalho': 'escalar-trabalho',
    'folga': 'escalar-folga',
    'falta': 'escalar-falta',
    'ferias': 'escalar-ferias',
    'substituicao': 'escalar-substituicao',
    'atestado': 'escalar-atestado',
};

// Mapeamento de tipos para cores do Google Calendar
const statusColors = {
    'trabalho': '9', // Azul forte
    'folga': '8', // Roxo
    'falta': '11', // Vermelho
    'ferias': '7', // Ciano
    'substituicao': '5', // Amarelo
    'atestado': '6', // Laranja
};

let currentDate = new Date();
let usuarioData = null;

// Dados de demonstração (usados quando não há usuário logado)
const mockScheduleData = {
    '2025-11-01': 'trabalho', '2025-11-02': 'trabalho', '2025-11-03': 'folga',
    '2025-11-04': 'trabalho', '2025-11-05': 'trabalho', '2025-11-06': 'trabalho',
    '2025-11-07': 'trabalho', '2025-11-08': 'folga', '2025-11-09': 'trabalho',
    '2025-11-10': 'trabalho', '2025-11-11': 'trabalho', '2025-11-12': 'trabalho',
    '2025-11-13': 'folga', '2025-11-14': 'trabalho', '2025-11-15': 'trabalho',
    '2025-11-16': 'trabalho', '2025-11-17': 'folga', '2025-11-18': 'trabalho',
    '2025-11-19': 'trabalho', '2025-11-20': 'trabalho', '2025-11-21': 'folga',
    '2025-11-22': 'trabalho', '2025-11-23': 'trabalho', '2025-11-24': 'trabalho',
    '2025-11-25': 'ferias', '2025-11-26': 'ferias', '2025-11-27': 'ferias',
    '2025-11-28': 'ferias', '2025-11-29': 'substituicao', '2025-11-30': 'trabalho',
    '2025-12-01': 'trabalho', '2025-12-02': 'atestado', '2025-12-03': 'atestado',
};

// ========================================
// INICIALIZAÇÃO GOOGLE CALENDAR API
// ========================================

// Criar objeto global para as funções de inicialização
window.initGoogleCalendar = {
    gapiLoaded: function() {
        console.log('📡 gapiLoaded() do calendario.js chamada');
        
        // Verificar se gapi está disponível
        if (typeof gapi === 'undefined') {
            console.error('❌ GAPI não está definido! Script não carregou corretamente.');
            return;
        }
        
        console.log('✅ GAPI disponível:', gapi);
        gapi.load('client', initializeGapiClient);
    },
    
    gisLoaded: function() {
        console.log('📡 gisLoaded() do calendario.js chamada');
        
        // Verificar se google está disponível
        if (typeof google === 'undefined') {
            console.error('❌ Google Accounts não está definido! Script não carregou corretamente.');
            return;
        }
        
        console.log('✅ Google Accounts disponível:', google);
        
        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        updateSigninStatus(true);
                        console.log('✅ Login Google bem-sucedido');
                    } else {
                        console.error('Falha ao obter token do Google');
                        updateSigninStatus(false);
                    }
                },
            });
            gisInited = true;
            console.log('✅ GIS inicializado');
            maybeEnableButtons();
        } catch (error) {
            console.error('❌ Erro ao inicializar tokenClient:', error);
        }
    }
};

async function initializeGapiClient() {
    try {
        console.log('🔧 Inicializando GAPI client...');
        await gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });
        gapiInited = true;
        console.log('✅ GAPI client inicializado');
        maybeEnableButtons();
    } catch (error) {
        console.error('❌ Erro ao inicializar GAPI:', error);
    }
}

function maybeEnableButtons() {
    console.log('🔄 maybeEnableButtons chamada:', { gapiInited, gisInited });
    
    if (gapiInited && gisInited) {
        try {
            const existingToken = gapi.client.getToken();
            updateSigninStatus(existingToken !== null);
            console.log('✅ Google APIs inicializadas - Botões habilitados');
        } catch (error) {
            console.error('❌ Erro ao verificar token:', error);
            updateSigninStatus(false);
        }
    } else {
        console.log('⏳ Aguardando APIs: GAPI=' + gapiInited + ', GIS=' + gisInited);
    }
}

function updateSigninStatus(signedIn) {
    isSignedIn = signedIn;
    const authButton = document.getElementById('authorize_button');
    const signoutButton = document.getElementById('signout_button');
    
    console.log('🔄 Atualizando status de login:', { 
        signedIn, 
        authButton: !!authButton, 
        signoutButton: !!signoutButton 
    });
    
    if (authButton && signoutButton) {
        if (isSignedIn) {
            authButton.style.display = 'none';
            signoutButton.style.display = 'inline-block';
            console.log('✅ Usuário logado no Google - Mostrando botão Logout');
            console.log('🔄 Iniciando sincronização com Google Calendar...');
        } else {
            authButton.style.display = 'inline-block';
            signoutButton.style.display = 'none';
            console.log('⚠️ Usuário não logado no Google - Mostrando botão Login');
        }
    } else {
        console.error('❌ Botões não encontrados no DOM!', { authButton, signoutButton });
    }
    
    if (isSignedIn) {
        // Recarregar calendário e sincronizar com Google Calendar
        console.log('🔄 Recarregando calendário para sincronizar...');
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        
        // Exibir Google Calendar embutido
        exibirGoogleCalendarEmbutido();
    } else {
        // Voltar ao calendário HTML
        ocultarGoogleCalendarEmbutido();
    }
}

async function exibirGoogleCalendarEmbutido() {
    try {
        console.log('📅 Configurando Google Calendar embutido...');
        
        // Criar calendário "Escalar - Plantões" e sincronizar eventos
        let calendarId = await getOrCreateEscalarCalendar();
        
        if (!calendarId) {
            console.error('❌ Não foi possível obter ID do calendário');
            return;
        }
        
        console.log('✅ Calendário ID obtido:', calendarId);
        
        // Sincronizar eventos antes de exibir
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const scheduleData = await fetchScheduleData(year, month);
        await sincronizarComGoogleCalendar(year, month, scheduleData);
        
        // Construir URL do iframe do Google Calendar
        const iframeSrc = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America/Sao_Paulo&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0`;
        
        // Atualizar iframe
        const iframe = document.getElementById('google-calendar-iframe');
        const container = document.getElementById('google-calendar-container');
        const loading = document.getElementById('calendar-loading');
        const fallback = document.getElementById('html-calendar-fallback');
        
        if (iframe && container) {
            iframe.src = iframeSrc;
            container.style.display = 'block';
            if (loading) loading.style.display = 'none';
            if (fallback) fallback.style.display = 'none';
            console.log('✅ Google Calendar embutido exibido!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao exibir Google Calendar embutido:', error);
    }
}

function ocultarGoogleCalendarEmbutido() {
    const container = document.getElementById('google-calendar-container');
    const loading = document.getElementById('calendar-loading');
    const fallback = document.getElementById('html-calendar-fallback');
    
    if (container) container.style.display = 'none';
    if (loading) loading.style.display = 'block';
    if (fallback) fallback.style.display = 'block';
    
    console.log('📅 Voltando ao calendário HTML');
}

function handleAuthClick() {
    if (!isSignedIn && tokenClient) {
        tokenClient.requestAccessToken();
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken(null);
        updateSigninStatus(false);
        console.log('✅ Logout Google realizado');
        
        // Recarregar calendário HTML
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    }
}

// ========================================
// FUNÇÕES DE INTEGRAÇÃO COM BACKEND
// ========================================

async function carregarDadosUsuario() {
    try {
        const usuario_id = localStorage.getItem('usuario_id');
        
        if (!usuario_id) {
            console.warn('⚠️ usuario_id não encontrado no localStorage. Calendário funcionará em modo demonstração.');
            return null;
        }
        
        // A API /api/usuarios retorna TODOS os usuários, precisamos filtrar
        const response = await fetch(`http://127.0.0.1:5000/api/usuarios`);
        
        if (response.ok) {
            const usuarios = await response.json();
            
            // Encontrar o usuário pelo ID
            usuarioData = usuarios.find(u => u.id == usuario_id);
            
            if (usuarioData) {
                console.log('✅ Dados do usuário carregados:', usuarioData);
                return usuarioData;
            } else {
                console.warn(`⚠️ Usuário ${usuario_id} não encontrado na lista.`);
                console.log('ℹ️ Calendário funcionará em modo demonstração com dados de exemplo.');
                return null;
            }
        } else {
            console.warn(`⚠️ Erro ao buscar usuários. Status: ${response.status}`);
            console.log('ℹ️ Calendário funcionará em modo demonstração.');
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        console.log('ℹ️ Calendário funcionará em modo demonstração.');
        return null;
    }
}

async function fetchScheduleData(year, month) {
    const usuario_id = localStorage.getItem('usuario_id');
    
    // Se não houver usuário logado, usar dados mock
    if (!usuario_id) {
        console.log('ℹ️ Usando dados de demonstração (nenhum usuário logado)');
        return mockScheduleData;
    }
    
    let scheduleData = {};
    
    try {
        // 1. Buscar escalas do backend
        const escalasResponse = await fetch(
            `http://127.0.0.1:5000/api/escalas?usuario_id=${usuario_id}&mes=${month + 1}&ano=${year}`
        );
        
        if (escalasResponse.ok) {
            const escalasData = await escalasResponse.json();
            const escalas = escalasData.data || escalasData.escalas || [];
            
            escalas.forEach(escala => {
                const data = escala.data_plantao.split('T')[0]; // Formato: YYYY-MM-DD
                scheduleData[data] = escala.tipo;
            });
            
            console.log(`✅ ${escalas.length} escalas carregadas do backend`);
        } else {
            console.warn('⚠️ Nenhuma escala encontrada, usando dados de demonstração');
            return mockScheduleData;
        }
        
        // 2. Buscar férias aprovadas
        const feriasResponse = await fetch(
            `http://127.0.0.1:5000/api/ferias?usuario_id=${usuario_id}&status=aprovada`
        );
        
        if (feriasResponse.ok) {
            const feriasData = await feriasResponse.json();
            const ferias = feriasData.data || [];
            
            ferias.forEach(f => {
                const inicio = new Date(f.data_inicio);
                const fim = new Date(f.data_fim);
                
                // Marcar todos os dias entre início e fim como férias
                for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
                    const dataStr = d.toISOString().split('T')[0];
                    scheduleData[dataStr] = 'ferias';
                }
            });
        }
        
        // 3. Buscar atestados aceitos
        const atestadosResponse = await fetch(
            `http://127.0.0.1:5000/api/atestados?usuario_id=${usuario_id}&status=aceito`
        );
        
        if (atestadosResponse.ok) {
            const atestadosData = await atestadosResponse.json();
            const atestados = atestadosData.data || [];
            
            atestados.forEach(a => {
                const inicio = new Date(a.data_inicio);
                const fim = new Date(a.data_fim);
                
                // Marcar todos os dias entre início e fim como atestado
                for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
                    const dataStr = d.toISOString().split('T')[0];
                    scheduleData[dataStr] = 'atestado';
                }
            });
        }
        
        // 4. Buscar trocas aprovadas onde o usuário é solicitante
        const trocasResponse = await fetch(
            `http://127.0.0.1:5000/api/trocas?usuario_id=${usuario_id}&status=aprovada`
        );
        
        if (trocasResponse.ok) {
            const trocasData = await trocasResponse.json();
            const trocas = trocasData.data || [];
            
            trocas.forEach(t => {
                if (t.solicitante_id == usuario_id) {
                    const dataStr = t.data_solicitada.split('T')[0];
                    scheduleData[dataStr] = 'folga'; // O solicitante folga no dia trocado
                } else if (t.substituto_id == usuario_id) {
                    const dataStr = t.data_solicitada.split('T')[0];
                    scheduleData[dataStr] = 'substituicao'; // O substituto trabalha
                }
            });
        }
        
        console.log(`✅ Dados do calendário carregados para ${months[month]}/${year}:`, Object.keys(scheduleData).length, 'dias');
        
        // Se não houver dados do backend, usar mock
        if (Object.keys(scheduleData).length === 0) {
            console.log('ℹ️ Nenhum dado encontrado no backend, usando dados de demonstração');
            return mockScheduleData;
        }
        
        return scheduleData;
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados do calendário:', error);
        console.log('ℹ️ Usando dados de demonstração devido a erro');
        return mockScheduleData;
    }
}

async function sincronizarComGoogleCalendar(year, month, scheduleData) {
    if (!isSignedIn) {
        console.log('⚠️ Usuário não está logado no Google Calendar - Sincronização cancelada');
        return;
    }
    
    console.log('🔄 Iniciando sincronização com Google Calendar...');
    console.log('📅 Dados para sincronizar:', Object.keys(scheduleData).length, 'dias');
    
    try {
        // Buscar ou criar calendário "Escalar"
        console.log('🔍 Buscando calendário "Escalar - Plantões"...');
        let calendarId = await getOrCreateEscalarCalendar();
        
        if (!calendarId) {
            console.error('❌ Não foi possível criar/encontrar o calendário Escalar');
            return;
        }
        
        console.log('✅ Calendário encontrado/criado:', calendarId);
        
        // Contador de eventos
        let eventosNovos = 0;
        let eventosExistentes = 0;
        
        // Sincronizar eventos
        for (const [data, tipo] of Object.entries(scheduleData)) {
            const [y, m, d] = data.split('-').map(Number);
            
            // Verificar se o evento já existe
            const eventExists = await checkEventExists(calendarId, data, tipo);
            
            if (!eventExists) {
                await createCalendarEvent(calendarId, data, tipo);
                eventosNovos++;
                console.log(`✅ Evento criado: ${data} - ${getTipoNome(tipo)}`);
            } else {
                eventosExistentes++;
            }
        }
        
        console.log('✅ Sincronização com Google Calendar concluída!');
        console.log(`📊 Novos eventos: ${eventosNovos}, Já existentes: ${eventosExistentes}`);
        
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        console.error('Detalhes:', error.message, error.stack);
    }
}

async function getOrCreateEscalarCalendar() {
    try {
        console.log('📋 Listando calendários do usuário...');
        
        // Listar calendários existentes
        const response = await gapi.client.calendar.calendarList.list();
        const calendars = response.result.items || [];
        
        console.log(`✅ ${calendars.length} calendários encontrados`);
        
        // Procurar calendário "Escalar"
        const escalarCalendar = calendars.find(cal => cal.summary === 'Escalar - Plantões');
        
        if (escalarCalendar) {
            console.log('✅ Calendário "Escalar - Plantões" já existe:', escalarCalendar.id);
            return escalarCalendar.id;
        }
        
        console.log('ℹ️ Calendário "Escalar - Plantões" não encontrado, criando...');
        
        // Criar novo calendário
        const newCalendar = await gapi.client.calendar.calendars.insert({
            resource: {
                summary: 'Escalar - Plantões',
                description: 'Calendário de escalas e plantões do sistema Escalar',
                timeZone: 'America/Sao_Paulo'
            }
        });
        
        console.log('✅ Calendário "Escalar - Plantões" criado com sucesso!');
        return newCalendar.result.id;
        
    } catch (error) {
        console.error('Erro ao buscar/criar calendário:', error);
        return null;
    }
}

async function checkEventExists(calendarId, date, tipo) {
    try {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        const response = await gapi.client.calendar.events.list({
            calendarId: calendarId,
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true
        });
        
        const events = response.result.items || [];
        return events.some(event => event.summary && event.summary.includes(getTipoNome(tipo)));
        
    } catch (error) {
        console.error('Erro ao verificar evento:', error);
        return false;
    }
}

async function createCalendarEvent(calendarId, date, tipo) {
    try {
        const tipoNome = getTipoNome(tipo);
        const descricao = getTipoDescricao(tipo);
        
        console.log(`📝 Criando evento: ${tipoNome} em ${date}...`);
        
        const event = {
            summary: `${tipoNome}`,
            description: descricao,
            start: {
                date: date, // Evento de dia inteiro
            },
            end: {
                date: date,
            },
            colorId: statusColors[tipo] || '1',
        };
        
        const response = await gapi.client.calendar.events.insert({
            calendarId: calendarId,
            resource: event
        });
        
        console.log(`✅ Evento criado com sucesso: ${tipoNome} em ${date}`);
        return response;
        
    } catch (error) {
        console.error(`❌ Erro ao criar evento ${getTipoNome(tipo)} em ${date}:`, error);
        console.error('Detalhes do erro:', error.message);
        throw error;
    }
}

function getTipoNome(tipo) {
    const nomes = {
        'trabalho': '🔵 Plantão',
        'folga': '🟣 Folga',
        'falta': '🔴 Falta',
        'ferias': '🔵 Férias',
        'substituicao': '🟡 Substituição',
        'atestado': '🟠 Atestado Médico'
    };
    return nomes[tipo] || tipo;
}

function getTipoDescricao(tipo) {
    const descricoes = {
        'trabalho': 'Dia de trabalho/plantão normal conforme escala',
        'folga': 'Dia de folga conforme escala',
        'falta': 'Falta não justificada',
        'ferias': 'Período de férias aprovado',
        'substituicao': 'Substituição de plantão (troca aprovada)',
        'atestado': 'Atestado médico aceito'
    };
    return descricoes[tipo] || '';
}

// ========================================
// FUNÇÕES DO CALENDÁRIO
// ========================================

function populateSelectors() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    if (!monthSelect || !yearSelect) {
        console.warn('Seletores de mês/ano não encontrados');
        return;
    }
    
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';
    
    // Preencher meses
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Preencher anos
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    monthSelect.value = currentDate.getMonth();
    yearSelect.value = currentDate.getFullYear();
}

async function generateCalendar(year, month) {
    const calendarGrid = document.getElementById('calendar-grid');
    
    if (!calendarGrid) {
        console.error('calendar-grid não encontrado');
        return;
    }
    
    calendarGrid.innerHTML = '<div class="col-span-7 text-center">Carregando...</div>';
    
    const scheduleData = await fetchScheduleData(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = ''; // Limpar loading

    // Células vazias antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.style.minHeight = '70px';
        calendarGrid.appendChild(emptyCell);
    }

    // Renderizar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const status = scheduleData[dateString];
        const statusClass = status ? statusClasses[status] : 'bg-white border';

        dayCell.className = `rounded p-2 fw-bold fs-5 shadow-sm ${statusClass} d-flex align-items-center justify-content-center`;
        dayCell.style.minHeight = '70px';
        dayCell.style.cursor = status ? 'pointer' : 'default';
        dayCell.textContent = day;
        
        // Tooltip com informações
        if (status) {
            dayCell.title = getTipoNome(status);
        }
        
        calendarGrid.appendChild(dayCell);
    }
    
    console.log(`✅ Calendário gerado: ${months[month]} ${year}`);
    
    // Sincronizar com Google Calendar se estiver logado
    console.log('🔍 Verificando se deve sincronizar com Google...', { isSignedIn });
    if (isSignedIn) {
        console.log('✅ Usuário está logado no Google - Iniciando sincronização...');
        await sincronizarComGoogleCalendar(year, month, scheduleData);
    } else {
        console.log('⚠️ Usuário não está logado no Google - Sincronização pulada');
    }
}

// ========================================
// SISTEMA DE NOTIFICAÇÕES
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
        const usuario_id = localStorage.getItem('usuario_id') || 1;
        
        const [trocasRes, feriasRes, atestadosRes] = await Promise.all([
            fetch(`http://127.0.0.1:5000/api/trocas?usuario_id=${usuario_id}`),
            fetch(`http://127.0.0.1:5000/api/ferias?usuario_id=${usuario_id}`),
            fetch(`http://127.0.0.1:5000/api/atestados?usuario_id=${usuario_id}`)
        ]);
        
        if (trocasRes.ok) {
            const trocas = await trocasRes.json();
            const dados = trocas.data || trocas;
            
            const minhasTrocas = dados.filter(t => t.solicitante_id == usuario_id);
            notificacoesColaborador.trocasAceitas = minhasTrocas.filter(t => t.status === 'aprovada');
            notificacoesColaborador.trocasRecusadas = minhasTrocas.filter(t => t.status === 'recusada');
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
    
    // Trocas solicitadas
    notificacoesColaborador.trocasSolicitadas.forEach(troca => {
        const data = new Date(troca.data_solicitada).toLocaleDateString('pt-BR');
        html += `
            <a href="trocasDisponiveis.html" class="d-block px-3 py-2 mb-2 rounded text-decoration-none notificacao-item" style="background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404;">
                <div class="fw-bold">🔔 Nova solicitação de troca</div>
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
    console.log('🚀 Calendário Colaborador inicializado');
    console.log('🔍 Verificando botões do Google:', {
        authButton: !!document.getElementById('authorize_button'),
        signoutButton: !!document.getElementById('signout_button')
    });
    
    // Verificar se há usuário logado
    const usuario_id = localStorage.getItem('usuario_id');
    const alertDemo = document.getElementById('alertDemo');
    
    if (!usuario_id) {
        console.warn('⚠️ ===== ATENÇÃO =====');
        console.warn('⚠️ Nenhum usuário logado!');
        console.warn('⚠️ Para fazer login, execute no console:');
        console.warn('   localStorage.setItem("usuario_id", "1")');
        console.warn('   location.reload()');
        console.warn('⚠️ IDs disponíveis: 1 a 36');
        console.warn('⚠️ O calendário funcionará em modo demonstração.');
        console.warn('⚠️ ====================');
        
        // Mostrar alerta de demonstração
        if (alertDemo) alertDemo.style.display = 'block';
    } else {
        console.log(`✅ Usuário logado com ID: ${usuario_id}`);
        
        // Ocultar alerta de demonstração
        if (alertDemo) alertDemo.style.display = 'none';
    }
    
    // Carregar dados do usuário
    await carregarDadosUsuario();
    
    // Inicializar calendário
    populateSelectors();
    await generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    
    // Event listeners dos seletores
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    if (monthSelect) {
        monthSelect.addEventListener('change', () => {
            currentDate.setMonth(monthSelect.value);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }
    
    if (yearSelect) {
        yearSelect.addEventListener('change', () => {
            currentDate.setFullYear(yearSelect.value);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }
    
    // Event listeners para Google Calendar
    const authButton = document.getElementById('authorize_button');
    const signoutButton = document.getElementById('signout_button');
    
    if (authButton) {
        authButton.addEventListener('click', handleAuthClick);
    }
    
    if (signoutButton) {
        signoutButton.addEventListener('click', handleSignoutClick);
    }
    
    // Verificação periódica se as APIs do Google carregaram (retry mechanism)
    let retryCount = 0;
    const maxRetries = 10; // 10 tentativas = 10 segundos
    
    const checkGoogleAPIs = setInterval(() => {
        retryCount++;
        console.log(`🔄 Tentativa ${retryCount}/${maxRetries} - Verificando APIs do Google...`);
        
        if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
            console.log('✅ APIs do Google detectadas! Inicializando...');
            clearInterval(checkGoogleAPIs);
            
            // Forçar inicialização manual se ainda não foi feita
            if (!gapiInited && window.initGoogleCalendar) {
                console.log('⚙️ Inicializando GAPI manualmente...');
                window.initGoogleCalendar.gapiLoaded();
            }
            
            if (!gisInited && window.initGoogleCalendar) {
                console.log('⚙️ Inicializando GIS manualmente...');
                window.initGoogleCalendar.gisLoaded();
            }
        } else if (retryCount >= maxRetries) {
            console.warn('⚠️ Timeout: APIs do Google não carregaram após 10 segundos');
            console.warn('GAPI:', typeof gapi, 'Google:', typeof google);
            clearInterval(checkGoogleAPIs);
        }
    }, 1000); // Verificar a cada 1 segundo
    
    // Inicializar notificações
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
    
    // Auto-refresh a cada 30 segundos
    setInterval(carregarNotificacoesColaborador, 30000);
});

console.log('✅ Sistema de calendário e notificações carregado!');
