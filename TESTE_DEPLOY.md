# 🧪 Guia de Testes - Deploy Railway

## ✅ Checklist de Funcionamento

### 1. **Backend está online?**
Acesse: `https://sua-url.up.railway.app/health`

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Servidor funcionando normalmente",
  "timestamp": "2025-11-26T...",
  "version": "1.0.0",
  "environment": "production"
}
```

✅ Se aparecer isso, backend está OK!

---

### 2. **Frontend carrega?**
Acesse: `https://sua-url.up.railway.app`

**Deve aparecer:**
- Tela de login
- Logo Edenred
- Campos de email e senha
- Botão "Entrar"

✅ Se aparecer, frontend está OK!

---

### 3. **Login funciona?**

**Teste 1 - Admin:**
```
Email: admin@edenred.com.br
Senha: admin123
```

**Teste 2 - Usuário:**
```
Email: usuario@edenred.com.br
Senha: user123
```

**Após login, deve:**
- ✅ Redirecionar para /dashboard
- ✅ Mostrar nome do usuário
- ✅ Mostrar estatísticas
- ✅ Menu lateral funcionando

---

### 4. **Dashboard carrega dados?**

**Verifique:**
- [ ] Contador de empresas
- [ ] Contador de consultas
- [ ] Contador de favoritos
- [ ] Gráficos aparecem
- [ ] Auto-refresh (espere 30s)

---

### 5. **Consulta CNPJ funciona?**

1. Vá em **"Consultas"**
2. Clique em **"Nova Consulta"**
3. Digite um CNPJ: `00.000.000/0001-91`
4. Selecione produto: **Fleet**
5. Clique em **"Consultar"**

**Deve:**
- ✅ Mostrar loading
- ✅ Buscar dados da Receita Federal
- ✅ Exibir dados da empresa
- ✅ Salvar no banco

---

### 6. **Chatbot IA funciona?**

1. Clique no ícone do chat (canto inferior direito)
2. Digite: "Qual a diferença entre Fleet e Pay?"
3. Aguarde resposta

**Se configurou OpenAI:**
- ✅ IA responde em português
- ✅ Resposta sobre produtos Edenred

**Se NÃO configurou:**
- ⚠️ Mensagem padrão: "Entre em contato: 0800..."

---

### 7. **Navegação funciona?**

Teste todos os menus:
- [ ] Dashboard
- [ ] Empresas
- [ ] Consultas
- [ ] Galeria
- [ ] Favoritos
- [ ] Upload
- [ ] Perfil

---

### 8. **Dark Mode funciona?**

1. Clique no ícone do sol/lua (canto superior)
2. Deve alternar entre claro e escuro
3. Preferência deve persistir (recarregue a página)

---

### 9. **Logout funciona?**

1. Clique no seu nome (canto superior direito)
2. Clique em **"Sair"**
3. Deve voltar para tela de login
4. Tente acessar /dashboard direto (deve redirecionar para login)

---

### 10. **Performance está boa?**

Abra DevTools (F12) → Network:
- [ ] Página carrega em < 2 segundos
- [ ] CSS/JS com cache (304)
- [ ] API responde em < 500ms

---

## 🐛 Se algo não funcionar:

### **Erro: "Network Error" ou "Load Failed"**

**Causa:** Frontend não conecta com backend

**Solução:**
1. Veja logs no Railway
2. Confirme que backend iniciou
3. Teste health check: `/health`
4. Verifique CORS nos logs

### **Erro: "Invalid credentials"**

**Causa:** Usuários não foram criados

**Solução:**
Veja logs, deve aparecer:
```
👥 Usuários já existem no sistema
```

Se não aparecer, algo deu errado na inicialização.

### **Erro: "Cannot connect to database"**

**Causa:** PostgreSQL não conectou

**Solução:**
1. Verifique se PostgreSQL está rodando no Railway
2. Confirme variáveis `DB_HOST`, `DB_PORT`, etc.
3. Veja logs de conexão

### **Chatbot não responde (IA)**

**Causa:** OpenAI não configurada ou sem crédito

**Solução:**
1. Verifique `OPENAI_API_KEY` nas variáveis
2. Confirme crédito em https://platform.openai.com
3. Veja logs: "Erro ao comunicar com IA"

---

## 📊 Logs Importantes

No Railway → Deployments → View Logs:

**Sucesso:**
```
✅ Servidor rodando em modo production
✅ PostgreSQL conectado
✅ Tabelas sincronizadas
✅ Sistema inicializado com sucesso
```

**Erro:**
```
❌ Erro ao conectar database
❌ Variáveis de ambiente não encontradas
❌ Cannot find module
```

---

## 🎯 Tudo funcionando?

Se todos os testes passaram:
- ✅ Backend online
- ✅ Frontend carregando
- ✅ Login funcionando
- ✅ Dashboard com dados
- ✅ API respondendo
- ✅ Banco conectado

**PARABÉNS! Deploy 100% funcional!** 🎉

Agora é só usar e compartilhar! 🚀

---

**Problemas?** 
Copie os logs do Railway e me envie!
