# 🗓️ Escalar - Sistema de Gestão de Plantões

Sistema completo de gerenciamento de escalas de trabalho para a segurança do Centro Universitário de Patos de Minas (UNIPAM).

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-1.0-blue)

---

## 📋 Identificação do Projeto

### 🎯 Nome do Projeto
**Escalar** - Sistema de Gestão de Plantões e Escalas de Trabalho

### 👥 Equipe do Projeto
- **Pedro Henrique Ferreira de Mello** - Back-End e APIs
- **Júlia Eduarda Fernandes Silva** - Front-End
- **Geizilane da Silva Melo** - Front-End
- **Sara Ferreira Rodrigues** - Front-End
- **Laís Santana Landim Silva** - Banco de Dados

### 🏢 Organização Beneficiária
**Fundação Educacional de Patos de Minas (FEPAM)**  
**Centro Universitário de Patos de Minas (UNIPAM)** - Setor de Vigilância

---

## 🎯 Descrição do Projeto

### 💡 Apresentação
O **Escalar** é um sistema web completo para gestão de plantões da equipe de segurança do UNIPAM. O sistema automatiza o controle de escalas, gerencia solicitações de trocas, férias e atestados médicos, proporcionando maior eficiência operacional e transparência na gestão de recursos humanos.

### ✨ Principais Funcionalidades

#### 🔐 **Sistema de Autenticação**
- Login seguro com hash de senhas (bcrypt)
- Dois níveis de acesso: **Colaborador** e **Coordenador**
- Sessões seguras com Flask Session
- Redirecionamento automático baseado no perfil do usuário

#### 👤 **Módulo do Colaborador** (6 páginas)

1. **📅 Calendário Pessoal** (`calendario.html`)
   - Visualização mensal da escala de trabalho
   - Tipos de evento: Trabalho, Folga, Férias, Atestado, Substituição
   - Integração com Google Calendar API
   - Sincronização automática de eventos
   - Legenda de cores por tipo de evento
   - Sistema de notificações em tempo real

2. **🔄 Trocas Disponíveis** (`trocasDisponiveis.html`)
   - Visualização de todas as trocas disponíveis no sistema
   - Cards informativos com detalhes de cada troca
   - Filtros por colaborador
   - Sistema de busca integrado
   - Notificações de trocas aceitas/recusadas

3. **📝 Solicitar Troca** (`solicitarTroca.html`)
   - Formulário de solicitação de troca de plantão
   - Seleção de substituto via modal
   - Validação de data e motivo
   - Busca e filtro de colaboradores disponíveis
   - Envio de notificação ao substituto

4. **✈️ Cadastrar Férias** (`cadastrarFerias.html`)
   - Formulário de solicitação de férias
   - Validação de período: 5 a 30 dias
   - Cálculo automático de dias úteis
   - Campo de observação
   - Feedback visual de validação

5. **🏥 Cadastrar Atestado** (`cadastrarAtestado.html`)
   - Formulário de envio de atestado médico
   - Upload de arquivo (imagem/PDF)
   - Validação: máximo 15 dias
   - Campo CID opcional
   - Suporte a FormData para arquivos

6. **📊 Minhas Solicitações** (`minhasSolicitacoes.html`)
   - Histórico completo de solicitações do colaborador
   - Visualização de trocas, férias e atestados
   - Status colorido: Pendente (amarelo), Aprovado (verde), Rejeitado (vermelho)
   - Atualização em tempo real

#### 👨‍💼 **Módulo do Coordenador** (5 páginas + 3 subpáginas)

1. **📅 Calendário Administrativo** (`calendarioAdm.html`)
   - Visualização mensal completa de todos os colaboradores
   - Modal de detalhes do dia com lista de colaboradores
   - Abas por status: Trabalho, Folga, Férias, Atestado, Substituição
   - Contadores por categoria
   - Sistema de notificações de pendências
   - Integração completa com todas as APIs

2. **👥 Quadro de Colaboradores** (`quadroColaboradores.htm`)
   - Lista completa de todos os colaboradores
   - Informações detalhadas: nome, CPF, escala, turno, local
   - Busca e filtros avançados
   - Sistema de notificações de pedidos pendentes
   - Acesso rápido ao cadastro

3. **➕ Cadastrar Colaborador** (`cadastrarColaborador.html`)
   - Formulário completo de cadastro
   - Validações em tempo real (CPF, email, idade)
   - Campos: nome, apelido, CPF, data de nascimento, email, turno, escala, local
   - Foto de perfil (upload)
   - Senha padrão: CPF do colaborador

4. **📋 Solicitações Pendentes** (`solicitacoes.html`)
   - Central de aprovação/rejeição
   - Visualização de todas as solicitações pendentes
   - Ações em lote ou individuais
   - Filtros por tipo e data

5. **📜 Histórico de Ações**
   - **Trocas** (`historico/trocas.html`)
     - Registro completo de todas as trocas (aprovadas/recusadas)
     - Filtros por período e status
     - Informações de solicitante e substituto
   
   - **Férias** (`historico/ferias.html`)
     - Histórico de todas as solicitações de férias
     - Status e períodos solicitados
     - Filtros e exportação de dados
   
   - **Atestados** (`historico/Atestados.html`)
     - Registro de todos os atestados enviados
     - Visualização de arquivos anexados
     - Auditoria completa

#### 🔔 **Sistema de Notificações Unificado**
- **Badge circular vermelho** com contador de notificações
- **Modal interativo** com lista detalhada
- **Atualização automática**: 15s (coordenador) / 30s (colaborador)
- **Tipos de notificação**:
  - Trocas aceitas/recusadas/solicitadas
  - Férias aprovadas/rejeitadas
  - Atestados aceitos/negados
- **Event listeners padronizados**: toggle, fechar, click fora

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Python 3.12+**
- **Flask 2.3.0** - Framework web
- **Flask-SQLAlchemy 3.0.5** - ORM para banco de dados
- **Flask-CORS 4.0.0** - Controle de CORS
- **Werkzeug 2.3.0** - Segurança e hashing de senhas
- **PyMySQL** - Driver para MySQL

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização customizada
- **Bootstrap 5.3.8** - Framework CSS responsivo
- **JavaScript (Vanilla)** - Lógica e interatividade
- **Bootstrap Icons** - Ícones do sistema

### **Banco de Dados**
- **MySQL 8.0+** - Banco de dados relacional
- **7 Tabelas principais**: Usuarios, Escalas, Trocas, Ferias, Atestados, Notificacoes, HistoricoAcao

### **APIs e Integrações**
- **RESTful API** - Comunicação Frontend-Backend
- **6 Blueprints modulares**: escalas, trocas, férias, atestados, notificações, histórico

---

## 📊 Estrutura do Projeto

```
ESCALAR PJ/
├── back - pedro/                      # Backend Python/Flask
│   ├── cadastro/                      # API principal (porta 5000)
│   │   ├── app.py                     # Servidor Flask com Blueprints
│   │   ├── models.py                  # Modelos do banco (7 tabelas)
│   │   ├── auth.py                    # Autenticação e segurança
│   │   ├── validations.py             # Validações de negócio
│   │   ├── api_escalas.py             # API de escalas
│   │   ├── api_trocas.py              # API de trocas
│   │   ├── api_ferias.py              # API de férias
│   │   ├── api_atestados.py           # API de atestados
│   │   ├── api_notificacoes.py        # API de notificações
│   │   └── api_historico.py           # API de histórico/auditoria
│   └── login/                         # Servidor de autenticação (porta 5001)
│       └── app_login.py               # Servidor com rotas de login
│
├── front - julia - geizi - sara/      # Frontend HTML/CSS/JS
│   ├── login.html                     # Página de login
│   ├── assets/
│   │   ├── css/                       # Estilos globais e específicos
│   │   │   ├── global.css             # Design system (cores, fonts)
│   │   │   ├── calendario.css
│   │   │   ├── login.css
│   │   │   └── ...
│   │   ├── img/                       # Imagens e logos
│   │   └── js/
│   │       ├── main.js                # Funções globais
│   │       ├── validations.js         # Validações frontend
│   │       ├── JScolaborador/         # Scripts do colaborador
│   │       │   ├── calendario.js
│   │       │   ├── calendario_simples.js
│   │       │   ├── trocasDisponiveis.js
│   │       │   └── ...
│   │       └── JScoordenador/         # Scripts do coordenador
│   │           ├── calendarioADM_completo.js
│   │           ├── quadroColaboradores.js
│   │           └── ...
│   ├── userColaborador/               # Páginas do colaborador (6)
│   │   ├── calendario.html
│   │   ├── trocasDisponiveis.html
│   │   ├── solicitarTroca.html
│   │   ├── cadastrarFerias.html
│   │   ├── cadastrarAtestado.html
│   │   └── minhasSolicitacoes.html
│   └── userCoordenador/               # Páginas do coordenador (5+3)
│       ├── calendarioAdm.html
│       ├── quadroColaboradores.htm
│       ├── cadastrarColaborador.html
│       ├── solicitacoes.html
│       └── historico.html/
│           ├── trocas.html
│           ├── ferias.html
│           └── Atestados.html
│
└── banco - lais/                      # Documentação do banco
    └── README.md
```

---

## 🗄️ Modelo de Dados

### **Principais Entidades**

1. **Usuario** - Dados dos colaboradores e coordenadores
2. **Escala** - Registro diário de plantões
3. **Troca** - Solicitações de troca de plantão
4. **Ferias** - Solicitações de férias
5. **Atestado** - Atestados médicos
6. **Notificacao** - Notificações do sistema
7. **HistoricoAcao** - Auditoria de ações

### **Valores Enum**
- **Escalas**: `12x36`, `6x1`, `5x2`, `5x1`, `4x3`
- **Turnos**: `diurno`, `noturno`, `misto`
- **Locais**: `CCE`, `CCV`, `Campus`, `CCO`
- **Status Troca**: `pendente`, `aprovada`, `recusada`
- **Status Férias**: `pendente`, `aprovada`, `rejeitada`
- **Status Atestado**: `pendente`, `aceito`, `negado`

---

## 🚀 Como Executar

### **Pré-requisitos**
- Python 3.12+
- MySQL 8.0+
- Navegador moderno (Chrome, Firefox, Edge)

### **Configuração do Ambiente**

1. **Clone o repositório**
```bash
git clone https://github.com/jul-edu23/Escalar.git
cd Escalar
```

2. **Configure o banco de dados**
```bash
# Crie o banco de dados MySQL
mysql -u root -p
CREATE DATABASE escalar;
exit;
```

3. **Configure as variáveis de ambiente** (opcional)
```bash
export DB_USER=root
export DB_PASS=escalar123
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=escalar
```

4. **Instale as dependências do backend**
```bash
cd "ESCALAR PJ/back - pedro/cadastro"
pip install -r requirements.txt
```

5. **Inicie o servidor principal**
```bash
python app.py
# Servidor rodando em http://localhost:5000
```

6. **Inicie o servidor de login** (em outro terminal)
```bash
cd "ESCALAR PJ/back - pedro/login"
python app_login.py
# Servidor rodando em http://localhost:5001
```

7. **Acesse o sistema**
```
Abra: http://localhost:5001/login.html
```

### **Credenciais Padrão**
- **Coordenador**: `admin@escalar.com` / `00000000000`
- **Colaboradores**: email cadastrado / CPF (sem formatação)

---

## 📡 Endpoints da API

### **Autenticação**
- `POST /login` - Autenticação de usuários

### **Escalas**
- `GET /api/escalas` - Listar escalas
- `GET /api/escalas/mes?ano={ano}&mes={mes}` - Escalas por mês
- `POST /api/escalas` - Criar escala
- `PUT /api/escalas/<id>` - Atualizar escala
- `DELETE /api/escalas/<id>` - Deletar escala

### **Trocas**
- `GET /api/trocas` - Listar trocas
- `GET /api/trocas/pendentes` - Trocas pendentes
- `POST /api/trocas` - Criar solicitação de troca
- `PUT /api/trocas/<id>/aprovar` - Aprovar troca
- `PUT /api/trocas/<id>/recusar` - Recusar troca

### **Férias**
- `GET /api/ferias` - Listar férias
- `GET /api/ferias/pendentes` - Férias pendentes
- `POST /api/ferias` - Solicitar férias
- `PUT /api/ferias/<id>/aprovar` - Aprovar férias
- `PUT /api/ferias/<id>/rejeitar` - Rejeitar férias

### **Atestados**
- `GET /api/atestados` - Listar atestados
- `GET /api/atestados/pendentes` - Atestados pendentes
- `POST /api/atestados` - Enviar atestado
- `PUT /api/atestados/<id>/aceitar` - Aceitar atestado
- `PUT /api/atestados/<id>/negar` - Negar atestado

### **Notificações**
- `GET /api/notificacoes?usuario_id={id}` - Notificações do usuário
- `PUT /api/notificacoes/<id>/marcar-lida` - Marcar como lida

### **Histórico**
- `GET /api/historico` - Histórico de ações

### **Usuários**
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/<id>` - Detalhes do usuário
- `POST /api/cadastrar-colaborador` - Cadastrar colaborador
- `PUT /api/usuarios/<id>` - Atualizar usuário
- `DELETE /api/usuarios/<id>` - Deletar usuário

---

## 🎨 Design System

### **Paleta de Cores**
```css
:root {
  --azul: #00466c;      /* Cor primária - brand */
  --cinza: #d9d9d9;     /* Backgrounds e containers */
  --branco: #ffffff;    /* Texto em fundos escuros */
  --preto: #000000;     /* Texto principal */
  --sombra: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
}
```

### **Cores de Status**
- 🟢 **Verde** (`#d1e7dd`) - Aprovado/Aceito
- 🔴 **Vermelho** (`#f8d7da`) - Rejeitado/Negado
- 🟡 **Amarelo** (`#fff3cd`) - Pendente
- 🔵 **Azul** (`#cfe2ff`) - Informação

---

## 📈 Status do Projeto

### ✅ **Concluído**
- [x] Sistema de autenticação e segurança
- [x] Cadastro de colaboradores com validação
- [x] Calendário do colaborador com Google Calendar
- [x] Calendário administrativo com modal de detalhes
- [x] Sistema completo de trocas
- [x] Sistema de férias
- [x] Sistema de atestados
- [x] Sistema de notificações unificado
- [x] Histórico de ações (auditoria)
- [x] 6 APIs RESTful modulares
- [x] Integração frontend-backend (80%)

### 🚧 **Em Desenvolvimento**
- [ ] Sistema de IA para geração automática de escalas
- [ ] Relatórios e dashboards analíticos
- [ ] Exportação de dados (PDF/Excel)
- [ ] Sistema de alertas por email/SMS

---

## 👥 Matriz de Responsabilidades

| Módulo | Responsável(is) | Status |
|--------|----------------|--------|
| **Backend (APIs)** | Pedro Henrique | ✅ Concluído |
| **Autenticação** | Pedro Henrique | ✅ Concluído |
| **Banco de Dados** | Laís Santana | ✅ Concluído |
| **Frontend - Colaborador** | Júlia, Geizilane, Sara | ✅ Concluído |
| **Frontend - Coordenador** | Júlia, Geizilane, Sara | ✅ Concluído |
| **Sistema de Notificações** | Júlia, Geizilane, Sara | ✅ Concluído |
| **Integração Google Calendar** | Sara | ✅ Concluído |
| **IA de Escalas** | Sara | ⏳ Planejado |

---

## 📝 Licença

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso para o UNIPAM.

---

## 📞 Contato

**Instituição:** Centro Universitário de Patos de Minas (UNIPAM)  
**Setor:** Vigilância - FEPAM  
**Período:** Agosto a Dezembro de 2025

---

**Desenvolvido com ❤️ pela equipe Escalar**

