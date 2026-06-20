# GUIA DE TROUBLESHOOTING - ESCALAR

Soluções detalhadas para problemas comuns nos sistemas de cadastro e login.

---

## Índice

1. [Problemas de Inicialização](#problemas-de-inicialização)
2. [Erros de Conexão](#erros-de-conexão)
3. [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
4. [Erros de Autenticação](#erros-de-autenticação)
5. [Problemas de Cadastro](#problemas-de-cadastro)
6. [Erros de CORS](#erros-de-cors)
7. [Problemas de Sessão](#problemas-de-sessão)
8. [Erros de Validação](#erros-de-validação)

---

## PROBLEMAS DE INICIALIZAÇÃO

### Problema 1: "Address already in use" (Porta ocupada)
**Sintomas:**
```
OSError: [Errno 98] Address already in use
```
**Causa:** Servidor já está rodando na porta ou processo não foi encerrado corretamente.
**Solução 1 - Parar servidor existente:**
```bash
./manage_servers.sh stop
```
**Solução 2 - Matar processo manualmente:**
```bash
# Ver processo na porta 5000
lsof -i :5000

# Matar processo
kill -9 $(lsof -t -i:5000)

# Ver processo na porta 5001
lsof -i :5001

# Matar processo
kill -9 $(lsof -t -i:5001)
```
**Solução 3 - Matar todos os processos Python:**
```bash
pkill -f "python.*app.py"
pkill -f "python.*app_login.py"
```

---

### Problema 2: "ModuleNotFoundError: No module named 'flask'"
**Sintomas:**
```
ModuleNotFoundError: No module named 'flask'
```
**Causa:** Dependências não instaladas.
**Solução:**
```bash
# Instalar dependências do cadastro
cd "ESCALAR PJ/back - pedro/cadastro"
pip install -r requirements.txt

# Instalar dependências do login
cd ../login
pip install -r requirements.txt
```
**Verifique instalação:**
```bash
python -c "import flask; print(flask.__version__)"
```

---

### Problema 3: "Permission denied" ao executar manage_servers.sh
**Sintomas:**
```
bash: ./manage_servers.sh: Permission denied
```
**Causa:** Arquivo não tem permissão de execução.
**Solução:**
```bash
chmod +x manage_servers.sh
./manage_servers.sh start
```

---

### Problema 4: Script não encontra Python
**Sintomas:**
```
python: command not found
```
**Causa:** Python não instalado ou não no PATH.
**Solução 1 - Verifique instalação:**
```bash
which python
which python3
```
**Solução 2 - Usar python3 explicitamente:**
```bash
# Editar scripts para usar python3
sed -i 's/python /python3 /g' manage_servers.sh
```

---

## ERROS DE CONEXÃO

### Problema 1: "Connection refused" ao acessar API
**Sintomas:**
```
curl: (7) Failed to connect to 127.0.0.1 port 5000: Connection refused
```
**Causa:** Servidor não está rodando.
**Diagnóstico:**
```bash
# Verifique se servidores estão ativos
./manage_servers.sh status

# Verifique portas abertas
netstat -tuln | grep -E '5000|5001'
```
**Solução:**
```bash
# Iniciar servidores
./manage_servers.sh start

# Aguardar 5 segundos
sleep 5

# Teste conexão
curl http://127.0.0.1:5000/api/stats
curl http://127.0.0.1:5001/verificar-sessao
```

---

### Problema 2: Timeout ao fazer requisição
**Sintomas:**
Requisição demora muito ou não retorna.
**Causa:** Servidor travado ou sobrecarga.
**Diagnóstico:**
```bash
# Ver uso de CPU/Memória
top | grep python

# Ver processos Python
ps aux | grep python
```
**Solução:**
```bash
# Reiniciar servidores
./manage_servers.sh restart

# Se não resolver, matar processos e reiniciar
pkill -9 python
./manage_servers.sh start
```

---

### Problema 3: "404 Not Found" ao acessar página
**Sintomas:**
```html
<!doctype html>
<html lang=en>
<title>404 Not Found</title>
<h1>Not Found</h1>
```
**Causa:** Rota não existe ou servidor de login não está rodando.
**Diagnóstico:**
```bash
# Verifique se login está ativo
curl http://127.0.0.1:5001/verificar-sessao

# Ver rotas disponíveis no código
grep -n "@app.route" login/app_login.py
```
**Solução:**
```bash
# Iniciar servidor de login
cd login
python app_login.py

# Verifique URL correta
# Correto: http://127.0.0.1:5001/login
# Errado: http://127.0.0.1:5000/login
```

---

## PROBLEMAS DE BANCO DE DADOS

### Problema 1: "no such table: usuario"
**Sintomas:**
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) no such table: usuario
```
**Causa:** Banco de dados não foi inicializado.
**Solução:**
```bash
# Deletar banco existente (se corrompido)
rm cadastro/instance/escalar.db

# Iniciar servidor de cadastro (recria banco)
cd cadastro
python app.py

# Aguardar mensagem:
# "Usuario admin criado com sucesso!"
```

---

### Problema 2: "database is locked"
**Sintomas:**
```
sqlite3.OperationalError: database is locked
```
**Causa:** Múltiplos processos acessando o banco simultaneamente.
**Solução:**
```bash
# Parar todos os servidores
./manage_servers.sh stop

# Aguardar 5 segundos
sleep 5

# Reiniciar
./manage_servers.sh start
```
**Solução Alternativa - Reiniciar com novo banco:**
```bash
# Backup do banco atual
cp cadastro/instance/escalar.db cadastro/instance/backup.db

# Deletar banco
rm cadastro/instance/escalar.db

# Reiniciar servidores
./manage_servers.sh start
```

---

### Problema 3: Dados inconsistentes no banco
**Sintomas:**
Usuários duplicados, dados corrompidos, etc.
**Diagnóstico:**
```python
# Verifique dados no banco
python3 << 'EOF'
import sys
sys.path.insert(0, 'cadastro')
from models import db, Usuario
from app import app

with app.app_context():
 usuarios = Usuario.query.all()
 print(f"Total de usuários: {len(usuarios)}")
 for u in usuarios:
 print(f"{u.id}: {u.nome} | {u.email} | {u.cpf}")
EOF
```
**Solução - Limpar e recriar:**
```bash
# Backup
cp cadastro/instance/escalar.db cadastro/instance/backup-$(date +%Y%m%d).db

# Deletar
rm cadastro/instance/escalar.db

# Recriar
cd cadastro && python app.py
```

---

### Problema 4: "IntegrityError: UNIQUE constraint failed"
**Sintomas:**
```
sqlalchemy.exc.IntegrityError: (sqlite3.IntegrityError) UNIQUE constraint failed: usuario.email
```
**Causa:** Tentativa de cadastrar email ou CPF já existente.
**Solução:**
```bash
# Verifique se email existe
curl http://127.0.0.1:5000/api/verificar-email/usuario@email.com

# Verifique se CPF existe
curl http://127.0.0.1:5000/api/verificar-cpf/12345678901

# Se necessário, deletar usuário existente
curl -X DELETE http://127.0.0.1:5000/api/usuario/<id>
```

---

## ERROS DE AUTENTICAÇÃO

### Problema 1: "E-mail ou senha incorretos"
**Sintomas:**
Login retorna erro mesmo com credenciais corretas.
**Diagnóstico:**
```bash
# Verifique se usuário existe
curl http://127.0.0.1:5000/api/usuarios | grep "email_desejado"

# Teste login admin
curl -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@escalar.com","senha":"00000000000"}'
```
**Solução 1 - Resetar senha via API:**
```bash
curl -X POST http://127.0.0.1:5001/api/recuperar-senha \
 -H "Content-Type: application/json" \
 -d '{
 "email": "usuario@email.com",
 "cpf": "12345678901"
 }'
```
**Solução 2 - Resetar senha via Python:**
```python
python3 << 'EOF'
import sys
sys.path.insert(0, 'cadastro')
from models import db, Usuario
from auth import gerarHashSenha
from app import app

with app.app_context():
 # Encontrar usuário
 usuario = Usuario.query.filter_by(email='usuario@email.com').first()
 
 if usuario:
 # Resetar para CPF
 usuario.senha = gerarHashSenha(usuario.cpf)
 db.session.commit()
 print(f"Senha resetada para CPF: {usuario.cpf}")
 else:
 print("Usuário não encontrado")
EOF
```

---

### Problema 2: Login funciona mas redireciona errado
**Sintomas:**
Colaborador acessa página de admin ou vice-versa.
**Diagnóstico:**
```python
# Verifique nível de acesso
python3 << 'EOF'
import sys
sys.path.insert(0, 'cadastro')
from models import db, Usuario
from app import app

with app.app_context():
 usuario = Usuario.query.filter_by(email='usuario@email.com').first()
 if usuario:
 print(f"Nível de acesso: {usuario.nivel_acesso}")
EOF
```
**Solução - Corrigir nível de acesso:**
```bash
curl -X PUT http://127.0.0.1:5000/api/usuario/<id> \
 -H "Content-Type: application/json" \
 -d '{
 "nivel_acesso": "administrador"
 }'
```

---

### Problema 3: Senha não atualiza após recuperação
**Sintomas:**
Recuperação de senha diz sucesso, mas login continua falhando.
**Diagnóstico:**
```bash
# Verifique logs do servidor
tail -n 50 login/login_server.log

# Teste API diretamente
curl -X POST http://127.0.0.1:5001/api/recuperar-senha \
 -H "Content-Type: application/json" \
 -d '{
 "email": "usuario@email.com",
 "cpf": "12345678901"
 }' | python3 -m json.tool
```
**Solução:**
```bash
# Se retornar 404, dados estão errados
# Verifique dados corretos
curl http://127.0.0.1:5000/api/usuarios | grep -A5 "usuario@email.com"

# Usar dados corretos na recuperação
```

---

## PROBLEMAS DE CADASTRO

### Problema 1: "Email já cadastrado"
**Sintomas:**
```json
{
 "error": "Erro ao cadastrar colaborador: E-mail já cadastrado"
}
```
**Solução:**
```bash
# Opção 1: Usar outro email
# Opção 2: Verifique se é duplicação real
curl http://127.0.0.1:5000/api/verificar-email/email@empresa.com

# Opção 3: Deletar usuário existente
curl http://127.0.0.1:5000/api/usuarios | grep "email@empresa.com"
# Anotar o ID
curl -X DELETE http://127.0.0.1:5000/api/usuario/<id>
```

---

### Problema 2: "CPF já cadastrado"
**Sintomas:**
```json
{
 "error": "Erro ao cadastrar colaborador: CPF já cadastrado"
}
```
**Solução:**
```bash
# Verifique se CPF existe
curl http://127.0.0.1:5000/api/verificar-cpf/12345678901

# Encontrar usuário com esse CPF
curl http://127.0.0.1:5000/api/usuarios | grep "12345678901"

# Deletar se necessário
curl -X DELETE http://127.0.0.1:5000/api/usuario/<id>
```

---

### Problema 3: "O colaborador deve ter pelo menos 18 anos"
**Sintomas:**
```json
{
 "error": "Erro ao cadastrar colaborador: O colaborador deve ter pelo menos 18 anos"
}
```
**Solução:**
```bash
# Calcular data mínima (18 anos atrás)
python3 -c "from datetime import datetime, timedelta; print((datetime.now() - timedelta(days=18*365)).strftime('%Y-%m-%d'))"

# Usar data válida no cadastro
curl -X POST http://127.0.0.1:5000/api/cadastrar-colaborador \
 -H "Content-Type: application/json" \
 -d '{
 "nome": "Nome",
 "apelido": "Apelido",
 "email": "email@empresa.com",
 "cpf": "12345678901",
 "data_nascimento": "2000-01-01",
 "escala": "12x36",
 "turno": "diurno",
 "local": "CCE"
 }'
```

---

### Problema 4: "E-mail inválido"
**Sintomas:**
```json
{
 "error": "Erro ao cadastrar colaborador: E-mail inválido"
}
```
**Causa:** Formato de email incorreto.
**Solução:**
```bash
# Formato válido: usuario@dominio.com
# Exemplos corretos:
# - joao.silva@empresa.com
# - maria@gmail.com
# - teste123@servidor.com.br

# Exemplos incorretos:
# - emailsemaroba.com (sem @)
# - @empresa.com (sem usuário)
# - usuario@ (sem domínio)
```

---

### Problema 5: "Escala inválida"
**Sintomas:**
```json
{
 "error": "Erro ao cadastrar colaborador: Escala inválida. Use: 12x36, 6x1, 5x2, 5x1, 4x3"
}
```
**Solução:**
```bash
# Usar apenas escalas válidas:
# - 12x36 (12 horas trabalhadas, 36 horas de descanso)
# - 6x1 (6 dias trabalhados, 1 dia de descanso)
# - 5x2 (5 dias trabalhados, 2 dias de descanso)
# - 5x1 (5 dias trabalhados, 1 dia de descanso)
# - 4x3 (4 dias trabalhados, 3 dias de descanso)

# Atenção: Case-sensitive, use exatamente como listado
```

---

## ERROS DE CORS

### Problema 1: "Access-Control-Allow-Origin" header is present
**Sintomas:**
```
Access to fetch at 'http://127.0.0.1:5001/api/login' from origin 'http://127.0.0.1:5500' 
has been blocked by CORS policy
```
**Causa:** Requisição de origem não permitida.
**Solução - Adicionar origem ao CORS:**
```python
# Editar login/app_login.py
CORS(app, resources={
 r"/*": {
 "origins": [
 "http://localhost:5000",
 "http://127.0.0.1:5000",
 "http://localhost:5001",
 "http://127.0.0.1:5001",
 "http://127.0.0.1:5500", # Adicionar Live Server
 "*" # OU permitir todas (apenas em desenvolvimento)
 ],
 ...
 }
})
```

---

### Problema 2: Requisição funciona no curl mas não no browser
**Sintomas:**
curl funciona, mas JavaScript no navegador dá erro CORS.
**Causa:** Browser aplica política CORS, curl não.
**Solução:**
```bash
# Sempre acessar frontend via servidor Flask
# http://127.0.0.1:5001/login

# NÃO usar:
# - file:///caminho/para/login.html
# - Live Server (http://127.0.0.1:5500)
```

---

## PROBLEMAS DE SESSÃO

### Problema 1: Sessão não persiste após login
**Sintomas:**
Login bem-sucedido mas `/verificar-sessao` retorna `logado: false`.
**Causa:** Acesso via Live Server ou file://.
**Solução:**
```bash
# SEMPRE usar o servidor Flask
http://127.0.0.1:5001/login

# Verifique se sessão funciona
curl -c cookies.txt -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@escalar.com","senha":"00000000000"}'

curl -b cookies.txt http://127.0.0.1:5001/verificar-sessao
```

---

### Problema 2: "302 Redirect" ao acessar página protegida
**Sintomas:**
Acesso a páginas protegidas redireciona para login.
**Causa:** Sessão não existe ou expirou.
**Solução:**
```bash
# Fazer login novamente
# Verifique se cookie está sendo enviado
# No navegador: DevTools > Application > Cookies
```

---

### Problema 3: Sessão expira rapidamente
**Sintomas:**
Precisa fazer login frequentemente.
**Causa:** Cookie expira ou SECRET_KEY mudou.
**Solução:**
```python
# Editar login/app_login.py
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
app.config['SESSION_PERMANENT'] = True
```

---

## ERROS DE VALIDAÇÃO

### Problema 1: CPF aceito com menos de 11 dígitos
**Sintomas:**
Sistema aceita CPF com formatação (123.456.789-01).
**Causa:** Esperado. Sistema limpa formatação automaticamente.
**Comportamento correto:**
```bash
# Todas as formas são aceitas:
# - 12345678901 (limpo)
# - 123.456.789-01 (formatado)
# - 123 456 789 01 (com espaços)

# Sistema sempre salva limpo: 12345678901
```

---

### Problema 2: Data de nascimento no futuro
**Sintomas:**
```json
{
 "error": "Data de nascimento inválida"
}
```
**Solução:**
```bash
# Usar formato YYYY-MM-DD
# Data deve ser no passado e resultar em idade >= 18
```

---

## Suporte e Ajuda AVANÇADO

### Dump completo do banco de dados

```bash
sqlite3 cadastro/instance/escalar.db .dump > backup.sql
```

### Restaurar do dump

```bash
sqlite3 cadastro/instance/escalar.db < backup.sql
```

### Inspecionar banco via SQL

```bash
sqlite3 cadastro/instance/escalar.db
# Dentro do sqlite3:
.tables
SELECT * FROM usuario;
.quit
```

### Ver todas as configurações Flask

```python
python3 << 'EOF'
import sys
sys.path.insert(0, 'login')
from app_login import app

print("Configurações Flask:")
for key, value in app.config.items():
 print(f"{key}: {value}")
EOF
```

---

## QUANDO TUDO FALHA

### Reset Completo do Sistema

```bash
# 1. Parar tudo
./manage_servers.sh stop
pkill -9 python

# 2. Backup do banco
cp cadastro/instance/escalar.db cadastro/instance/backup-emergency.db

# 3. Limpar tudo
rm cadastro/instance/escalar.db
rm login/*.log cadastro/*.log 2>/dev/null

# 4. Reinstalar dependências
cd cadastro && pip install --force-reinstall -r requirements.txt && cd ..
cd login && pip install --force-reinstall -r requirements.txt && cd ..

# 5. Reiniciar
./manage_servers.sh start

# 6. Teste
curl http://127.0.0.1:5000/api/stats
curl -X POST http://127.0.0.1:5001/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@escalar.com","senha":"00000000000"}'
```

---
**Versão:** 1.0 
**Última atualização:** Novembro 2025 
**Se problema persistir:** Consultar documentação completa ou verificar logs detalhados.
