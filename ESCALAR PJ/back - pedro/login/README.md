# Sistema de Login - Escalar

Sistema de autenticação integrado ao sistema de gestão de escalas Escalar.

##  Descrição

Sistema completo de login que utiliza o mesmo banco de dados do módulo de cadastro, oferecendo:

-  Autenticação segura com hash de senha (Werkzeug)
-  Sessões persistentes (Flask Session)
-  Controle de acesso por nível (Administrador/Colaborador)
-  Dashboards personalizados por tipo de usuário
-  Troca de senha com validação
-  API REST para integração com frontend JavaScript
-  Interface responsiva com Bootstrap 5

##  Início Rápido

### 1. Certifique-se que o sistema de cadastro está configurado

```bash
cd "../cadastro"
python app.py
```

Isso criará o banco de dados e o usuário administrador padrão.

### 2. Inicie o servidor de login

```bash
python app_login.py
```

O servidor iniciará em: **http://127.0.0.1:5001**

### 3. Acesse a página de login

Abra no navegador: **http://127.0.0.1:5001/login**

##  Credenciais Padrão

### Administrador
- **Email:** admin@escalar.com
- **Senha:** admin123

### Colaboradores
- **Email:** [email cadastrado]
- **Senha:** [CPF do colaborador]

**Exemplo:** Se o CPF é `12345678901`, a senha padrão é `12345678901`

##  Estrutura de Arquivos

```
login/
├── app_login.py              # Aplicação Flask principal
├── requirements.txt          # Dependências Python
├── test_login.sh            # Script de testes automatizados
├── README.md                # Esta documentação
└── templates/
    ├── login.html           # Página de login
    ├── dashboard_admin.html # Dashboard do coordenador
    ├── dashboard_colaborador.html # Dashboard do colaborador
    └── trocar_senha.html    # Página de troca de senha
```

## 🔗 Rotas Disponíveis

### Rotas Web (HTML)

| Rota | Método | Descrição | Autenticação |
|------|--------|-----------|--------------|
| `/` | GET | Página inicial (redireciona) | Não |
| `/login` | GET, POST | Página de login | Não |
| `/logout` | GET | Logout do sistema | Sim |
| `/dashboard-admin` | GET | Dashboard do administrador | Admin |
| `/dashboard-colaborador` | GET | Dashboard do colaborador | Sim |
| `/trocar-senha` | GET, POST | Alterar senha | Sim |
| `/perfil` | GET | Perfil do usuário | Sim |

### Rotas API (JSON)

| Rota | Método | Descrição | Body |
|------|--------|-----------|------|
| `/api/login` | POST | Login via JSON | `{email, senha}` |
| `/verificar-sessao` | GET | Verifica se está logado | - |

## 🧪 Testando o Sistema

### Teste Automatizado

```bash
./test_login.sh
```

### Teste Manual

1. Acesse: http://127.0.0.1:5001/login
2. Use as credenciais do administrador
3. Você será redirecionado para o dashboard apropriado

### Teste da API com curl

```bash
# Login com sucesso
curl -X POST http://127.0.0.1:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@escalar.com","senha":"admin123"}'

# Verificar sessão
curl http://127.0.0.1:5001/verificar-sessao
```

##  Fluxo de Autenticação

```
1. Usuário acessa /login
   ↓
2. Insere email e senha
   ↓
3. Sistema valida no banco de dados
   ↓
4. Se válido: cria sessão + redireciona para dashboard
   ↓
5. Se inválido: mostra mensagem de erro
```

##  Níveis de Acesso

### Administrador (Coordenador)
- Dashboard com estatísticas gerais
- Acesso ao sistema de cadastro
- Gerenciamento de colaboradores
- Futuro: geração de escalas

### Colaborador (Comum)
- Dashboard personalizado
- Visualização de dados pessoais
- Futuro: solicitações de troca, férias, atestados

## 🔒 Segurança

- **Senhas:** Hash Werkzeug (PBKDF2-SHA256)
- **Sessões:** Flask Session com SECRET_KEY
- **CORS:** Configurado para desenvolvimento
- **Validação:** Server-side em todas as rotas
- **Proteção:** Decorators verificam autenticação

## 🔗 Integração com Sistema de Cadastro

O sistema de login **compartilha o mesmo banco de dados** (`instance/escalar.db`) do sistema de cadastro, garantindo:

-  Usuários cadastrados automaticamente podem fazer login
-  Sem duplicação de dados
-  Consistência entre módulos
-  Facilidade de manutenção

##  Logs e Debug

O servidor Flask roda em modo debug, mostrando:
- Requisições recebidas
- Erros detalhados
- Consultas ao banco de dados

## 🐛 Troubleshooting

### Problema: "Servidor não está rodando"
**Solução:** Execute `python app_login.py`

### Problema: "E-mail ou senha incorretos"
**Solução:** 
- Verifique as credenciais
- Para colaboradores, use o CPF como senha
- Para admin: `admin@escalar.com` / `admin123`

### Problema: "Erro ao conectar ao banco de dados"
**Solução:** Execute primeiro o sistema de cadastro para criar o banco:
```bash
cd ../cadastro
python app.py
```

### Problema: "Módulo não encontrado"
**Solução:** Instale as dependências:
```bash
pip install -r requirements.txt
```

## 🚧 Próximos Passos

- [ ] Implementar "Esqueci minha senha"
- [ ] Adicionar autenticação de dois fatores (2FA)
- [ ] Implementar logout automático por inatividade
- [ ] Adicionar logs de acesso
- [ ] Implementar rate limiting contra brute force
- [ ] Integrar com o frontend estático

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique este README
- Execute os testes: `./test_login.sh`
- Consulte a documentação do projeto principal

## 📄 Licença

Projeto acadêmico - UNIPAM 2025
