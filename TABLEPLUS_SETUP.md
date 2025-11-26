# 🎯 CONFIGURAR TABLEPLUS - PASSO A PASSO

## 1️⃣ Abrir TablePlus
Acabei de instalar o TablePlus. Abra ele:
- Vá em **Applications** → **TablePlus**
- Ou pressione **Cmd + Space** e digite "TablePlus"

## 2️⃣ Criar Nova Conexão

1. Clique no botão **"Create a new connection"** (ou Cmd+N)
2. Selecione: **PostgreSQL**

## 3️⃣ Preencher Dados da Conexão

Cole esses dados exatamente como estão:

```
Name: Railway Edenred
Host: metro.proxy.rlwy.net
Port: 45797
User: postgres
Password: HLvBZqeEAesIsJXBiyZzGhfGbcWvUbRl
Database: railway
```

**Deixe os outros campos vazios/padrão**

## 4️⃣ Testar Conexão

1. Clique no botão **"Test"** (embaixo)
2. Se aparecer **"Connection successful"** ✅ → Perfeito!
3. Se aparecer erro de timeout ❌ → Seu firewall está bloqueando

## 5️⃣ Conectar

1. Clique em **"Connect"**
2. Você verá as tabelas do banco: `users`, `companies`, `consultations`, `landscapes`

## 6️⃣ Importar Dados

### Método A: Via Menu (Mais Fácil)
1. Menu superior: **File → Import → From SQL Dump**
2. Selecione o arquivo: `railway-import-full.sql`
3. Clique em **"Open"** ou **"Import"**
4. Aguarde a importação (10-30 segundos)

### Método B: Via Query (Se Método A não funcionar)
1. Clique no botão **SQL** (ou pressione Cmd+T)
2. Abra o arquivo `railway-import-full.sql` no editor de texto
3. Copie TODO o conteúdo (Cmd+A, Cmd+C)
4. Cole no TablePlus (Cmd+V)
5. Clique em **"Run"** ou pressione **Cmd+Enter**

## 7️⃣ Verificar Importação

Após importar, execute esta query no TablePlus:

```sql
SELECT 'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'consultations', COUNT(*) FROM consultations
UNION ALL
SELECT 'landscapes', COUNT(*) FROM landscapes;
```

**Resultado esperado:**
```
users           49
companies        8
consultations   11
landscapes       0
```

## ✅ Pronto!

Seus dados estão no Railway! Agora você pode:
1. Acessar o site do Railway
2. Fazer login com: `admin@edenred.com.br`
3. Ver suas empresas e consultas

---

## 🆘 Se der erro de conexão

Se o TablePlus não conseguir conectar (firewall bloqueando), me avise que vamos usar o método alternativo via API do próprio backend.
