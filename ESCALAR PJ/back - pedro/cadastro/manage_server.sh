#!/bin/bash
# Script para gerenciar o servidor Flask em background

cd "/workspaces/Escalar/ESCALAR PJ/back - pedro/cadastro"

case "$1" in
    start)
        if ps aux | grep "python.*app.py" | grep -v grep > /dev/null; then
            echo "AVISO:  Servidor já está rodando!"
            ps aux | grep "python.*app.py" | grep -v grep
        else
            echo " Iniciando servidor Flask..."
            nohup python app.py > server.log 2>&1 &
            sleep 3
            if ps aux | grep "python.*app.py" | grep -v grep > /dev/null; then
                echo " Servidor iniciado com sucesso!"
                echo " URL: http://127.0.0.1:5000"
                echo " Logs: server.log"
                PID=$(ps aux | grep "python.*app.py" | grep -v grep | awk '{print $2}' | head -1)
                echo "PID: PID: $PID"
            else
                echo "ERRO: Erro ao iniciar servidor. Verifique server.log"
            fi
        fi
        ;;
    
    stop)
        echo " Parando servidor Flask..."
        pkill -f "python.*app.py"
        sleep 2
        if ps aux | grep "python.*app.py" | grep -v grep > /dev/null; then
            echo "AVISO:  Servidor ainda está rodando. Forçando parada..."
            pkill -9 -f "python.*app.py"
        fi
        echo " Servidor parado!"
        ;;
    
    restart)
        echo " Reiniciando servidor Flask..."
        $0 stop
        sleep 2
        $0 start
        ;;
    
    status)
        if ps aux | grep "python.*app.py" | grep -v grep > /dev/null; then
            echo " Servidor está RODANDO"
            echo ""
            ps aux | grep "python.*app.py" | grep -v grep
            echo ""
            PID=$(ps aux | grep "python.*app.py" | grep -v grep | awk '{print $2}' | head -1)
            echo "PID: PID: $PID"
            echo " URL: http://127.0.0.1:5000"
            echo " Logs: server.log"
            echo ""
            echo " Últimas 10 linhas do log:"
            tail -10 server.log
        else
            echo "ERRO: Servidor NÃO está rodando"
        fi
        ;;
    
    logs)
        if [ -f "server.log" ]; then
            echo " Logs do servidor (últimas 50 linhas):"
            echo "========================================"
            tail -50 server.log
        else
            echo "ERRO: Arquivo de log não encontrado"
        fi
        ;;
    
    tail)
        if [ -f "server.log" ]; then
            echo " Monitorando logs do servidor (Ctrl+C para sair):"
            echo "========================================"
            tail -f server.log
        else
            echo "ERRO: Arquivo de log não encontrado"
        fi
        ;;
    
    *)
        echo " Gerenciador do Servidor Flask - Escalar"
        echo "=========================================="
        echo "Uso: $0 {start|stop|restart|status|logs|tail}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia o servidor em background"
        echo "  stop    - Para o servidor"
        echo "  restart - Reinicia o servidor"
        echo "  status  - Mostra o status do servidor"
        echo "  logs    - Mostra as últimas 50 linhas do log"
        echo "  tail    - Monitora os logs em tempo real"
        exit 1
        ;;
esac
