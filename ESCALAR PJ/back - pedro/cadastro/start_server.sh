#!/bin/bash
# Script para iniciar o servidor Flask

cd "/workspaces/Escalar/ESCALAR PJ/back - pedro/cadastro"

echo "========================================"
echo "  INICIANDO SERVIDOR FLASK - ESCALAR"
echo "========================================"
echo ""
echo "Servidor rodará em: http://localhost:5000"
echo "Endpoint de cadastro: http://localhost:5000/api/cadastrar-colaborador"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo "========================================"
echo ""

python app.py
