
document.addEventListener('DOMContentLoaded', function() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const calendarGrid = document.getElementById('calendar-grid');
    const notifyBtn = document.getElementById('notify-btn');
    const closeNotifyBtn = document.getElementById('close-notify-btn');
    const notificationPanel = document.getElementById('notification-panel');

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    //dados fixos temp, substituir dps por bd 
    const mockScheduleData = {
        // 'YYYY-MM-DD':
        '2025-09-01': 'trabalho',
        '2025-09-02': 'trabalho',
        '2025-09-03': 'trabalho',
        '2025-09-04': 'trabalho',
        '2025-09-05': 'trabalho',
        '2025-09-06': 'trabalho',
        '2025-09-07': 'folga',
        '2025-09-08': 'trabalho',
        '2025-09-09': 'trabalho',
        '2025-09-10': 'trabalho',
        '2025-09-11': 'trabalho',
        '2025-09-12': 'trabalho',
        '2025-09-13': 'folga',
        '2025-09-14': 'trabalho',
        '2025-09-15': 'folga',
        '2025-09-16': 'trabalho',
        '2025-09-17': 'folga',
        '2025-09-18': 'trabalho',
        '2025-09-19': 'folga',
        '2025-09-20': 'trabalho',
        '2025-09-21': 'folga',
        '2025-09-22': 'falta',
        '2025-09-23': 'folga',
        '2025-09-24': 'trabalho',
        '2025-09-25': 'atestado', 
        '2025-09-26': 'substituicao', 
        '2025-09-27': 'trabalho',
        '2025-09-28': 'folga',
        '2025-09-29': 'folga',
        '2025-09-30': 'folga',
    
    };

    // substituir pelo fetch de bd dps
    async function fetchScheduleData(year, month) {
        // console.log(`Buscando dados para ${year}-${month + 1}`);
        // const response = await fetch(`/api/escala/user?year=${year}&month=${month + 1}`);
        // const data = await response.json();
        // return data;
        
        // Por enquanto, retorna os dados mockados, dai dps mete o bd
        return mockScheduleData;
    }
    // -----------------------------------------------------------

    const statusClasses = {
        'trabalho': 'escalar-trabalho',
        'folga': 'escalar-folga',
        'falta': 'escalar-falta',
        'ferias': 'escalar-ferias',
        'substituicao': 'escalar-substituicao',
        'atestado': 'escalar-atestado',
    };
    
    let currentDate = new Date(2025, 8, 1); //setembrooo

    function populateSelectors() {
        // mesesss
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            monthSelect.appendChild(option);
        });

        // anos
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
        calendarGrid.innerHTML = ''; // Limpa algo..
        
        // busca de dds
        const scheduleData = await fetchScheduleData(year, month);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // dias antes 1 vazio
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'h-20 sm:h-24 rounded-lg bg-gray-200'; // Célula vazia no tom do fundo
            calendarGrid.appendChild(emptyCell);
        }

        // dias
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const status = scheduleData[dateString];
            const statusClass = status ? statusClasses[status] : 'bg-gray-100 text-gray-700'; // Dia sem status

            // Adicionei 'flex items-center justify-center' para centralizar o número
            dayCell.className = `h-20 sm:h-24 rounded-lg p-2 font-bold text-lg shadow ${statusClass} flex items-center justify-center`;
            dayCell.textContent = day;
            calendarGrid.appendChild(dayCell);
        }
    }

    
    monthSelect.addEventListener('change', () => {
        currentDate.setMonth(monthSelect.value);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    yearSelect.addEventListener('change', () => {
        currentDate.setFullYear(yearSelect.value);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    // Notificaçõessss
    notifyBtn.addEventListener('click', () => {
        notificationPanel.classList.remove('hidden');
    });

    closeNotifyBtn.addEventListener('click', () => {
        notificationPanel.classList.add('hidden');
    });

    // geração veyr
    populateSelectors();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

