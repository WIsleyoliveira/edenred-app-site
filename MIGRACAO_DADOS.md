# 📦 Migração de Dados - Local → Railway

## ✅ Backup criado com sucesso!

O arquivo `backup-local.sql` foi criado com todos os seus dados:
- ✅ Usuários
- ✅ Empresas
- ✅ Consultas
- ✅ Favoritos
- ✅ Todos os dados

---

## 🚀 Como importar para o Railway:

### **Passo 1: Obter DATABASE_URL do Railway**

1. Vá no **Railway** → Seu projeto
2. Clique no serviço **PostgreSQL** (não no edenred-app-site)
3. Vá na aba **"Connect"**
4. Copie a **"DATABASE_URL"** (começando com `postgresql://`)

**Exemplo da URL:**
```
postgresql://postgres:SenhaAqui123@autorack.proxy.rlwy.net:12345/railway
```

---

### **Passo 2: Importar dados**

No terminal, execute (substitua pela SUA URL):

```bash
psql 'postgresql://COLE_SUA_URL_AQUI' < backup-local.sql
```

**Exemplo completo:**
```bash
psql 'postgresql://postgres:SenhaAqui123@autorack.proxy.rlwy.net:12345/railway' < backup-local.sql
```

---

### **Passo 3: Verificar**

Após importar, vá no Railway:
1. PostgreSQL → **"Data"**
2. Clique em **"Query"**
3. Execute:
```sql
SELECT * FROM users;
SELECT * FROM companies;
```

Deve mostrar seus dados! ✅

---

## 🔧 Se der erro:

### **Erro: "psql: command not found"**

**Solução:**
Instale PostgreSQL client:
```bash
brew install postgresql@14
```

### **Erro: "connection refused"**

**Solução:**
1. Verifique se copiou a URL correta
2. URL deve começar com `postgresql://`
3. Inclua aspas simples: `'postgresql://...'`

### **Erro: "permission denied"**

**Solução:**
A URL já tem as credenciais corretas. Use exatamente como está.

### **Erro: "relation already exists"**

**Solução:**
As tabelas já existem. Duas opções:

**Opção A - Limpar e reimportar:**
```sql
-- No Railway Query:
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS landscapes CASCADE;
```

Depois rode o import novamente.

**Opção B - Importar apenas dados:**
```bash
pg_dump -h localhost -U postgres -d cnpj_consultation --data-only -f backup-data-only.sql
psql 'SUA_URL_RAILWAY' < backup-data-only.sql
```

---

## 📊 Verificação Final

Após importar, teste no site:
1. Acesse: `https://sua-url.up.railway.app`
2. Faça login com seus usuários antigos
3. Verifique se empresas aparecem
4. Verifique se consultas aparecem

---

## 🎯 Alternativa Rápida (Railway CLI)

Se tiver Railway CLI instalado:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Conectar ao banco
railway connect postgres

# Importar (quando conectado)
\i backup-local.sql
```

---

## ⚠️ Importante

- ✅ Backup está em: `backup-local.sql`
- ✅ Não delete este arquivo até confirmar que funcionou
- ✅ Você pode importar quantas vezes quiser
- ✅ Se errar, pode limpar e tentar de novo

---

## 🆘 Precisa de ajuda?

Me envie:
1. Mensagem de erro completa
2. Screenshot da tela do Railway
3. Primeiros caracteres da sua DATABASE_URL (sem senha!)

**Exemplo:** `postgresql://postgres:***@autorack.proxy...`

---

**Boa sorte! Em 2 minutos seus dados estarão no Railway!** 🚀
