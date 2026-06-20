#!/bin/bash
# Script para gerenciar os servidores do Escalar (MySQL + Cadastro + Login)

CADASTRO_DIR="/workspaces/Escalar/ESCALAR PJ/back - pedro/cadastro"
LOGIN_DIR="/workspaces/Escalar/ESCALAR PJ/back - pedro/login"

case "$1" in
    start)
        echo "Iniciando servidores do Escalar..."
        echo ""
        
        # Inicia MySQL
        echo "1. Iniciando MySQL..."
        if sudo service mysql status > /dev/null 2>&1; then
            echo "   MySQL ja esta rodando"
        else
            sudo service mysql start > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo "   MySQL iniciado com sucesso"
            else
                echo "   ERRO ao iniciar MySQL"
                exit 1
            fi
        fi
        
        sleep 2
        
        # Inicia servidor de cadastro (porta 5000)
        echo "2. Iniciando servidor de CADASTRO (porta 5000)..."
        cd "$CADASTRO_DIR"
        nohup python app.py > cadastro_server.log 2>&1 &
        CADASTRO_PID=$!
        echo "   PID: $CADASTRO_PID"
        
        sleep 2
        
        # Inicia servidor de login (porta 5001)
        echo "3. Iniciando servidor de LOGIN (porta 5001)..."
        cd "$LOGIN_DIR"
        nohup python app_login.py > login_server.log 2>&1 &
        LOGIN_PID=$!
        echo "   PID: $LOGIN_PID"
        
        sleep 3
        
        echo ""
        echo "✅ Todos os servidores iniciados com sucesso!"
        echo ""
        echo "URLs disponiveis:"
        echo "   • MySQL:    localhost:3306"
        echo "   • Cadastro: http://127.0.0.1:5000"
        echo "   • Login:    http://127.0.0.1:5001/login"
        echo ""
        ;;
    
    stop)
        echo "Parando servidores do Escalar..."
        echo ""
        
        # Para servidores Flask
        echo "1. Parando servidores Flask..."
        pkill -f "python.*app.py"
        pkill -f "python.*app_login.py"
        sleep 1
        echo "   Servidores Flask parados"
        
        # Para MySQL
        echo "2. Parando MySQL..."
        sudo service mysql stop > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "   MySQL parado"
        else
            echo "   MySQL ja estava parado ou erro ao parar"
        fi
        
        echo ""
        echo "✅ Servidores parados!"
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
        
        # Verifica MySQL
        echo "1. MySQL:"
        if sudo service mysql status > /dev/null 2>&1; then
            echo "   ✅ RODANDO"
            echo "   Porta: 3306"
        else
            echo "   ❌ NAO esta rodando"
        fi
        
        echo ""
        
        # Verifica servidor de cadastro
        echo "2. Servidor de CADASTRO:"
        if ps aux | grep "python.*app.py" | grep -v grep > /dev/null; then
            echo "   ✅ RODANDO"
            ps aux | grep "python.*app.py" | grep -v grep | head -1 | awk '{print "   PID: " $2}'
            
            if curl -s http://127.0.0.1:5000/ > /dev/null 2>&1; then
                echo "   Respondendo em: http://127.0.0.1:5000"
            fi
        else
            echo "   ❌ NAO esta rodando"
        fi
        
        echo ""
        
        # Verifica servidor de login
        echo "3. Servidor de LOGIN:"
        if ps aux | grep "python.*app_login.py" | grep -v grep > /dev/null; then
            echo "   ✅ RODANDO"
            ps aux | grep "python.*app_login.py" | grep -v grep | head -1 | awk '{print "   PID: " $2}'
            
            if curl -s http://127.0.0.1:5001/ > /dev/null 2>&1; then
                echo "   Respondendo em: http://127.0.0.1:5001/login"
            fi
        else
            echo "   ❌ NAO esta rodando"
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
    
    logs-mysql)
        echo "Logs do MySQL (Ctrl+C para sair):"
        echo "===================================="
        sudo tail -f /var/log/mysql/error.log
        ;;
    
    test)
        echo "Executando testes..."
        echo ""
        
        # Testa MySQL
        echo "1. Testando MySQL..."
        if sudo service mysql status > /dev/null 2>&1; then
            echo "   ✅ MySQL OK (servico rodando)"
        else
            echo "   ❌ MySQL nao esta rodando"
        fi
        
        echo ""
        
        # Testa servidor de cadastro
        echo "2. Testando servidor de CADASTRO..."
        if curl -s http://127.0.0.1:5000/ > /dev/null 2>&1; then
            echo "   ✅ Servidor de cadastro OK"
        else
            echo "   ❌ Servidor de cadastro nao responde"
        fi
        
        echo ""
        
        # Testa servidor de login
        echo "3. Testando servidor de LOGIN..."
        if curl -s http://127.0.0.1:5001/ > /dev/null 2>&1; then
            echo "   ✅ Servidor de login OK"
        else
            echo "   ❌ Servidor de login nao responde"
        fi
        
        echo ""
        ;;
    
    *)
        echo "Gerenciador de Servidores - Escalar"
        echo "======================================="
        echo ""
        echo "Uso: $0 {start|stop|restart|status|logs-cadastro|logs-login|logs-mysql|test}"
        echo ""
        echo "Comandos:"
        echo "  start         - Inicia MySQL + servidores Flask"
        echo "  stop          - Para MySQL + servidores Flask"
        echo "  restart       - Reinicia todos os servidores"
        echo "  status        - Mostra o status de todos os servidores"
        echo "  logs-cadastro - Monitora logs do servidor de cadastro"
        echo "  logs-login    - Monitora logs do servidor de login"
        echo "  logs-mysql    - Monitora logs do MySQL"
        echo "  test          - Executa testes em todos os servidores"
        echo ""
        echo "Servidores:"
        echo "  • MySQL:    localhost:3306"
        echo "  • Cadastro: http://127.0.0.1:5000"
        echo "  • Login:    http://127.0.0.1:5001"
        echo ""
        exit 1
        ;;
esac
