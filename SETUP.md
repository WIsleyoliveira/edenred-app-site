# 🚀 Sistema Edenred - Guia de Configuração

Este guia contém as instruções para configurar e executar o Sistema de Consulta CNPJ da Edenred.

## 📋 Pré-requisitos

- Node.js 18+ 
- MongoDB (opcional, se usar MongoDB)
- Firebase Account (se usar Firebase)
- Git

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd app_edenred
```

### 2. Instalar dependências do Frontend
```bash
npm install
```

### 3. Instalar dependências do Backend
```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuração

### 1. Configuração do Backend

1. Copie o arquivo `.env.example` para `.env`:
```bash
cd backend
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:

#### Configurações Obrigatórias:
- `CHAVE_SECRETA_JWT`: Chave secreta para JWT (já configurada)
- `PORTA_SERVIDOR`: Porta do servidor (5001)
- `AMBIENTE_EXECUCAO`: Ambiente de execução (desenvolvimento)

#### Configurações do Banco de Dados:
Por padrão, o sistema está configurado para usar Firebase. Se quiser usar MongoDB:

```env
TIPO_BANCO_DADOS=mongodb
URL_CONEXAO_MONGODB=mongodb://localhost:27017/sistema_consulta_cnpj
```

Para Firebase (já configurado):
```env
TIPO_BANCO_DADOS=firebase
CHAVE_API_FIREBASE=AIzaSyDiumkATE7zvJoygX8VIXWfc60caWwrTzc
# ... outras configurações Firebase já estão definidas
```

### 2. Configuração do Frontend

O arquivo `.env` do frontend já está configurado com as variáveis necessárias. Você pode editar se necessário:

```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=AIzaSyDiumkATE7zvJoygX8VIXWfc60caWwrTzc
# ... outras configurações Firebase
```

## 🚀 Executando o Sistema

### 1. Iniciar o Backend
```bash
cd backend
npm run dev
```

O backend estará disponível em: `http://localhost:5001`

### 2. Iniciar o Frontend (em outro terminal)
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 📊 Verificação de Saúde

Para verificar se tudo está funcionando:

1. Backend health check: `http://localhost:5001/health`
2. Frontend: `http://localhost:5173`

## 🗄️ Configuração do Banco de Dados

### MongoDB (Opcional)
Se escolher usar MongoDB:

1. Instale o MongoDB localmente
2. Configure a variável `URL_CONEXAO_MONGODB` no `.env`
3. O sistema criará as coleções automaticamente

### Firebase (Padrão)
As configurações do Firebase já estão definidas e funcionais.

## 🔧 Scripts Disponíveis

### Frontend
- `npm run dev`: Inicia em modo desenvolvimento
- `npm run build`: Gera build de produção
- `npm run lint`: Executa linting
- `npm run preview`: Preview do build

### Backend
- `npm run dev`: Inicia em modo desenvolvimento com nodemon
- `npm start`: Inicia em modo produção
- `npm run seed`: Popula banco com dados iniciais
- `npm test`: Executa testes

## 🐛 Resolução de Problemas

### Erro de CORS
Se encontrar erros de CORS, verifique:
1. Se o frontend está rodando na porta correta (5173)
2. Se a configuração `ORIGENS_CORS_PERMITIDAS` no backend inclui a porta do frontend

### Erro de Banco de Dados
1. Verifique se as variáveis de ambiente estão corretas
2. Para MongoDB: certifique-se que o serviço está rodando
3. Para Firebase: verifique se as credenciais estão corretas

### Erro de Porta
Se a porta 5001 já estiver em uso:
1. Altere `PORTA_SERVIDOR` no backend/.env
2. Altere `VITE_API_URL` no frontend/.env

### Problemas de Autenticação
1. Verifique se `CHAVE_SECRETA_JWT` está definida
2. Limpe localStorage do browser
3. Verifique logs do backend

## 🚀 Deploy em Produção

### Backend
1. Configure variáveis de ambiente de produção
2. Use PM2 ou similar para gerenciar o processo
3. Configure proxy reverso (Nginx)

### Frontend
1. Execute `npm run build`
2. Sirva os arquivos estáticos do diretório `dist`

## 🔐 Segurança

- Todas as senhas são criptografadas com bcrypt
- JWT tokens para autenticação
- Sanitização de dados de entrada
- Rate limiting configurado
- Headers de segurança com Helmet.js

## 📝 Logs

- Backend: Logs no console com diferentes níveis
- Development: Logs detalhados
- Production: Logs essenciais

## 🤝 Suporte

Em caso de problemas:
1. Verifique os logs do backend
2. Verifique o console do browser
3. Verifique se todas as dependências estão instaladas
4. Verifique as configurações do `.env`

---

✅ **Status das Correções Aplicadas:**

- [x] Corrigido import faltante do bcryptjs no backend
- [x] Arquivo .env do backend criado e configurado
- [x] Corrigido erros de import no apiService.ts
- [x] Corrigido erros de CSS no Home.tsx
- [x] Adicionado Error Boundary para React
- [x] Adicionada validação de variáveis de ambiente
- [x] Configuração Firebase movida para variáveis de ambiente
- [x] Adicionados tipos TypeScript globais
- [x] Melhorado tratamento de erros na API
- [x] Sistema robusto contra falhas de rede e timeouts

🎉 **O sistema agora está preparado para rodar sem erros!**