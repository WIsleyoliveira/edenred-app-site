# 🎯 IMPORTAÇÃO COMPLETA - TODOS OS SEUS DADOS

## 📊 Resumo dos Dados que Serão Importados:

### 👥 Users: **49 usuários**
- **Admin Edenred** (admin@edenred.com.br) - Role: ADMIN
- **Wisley** (wisleygabriel@gmail.com)
- **Consultor Edenred** (consultor@edenred.com.br)
- E mais 46 usuários de teste

### 🏢 Companies: **8 empresas**
- Antonio Distribuição LTDA
- Eliane Consultoria
- Lea Tech
- Eric Metalúrgicas
- B3 S.A. Brasil Bolsa Balcão (2 registros)
- Arkama Intermediações (2 registros)

### 📋 Consultations: **11 consultas**
- Consultas CNPJ realizadas pelos usuários
- Histórico de buscas e resultados

### 🖼️ Landscapes: **0 imagens**
- Nenhuma imagem cadastrada no sistema local

---

## 🚀 Como Importar:

### Passo 1: Abrir o Arquivo
Abra o arquivo: **`railway-import-full.sql`**

### Passo 2: Copiar TODO o Conteúdo
- Pressione: **Cmd + A** (selecionar tudo)
- Pressione: **Cmd + C** (copiar)

### Passo 3: Acessar Railway
1. Vá para: https://railway.app
2. Login com sua conta
3. Selecione o projeto: **gleaming-freedom**
4. Clique no serviço: **Postgres**
5. Clique na aba: **Data**

### Passo 4: Colar e Executar
1. Cole o conteúdo na caixa de texto (Cmd + V)
2. Clique no botão: **"Run"** ou **"Execute"**
3. Aguarde a execução (pode demorar 10-30 segundos)

### Passo 5: Verificar
Após a importação, execute no mesmo editor:

```sql
SELECT 'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'consultations', COUNT(*) FROM consultations
UNION ALL
SELECT 'landscapes', COUNT(*) FROM landscapes;
```

**Resultado Esperado:**
```
users           49
companies        8
consultations   11
landscapes       0
```

---

## ✅ Após a Importação

1. **Teste o Login:**
   - Email: `admin@edenred.com.br`
   - Senha: A mesma que você usa localmente

2. **Acesse o Site:**
   - URL do Railway (verifique no dashboard)
   - Faça login com suas credenciais
   - Navegue pelas empresas cadastradas

3. **Verifique os Dados:**
   - Dashboard deve mostrar 8 empresas
   - Seu perfil deve estar disponível
   - Histórico de consultas preservado

---

## ⚠️ Importante

- **NÃO** delete o arquivo `backup-local.sql` (é seu backup de segurança)
- **NÃO** delete o arquivo `railway-import-full.sql` (caso precise reimportar)
- Se der erro na primeira tentativa, tente executar as seções separadamente:
  1. Primeiro: apenas a seção COMPANIES
  2. Depois: apenas a seção CONSULTATIONS
  3. Por último: apenas a seção USERS

---

## 🆘 Se Algo Der Errado

Se aparecer erros de duplicação:
```sql
-- Limpar dados antes de reimportar (CUIDADO!)
TRUNCATE users CASCADE;
TRUNCATE companies CASCADE;
TRUNCATE consultations CASCADE;
TRUNCATE landscapes CASCADE;
```

Depois reimporte o `railway-import-full.sql` novamente.

---

## 📞 Próximos Passos

Depois de importar com sucesso:
1. ✅ Testar login no site Railway
2. ✅ Verificar se empresas aparecem
3. ✅ Configurar variável OPENAI_API_KEY (se ainda não configurou)
4. ✅ Testar chatbot
5. ✅ Fazer commit e push das mudanças

---

**Arquivo Pronto:** `railway-import-full.sql` ✅
**Total de Registros:** 68 registros (49 users + 8 companies + 11 consultations)
