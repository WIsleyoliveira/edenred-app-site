# 🚀 Sistema Edenred - Plataforma Completa de Gestão

Sistema completo de gestão de consultas CNPJ com IA integrada, desenvolvido para Edenred.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [API Endpoints](#-api-endpoints)
- [Credenciais Padrão](#-credenciais-padrão)

## ✨ Características

- 🔐 **Autenticação JWT** com sistema de permissões (Admin/User)
- 🤖 **IA Chatbot** integrado com Ollama (Llama 3.2)
- 📊 **Dashboard** interativo com auto-refresh e estatísticas em tempo real
- 🏢 **Gestão de Empresas** com filtros avançados e exportação CSV
- 📝 **Sistema de Consultas** CNPJ com rastreamento de produtos Edenred
- 🌓 **Dark Mode** com suporte a temas
- 📱 **Responsivo** - Funciona em desktop, tablet e mobile
- 🔄 **Auto-refresh** a cada 30 segundos
- 🗄️ **Visualizador de Banco de Dados** em tempo real
- 📤 **Exportação** de dados em CSV

## 🛠 Tecnologias

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (Sequelize ORM)
- **JWT** para autenticação
- **Ollama** para IA
- **bcryptjs** para hash de senhas

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **TailwindCSS** para estilização
- **Framer Motion** para animações
- **React Hot Toast** para notificações
- **Lucide React** para ícones

### IA
- **Ollama** com modelo **Llama 3.2 (3B)**
- Integração completa com chatbot

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x
- **Ollama** (para funcionalidade de IA)

### Instalando Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo Llama 3.2
ollama pull llama3.2:3b
```

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/edenred.git
cd edenred
```

### 2. Instale as dependências

```bash
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

### 3. Configure o banco de dados PostgreSQL

```bash
# Criar banco de dados
createdb cnpj_consultation

# Ou via psql
psql -U postgres
CREATE DATABASE cnpj_consultation;
\q
```

## ⚙️ Configuração

### Backend (.env)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Servidor
NODE_ENV=development
PORT=5001

# Banco de Dados
DATABASE_TYPE=SQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cnpj_consultation
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d

# Ollama (IA)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=Sistema Edenred
```

## 🎯 Executando o Projeto

### Opção 1: Script Automático (Recomendado)

```bash
chmod +x start-project.sh
./start-project.sh
```

### Opção 2: Manual

**Terminal 1 - Backend:**
```bash
cd backend
node src/server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - DB Viewer:**
```bash
cd backend
node db-viewer.js
```

**Terminal 4 - Ollama (IA):**
```bash
ollama serve
```

## 🌐 URLs de Acesso

Após iniciar todos os serviços:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **DB Viewer**: http://localhost:3002
- **API Docs**: http://localhost:5001/api/docs
- **Health Check**: http://localhost:5001/health

## 📁 Estrutura do Projeto

```
edenred/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações do banco
│   │   ├── controllers/     # Controladores da API
│   │   ├── middleware/      # Middlewares (auth, validation)
│   │   ├── models/          # Modelos Sequelize
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços (chatbot, etc)
│   │   └── utils/           # Utilitários
│   ├── db-viewer.js         # Visualizador do DB
│   └── package.json
├── src/
│   ├── components/          # Componentes React
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços de API
│   ├── types/              # TypeScript types
│   └── config/             # Configurações
├── start-project.sh        # Script de inicialização
└── package.json
```

## 🎨 Funcionalidades

### Para Todos os Usuários
- ✅ Login/Logout seguro
- ✅ Dashboard com estatísticas
- ✅ Consulta CNPJ
- ✅ Gestão de empresas
- ✅ Filtros avançados
- ✅ Exportação CSV
- ✅ Chatbot com IA
- ✅ Dark mode

### Para Administradores
- ✅ Visualizar todas as consultas do sistema
- ✅ Ver informações de todos os usuários
- ✅ Editar/Excluir registros
- ✅ Acesso ao DB Viewer
- ✅ Estatísticas globais

### Produtos Edenred Suportados
- 🚗 **Fleet** - Gestão de frotas
- 🍽️ **Ticket Restaurant** - Vale refeição
- 💳 **Pay** - Pagamentos
- 🥗 **Alimenta** - Vale alimentação
- ⛽ **Abastecimento** - Combustível
- 📋 **Outras** - Outros produtos

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Registro
GET    /api/auth/verify         # Verificar token
```

### Consultas
```
GET    /api/consultations       # Listar consultas
POST   /api/consultations       # Nova consulta
GET    /api/consultations/:id   # Detalhes
PUT    /api/consultations/:id   # Atualizar
DELETE /api/consultations/:id   # Excluir
```

### Empresas
```
GET    /api/companies           # Listar empresas
POST   /api/companies           # Nova empresa
GET    /api/companies/:id       # Detalhes
PUT    /api/companies/:id       # Atualizar
DELETE /api/companies/:id       # Excluir
```

### Chatbot (IA)
```
POST   /api/chatbot/message     # Enviar mensagem
GET    /api/chatbot/health      # Status Ollama
GET    /api/chatbot/quick-replies  # Respostas rápidas
DELETE /api/chatbot/conversation/:userId  # Limpar histórico
```

### Usuários
```
GET    /api/users               # Listar usuários (Admin)
GET    /api/users/:id           # Detalhes usuário
PUT    /api/users/:id           # Atualizar usuário
DELETE /api/users/:id           # Excluir usuário (Admin)
```

## 🔑 Credenciais Padrão

### Administrador
- **Email**: admin@edenred.com.br
- **Senha**: admin123

### Usuário Normal
- **Email**: usuario@edenred.com.br
- **Senha**: user123

> ⚠️ **IMPORTANTE**: Altere estas senhas em produção!

## 🧪 Testando a API

### Usando curl

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edenred.com.br","password":"admin123"}'

# Listar consultas (com token)
curl http://localhost:5001/api/consultations \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Testar IA
curl -X POST http://localhost:5001/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"Qual a diferença entre Fleet e Pay?"}'
```

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Verifique se a porta 5001 está livre

### Frontend não carrega
- Confirme se o backend está rodando
- Verifique a URL da API no `.env`
- Limpe o cache: `npm run dev -- --force`

### IA não responde
- Verifique se o Ollama está rodando: `ollama list`
- Confirme o modelo: `ollama pull llama3.2:3b`
- Teste: `curl http://localhost:11434/api/tags`

### Erro de conexão com banco
```bash
# Reiniciar PostgreSQL
brew services restart postgresql@14  # macOS
sudo systemctl restart postgresql    # Linux
```

## 📝 Scripts Disponíveis

```bash
# Frontend
npm run dev          # Iniciar dev server
npm run build        # Build para produção
npm run preview      # Preview do build

# Backend
npm start            # Iniciar servidor
npm run seed         # Popular banco de dados
npm test             # Rodar testes
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Wisley Oliveira** - [@WIsleyoliveira](https://github.com/WIsleyoliveira)

## 🙏 Agradecimentos

- Edenred pela oportunidade
- Comunidade Open Source
- Ollama Team pelo modelo de IA

---

⭐ Se este projeto foi útil, considere dar uma estrela!

📧 Contato: [seu-email@exemplo.com](mailto:seu-email@exemplo.com)
