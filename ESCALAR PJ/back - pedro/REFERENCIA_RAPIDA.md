# REFERÊNCIA RÁPIDA - ESCALAR

Cheat sheet para consulta rápida durante o desenvolvimento.

---

## Como Iniciar o Sistema

```bash
# Iniciar tudo
./manage_servers.sh start

# Parar tudo
./manage_servers.sh stop

# Reiniciar
./manage_servers.sh restart

# Ver status
./manage_servers.sh status
```

---

## URLs PRINCIPAIS

| Serviço | URL | Porta |
|---------|-----|-------|
| **Login** | http://127.0.0.1:5001/login | 5001 |
| **API Cadastro** | http://127.0.0.1:5000/api | 5000 |
| **Calendário Admin** | http://127.0.0.1:5001/calendario-admin | 5001 |
| **Calendário Colaborador** | http://127.0.0.1:5001/calendario-colaborador | 5001 |

---

## CREDENCIAIS

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@escalar.com | 00000000000 |
| **Colaborador** | [email cadastrado] | [CPF] |

---

## Regras de Validação

### Campos Obrigatórios
 nome, apelido, email, cpf, data_nascimento, escala, turno, local

### Regras
| Campo | Regra |
|-------|-------|
| **Email** | Formato válido + único |
| **CPF** | 11 dígitos + único |
| **Idade** | Mínimo 18 anos |
| **Escala** | 12x36, 6x1, 5x2, 5x1, 4x3 |
| **Turno** | diurno, noturno, misto |
| **Local** | CCE, CCV, Campus, CCO |

---

## ENDPOINTS

### Cadastro (5000)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/cadastrar-colaborador` | Criar usuário |
| `GET` | `/api/usuarios` | Listar todos |
| `GET` | `/api/usuario/<id>` | Buscar por ID |
| `PUT` | `/api/usuario/<id>` | Atualizar |
| `DELETE` | `/api/usuario/<id>` | Deletar |
| `GET` | `/api/verificar-email/<email>` | Checar disponibilidade |
| `GET` | `/api/verificar-cpf/<cpf>` | Checar disponibilidade |
| `GET` | `/api/stats` | Estatísticas |

### Login (5001)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/login` | Autenticar |
| `GET` | `/logout` | Deslogar |
| `GET` | `/verificar-sessao` | Checar sessão |
| `POST` | `/api/recuperar-senha` | Resetar senha |

---

## Comandos Úteis

### Cadastrar Usuário (curl)

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Nome Completo",
 "apelido": "Apelido",
 "email": "email@empresa.com",
 "cpf": "12345678901",
 "data_nascimento": "1990-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }'
```

### Login (curl)

```bash
curl -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "usuario@email.com",
 "senha": "senha123"
 }'
```

### Listar Usuários

```bash
curl http://127.0.0.1:5000/api/usuarios
```

### Buscar por ID

```bash
curl http://127.0.0.1:5000/api/usuario/2
```

### Atualizar Usuário

```bash
curl -X PUT http://127.0.0.1:5000/api/usuario/2 \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Novo Nome",
 "escala": "6x1"
 }'
```

### Deletar Usuário

```bash
curl -X DELETE http://127.0.0.1:5000/api/usuario/5
```

### Recuperar Senha

```bash
curl -X POST http://127.0.0.1:5001/api/recuperar-senha \
 -H "Content-Type: application/json" \
 -d '{
 "email": "usuario@email.com",
 "cpf": "12345678901"
 }'
```

### Estatísticas

```bash
curl http://127.0.0.1:5000/api/stats
```

---

## Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| **Connection refused** | Servidor parado | `./manage_servers.sh start` |
| **404 Not Found** | Endpoint errado | Verifique rota |
| **Email já cadastrado** | Email duplicado | Usar outro email |
| **CPF já cadastrado** | CPF duplicado | Usar outro CPF |
| **Login failed** | Credenciais erradas | Verifique email/senha |
| **Sessão não persiste** | Usando Live Server | Usar `http://127.0.0.1:5001` |
| **CORS error** | Origem não permitida | Verifique CORS config |

---

## Status do Projeto CODES

| Código | Significado |
|--------|-------------|
| **200** | OK - Sucesso |
| **201** | Created - Criado |
| **400** | Bad Request - Dados inválidos |
| **401** | Unauthorized - Não autenticado |
| **404** | Not Found - Não encontrado |
| **500** | Server Error - Erro no servidor |

---

## ️ ESTRUTURA DE DADOS

### Usuário (Objeto JSON)

```json
{
 "id": 1,
 "nome": "Nome Completo",
 "apelido": "Apelido",
 "email": "email@empresa.com",
 "cpf": "12345678901",
 "data_nascimento": "1990-01-01",
 "nivel_acesso": "comum|administrador",
 "escala": "12x36|6x1|5x2|5x1|4x3",
 "turno": "diurno|noturno|misto",
 "local": "CCE|CCV|Campus|CCO",
 "foto": "default.jpg"
}
```

### Resposta de Sucesso

```json
{
 "success": true,
 "message": "Mensagem de sucesso",
 "data": { ... }
}
```

### Resposta de Erro

```json
{
 "error": "Descrição do erro",
 "errors": ["Erro 1", "Erro 2"]
}
```

---

## LOGS

### Ver Logs em Tempo Real

```bash
# Cadastro
tail -f cadastro/cadastro_server.log

# Login
tail -f login/login_server.log
```

### Ver Últimas Linhas

```bash
# Últimas 50 linhas
tail -n 50 cadastro/cadastro_server.log
```

---

## Manutenção do Sistema

### Backup do Banco

```bash
cp cadastro/instance/escalar.db cadastro/instance/backup.db
```

### Restaurar Backup

```bash
cp cadastro/instance/backup.db cadastro/instance/escalar.db
```

### Limpar Banco (CUIDADO!)

```bash
rm cadastro/instance/escalar.db
python cadastro/app.py # Recria banco
```

### Verifique Portas

```bash
lsof -i :5000 # Cadastro
lsof -i :5001 # Login
```

### Matar Processo por Porta

```bash
kill -9 $(lsof -t -i:5000)
kill -9 $(lsof -t -i:5001)
```

---

## Executando Testes RÁPIDOS

### Teste Cadastro

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{"nome":"Teste","apelido":"T","email":"t@e.com","cpf":"11111111111","data_nascimento":"1990-01-01","escala":"12x36","turno":"diurno","local":"CCE"}'
```

### Teste Login Admin

```bash
curl -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@escalar.com","senha":"00000000000"}'
```

### Teste Estatísticas

```bash
curl http://127.0.0.1:5000/api/stats
```

### Teste Sessão

```bash
curl http://127.0.0.1:5001/verificar-sessao
```

---

## DOCUMENTAÇÃO

• **Guia Completo:** `GUIA_DE_USO_COMPLETO.md`
• **Quickstart:** `QUICKSTART.md`
• **Exemplos:** `EXEMPLOS_DE_USO.md`
• **Análise Login:** `ANALISE_LOGIN_completa.md`
• **Comparativo:** `COMPARATIVO_SISTEMAS.md`

---

## PÁGINAS WEB

### Administrador

• `/calendario-admin` - Calendário principal
• `/cadastrar-colaborador` - Cadastro de usuários
• `/quadro-colaboradores` - Lista de colaboradores
• `/solicitacoes` - Gerenciar solicitações
• `/historico/trocas` - Histórico de trocas
• `/historico/ferias` - Histórico de férias
• `/historico/atestados` - Histórico de atestados

### Colaborador

• `/calendario-colaborador` - Meu calendário
• `/solicitar-troca` - Pedir troca
• `/trocas-disponiveis` - Ver trocas
• `/cadastrar-ferias` - Solicitar férias
• `/cadastrar-atestado` - Enviar atestado
• `/minhas-solicitacoes` - Meus pedidos

---

## ATALHOS

### Python (Console)

```python
# Acessar banco de dados
from cadastro.models import db, Usuario
from cadastro.app import app

with app.app_context():
 # Listar usuários
 usuarios = Usuario.query.all()
 for u in usuarios:
 print(f'{u.id}: {u.nome} - {u.email}')
 
 # Criar usuário
 novo = Usuario(
 nome="Teste",
 apelido="T",
 email="teste@e.com",
 cpf="11111111111",
 senha=gerarHashSenha("11111111111"),
 data_nascimento="1990-01-01",
 escala="12x36",
 turno="diurno",
 local="CCE"
 )
 db.session.add(novo)
 db.session.commit()
```

---

## Segurança

### ️ IMPORTANTE

• **NÃO usar** em produção sem alterar `SECRET_KEY`
• **NÃO usar** senha padrão (CPF) em produção
• **NÃO expor** porta 5000 publicamente
• **SEMPRE** usar HTTPS em produção
• **SEMPRE** fazer backup regular
• **SEMPRE** validar inputs

---
**Quick Reference v1.0** 
**Novembro 2025**
