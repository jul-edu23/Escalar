
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

    // --- 'mock'---//
    const mockScheduleData = {
        // 'YYYY-MM-DD'
        '2025-09-01': [
            { nome: 'Júlia', status: 'trabalho' },
            { nome: 'Maria', status: 'trabalho' },
            { nome: 'Antonio', status: 'trabalho' },
            { nome: 'Luiz', status: 'trabalho' },
            { nome: 'Carlos', status: 'trabalho' }
        ],
        '2025-09-07': [
            { nome: 'Júlia', status: 'folga' },
            { nome: 'Maria', status: 'folga' },
            { nome: 'Antonio', status: 'folga' },
            { nome: 'Luiz', status: 'trabalho' },
            { nome: 'Carlos', status: 'trabalho' }
        ],
         '2025-09-22': [
            { nome: 'Júlia', status: 'falta-justificada' },
            { nome: 'Maria', status: 'trabalho' },
            { nome: 'Antonio', status: 'trabalho' },
            { nome: 'Luiz', status: 'falta' },
            { nome: 'Carlos', status: 'trabalho' }
        ],
        '2025-09-25': [
            { nome: 'Júlia', status: 'atestado' },
            { nome: 'Maria', status: 'trabalho' },
            { nome: 'Antonio', status: 'trabalho' },
            { nome: 'Luiz', status: 'trabalho' },
            { nome: 'Carlos', status: 'trabalho' }
        ],
        '2025-09-26': [
            { nome: 'Júlia', status: 'trabalho' },
            { nome: 'Maria', status: 'substituicao' },
            { nome: 'Antonio', status: 'trabalho' },
            { nome: 'Luiz', status: 'ferias' },
            { nome: 'Carlos', status: 'trabalho' }
        ],
    };

    // buscar dados, por fetch dps
    async function fetchScheduleData(year, month) {
        // console.log(`Buscando dados para ${year}-${month + 1}`);
        // dados de todos func
        return mockScheduleData;
    }
    // -----------------------------------------------------------

    
    const statusClasses = {
        'trabalho': 'escalar-trabalho',
        'folga': 'escalar-folga',
        'falta': 'escalar-falta',
        'falta-justificada': 'escalar-falta-justificada',
        'ferias': 'escalar-ferias',
        'substituicao': 'escalar-substituicao',
        'atestado': 'escalar-atestado',
    };
    
    let currentDate = new Date(2025, 8, 1); //setembro

    function populateSelectors() {
        // mesesss
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            monthSelect.appendChild(option);
        });

        // anoss
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
        calendarGrid.innerHTML = ''; // Limpa o grid
        
        const scheduleData = await fetchScheduleData(year, month);
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1. Células vazias dos diass
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'rounded-lg bg-gray-200'; // Célula vazia no tom do fundo
            calendarGrid.appendChild(emptyCell);
        }

        // 2. Células dos dias
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = scheduleData[dateString]; // arrayu ndefined

            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day-cell'; 

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            if (dayData) {
                const employeeList = document.createElement('div');
                employeeList.className = 'employee-list';

                dayData.forEach(employee => {
                    const item = document.createElement('div');
                    item.className = 'employee-item';

                    // Bolinha colorida nsei
                    const dot = document.createElement('div');
                    const statusClass = statusClasses[employee.status] || 'bg-gray-400';
                    dot.className = `employee-status-dot ${statusClass}`;
                    
                    // Nome
                    const name = document.createElement('span');
                    name.textContent = employee.nome;

                    item.appendChild(dot);
                    item.appendChild(name);
                    employeeList.appendChild(item);
                });

                dayCell.appendChild(employeeList);
            }
            
            calendarGrid.appendChild(dayCell);
        }
    }

    
    // --- Eventos ---
    monthSelect.addEventListener('change', () => {
        currentDate.setMonth(monthSelect.value);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    yearSelect.addEventListener('change', () => {
        currentDate.setFullYear(yearSelect.value);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    // Notificações
    notifyBtn.addEventListener('click', () => {
        notificationPanel.classList.remove('hidden');
    });

    closeNotifyBtn.addEventListener('click', () => {
        notificationPanel.classList.add('hidden');
    });

    // Geração inicio
    populateSelectors();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});
