# 🚂 Deploy no Railway - Guia Completo

## 📋 Pré-requisitos

- Conta no GitHub (já tem ✅)
- Conta no Railway (criar grátis em https://railway.app)
- Projeto já no GitHub (já está ✅)

## 🚀 Passo a Passo - Deploy Completo

### 1. Criar Conta no Railway

1. Acesse: https://railway.app
2. Clique em **"Start a New Project"**
3. Faça login com sua conta do GitHub
4. Autorize o Railway a acessar seus repositórios

### 2. Criar Novo Projeto

1. No Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Procure por **"edenred-app-site"**
4. Clique no repositório para selecionar

### 3. Adicionar PostgreSQL

1. No projeto criado, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Railway criará automaticamente o banco e as variáveis de ambiente

### 4. Configurar Variáveis de Ambiente

No seu serviço (não no banco), vá em **"Variables"** e adicione:

```bash
# Node.js
NODE_ENV=production
PORT=5001

# Banco de Dados (Railway cria automaticamente)
# DATABASE_URL já está configurado pelo Railway
# Mas você precisa adicionar estas:
DATABASE_TYPE=SQL
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# JWT (IMPORTANTE: Crie um secret forte!)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_12345678901234567890
JWT_EXPIRE=7d

# Ollama (opcional - não funciona no Railway gratuito)
# OLLAMA_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.2:3b

# CORS (URL do seu frontend no Railway)
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
ORIGENS_CORS_PERMITIDAS=https://${{RAILWAY_PUBLIC_DOMAIN}}

# Outras
AMBIENTE_EXECUCAO=production
PORTA_SERVIDOR=5001
```

### 5. Configurar Build e Start

Railway já detecta automaticamente, mas verifique:

**Em Settings → Deploy:**
- Build Command: `npm install && cd backend && npm install`
- Start Command: `node backend/src/server.js`

### 6. Deploy Automático

1. Railway fará o deploy automaticamente
2. Aguarde o build terminar (3-5 minutos)
3. Quando aparecer "Active", o deploy está pronto! ✅

### 7. Obter URL Pública

1. Vá em **Settings → Networking**
2. Clique em **"Generate Domain"**
3. Copie a URL gerada (ex: `edenred-app-site.up.railway.app`)
4. Acesse a URL para ver seu site funcionando! 🎉

## ⚙️ Configurações Adicionais

### Frontend Separado (Opcional)

Se quiser servir o frontend separadamente:

1. Clique em **"+ New"** no projeto
2. Selecione **"Empty Service"**
3. Configure:
   - Build: `npm run build`
   - Start: `npx serve -s dist -p $PORT`
   - PORT: automático

### Habilitar HTTPS

✅ Railway já fornece HTTPS automático em todos os domínios!

### Logs e Monitoramento

1. Clique no serviço
2. Vá em **"Deployments"**
3. Clique no deployment ativo
4. Veja os **"Logs"** em tempo real

## 🔧 Troubleshooting

### Erro: "Application failed to respond"

**Solução:**
1. Verifique se a variável `PORT` está configurada
2. No `server.js`, certifique-se de usar `process.env.PORT`
3. Railway injeta a porta automaticamente

### Erro: "Database connection failed"

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Confirme as variáveis de ambiente do banco
3. Use as variáveis do Railway: `${{Postgres.PGHOST}}`

### Erro: "Build failed"

**Solução:**
1. Verifique os logs de build
2. Confirme que `package.json` tem todas as dependências
3. Rode `npm install` localmente para testar

### Ollama/IA não funciona

**Solução:**
O Railway gratuito não suporta Ollama. Opções:
1. Desabilitar IA temporariamente
2. Usar OpenAI API (pago, mas mais barato)
3. Fazer upgrade para Railway Pro ($5/mês)

## 📊 Limites do Plano Gratuito

Railway oferece:
- ✅ $5 de crédito grátis por mês
- ✅ Unlimited deployments
- ✅ PostgreSQL incluído
- ✅ HTTPS automático
- ⚠️ Serviços dormem após 30 min de inatividade (plano grátis)

**Uso estimado do projeto:**
- Backend + PostgreSQL: ~$3-4/mês
- Com frontend separado: ~$5-6/mês

## 🎯 Depois do Deploy

### 1. Testar o Site

```bash
# Testar health check
curl https://sua-url.up.railway.app/health

# Testar login
curl -X POST https://sua-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edenred.com.br","password":"admin123"}'
```

### 2. Configurar Domínio Próprio (Opcional)

1. Vá em **Settings → Networking**
2. Clique em **"Custom Domain"**
3. Adicione seu domínio
4. Configure DNS conforme instruções

### 3. Habilitar Auto-Deploy

✅ Já está habilitado! A cada push no GitHub, Railway faz deploy automático.

### 4. Monitorar Recursos

1. Vá em **"Metrics"**
2. Veja CPU, RAM e Network
3. Configure alertas se necessário

## 🔐 Segurança

### Alterar Senhas Padrão

⚠️ **IMPORTANTE**: Altere as senhas padrão após o deploy!

```bash
# Credenciais padrão do sistema
Admin: admin@edenred.com.br / admin123
User: usuario@edenred.com.br / user123
```

### Gerar JWT Secret Forte

```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use o resultado como `JWT_SECRET`

## 📱 URLs Importantes

Após o deploy, você terá:

- **Frontend**: https://sua-url.up.railway.app
- **Backend API**: https://sua-url.up.railway.app/api
- **Health Check**: https://sua-url.up.railway.app/health
- **Dashboard Railway**: https://railway.app/dashboard

## 🆘 Suporte

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/WIsleyoliveira/edenred-app-site/issues

## ✅ Checklist Final

Antes de compartilhar o site:

- [ ] Deploy concluído com sucesso
- [ ] Health check respondendo
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Consulta CNPJ funcionando
- [ ] Banco de dados populado
- [ ] Senhas padrão alteradas
- [ ] HTTPS ativo
- [ ] Domínio configurado (opcional)

---

🎉 **Parabéns! Seu site está no ar!**

Compartilhe o link: https://sua-url.up.railway.app
