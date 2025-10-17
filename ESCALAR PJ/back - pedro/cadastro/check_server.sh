#!/bin/bash
# Script para testar rapidamente se o servidor está funcionando

echo "🔍 Verificando servidor Flask..."
echo ""

# Verifica se a porta 5000 está em uso
if lsof -i :5000 > /dev/null 2>&1; then
    echo "✅ Servidor Flask ESTÁ RODANDO na porta 5000"
    echo ""
    
    # Mostra os processos
    echo "📋 Processos rodando:"
    lsof -i :5000 | head -5
    echo ""
    
    # Testa o endpoint
    echo "🧪 Testando endpoint de cadastro..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/cadastrar-colaborador -X POST -H "Content-Type: application/json" -d '{"nome":"Teste"}')
    
    if [ "$response" = "400" ] || [ "$response" = "201" ]; then
        echo "✅ Endpoint está RESPONDENDO (código $response)"
        echo ""
        echo "🎉 TUDO FUNCIONANDO!"
        echo ""
        echo "📝 Próximos passos:"
        echo "   1. Abra: ESCALAR PJ/front - julia - geizi/userCoordenador/cadastrarColaborador.html"
        echo "   2. Preencha o formulário"
        echo "   3. Clique em 'Cadastrar'"
    else
        echo "⚠️  Endpoint retornou código inesperado: $response"
    fi
else
    echo "❌ Servidor Flask NÃO está rodando"
    echo ""
    echo "💡 Para iniciar o servidor, execute:"
    echo "   cd 'ESCALAR PJ/back - pedro/cadastro'"
    echo "   python app.py"
fi

echo ""
