# GUIA COMPLETO - SISTEMAS DE CADASTRO E LOGIN
**Sistema:** Escalar - Gestão de Escalas 
**Data:** Novembro 2025 
**Status:** Produção Ready

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [Inicialização](#inicialização)
6. [Uso do Sistema](#uso-do-sistema)
7. [API Reference](#api-reference)
8. [Solução de Problemas](#solução-de-problemas)
9. [Manutenção](#manutenção)

---

## Visão Geral

O sistema Escalar é composto por dois servidores Flask independentes que trabalham em conjunto:

### Sistema de Cadastro (Porta 5000)
• Uma API REST que permite CRUD de usuários
• Validações de negócio
• Gerenciamento de colaboradores

### Sistema de Login (Porta 5001)
• Autenticação de usuários
• Gerenciamento de sessões
• Interface web completa
• Recuperação de senha

### Integração
• Banco de dados SQLite compartilhado
• Models e autenticação compartilhados
• CORS configurado entre portas

---

## Requisitos do Sistema

### Software Necessário

```bash
# Python 3.8 ou superior
python --version

# Pip (gerenciador de pacotes)
pip --version
```

### Bibliotecas Python Necessárias

```txt
Flask==2.3.0
Flask-SQLAlchemy==3.0.5
Flask-CORS==4.0.0
Werkzeug==2.3.0
```

### Estrutura de Pastas Necessária

```
ESCALAR PJ/
 back - pedro/
 cadastro/
 app.py
 models.py
 auth.py
 validations.py
 requirements.txt
 instance/
 escalar.db (criado automaticamente)
 login/
 app_login.py
 requirements.txt
 manage_servers.sh
 front - julia - geizi - sara/
 login.html
 recuperarSenha.html
 assets/
 userCoordenador/
 userColaborador/
```

---

## Instalação

### Passo 1: Clonar/Acessar o Projeto

```bash
cd "ESCALAR PJ/back - pedro"
```

### Passo 2: Instalar Dependências do Cadastro

```bash
cd cadastro
pip install -r requirements.txt
cd ..
```

### Passo 3: Instalar Dependências do Login

```bash
cd login
pip install -r requirements.txt
cd ..
```

### Passo 4: Verifique Instalação

```bash
python -c "import flask; print(f'Flask {flask.__version__} instalado!')"
```

---

## Configuração

### 1. Configuração do Banco de Dados

O banco de dados será criado automaticamente na primeira execução, mas você pode configurar:
**Arquivo:** `cadastro/app.py` e `login/app_login.py`

```python
# Localização do banco de dados
DB_PATH = os.path.abspath(os.path.join(
 os.path.dirname(__file__), 
 '..', 
 'cadastro', 
 'instance', 
 'escalar.db'
))
```

### 2. Configuração de Segurança
**Arquivo:** `login/app_login.py`

```python
# Importante: Alterar em produção!
app.config['SECRET_KEY'] = 'chave-secreta-para-desenvolvimento'
```
****Atenção:** Em produção, use uma chave secreta forte:

```python
import secrets
app.config['SECRET_KEY'] = secrets.token_hex(32)
```

### 3. Configuração de CORS
**Arquivo:** `login/app_login.py`

```python
CORS(app, resources={
 r"/*": {
 "origins": [
 "http://localhost:5000", 
 "http://127.0.0.1:5000",
 "http://localhost:5001", 
 "http://127.0.0.1:5001"
 ],
 "methods": ["GET", "POST", "OPTIONS"],
 "allow_headers": ["Content-Type", "Authorization"],
 "supports_credentials": True
 }
})
```

### 4. Configuração de Validações
**Arquivo:** `cadastro/validations.py`

Personalize as regras de negócio:

```python
# Escalas permitidas
ESCALAS_VALIDAS = ['12x36', '6x1', '5x2', '5x1', '4x3']

# Turnos permitidos
TURNOS_VALIDOS = ['diurno', 'noturno', 'misto']

# Locais permitidos
LOCAIS_VALIDOS = ['CCE', 'CCV', 'Campus', 'CCO']

# Idade mínima
IDADE_MINIMA = 18
```

---

## Como Iniciar o Sistema

### Opção 1: Script Automatizado (Recomendado)

```bash
cd "ESCALAR PJ/back - pedro"

# Tornar executável (primeira vez)
chmod +x manage_servers.sh

# Iniciar ambos os servidores
./manage_servers.sh start

# Verifique status
./manage_servers.sh status

# Parar servidores
./manage_servers.sh stop

# Reiniciar servidores
./manage_servers.sh restart
```

### Opção 2: Manual (Desenvolvimento)
**Terminal 1 - Cadastro:**
```bash
cd "ESCALAR PJ/back - pedro/cadastro"
python app.py
```
**Terminal 2 - Login:**
```bash
cd "ESCALAR PJ/back - pedro/login"
python app_login.py
```

### Verificação de Inicialização

Você verá algo assim:

```
================================================================
SERVIDOR DE CADASTRO - ESCALAR
================================================================
URL: http://127.0.0.1:5000
Criando banco de dados...
Usuario admin criado com sucesso!
================================================================

================================================================
SERVIDOR DE LOGIN - ESCALAR
================================================================
URL: http://127.0.0.1:5001
Pagina de Login: http://127.0.0.1:5001/login
Conectado ao banco de dados. Total de usuarios: 1
================================================================
```

---

## Usando o Sistema

### 1. PRIMEIRO ACESSO

#### Credenciais Padrão

```
Email: admin@escalar.com
Senha: 00000000000 (11 zeros - CPF padrão)
```

#### Acessar o Sistema

1. Abra o navegador
2. Acesse: `http://127.0.0.1:5001/login`
3. Digite as credenciais do admin
4. Clique no botão "Entrar"

• O sistema irá redirecionar você para o **Calendário do Administrador**

---

### 2. CADASTRAR COLABORADORES (Admin)

#### Via Interface Web

1. Entre como administrador
2. No menu lateral, clique em **"Cadastrar Colaborador"**
3. Preencha o formulário:
 • **Nome completo** (ex: João Silva)
 • **Apelido** (ex: João)
 • **Email** (ex: joao.silva@empresa.com)
 • **CPF** (11 dígitos)
 • **Data de Nascimento** (mínimo 18 anos)
 • **Escala** (12x36, 6x1, 5x2, 5x1, 4x3)
 • **Turno** (diurno, noturno, misto)
 • **Local** (CCE, CCV, Campus, CCO)
4. Clique em **"Cadastrar"**

• **Senha padrão:** O CPF do colaborador

#### Via API (curl)

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

---

### 3. LOGIN DE COLABORADORES

1. Colaborador acessa: `http://127.0.0.1:5001/login`
2. Digite seu **email cadastrado**
3. Digite seu **CPF** (senha padrão)
4. Clique em "Entrar"

• Você será redirecionado automaticamente para o **Calendário do Colaborador**
**Primeira vez?** O colaborador deve usar o CPF como senha inicial.

---

### 4. RECUPERAR SENHA

#### Se o Usuário Esqueceu a Senha:

1. Na tela de login, clicar em **"Esqueci minha senha"**
2. Preencher:
 • Email cadastrado
 • CPF (11 dígitos)
3. Clicar em **"Solicitar Recuperação"**
4. A senha será resetada para o **CPF**
5. Fazer login novamente com o CPF

---

### 5. NAVEGAÇÃO NO SISTEMA

#### Menu do Administrador

| Página | Descrição |
|--------|-----------|
| **Calendário** | Visualizar escalas de todos |
| **Cadastrar Colaborador** | Adicionar novos usuários |
| **Quadro de Colaboradores** | Listar todos os colaboradores |
| **Solicitações** | Gerenciar pedidos (trocas, férias, atestados) |
| **Histórico** | Ver histórico de trocas, férias e atestados |

#### Menu do Colaborador

| Página | Descrição |
|--------|-----------|
| **Calendário** | Ver minha escala |
| **Solicitar Troca** | Pedir troca de turno |
| **Trocas Disponíveis** | Ver trocas oferecidas por outros |
| **Cadastrar Férias** | Solicitar férias |
| **Cadastrar Atestado** | Enviar atestado médico |
| **Minhas Solicitações** | Ver status dos pedidos |

---

## API REFERENCE

### Sistema de Cadastro (Porta 5000)

#### 1. Cadastrar Colaborador

```http
POST /api/cadastrar-colaborador
Content-Type: application/json

{
 "nome": "string (obrigatório)",
 "apelido": "string (obrigatório)",
 "email": "string (obrigatório, único)",
 "cpf": "string (11 dígitos, único)",
 "data_nascimento": "YYYY-MM-DD (18+ anos)",
 "escala": "12x36|6x1|5x2|5x1|4x3",
 "turno": "diurno|noturno|misto",
 "local": "CCE|CCV|Campus|CCO"
}
```
**Resposta (201):**
```json
{
 "success": true,
 "message": "Colaborador cadastrado com sucesso!",
 "id": 1,
 "nome": "João Silva",
 "email": "joao@empresa.com",
 "senha_padrao": "12345678901"
}
```

#### 2. Listar Todos os Usuários

```http
GET /api/usuarios
```
**Resposta (200):**
```json
{
 "success": true,
 "usuarios": [
 {
 "id": 1,
 "nome": "Admin",
 "email": "admin@escalar.com",
 "nivel_acesso": "administrador",
 ...
 }
 ],
 "total": 1
}
```

#### 3. Buscar Usuário por ID

```http
GET /api/usuario/<id>
```

#### 4. Atualizar Usuário

```http
PUT /api/usuario/<id>
Content-Type: application/json

{
 "nome": "Novo Nome",
 "email": "novo@email.com",
 ...
}
```

#### 5. Deletar Usuário

```http
DELETE /api/usuario/<id>
```

#### 6. Verifique Email Disponível

```http
GET /api/verificar-email/<email>
```

#### 7. Verifique CPF Disponível

```http
GET /api/verificar-cpf/<cpf>
```

#### 8. Estatísticas do Sistema

```http
GET /api/stats
```
**Resposta (200):**
```json
{
 "total_usuarios": 10,
 "total_administradores": 1,
 "total_colaboradores": 9
}
```

---

### Sistema de Login (Porta 5001)

#### 1. Login

```http
POST /api/login
Content-Type: application/json

{
 "email": "usuario@email.com",
 "senha": "senha123"
}
```
**Resposta (200):**
```json
{
 "success": true,
 "message": "Bem-vindo, João!",
 "usuario": {
 "id": 1,
 "nome": "João Silva",
 "nivel_acesso": "comum"
 },
 "redirect": "/calendario-colaborador"
}
```

#### 2. Verifique Sessão

```http
GET /verificar-sessao
```
**Resposta (200):**
```json
{
 "logado": true,
 "usuario": {
 "id": 1,
 "nome": "João Silva",
 ...
 }
}
```

#### 3. Logout

```http
GET /logout
```

#### 4. Recuperar Senha

```http
POST /api/recuperar-senha
Content-Type: application/json

{
 "email": "usuario@email.com",
 "cpf": "12345678901"
}
```
**Resposta (200):**
```json
{
 "success": true,
 "message": "Senha resetada com sucesso! Use seu CPF..."
}
```

---

## Solução de Problemas

### Problema 1: "Erro ao conectar ao banco de dados"
**Causa:** Banco não foi inicializado
**Solução:**
```bash
# Iniciar primeiro o servidor de cadastro
cd cadastro
python app.py
# Aguardar mensagem: "Usuario admin criado com sucesso!"
```

---

### Problema 2: "Email já cadastrado"
**Causa:** Email duplicado no banco
**Solução:**
• Use outro email, OU
• Deletar o usuário existente via API:
```bash
curl -X DELETE http://127.0.0.1:5000/api/usuario/<id>
```

---

### Problema 3: "CPF já cadastrado"
**Causa:** CPF duplicado no banco
**Solução:**
• Use outro CPF, OU
• Deletar o usuário existente

---

### Problema 4: "404 Not Found" ao acessar páginas
**Causa:** Servidor de login não está rodando
**Solução:**
```bash
cd login
python app_login.py
```

---

### Problema 5: "Sessão não persiste"
**Causa:** Acesso via Live Server ou file://
**Solução:**
• **Sempre acesse através de:** `http://127.0.0.1:5001`
• **Não use:** Live Server ou file://

---

### Problema 6: "CORS error"
**Causa:** Requisição de origem não permitida
**Solução:**
Verifique configuração CORS em `app_login.py`:
```python
"origins": ["http://127.0.0.1:5001", ...]
```

---

### Problema 7: "Senha incorreta"
**Causa:** Usuário não sabe senha padrão
**Solução:**
1. Usar "Esqueci minha senha"
2. Informar Email + CPF
3. Senha será resetada para o CPF

---

## Manutenção do Sistema

### Backup do Banco de Dados

```bash
# Backup manual
cp cadastro/instance/escalar.db cadastro/instance/escalar.db.backup

# Backup com data
cp cadastro/instance/escalar.db "cadastro/instance/escalar-$(date +%Y%m%d).db"
```

### Restaurar Banco de Dados

```bash
cp cadastro/instance/escalar.db.backup cadastro/instance/escalar.db
```

### Limpar Banco de Dados

```bash
# Cuidado: Apaga todos os dados!
rm cadastro/instance/escalar.db

# Reiniciar servidor para recriar
python cadastro/app.py
```

### Ver Logs do Servidor

```bash
# Cadastro
tail -f cadastro/cadastro_server.log

# Login 
tail -f login/login_server.log
```

### Verifique Usuários no Banco

```bash
python -c "
from cadastro.models import db, Usuario
from cadastro.app import app

with app.app_context():
 usuarios = Usuario.query.all()
 for u in usuarios:
 print(f'{u.id}: {u.nome} - {u.email} - {u.nivel_acesso}')
"
```

### Atualizar Dependências

```bash
# Cadastro
cd cadastro
pip install --upgrade -r requirements.txt

# Login
cd login
pip install --upgrade -r requirements.txt
```

---

## Monitoramento

### Verifique Status dos Servidores

```bash
./manage_servers.sh status
```

### Verifique Portas em Uso

```bash
# Porta 5000 (Cadastro)
lsof -i :5000

# Porta 5001 (Login)
lsof -i :5001
```

### Teste APIs

```bash
# Teste rápido de cadastro
curl http://127.0.0.1:5000/api/stats

# Teste rápido de login
curl http://127.0.0.1:5001/verificar-sessao
```

---

## Segurança

### Checklist de Segurança

• [ ] Alterar `SECRET_KEY` em produção
• [ ] Usar HTTPS em produção
• [ ] Restringir origins do CORS
• [ ] Implementar rate limiting
• [ ] Adicionar logs de auditoria
• [ ] Fazer backups regulares
• [ ] Validar entradas do usuário
• [ ] Usar senhas fortes (não CPF)

### Recomendações

1. **Senhas:** Implementar troca obrigatória no primeiro login
2. **Sessões:** Configurar timeout de inatividade
3. **Logs:** Registrar todas as tentativas de login
4. **Permissões:** Revisar níveis de acesso regularmente

---

## Suporte e Ajuda

### Problemas Comuns

1. Consulte a seção [Solução de Problemas](#solução-de-problemas)
2. Verifique logs dos servidores
3. Teste APIs com curl
4. Reiniciar servidores

### Documentação Adicional

• `ANALISE_LOGIN_completa.md` - Análise técnica do login
• `COMPARATIVO_SISTEMAS.md` - Comparação entre sistemas
• `CREDENCIAIS.md` - Lista de credenciais padrão

---

## Lista de Verificação DE IMPLANTAÇÃO

### Desenvolvimento
• [x] Instalar dependências
• [x] Configurar banco de dados
• [x] Teste ambos servidores
• [x] Verifique login admin
• [x] Cadastrar usuário teste
• [x] Teste todas as páginas

### Produção
• [ ] Alterar SECRET_KEY
• [ ] Configurar HTTPS
• [ ] Restringir CORS
• [ ] Configurar backups automáticos
• [ ] Implementar logs
• [ ] Teste recuperação de desastres
• [ ] Documentar procedimentos

---
**Versão:** 1.0 
**Última atualização:** Novembro 2025 
**Status:** - Sistema em Produção
