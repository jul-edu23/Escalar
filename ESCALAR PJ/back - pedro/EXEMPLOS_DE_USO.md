# EXEMPLOS DE USO - APIs ESCALAR

Exemplos práticos de todas as operações disponíveis nos sistemas.

---

## Índice

1. [Autenticação](#autenticação)
2. [Cadastro de Usuários](#cadastro-de-usuários)
3. [Consulta de Usuários](#consulta-de-usuários)
4. [Atualização de Usuários](#atualização-de-usuários)
5. [Exclusão de Usuários](#exclusão-de-usuários)
6. [Recuperação de Senha](#recuperação-de-senha)
7. [Validações](#validações)

---

## AUTENTICAÇÃO

### Login de Administrador

```bash
curl -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "admin@escalar.com",
 "senha": "00000000000"
 }'
```
**Resposta Sucesso (200):**
```json
{
 "success": true,
 "message": "Bem-vindo, Admin!",
 "usuario": {
 "id": 1,
 "nome": "Admin",
 "apelido": "Admin",
 "email": "admin@escalar.com",
 "nivel_acesso": "administrador",
 "foto": "default.jpg"
 },
 "redirect": "/calendario-admin"
}
```

### Login de Colaborador

```bash
curl -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "maria.silva@empresa.com",
 "senha": "12345678901"
 }'
```
**Resposta Sucesso (200):**
```json
{
 "success": true,
 "message": "Bem-vindo, Maria!",
 "usuario": {
 "id": 2,
 "nome": "Maria Silva",
 "apelido": "Maria",
 "email": "maria.silva@empresa.com",
 "nivel_acesso": "comum",
 "foto": "default.jpg"
 },
 "redirect": "/calendario-colaborador"
}
```

### Login com Credenciais Inválidas

```bash
curl -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "invalido@email.com",
 "senha": "senhaerrada"
 }'
```
**Resposta Erro (401):**
```json
{
 "error": "E-mail ou senha incorretos"
}
```

### Verifique Sessão Ativa

```bash
curl http://127.0.0.1:5001/verificar-sessao \
 --cookie "session=SEU_COOKIE_AQUI"
```
**Resposta (200):**
```json
{
 "logado": true,
 "usuario": {
 "id": 1,
 "nome": "Admin",
 "apelido": "Admin",
 "email": "admin@escalar.com",
 "nivel_acesso": "administrador",
 "foto": "default.jpg"
 }
}
```

---

## CADASTRO DE USUÁRIOS

### Cadastro Completo (Escala 12x36)

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "João Santos",
 "apelido": "João",
 "email": "joao.santos@empresa.com",
 "cpf": "11122233344",
 "data_nascimento": "1990-05-20",
 "escala": "12x36",
 "turno": "noturno",
 "local": "CCE"
 }'
```
**Resposta Sucesso (201):**
```json
{
 "success": true,
 "message": "Colaborador cadastrado com sucesso!",
 "id": 3,
 "nome": "João Santos",
 "email": "joao.santos@empresa.com",
 "senha_padrao": "11122233344"
}
```

### Cadastro com Escala 6x1

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Ana Paula Costa",
 "apelido": "Ana Paula",
 "email": "ana.costa@empresa.com",
 "cpf": "22233344455",
 "data_nascimento": "1988-03-15",
 "escala": "6x1",
 "turno": "diurno",
 "local": "CCV"
 }'
```

### Cadastro com Turno Misto

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Carlos Eduardo Lima",
 "apelido": "Carlos",
 "email": "carlos.lima@empresa.com",
 "cpf": "33344455566",
 "data_nascimento": "1992-11-08",
 "escala": "5x2",
 "turno": "misto",
 "local": "Campus"
 }'
```

### Cadastro no CCO (Escala 4x3)

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Fernanda Oliveira",
 "apelido": "Fernanda",
 "email": "fernanda.oliveira@empresa.com",
 "cpf": "44455566677",
 "data_nascimento": "1995-07-22",
 "escala": "4x3",
 "turno": "diurno",
 "local": "CCO"
 }'
```

---

## EXEMPLOS DE ERROS

### Email Já Cadastrado

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Teste Duplicado",
 "apelido": "Teste",
 "email": "admin@escalar.com",
 "cpf": "99988877766",
 "data_nascimento": "1990-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }'
```
**Resposta Erro (400):**
```json
{
 "error": "Erro ao cadastrar colaborador: E-mail já cadastrado"
}
```

### CPF Já Cadastrado

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Teste Duplicado",
 "apelido": "Teste",
 "email": "teste@empresa.com",
 "cpf": "00000000000",
 "data_nascimento": "1990-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }'
```
**Resposta Erro (400):**
```json
{
 "error": "Erro ao cadastrar colaborador: CPF já cadastrado"
}
```

### Idade Menor que 18 Anos

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Menor de Idade",
 "apelido": "Menor",
 "email": "menor@empresa.com",
 "cpf": "11111111111",
 "data_nascimento": "2010-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }'
```
**Resposta Erro (400):**
```json
{
 "error": "Erro ao cadastrar colaborador: O colaborador deve ter pelo menos 18 anos"
}
```

### Email Inválido

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Email Invalido",
 "apelido": "Teste",
 "email": "emailinvalido",
 "cpf": "22222222222",
 "data_nascimento": "1990-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }'
```
**Resposta Erro (400):**
```json
{
 "error": "Erro ao cadastrar colaborador: E-mail inválido"
}
```

### CPF Inválido (menos de 11 dígitos)

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "CPF Invalido",
 "apelido": "Teste",
 "email": "teste@empresa.com",
 "cpf": "123",
 "data_nascimento": "1990-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }'
```
**Resposta Erro (400):**
```json
{
 "error": "Erro ao cadastrar colaborador: CPF deve ter 11 dígitos"
}
```

### Escala Inválida

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Escala Invalida",
 "apelido": "Teste",
 "email": "teste@empresa.com",
 "cpf": "33333333333",
 "data_nascimento": "1990-01-01",
 "escala": "8x6",
 "turno": "diurno",
 "local": "CCE"
 }'
```
**Resposta Erro (400):**
```json
{
 "error": "Erro ao cadastrar colaborador: Escala inválida. Use: 12x36, 6x1, 5x2, 5x1, 4x3"
}
```

---

## CONSULTA DE USUÁRIOS

### Listar Todos os Usuários

```bash
curl http://127.0.0.1:5000/api/usuarios
```
**Resposta (200):**
```json
{
 "success": true,
 "usuarios": [
 {
 "id": 1,
 "nome": "Admin",
 "apelido": "Admin",
 "email": "admin@escalar.com",
 "cpf": "00000000000",
 "data_nascimento": "1980-01-01",
 "nivel_acesso": "administrador",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE",
 "foto": "default.jpg"
 },
 {
 "id": 2,
 "nome": "Maria Silva",
 "apelido": "Maria",
 "email": "maria.silva@empresa.com",
 "cpf": "12345678901",
 "data_nascimento": "1995-06-15",
 "nivel_acesso": "comum",
 "escala": "12x36",
 "turno": "noturno",
 "local": "CCV",
 "foto": "default.jpg"
 }
 ],
 "total": 2
}
```

### Buscar Usuário por ID

```bash
curl http://127.0.0.1:5000/api/usuario/2
```
**Resposta (200):**
```json
{
 "success": true,
 "usuario": {
 "id": 2,
 "nome": "Maria Silva",
 "apelido": "Maria",
 "email": "maria.silva@empresa.com",
 "cpf": "12345678901",
 "data_nascimento": "1995-06-15",
 "nivel_acesso": "comum",
 "escala": "12x36",
 "turno": "noturno",
 "local": "CCV",
 "foto": "default.jpg"
 }
}
```

### Buscar Usuário Inexistente

```bash
curl http://127.0.0.1:5000/api/usuario/999
```
**Resposta (404):**
```json
{
 "error": "Usuário não encontrado"
}
```

### Verifique Email Disponível

```bash
curl http://127.0.0.1:5000/api/verificar-email/novo@email.com
```
**Resposta (200):**
```json
{
 "disponivel": true,
 "email": "novo@email.com"
}
```

### Verifique Email Indisponível

```bash
curl http://127.0.0.1:5000/api/verificar-email/admin@escalar.com
```
**Resposta (200):**
```json
{
 "disponivel": false,
 "email": "admin@escalar.com"
}
```

### Verifique CPF Disponível

```bash
curl http://127.0.0.1:5000/api/verificar-cpf/99999999999
```
**Resposta (200):**
```json
{
 "disponivel": true,
 "cpf": "99999999999"
}
```

### Estatísticas do Sistema

```bash
curl http://127.0.0.1:5000/api/stats
```
**Resposta (200):**
```json
{
 "total_usuarios": 10,
 "total_administradores": 1,
 "total_colaboradores": 9,
 "por_escala": {
 "12x36": 5,
 "6x1": 2,
 "5x2": 2,
 "4x3": 1
 },
 "por_turno": {
 "diurno": 4,
 "noturno": 3,
 "misto": 3
 },
 "por_local": {
 "CCE": 3,
 "CCV": 2,
 "Campus": 4,
 "CCO": 1
 }
}
```

---

## ️ ATUALIZAÇÃO DE USUÁRIOS

### Atualizar Nome e Email

```bash
curl -X PUT http://127.0.0.1:5000/api/usuario/2 \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Maria Silva Santos",
 "email": "maria.santos@empresa.com"
 }'
```
**Resposta (200):**
```json
{
 "success": true,
 "message": "Usuário atualizado com sucesso!",
 "usuario": {
 "id": 2,
 "nome": "Maria Silva Santos",
 "email": "maria.santos@empresa.com",
 ...
 }
}
```

### Atualizar Escala e Turno

```bash
curl -X PUT http://127.0.0.1:5000/api/usuario/2 \
 -H "Content-Type: application/json" \
 -d '{
 "escala": "6x1",
 "turno": "diurno"
 }'
```

### Atualizar Local de Trabalho

```bash
curl -X PUT http://127.0.0.1:5000/api/usuario/2 \
 -H "Content-Type: application/json" \
 -d '{
 "local": "Campus"
 }'
```

### Atualizar Múltiplos Campos

```bash
curl -X PUT http://127.0.0.1:5000/api/usuario/2 \
 -H "Content-Type: application/json" \
 -d '{
 "apelido": "Mari",
 "escala": "5x2",
 "turno": "misto",
 "local": "CCO"
 }'
```

---

## ️ EXCLUSÃO DE USUÁRIOS

### Deletar Usuário

```bash
curl -X DELETE http://127.0.0.1:5000/api/usuario/5
```
**Resposta (200):**
```json
{
 "success": true,
 "message": "Usuário deletado com sucesso!"
}
```

### Tentar Deletar Usuário Inexistente

```bash
curl -X DELETE http://127.0.0.1:5000/api/usuario/999
```
**Resposta (404):**
```json
{
 "error": "Usuário não encontrado"
}
```

---

## RECUPERAÇÃO DE SENHA

### Recuperar Senha com Email e CPF

```bash
curl -X POST http://127.0.0.1:5001/api/recuperar-senha \
 -H "Content-Type: application/json" \
 -d '{
 "email": "maria.silva@empresa.com",
 "cpf": "12345678901"
 }'
```
**Resposta Sucesso (200):**
```json
{
 "success": true,
 "message": "Senha resetada com sucesso! Use seu CPF (12345678901) como nova senha no login."
}
```

### Recuperar com Email Errado

```bash
curl -X POST http://127.0.0.1:5001/api/recuperar-senha \
 -H "Content-Type: application/json" \
 -d '{
 "email": "inexistente@email.com",
 "cpf": "12345678901"
 }'
```
**Resposta Erro (404):**
```json
{
 "error": "Usuário não encontrado com estes dados. Verifique email e CPF."
}
```

### Recuperar com CPF Errado

```bash
curl -X POST http://127.0.0.1:5001/api/recuperar-senha \
 -H "Content-Type: application/json" \
 -d '{
 "email": "maria.silva@empresa.com",
 "cpf": "99999999999"
 }'
```
**Resposta Erro (404):**
```json
{
 "error": "Usuário não encontrado com estes dados. Verifique email e CPF."
}
```

---

## Executando Testes COMPLETOS

### Script de Teste Automatizado

```bash
#!/bin/bash

echo "=== TESTANDO SISTEMA ESCALAR ==="

# 1. Teste estatísticas
echo -e "\n1. Estatísticas:"
curl -s http://127.0.0.1:5000/api/stats | python3 -m json.tool

# 2. Cadastrar novo usuário
echo -e "\n2. Cadastrar usuário:"
curl -s -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Teste Automatizado",
 "apelido": "Teste",
 "email": "teste.auto@empresa.com",
 "cpf": "55566677788",
 "data_nascimento": "1990-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }' | python3 -m json.tool

# 3. Listar usuários
echo -e "\n3. Listar usuários:"
curl -s http://127.0.0.1:5000/api/usuarios | python3 -m json.tool

# 4. Fazer login
echo -e "\n4. Login:"
curl -s -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "teste.auto@empresa.com",
 "senha": "55566677788"
 }' | python3 -m json.tool

echo -e "\n=== TESTES CONCLUÍDOS ==="
```

Salve como `teste_completo.sh` e execute:

```bash
chmod +x teste_completo.sh
./teste_completo.sh
```

---

## Regras de Validação completaS

### Todas as Escalas Válidas

```bash
# 12x36
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Teste 12x36","apelido":"T1","email":"t1@e.com","cpf":"10000000001","data_nascimento":"1990-01-01","escala":"12x36","turno":"diurno","local":"CCE"}'

# 6x1
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Teste 6x1","apelido":"T2","email":"t2@e.com","cpf":"10000000002","data_nascimento":"1990-01-01","escala":"6x1","turno":"diurno","local":"CCV"}'

# 5x2
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Teste 5x2","apelido":"T3","email":"t3@e.com","cpf":"10000000003","data_nascimento":"1990-01-01","escala":"5x2","turno":"diurno","local":"Campus"}'

# 5x1
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Teste 5x1","apelido":"T4","email":"t4@e.com","cpf":"10000000004","data_nascimento":"1990-01-01","escala":"5x1","turno":"diurno","local":"CCO"}'

# 4x3
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Teste 4x3","apelido":"T5","email":"t5@e.com","cpf":"10000000005","data_nascimento":"1990-01-01","escala":"4x3","turno":"diurno","local":"CCE"}'
```

### Todos os Turnos Válidos

```bash
# Diurno
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Turno Diurno","apelido":"TD","email":"td@e.com","cpf":"20000000001","data_nascimento":"1990-01-01","escala":"12x36","turno":"diurno","local":"CCE"}'

# Noturno
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Turno Noturno","apelido":"TN","email":"tn@e.com","cpf":"20000000002","data_nascimento":"1990-01-01","escala":"12x36","turno":"noturno","local":"CCV"}'

# Misto
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Turno Misto","apelido":"TM","email":"tm@e.com","cpf":"20000000003","data_nascimento":"1990-01-01","escala":"12x36","turno":"misto","local":"Campus"}'
```

### Todos os Locais Válidos

```bash
# CCE
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Local CCE","apelido":"L1","email":"l1@e.com","cpf":"30000000001","data_nascimento":"1990-01-01","escala":"12x36","turno":"diurno","local":"CCE"}'

# CCV
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Local CCV","apelido":"L2","email":"l2@e.com","cpf":"30000000002","data_nascimento":"1990-01-01","escala":"12x36","turno":"diurno","local":"CCV"}'

# Campus
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Local Campus","apelido":"L3","email":"l3@e.com","cpf":"30000000003","data_nascimento":"1990-01-01","escala":"12x36","turno":"diurno","local":"Campus"}'

# CCO
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Local CCO","apelido":"L4","email":"l4@e.com","cpf":"30000000004","data_nascimento":"1990-01-01","escala":"12x36","turno":"diurno","local":"CCO"}'
```

---
**Versão:** 1.0 
**Última atualização:** Novembro 2025 
**Para:** Desenvolvimento e Testes
