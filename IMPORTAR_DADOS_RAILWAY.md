# 🚀 Guia: Importar Dados para Railway (Método Simples)

## ⚠️ Problema Identificado
O firewall está bloqueando conexões diretas ao banco PostgreSQL do Railway (`metro.proxy.rlwy.net:45797`).

## ✅ Solução: Usar Interface Web do Railway

### Método 1: Importar via Railway Dashboard (RECOMENDADO)

1. **Acessar o Banco de Dados**
   ```
   https://railway.app
   ```
   - Login com sua conta
   - Selecione o projeto: `gleaming-freedom`
   - Clique no serviço: `Postgres`

2. **Abrir o Data Tab**
   - Clique na aba `Data` no topo
   - Você verá uma interface SQL

3. **Copiar SQL do Backup**
   - Abra o arquivo: `backup-local.sql`
   - Copie APENAS as partes de INSERT (ignore CREATE TYPE, CREATE TABLE)
   - Cole no editor SQL do Railway
   - Clique em `Run`

### Método 2: Usar Ferramenta Externa (TablePlus/DBeaver)

**Opção A: TablePlus**
1. Download: https://tableplus.com/
2. Nova conexão PostgreSQL:
   ```
   Host: metro.proxy.rlwy.net
   Port: 45797
   User: postgres
   Password: HLvBZqeEAesIsJXBiyZzGhfGbcWvUbRl
   Database: railway
   ```
3. File → Import → From SQL dump
4. Selecione `backup-local.sql`

**Opção B: DBeaver**
1. Download: https://dbeaver.io/
2. Nova conexão PostgreSQL (mesmos dados acima)
3. Tools → Execute SQL script
4. Selecione `backup-local.sql`

### Método 3: Criar Usuários Manualmente (Rápido)

Se você só precisa de alguns usuários para testar:

1. **Acessar Railway Dashboard → Postgres → Data**

2. **Criar Usuário Admin:**
   ```sql
   INSERT INTO users (id, nome, email, senha, cpf, perfil, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'Admin',
     'admin@example.com',
     '$2b$10$encrypted_password_here',
     '12345678900',
     'ADMIN',
     NOW(),
     NOW()
   );
   ```

3. **Criar Senha Criptografada:**
   ```javascript
   // Execute no console do Node.js local:
   const bcrypt = require('bcrypt');
   bcrypt.hash('sua_senha', 10).then(hash => console.log(hash));
   ```

## 🎯 Dados que Você Precisa Importar

Prioridade dos dados:

1. **Users** (essencial para login)
2. **Companies** (suas empresas cadastradas)
3. **Consultations** (histórico de consultas)
4. **Landscapes** (imagens/paisagens)

## 📊 Verificar Dados Importados

Após importar, execute no Railway Data tab:

```sql
-- Contar usuários
SELECT COUNT(*) FROM users;

-- Contar empresas
SELECT COUNT(*) FROM companies;

-- Contar consultas
SELECT COUNT(*) FROM consultations;

-- Ver primeiro usuário
SELECT id, nome, email, perfil FROM users LIMIT 1;
```

## 🔧 Alternativa: Railway CLI com Proxy

Se nenhum método acima funcionar:

```bash
# Criar tunnel temporário
railway run --service Postgres bash

# Dentro do container:
psql $DATABASE_URL < /caminho/para/backup-local.sql
```

**Nota:** Você precisaria fazer upload do backup para um bucket S3 ou GitHub primeiro.

## ❓ Qual Método Usar?

| Método | Facilidade | Velocidade | Recomendado |
|--------|-----------|-----------|-------------|
| Railway Dashboard | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ SIM |
| TablePlus/DBeaver | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ SIM |
| Manual (SQL) | ⭐⭐⭐ | ⭐⭐ | Se poucos dados |
| Railway CLI | ⭐⭐ | ⭐⭐⭐⭐ | Última opção |

## 🚨 Importante

- **NÃO** execute `DROP TABLE` no Railway (vai perder configurações)
- **TESTE** com 1-2 registros primeiro
- **BACKUP** antes de importar dados

---

**Próximo Passo:** Te recomendo usar **TablePlus** ou a **Interface Web do Railway** para importar os dados! 🎯
