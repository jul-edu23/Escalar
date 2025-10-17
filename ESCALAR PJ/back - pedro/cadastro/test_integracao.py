#!/usr/bin/env python3
"""
Script de teste para verificar a integracao HTML + Flask.
Testa o endpoint /api/cadastrar-colaborador.
"""

import requests
import json
import sys

# Configurações
API_URL = "http://localhost:5000/api/cadastrar-colaborador"
BASE_URL = "http://localhost:5000"

# Dados de teste
colaborador_teste = {
    "nome": "Teste Silva",
    "email": "teste@exemplo.com",
    "apelido": "Teste",
    "cpf": "12345678901",
    "data_nascimento": "1995-06-15",
    "escala": "12x36",
    "turno": "diurno",
    "local": "CCE",
    "foto": "default.jpg"
}

def print_header(text):
    """Imprime cabeçalho formatado"""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def print_step(number, text):
    """Imprime passo do teste"""
    print(f"\n{number}. {text}")

def print_success(text):
    """Imprime mensagem de sucesso"""
    print(f"   [OK] {text}")

def print_error(text):
    """Imprime mensagem de erro"""
    print(f"   [ERRO] {text}")

def check_server():
    """Verifica se o servidor Flask esta online"""
    print_step(1, "Verificando servidor Flask...")
    try:
        response = requests.get(BASE_URL, timeout=3)
        print_success("Servidor Flask está online!")
        return True
    except requests.exceptions.ConnectionError:
        print_error("Servidor Flask NÃO está rodando!")
        print("\n   Execute:")
        print("   cd 'ESCALAR PJ/back - pedro/cadastro'")
        print("   python app.py")
        return False
    except Exception as e:
        print_error(f"Erro ao conectar: {str(e)}")
        return False

def test_cadastro():
    """Testa o cadastro de colaborador"""
    print_step(2, "Testando cadastro de colaborador...")
    
    print("\n   Dados enviados:")
    print(f"   {json.dumps(colaborador_teste, indent=3, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            API_URL,
            json=colaborador_teste,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print_step(3, f"Resposta do servidor (Status: {response.status_code})")
        
        if response.status_code == 201:
            data = response.json()
            print_success("Colaborador cadastrado com sucesso!")
            print(f"\n   Dados do colaborador:")
            print(f"      ID: {data.get('id')}")
            print(f"      Nome: {data.get('nome')}")
            print(f"      Email: {data.get('email')}")
            print(f"      Senha padrao: {data.get('senha_padrao')}")
            return True
            
        elif response.status_code == 400:
            data = response.json()
            print_error("Erro de validação:")
            if 'errors' in data:
                for erro in data['errors']:
                    print(f"      • {erro}")
            else:
                print(f"      • {data.get('error', 'Erro desconhecido')}")
            return False
            
        elif response.status_code == 500:
            data = response.json()
            print_error("Erro no servidor:")
            print(f"      • {data.get('error', 'Erro desconhecido')}")
            return False
            
        else:
            print_error(f"Resposta inesperada: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print_error("Timeout ao conectar com o servidor")
        return False
    except requests.exceptions.RequestException as e:
        print_error(f"Erro na requisição: {str(e)}")
        return False
    except Exception as e:
        print_error(f"Erro inesperado: {str(e)}")
        return False

def main():
    """Funcao principal"""
    print_header("TESTE DE INTEGRAÇÃO - CADASTRO DE COLABORADOR")
    
    # Verifica servidor
    if not check_server():
        sys.exit(1)
    
    # Testa cadastro
    success = test_cadastro()
    
    # Resultado final
    print_header("RESULTADO DO TESTE")
    if success:
        print_success("Teste passou! Integração funcionando corretamente.")
    else:
        print_error("Teste falhou. Verifique os erros acima.")
    
    print("\n" + "=" * 70 + "\n")
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
