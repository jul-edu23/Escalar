# QUICKSTART - ESCALAR

Guia rápido para iniciar os sistemas de cadastro e login em 5 minutos.

---

## Início Rápido

### 1. Instalar Dependências (Primeira vez apenas)

```bash
cd "ESCALAR PJ/back - pedro"

# Cadastro
cd cadastro && pip install -r requirements.txt && cd ..

# Login
cd login && pip install -r requirements.txt && cd ..
```

### 2. Iniciar Servidores

```bash
# Opção A: Automático (recomendado)
./manage_servers.sh start

# Opção B: Manual (2 terminais)
# Terminal 1:
cd cadastro && python app.py

# Terminal 2:
cd login && python app_login.py
```

### 3. Acessar Sistema

```
URL: http://127.0.0.1:5001/login
Email: admin@escalar.com
Senha: 00000000000
```
**Pronto!** Sistema funcionando.

---

## Comandos Essenciais

```bash
# Verifique status
./manage_servers.sh status

# Parar servidores
./manage_servers.sh stop

# Reiniciar servidores
./manage_servers.sh restart

# Ver logs
tail -f cadastro/cadastro_server.log
tail -f login/login_server.log
```

---

## Operações Comuns

### Cadastrar Colaborador (Via Web)

1. Login como admin `http://127.0.0.1:5001/login`
2. Menu lateral **Cadastrar Colaborador**
3. Preencher formulário
4. Senha padrão = CPF

### Cadastrar Colaborador (Via API)

```bash
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Maria Santos",
 "apelido": "Maria",
 "email": "maria@empresa.com",
 "cpf": "12345678901",
 "data_nascimento": "1995-06-15",
 "escala": "12x36",
 "turno": "diurno",
 "local": "Campus"
 }'
```

### Recuperar Senha

1. Tela de login **"Esqueci minha senha"**
2. Informar: Email + CPF
3. Senha resetada para CPF

### Listar Todos os Usuários

```bash
curl http://127.0.0.1:5000/api/usuarios
```

### Ver Estatísticas

```bash
curl http://127.0.0.1:5000/api/stats
```

---

## Solução Rápida de Problemas

| Problema | Solução |
|----------|---------|
| **Porta em uso** | `./manage_servers.sh stop` |
| **Banco não existe** | Iniciar `cadastro/app.py` primeiro |
| **404 Not Found** | Verifique se login está rodando |
| **Email duplicado** | Usar outro email ou deletar usuário |
| **Sessão não persiste** | Usar `http://127.0.0.1:5001` (não Live Server) |

---

## Regras de Validação

### Campos Obrigatórios
• Nome, apelido, email, CPF, data de nascimento
• Escala, turno, local

### Regras de Validação dos Dados
• **Email:** Formato válido + único
• **CPF:** 11 dígitos + único
• **Idade:** Mínimo 18 anos
• **Escala:** 12x36, 6x1, 5x2, 5x1, 4x3
• **Turno:** diurno, noturno, misto
• **Local:** CCE, CCV, Campus, CCO

---

## Principais Endpoints da API

### Cadastro (5000)
• `POST /api/cadastrar-colaborador` - Criar usuário
• `GET /api/usuarios` - Listar todos
• `GET /api/usuario/<id>` - Buscar por ID
• `PUT /api/usuario/<id>` - Atualizar
• `DELETE /api/usuario/<id>` - Deletar
• `GET /api/stats` - Estatísticas

### Login (5001)
• `POST /api/login` - Autenticar
• `GET /logout` - Deslogar
• `GET /verificar-sessao` - Checar sessão
• `POST /api/recuperar-senha` - Resetar senha

---

## Estrutura do Projeto

```
back - pedro/
 cadastro/ Porta 5000
 app.py Iniciar primeiro
 models.py
 auth.py
 validations.py
 instance/
 escalar.db Banco compartilhado
 login/ Porta 5001
 app_login.py Iniciar segundo
 manage_servers.sh Script de controle
```

---

## Credenciais de Acesso Padrão

```
Admin:
 Email: admin@escalar.com
 Senha: 00000000000 (CPF padrão)

Colaboradores:
 Email: [email cadastrado]
 Senha: [CPF do colaborador]
```

---

## DOCUMENTAÇÃO completa

Para mais detalhes, consulte:
• `GUIA_DE_USO_COMPLETO.md` - Documentação detalhada
• `ANALISE_LOGIN_completa.md` - Análise técnica do login
• `COMPARATIVO_SISTEMAS.md` - Comparação entre sistemas

---

## Lista de Verificação

• [ ] Dependências instaladas
• [ ] Ambos servidores rodando
• [ ] Login admin funcionando
• [ ] Cadastro de colaborador testado
• [ ] Login colaborador funcionando
• [ ] Recuperar senha testado
**Sistema pronto? Comece a usar! **
