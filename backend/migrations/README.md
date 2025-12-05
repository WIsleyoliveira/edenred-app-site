# 📋 Migrations - Guia de Uso

## 🎯 Propósito

Este sistema de migrations garante que a coluna `phone` na tabela `users` sempre exista, mesmo que este projeto não a utilize diretamente. Esta coluna é compartilhada com outro projeto que usa Prisma.

## 📁 Estrutura

```
backend/
├── migrations/
│   ├── 20251023211806-add_produto_to_consultations.js
│   └── 20251205003800-add-phone-to-users.js  ← Nova migration
├── run-migration.js  ← Script executor
└── src/models/User.js  ← Modelo atualizado com campo phone
```

## 🚀 Como Executar

### Opção 1: Script Node (Recomendado)

```bash
cd backend
node run-migration.js
```

### Opção 2: Manualmente via SQL

Se preferir executar via SQL diretamente:

```sql
-- Adicionar coluna phone se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        COMMENT ON COLUMN users.phone IS 'Telefone do usuário - Compartilhado com projeto Prisma';
    END IF;
END $$;
```

## ⚙️ Configuração

### Variáveis de Ambiente Necessárias

```bash
DATABASE_URL=postgresql://usuario:senha@host:5432/database
# ou
POSTGRES_URL=postgresql://usuario:senha@host:5432/database
```

## 🔒 Importante

### ⚠️ NÃO REMOVER A COLUNA PHONE

Esta coluna é usada por outro projeto que compartilha o mesmo banco de dados. A migration **não** remove a coluna no rollback.

### ⚠️ Evitar sync({ force: true })

**NUNCA** use em produção:
```javascript
// ❌ EVITE ISTO EM PRODUÇÃO
sequelize.sync({ force: true })  // Apaga todas as tabelas!
sequelize.sync({ alter: true })  // Pode remover colunas não mapeadas
```

**✅ USE ISTO**:
```javascript
sequelize.sync()  // Apenas cria tabelas que não existem
```

## 📝 Migration Atual: add-phone-to-users

### O que faz:

1. ✅ Verifica se a coluna `phone` já existe
2. ✅ Adiciona a coluna se não existir
3. ✅ Define tipo: `VARCHAR(20)`
4. ✅ Permite valores `NULL`
5. ✅ Adiciona comentário explicativo
6. ⚠️ **NÃO remove** no rollback (por segurança)

### Estrutura da coluna:

```javascript
phone: {
  type: DataTypes.STRING(20),
  allowNull: true,
  validate: {
    is: /^[\d\s\(\)\-\+]+$/  // Apenas dígitos, espaços, parênteses, hífen e +
  }
}
```

## 🔄 Execução Automática

A migration é executada automaticamente quando o servidor inicia, graças ao código em `src/config/database.js`:

```javascript
// Executar migrations pendentes
await runPendingMigrations(sequelize);
```

## 🛠️ Troubleshooting

### Erro: "relation SequelizeMeta does not exist"

Execute manualmente:
```sql
CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
  name VARCHAR(255) NOT NULL PRIMARY KEY
);
```

### Erro: "column already exists"

Não há problema! A migration detecta e pula.

### Coluna phone não aparece

1. Verifique se a migration foi executada:
```sql
SELECT * FROM "SequelizeMeta";
```

2. Force a execução:
```bash
node run-migration.js
```

3. Verifique a estrutura da tabela:
```sql
\d users
```

## 📊 Verificar Status

```sql
-- Ver migrations executadas
SELECT * FROM "SequelizeMeta" ORDER BY name;

-- Ver estrutura da tabela users
\d users;

-- Verificar se phone existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'phone';
```

## 🎓 Boas Práticas

1. ✅ Sempre use migrations para alterações de schema
2. ✅ Teste localmente antes de aplicar em produção
3. ✅ Documente o propósito de cada migration
4. ✅ Use timestamps no nome do arquivo (YYYYMMDDHHMMSS)
5. ✅ Implemente verificação de existência (idempotência)
6. ⚠️ Cuidado com rollbacks em ambientes compartilhados
7. ⚠️ Nunca remova colunas usadas por outros projetos

## 📞 Uso do Campo Phone

Este projeto **não precisa usar** o campo `phone` ativamente, mas deve mantê-lo para compatibilidade:

```javascript
// ✅ Ao criar usuário (phone é opcional)
const user = await User.create({
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'senha123',
  phone: '+55 11 98765-4321'  // Opcional
});

// ✅ Ao buscar usuário (phone será incluído)
const user = await User.findOne({ where: { email: 'joao@example.com' }});
console.log(user.phone);  // Disponível se foi definido

// ✅ Ao atualizar (pode ser null)
await user.update({ phone: null });  // OK
```

## 🔗 Integração com Prisma

O outro projeto pode usar assim:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String
  phone     String?  // Opcional, mapeado para a mesma coluna
  // ... outros campos
  
  @@map("users")
}
```

---

**Criado em:** 05/12/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para uso
