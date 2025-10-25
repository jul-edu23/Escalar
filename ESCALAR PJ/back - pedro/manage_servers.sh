#!/bin/bash
# Script para gerenciar os servidores do Escalar (Cadastro + Login)

CADASTRO_DIR="/workspaces/Escalar/ESCALAR PJ/back - pedro/cadastro"
LOGIN_DIR="/workspaces/Escalar/ESCALAR PJ/back - pedro/login"

case "$1" in
    start)
        echo "Iniciando servidores do Escalar..."
        echo ""
        
        # Inicia servidor de cadastro (porta 5000)
        echo "Iniciando servidor de CADASTRO (porta 5000)..."
        cd "$CADASTRO_DIR"
        nohup python app.py > cadastro_server.log 2>&1 &
        CADASTRO_PID=$!
        echo "   PID: $CADASTRO_PID"
        
        sleep 2
        
        # Inicia servidor de login (porta 5001)
        echo "Iniciando servidor de LOGIN (porta 5001)..."
        cd "$LOGIN_DIR"
        nohup python app_login.py > login_server.log 2>&1 &
        LOGIN_PID=$!
        echo "   PID: $LOGIN_PID"
        
        sleep 3
        
        echo ""
        echo "Servidores iniciados com sucesso!"
        echo ""
        echo "URLs disponiveis:"
        echo "   • Cadastro: http://127.0.0.1:5000"
        echo "   • Login:    http://127.0.0.1:5001/login"
        echo ""
        ;;
    
    stop)
        echo "Parando servidores do Escalar..."
        
        pkill -f "python.*app.py"
        pkill -f "python.*app_login.py"
        
        sleep 2
        echo "Servidores parados!"
        ;;
    
    restart)
        echo "Reiniciando servidores..."
        $0 stop
        sleep 2
        $0 start
        ;;
    
    status)
        echo "Status dos Servidores Escalar"
        echo "=================================="
        echo ""
        
        # Verifica servidor de cadastro
        if ps aux | grep "python.*app.py" | grep -v grep > /dev/null; then
            echo "Servidor de CADASTRO esta RODANDO"
            ps aux | grep "python.*app.py" | grep -v grep | head -1
            
            if curl -s http://127.0.0.1:5000/ > /dev/null 2>&1; then
                echo "   Respondendo em: http://127.0.0.1:5000"
            fi
        else
            echo "Servidor de CADASTRO NAO esta rodando"
        fi
        
        echo ""
        
        # Verifica servidor de login
        if ps aux | grep "python.*app_login.py" | grep -v grep > /dev/null; then
            echo "Servidor de LOGIN esta RODANDO"
            ps aux | grep "python.*app_login.py" | grep -v grep | head -1
            
            if curl -s http://127.0.0.1:5001/ > /dev/null 2>&1; then
                echo "   Respondendo em: http://127.0.0.1:5001/login"
            fi
        else
            echo "Servidor de LOGIN NAO esta rodando"
        fi
        
        echo ""
        ;;
    
    logs-cadastro)
        echo "Logs do Servidor de Cadastro (Ctrl+C para sair):"
        echo "===================================================="
        tail -f "$CADASTRO_DIR/cadastro_server.log" 2>/dev/null || tail -f "$CADASTRO_DIR/server.log"
        ;;
    
    logs-login)
        echo "Logs do Servidor de Login (Ctrl+C para sair):"
        echo "================================================="
        tail -f "$LOGIN_DIR/login_server.log"
        ;;
    
    test)
        echo "Executando testes..."
        echo ""
        
        # Testa servidor de cadastro
        echo "1. Testando servidor de CADASTRO..."
        if curl -s http://127.0.0.1:5000/ > /dev/null 2>&1; then
            echo "   Servidor de cadastro OK"
        else
            echo "   Servidor de cadastro nao responde"
        fi
        
        echo ""
        
        # Testa servidor de login
        echo "2. Testando servidor de LOGIN..."
        cd "$LOGIN_DIR"
        ./test_login.sh
        ;;
    
    *)
        echo "Gerenciador de Servidores - Escalar"
        echo "======================================="
        echo ""
        echo "Uso: $0 {start|stop|restart|status|logs-cadastro|logs-login|test}"
        echo ""
        echo "Comandos:"
        echo "  start         - Inicia ambos os servidores"
        echo "  stop          - Para ambos os servidores"
        echo "  restart       - Reinicia ambos os servidores"
        echo "  status        - Mostra o status dos servidores"
        echo "  logs-cadastro - Monitora logs do servidor de cadastro"
        echo "  logs-login    - Monitora logs do servidor de login"
        echo "  test          - Executa testes nos servidores"
        echo ""
        echo "Portas:"
        echo "  • Cadastro: 5000"
        echo "  • Login:    5001"
        echo ""
        exit 1
        ;;
esac
