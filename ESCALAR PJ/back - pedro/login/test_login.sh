#!/bin/bash
# Script de teste para o sistema de login

echo "========================================"
echo "  TESTE DO SISTEMA DE LOGIN - ESCALAR"
echo "========================================"
echo ""

# Verifica se o servidor esta rodando
echo "Verificando se o servidor esta rodando..."
if curl -s http://127.0.0.1:5001/ > /dev/null 2>&1; then
    echo "Servidor esta respondendo!"
else
    echo "Servidor nao esta rodando em http://127.0.0.1:5001"
    echo "   Execute: python app_login.py"
    exit 1
fi

echo ""
echo "Testando endpoints..."
echo ""

# Teste 1: Pagina de login
echo "1. Testando GET /login"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5001/login)
if [ "$STATUS" = "200" ]; then
    echo "   Pagina de login acessivel (200)"
else
    echo "   Erro ao acessar pagina de login (Status: $STATUS)"
fi

# Teste 2: Verificar sessao (sem estar logado)
echo ""
echo "2. Testando GET /verificar-sessao (sem login)"
RESPONSE=$(curl -s http://127.0.0.1:5001/verificar-sessao)
if echo "$RESPONSE" | grep -q '"logado": false'; then
    echo "   Endpoint de verificacao funcionando"
else
    echo "   Erro no endpoint de verificacao"
fi

# Teste 3: API de login com credenciais invalidas
echo ""
echo "3. Testando POST /api/login (credenciais invalidas)"
RESPONSE=$(curl -s -X POST http://127.0.0.1:5001/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"invalido@test.com","senha":"senha_errada"}')

if echo "$RESPONSE" | grep -q '"error"'; then
    echo "   Rejeicao de credenciais invalidas funcionando"
else
    echo "   AVISO: Resposta inesperada para credenciais invalidas"
fi

# Teste 4: API de login com admin
echo ""
echo "4. Testando POST /api/login (admin valido)"
RESPONSE=$(curl -s -X POST http://127.0.0.1:5001/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@escalar.com","senha":"00000000000"}')

if echo "$RESPONSE" | grep -q '"success": true'; then
    echo "   Login de administrador funcionando"
    echo "   Resposta:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo "   Erro no login de administrador"
    echo "   Resposta: $RESPONSE"
fi

echo ""
echo "========================================"
echo "  RESUMO DOS TESTES"
echo "========================================"
echo ""
echo "URL do sistema: http://127.0.0.1:5001"
echo "Pagina de login: http://127.0.0.1:5001/login"
echo ""
echo "Credenciais de teste:"
echo "   Admin: admin@escalar.com / 00000000000 (CPF)"
echo "   IMPORTANTE: Senha padrao = CPF do usuario"
echo ""
echo "Para testar o login completo, acesse:"
echo "   http://127.0.0.1:5001/login"
echo ""
echo "========================================"
