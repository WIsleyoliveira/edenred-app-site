# 🔧 Troubleshooting Railway - Guia de Solução de Problemas

## ❌ Erro: "Application failed to respond"

### Causas Comuns:

#### 1. **Porta incorreta** ✅ CORRIGIDO
O Railway fornece a porta via `process.env.PORT`, não `PORTA_SERVIDOR`.

**Solução:** Já corrigido no último commit!

#### 2. **Banco de dados não conectado**

**Sintomas nos logs:**
```
Error: Connection refused
ECONNREFUSED postgresql://...
```

**Solução:**
1. Verifique se o PostgreSQL está rodando no Railway
2. Confirme as variáveis `DB_HOST`, `DB_PORT`, etc.
3. Use as referências: `${{Postgres.PGHOST}}`

#### 3. **Variáveis de ambiente faltando**

**Sintomas nos logs:**
```
❌ Falha na validação de variáveis de ambiente
JWT_SECRET is required
```

**Solução:**
Verifique se TODAS as variáveis foram adicionadas:
- `NODE_ENV=production`
- `DATABASE_TYPE=SQL`
- `JWT_SECRET=...`
- `OPENAI_API_KEY=...` (se usar IA)

#### 4. **Dependências não instaladas**

**Sintomas nos logs:**
```
Error: Cannot find module 'express'
```

**Solução:**
1. Vá em Settings → Deploy
2. Build Command: `npm install && cd backend && npm install`
3. Start Command: `node backend/src/server.js`

---

## 📊 Como Ver os Logs

### No Railway:
1. Clique no serviço
2. Aba **"Deployments"**
3. Clique no deployment ativo
4. Veja **"Deploy Logs"** e **"View Logs"**

### Logs importantes:
```
✅ Servidor rodando em modo production
✅ Banco de dados conectado com sucesso
✅ Sistema inicializado com sucesso
```

Se não aparecer isso, há um problema!

---

## 🔍 Checklist de Debug

- [ ] PostgreSQL está rodando?
- [ ] Variáveis estão todas configuradas?
- [ ] Logs mostram erro específico?
- [ ] Build terminou com sucesso?
- [ ] Health check responde? (https://sua-url/health)

---

## 🚨 Erros Específicos

### "Module not found: express"
**Solução:** 
```bash
# No Railway Settings → Deploy
Build Command: npm install && cd backend && npm install
```

### "ECONNREFUSED PostgreSQL"
**Solução:**
1. Certifique-se que PostgreSQL foi criado no Railway
2. Use `${{Postgres.PGHOST}}` nas variáveis
3. Não use `localhost`

### "Invalid JWT_SECRET"
**Solução:**
Adicione variável `JWT_SECRET` com um secret forte

### "OpenAI API error"
**Solução:**
1. Verifique se `OPENAI_API_KEY` está correto
2. Confirme se tem crédito na OpenAI
3. Teste: https://platform.openai.com/api-keys

### "Port already in use"
**Solução:**
Isso não acontece no Railway. Se ver localmente:
```bash
# Matar processo na porta
lsof -ti:5001 | xargs kill -9
```

---

## ✅ Deploy Bem-Sucedido

Você saberá que funcionou quando:
1. ✅ Build completa sem erros
2. ✅ Logs mostram "Servidor rodando"
3. ✅ Health check responde: https://sua-url/health
4. ✅ Site carrega: https://sua-url

---

## 🔄 Forçar Redeploy

Se nada funcionar:
1. Vá em Settings
2. Clique em **"Redeploy"**
3. Ou faça um commit vazio:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 🆘 Ainda não funciona?

1. Copie os logs completos
2. Verifique as variáveis de ambiente
3. Teste localmente primeiro:
```bash
cd backend
node src/server.js
```

4. Se funcionar local mas não no Railway:
   - Problema é nas variáveis de ambiente
   - Ou problema de porta/host

---

## 📞 Suporte

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/WIsleyoliveira/edenred-app-site/issues

---

**Última atualização:** 26/11/2025
