# 🚀 Guia de Configuração Completa - Sistema Escalar

Este documento contém **TODAS** as dependências e passos necessários para configurar o Sistema Escalar em um novo computador.

---

## 🌟 ATENÇÃO: Usando GitHub Codespaces?

**Se você está usando GitHub Codespaces ou VS Code dev container**, o processo é **MUITO mais simples**! 

� **Pule direto para:** [Configuração Rápida no Codespace](#configuração-rápida-no-codespace)

**Se você está instalando em uma máquina local** (seu computador), continue lendo normalmente.

---

## �📋 Índice

### Setup Rápido (Codespaces)
- [🚀 Configuração Rápida no Codespace](#configuração-rápida-no-codespace)

### Setup Completo (Máquina Local)
1. [Requisitos de Sistema](#requisitos-de-sistema)
2. [Instalação de Dependências Base](#instalação-de-dependências-base)
3. [Configuração do Backend (Python/Flask)](#configuração-do-backend)
4. [Configuração do Banco de Dados (MySQL)](#configuração-do-banco-de-dados)
5. [Configuração do Frontend](#configuração-do-frontend)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Iniciando o Sistema](#iniciando-o-sistema)
8. [Verificação da Instalação](#verificação-da-instalação)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Configuração Rápida no Codespace

Se você está usando **GitHub Codespaces**, a maioria das dependências já está instalada! Siga apenas estes passos:

### ✅ O que JÁ está instalado no Codespace:
- ✅ Python 3.12
- ✅ Git
- ✅ Node.js/npm (se necessário)
- ✅ Ferramentas de desenvolvimento
- ✅ VS Code integrado

### 📦 O que você PRECISA instalar:

#### 1. MySQL (único requisito que falta)

```bash
# Instalar MySQL
sudo apt update
sudo apt install -y mysql-server

# Iniciar MySQL
sudo service mysql start

# Verificar se está rodando
sudo service mysql status
```

#### 2. Configurar Banco de Dados

```bash
# Acessar MySQL como root (sem senha no Codespace)
sudo mysql
```

Dentro do MySQL, execute:
```sql
CREATE DATABASE escalar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'escalar_user'@'localhost' IDENTIFIED BY 'escalar123';
GRANT ALL PRIVILEGES ON escalar.* TO 'escalar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Configurar Backend

```bash
# Navegar para a pasta do backend
cd "ESCALAR PJ/back - pedro/cadastro"

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install --upgrade pip
pip install Flask==2.3.0 Flask-SQLAlchemy==3.0.5 Flask-CORS==4.0.0 Werkzeug==2.3.0 pymysql==1.1.0 cryptography==41.0.3 python-dotenv==1.0.0
```

#### 4. Criar arquivo .env

```bash
# Ainda na pasta cadastro
cat > .env << 'EOF'
DB_USER=escalar_user
DB_PASS=escalar123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=escalar
SECRET_KEY=sua-chave-secreta-codespace-$(date +%s)
FLASK_ENV=development
FLASK_DEBUG=1
EOF
```

#### 5. Inicializar Banco

```bash
# Ainda com venv ativo
python3 << 'EOF'
from app import app, db
with app.app_context():
    db.create_all()
    print("✅ Banco de dados criado com sucesso!")
EOF
```

#### 6. Iniciar o Sistema

```bash
# Iniciar backend
python3 app.py
```

**Pronto!** O backend estará rodando em `http://127.0.0.1:5000`

#### 7. Abrir Frontend

No Codespace, você pode:

**Opção A: Usar Simple Browser (VS Code)**
1. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
2. Digite "Simple Browser: Show"
3. Digite a URL: `http://127.0.0.1:5000`

**Opção B: Abrir diretamente**
1. Navegue até `ESCALAR PJ/front - julia - geizi - sara/login.html`
2. Clique com botão direito → "Open with Live Server"

**Opção C: Port Forwarding**
O Codespace automaticamente faz port forwarding. Você verá uma notificação:
- Clique em "Open in Browser" quando aparecer a notificação da porta 5000

### 🎯 Checklist Rápido - Codespace

Execute para verificar:

```bash
# 1. Python
python3 --version

# 2. MySQL rodando?
sudo service mysql status

# 3. Banco existe?
mysql -u escalar_user -pescalar123 -e "SHOW DATABASES LIKE 'escalar';"

# 4. Backend funcionando?
curl http://127.0.0.1:5000/api/usuarios
```

### ⚡ Reiniciar MySQL no Codespace

Se o MySQL parar (comum em Codespaces após inatividade):

```bash
sudo service mysql start
```

Ou adicione ao seu `.bashrc` para iniciar automaticamente:

```bash
echo 'sudo service mysql start 2>/dev/null' >> ~/.bashrc
```

### 🔄 Diferenças Importantes - Codespace vs Local

| Aspecto | Codespace | Máquina Local |
|---------|-----------|---------------|
| **Python** | ✅ Já instalado | ❌ Precisa instalar |
| **Git** | ✅ Já instalado | ❌ Precisa instalar |
| **MySQL** | ❌ Precisa instalar | ❌ Precisa instalar |
| **VS Code** | ✅ Integrado | 🔶 Opcional |
| **Navegador** | ✅ Simple Browser | ✅ Qualquer navegador |
| **Persistência** | ⚠️ Limitada* | ✅ Total |
| **Internet** | ✅ Necessária | 🔶 Só para setup |
| **Performance** | 🔶 Depende do plano | ✅ Depende do hardware |

*Dados persistem enquanto o Codespace existir, mas pode expirar se não usado por 30 dias (configurável).

### 💡 Dica: Script de Setup Rápido para Codespace

Salve como `setup-codespace.sh` na raiz do projeto:

```bash
#!/bin/bash
echo "🚀 Configurando Sistema Escalar no Codespace..."

# Instalar MySQL
echo "📦 Instalando MySQL..."
sudo apt update -qq
sudo apt install -y mysql-server > /dev/null 2>&1
sudo service mysql start

# Configurar banco
echo "🗄️ Configurando banco de dados..."
sudo mysql << EOF
CREATE DATABASE IF NOT EXISTS escalar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'escalar_user'@'localhost' IDENTIFIED BY 'escalar123';
GRANT ALL PRIVILEGES ON escalar.* TO 'escalar_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Setup backend
echo "🐍 Configurando backend..."
cd "ESCALAR PJ/back - pedro/cadastro"
python3 -m venv venv
source venv/bin/activate
pip install -q --upgrade pip
pip install -q Flask==2.3.0 Flask-SQLAlchemy==3.0.5 Flask-CORS==4.0.0 Werkzeug==2.3.0 pymysql==1.1.0 cryptography==41.0.3 python-dotenv==1.0.0

# Criar .env
cat > .env << 'ENVEOF'
DB_USER=escalar_user
DB_PASS=escalar123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=escalar
SECRET_KEY=codespace-secret-$(date +%s)
FLASK_ENV=development
FLASK_DEBUG=1
ENVEOF

# Inicializar banco
python3 << 'PYEOF'
from app import app, db
with app.app_context():
    db.create_all()
    print("✅ Banco inicializado!")
PYEOF

echo ""
echo "✅ Setup completo!"
echo ""
echo "Para iniciar o sistema:"
echo "  cd 'ESCALAR PJ/back - pedro/cadastro'"
echo "  source venv/bin/activate"
echo "  python3 app.py"
```

Executar:
```bash
chmod +x setup-codespace.sh
./setup-codespace.sh
```

---

**🎉 Pronto! Seu Codespace está configurado!**

Agora você pode pular para [Iniciando o Sistema](#iniciando-o-sistema) ou continuar lendo para entender a configuração completa em máquina local.

---

---

## 💻 Requisitos de Sistema

### Sistema Operacional
- **Linux**: Ubuntu 20.04+ / Debian 10+ (recomendado)
- **macOS**: 10.15+ (Catalina ou superior)
- **Windows**: 10/11 (com WSL2 recomendado)

### Hardware Mínimo
- **CPU**: 2 cores
- **RAM**: 4GB (8GB recomendado)
- **Disco**: 5GB de espaço livre
- **Rede**: Conexão com internet para instalação inicial

---

## 🔧 Instalação de Dependências Base

### 1. Python 3.12+

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3-pip
```

#### macOS
```bash
brew install python@3.12
```

#### Windows (via WSL2)
```bash
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3-pip
```

**Verificar instalação:**
```bash
python3 --version  # Deve mostrar Python 3.12.x
pip3 --version
```

---

### 2. MySQL 8.0+

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y mysql-server mysql-client
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### macOS
```bash
brew install mysql@8.0
brew services start mysql
```

#### Windows (via WSL2)
```bash
sudo apt update
sudo apt install -y mysql-server
sudo service mysql start
```

**Configuração inicial do MySQL:**
```bash
sudo mysql_secure_installation
```

**Criar banco de dados:**
```bash
sudo mysql -u root -p
```

Dentro do MySQL:
```sql
CREATE DATABASE escalar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'escalar_user'@'localhost' IDENTIFIED BY 'escalar123';
GRANT ALL PRIVILEGES ON escalar.* TO 'escalar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 3. Git

#### Linux
```bash
sudo apt install -y git
```

#### macOS
```bash
brew install git
```

#### Windows
Baixar de: https://git-scm.com/download/win

**Verificar:**
```bash
git --version
```

---

## 🐍 Configuração do Backend

### 1. Clonar o Repositório

```bash
cd ~
git clone https://github.com/jul-edu23/Escalar.git
cd Escalar
```

### 2. Criar Ambiente Virtual Python

```bash
cd "ESCALAR PJ/back - pedro/cadastro"
python3 -m venv venv
```

### 3. Ativar Ambiente Virtual

#### Linux/macOS
```bash
source venv/bin/activate
```

#### Windows (WSL2)
```bash
source venv/bin/activate
```

**Você verá `(venv)` no início do prompt quando ativado.**

### 4. Instalar Dependências Python

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Se o arquivo `requirements.txt` não existir, instalar manualmente:**
```bash
pip install Flask==2.3.0
pip install Flask-SQLAlchemy==3.0.5
pip install Flask-CORS==4.0.0
pip install Werkzeug==2.3.0
pip install pymysql==1.1.0
pip install cryptography==41.0.3
```

### 5. Lista Completa de Dependências Python

```
Flask==2.3.0
Flask-SQLAlchemy==3.0.5
Flask-CORS==4.0.0
Werkzeug==2.3.0
pymysql==1.1.0
cryptography==41.0.3
python-dotenv==1.0.0
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Variáveis de Ambiente para Banco de Dados

Criar arquivo `.env` em `ESCALAR PJ/back - pedro/cadastro/`:

```bash
nano .env
```

Adicionar:
```env
# Configurações do Banco de Dados MySQL
DB_USER=escalar_user
DB_PASS=escalar123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=escalar

# Chave Secreta Flask (gerar uma nova)
SECRET_KEY=sua-chave-secreta-muito-segura-aqui

# Ambiente
FLASK_ENV=development
FLASK_DEBUG=1
```

**Gerar SECRET_KEY segura:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 2. Inicializar Banco de Dados

Com o ambiente virtual ativado:

```bash
cd "ESCALAR PJ/back - pedro/cadastro"
python3 -c "from app import app, db; app.app_context().push(); db.create_all(); print('✅ Tabelas criadas!')"
```

### 3. Criar Usuário Coordenador Padrão

O sistema criará automaticamente ao iniciar `app.py`, mas você pode verificar:

```bash
python3 -c "from app import criarUsuarioCoordenador; criarUsuarioCoordenador()"
```

**Credenciais padrão:**
- Email: `admin@escalar.com`
- Senha: `00000000000` (11 zeros - formato CPF)

---

## 🎨 Configuração do Frontend

### 1. Navegador Moderno

**Requisitos:**
- Google Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+
- JavaScript habilitado
- Cookies habilitados

### 2. Dependências Frontend (CDN - Nada para instalar!)

O frontend usa **CDNs** para todas as bibliotecas, então **não há instalação necessária**:

- **Bootstrap 5.3.8**: CSS e JS via CDN
- **Bootstrap Icons 1.13.1**: Ícones via CDN
- **JavaScript Vanilla**: Sem frameworks adicionais

### 3. Estrutura de Arquivos Frontend

```
ESCALAR PJ/front - julia - geizi - sara/
├── login.html                      # Página de login
├── assets/
│   ├── css/
│   │   ├── global.css             # Estilos globais
│   │   ├── calendario.css         # Estilos do calendário
│   │   └── *.css                  # Outros estilos
│   ├── img/                        # Imagens
│   └── js/
│       ├── main.js                 # JavaScript principal
│       ├── JScolaborador/
│       │   └── calendario.js       # Calendário colaborador
│       └── JScoordenador/
│           └── calendarioADM_completo.js  # Calendário coordenador
├── userColaborador/
│   ├── calendario.html
│   ├── cadastrarAtestado.html
│   ├── cadastrarFerias.html
│   └── ...
└── userCoordenador/
    ├── calendarioAdm.html
    ├── cadastrarColaborador.html
    └── ...
```

---

## 🌐 Variáveis de Ambiente

### Arquivo `.env` Completo

Criar em: `ESCALAR PJ/back - pedro/cadastro/.env`

```env
# ==========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ==========================================
DB_USER=escalar_user
DB_PASS=escalar123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=escalar

# ==========================================
# CONFIGURAÇÕES DO FLASK
# ==========================================
SECRET_KEY=Cole-aqui-a-chave-gerada-com-secrets
FLASK_ENV=development
FLASK_DEBUG=1

# ==========================================
# CONFIGURAÇÕES DO SERVIDOR
# ==========================================
FLASK_HOST=127.0.0.1
FLASK_PORT_CADASTRO=5000
FLASK_PORT_LOGIN=5001

# ==========================================
# CORS (Permitir requisições do frontend)
# ==========================================
CORS_ORIGINS=*
```

---

## 🚀 Iniciando o Sistema

### 1. Iniciar Backend (Servidor Principal - Porta 5000)

```bash
# Navegar até a pasta do backend
cd "ESCALAR PJ/back - pedro/cadastro"

# Ativar ambiente virtual (se não estiver ativo)
source venv/bin/activate

# Iniciar servidor
python3 app.py
```

**Saída esperada:**
```
📅 Carregando sistema Escalar...
✅ Banco de dados conectado
✅ Coordenador padrão criado/verificado
 * Running on http://127.0.0.1:5000
```

### 2. Verificar Backend

Em outro terminal:
```bash
curl http://127.0.0.1:5000/api/usuarios
```

Deve retornar lista de usuários (pelo menos o coordenador padrão).

### 3. Abrir Frontend

**Opção A: Abrir diretamente no navegador**
```bash
# Linux
xdg-open "ESCALAR PJ/front - julia - geizi - sara/login.html"

# macOS
open "ESCALAR PJ/front - julia - geizi - sara/login.html"

# Windows
start "ESCALAR PJ/front - julia - geizi - sara/login.html"
```

**Opção B: Usar Live Server (VS Code)**
1. Instalar extensão "Live Server" no VS Code
2. Clicar com botão direito em `login.html`
3. Selecionar "Open with Live Server"

**IMPORTANTE:** O frontend faz requisições para `http://127.0.0.1:5000`, então certifique-se de que o backend está rodando!

---

## ✅ Verificação da Instalação

### Checklist de Verificação

Execute os seguintes comandos para verificar se tudo está funcionando:

#### 1. Python
```bash
python3 --version
# Esperado: Python 3.12.x
```

#### 2. MySQL
```bash
mysql --version
# Esperado: mysql Ver 8.0.x

mysql -u escalar_user -pescalar123 -e "USE escalar; SHOW TABLES;"
# Esperado: Lista de tabelas (Usuario, Escala, Troca, Ferias, Atestado, etc.)
```

#### 3. Flask
```bash
cd "ESCALAR PJ/back - pedro/cadastro"
source venv/bin/activate
python3 -c "import flask; print(f'Flask {flask.__version__}')"
# Esperado: Flask 2.3.0
```

#### 4. Backend API
```bash
curl http://127.0.0.1:5000/api/usuarios
# Esperado: JSON com lista de usuários
```

#### 5. Teste de Login
```bash
curl -X POST http://127.0.0.1:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@escalar.com","senha":"00000000000"}'
# Esperado: JSON com dados do usuário coordenador
```

---

## 🛠️ Troubleshooting

### Problema: "ModuleNotFoundError: No module named 'flask'"

**Solução:**
```bash
cd "ESCALAR PJ/back - pedro/cadastro"
source venv/bin/activate
pip install -r requirements.txt
```

---

### Problema: "Access denied for user 'escalar_user'@'localhost'"

**Solução:**
```bash
sudo mysql -u root -p
```

Dentro do MySQL:
```sql
DROP USER IF EXISTS 'escalar_user'@'localhost';
CREATE USER 'escalar_user'@'localhost' IDENTIFIED BY 'escalar123';
GRANT ALL PRIVILEGES ON escalar.* TO 'escalar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Problema: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solução:**
Verificar se `Flask-CORS` está instalado:
```bash
pip install Flask-CORS==4.0.0
```

Verificar em `app.py` se há:
```python
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "*"}})
```

---

### Problema: "Port 5000 is already in use"

**Solução:**
```bash
# Linux/macOS
lsof -ti:5000 | xargs kill -9

# Ou mudar a porta em app.py
app.run(host='127.0.0.1', port=5001)
```

---

### Problema: Frontend não consegue se conectar ao backend

**Verificar:**
1. Backend está rodando? `curl http://127.0.0.1:5000/api/usuarios`
2. Console do navegador mostra erro CORS?
3. URL correta nos arquivos JS? Procurar por `http://127.0.0.1:5000`

---

### Problema: "Table doesn't exist"

**Solução - Recriar banco:**
```bash
cd "ESCALAR PJ/back - pedro/cadastro"
source venv/bin/activate
python3 << EOF
from app import app, db
with app.app_context():
    db.drop_all()  # CUIDADO: Apaga todas as tabelas!
    db.create_all()
    print("✅ Banco recriado!")
EOF
```

---

## 📦 Backup do Banco de Dados

### Fazer Backup
```bash
mysqldump -u escalar_user -pescalar123 escalar > backup_escalar_$(date +%Y%m%d).sql
```

### Restaurar Backup
```bash
mysql -u escalar_user -pescalar123 escalar < backup_escalar_20251106.sql
```

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] Mudar `SECRET_KEY` para valor único e seguro
- [ ] Mudar senha do MySQL de `escalar123` para algo forte
- [ ] Mudar senha padrão do coordenador
- [ ] Desabilitar `FLASK_DEBUG=0` em produção
- [ ] Configurar CORS para domínios específicos (não `*`)
- [ ] Usar HTTPS (certificado SSL/TLS)
- [ ] Configurar firewall para portas 3306 e 5000
- [ ] Fazer backups regulares do banco de dados
- [ ] Implementar rate limiting nas APIs
- [ ] Logs de acesso e auditoria

---

## 📚 Comandos Úteis

### Backend
```bash
# Ativar ambiente virtual
cd "ESCALAR PJ/back - pedro/cadastro"
source venv/bin/activate

# Iniciar servidor
python3 app.py

# Ver logs em tempo real
tail -f cadastro_server.log

# Desativar ambiente virtual
deactivate
```

### Banco de Dados
```bash
# Acessar MySQL
mysql -u escalar_user -pescalar123 escalar

# Ver usuários
SELECT id, nome, email, cargo FROM Usuario;

# Ver escalas de novembro 2025
SELECT * FROM Escala WHERE data_plantao LIKE '2025-11%';

# Contar registros por tabela
SELECT 'Usuarios' as tabela, COUNT(*) as total FROM Usuario
UNION ALL
SELECT 'Escalas', COUNT(*) FROM Escala
UNION ALL
SELECT 'Trocas', COUNT(*) FROM Troca
UNION ALL
SELECT 'Ferias', COUNT(*) FROM Ferias
UNION ALL
SELECT 'Atestados', COUNT(*) FROM Atestado;
```

### Git
```bash
# Atualizar código
git pull origin devp

# Verificar status
git status

# Ver últimos commits
git log --oneline -5
```

---

## 📞 Suporte

### Documentação Adicional
- `README.md` - Visão geral do projeto
- `.github/copilot-instructions.md` - Instruções de arquitetura
- `MODAL_DETALHES_DIA.md` - Documentação do modal do coordenador
- `CALENDARIO_AUTO_PREENCHIMENTO.md` - Sistema de auto-preenchimento

### Logs
- Backend: `ESCALAR PJ/back - pedro/cadastro/cadastro_server.log`
- MySQL: `/var/log/mysql/error.log`

---

## ✨ Pronto!

Se você seguiu todos os passos acima, o sistema Escalar deve estar funcionando perfeitamente!

**Teste final:**
1. Abrir navegador em `http://127.0.0.1:5000` - deve mostrar "Sistema Escalar - API"
2. Abrir `login.html` no navegador
3. Login com `admin@escalar.com` / `00000000000`
4. Deve redirecionar para calendário do coordenador

🎉 **Bem-vindo ao Sistema Escalar!** 🎉
