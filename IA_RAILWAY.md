# 🤖 Como Habilitar IA no Railway

O chatbot do sistema suporta **2 opções de IA**:

## Opção 1: OpenAI (Recomendado para Railway) ✅

### Vantagens:
- ✅ Funciona perfeitamente no Railway
- ✅ Muito barato (~$0.002 por 1000 tokens)
- ✅ Resposta rápida
- ✅ Sem necessidade de GPU

### Como Configurar:

#### 1. Criar Conta OpenAI
1. Acesse: https://platform.openai.com
2. Crie uma conta (grátis)
3. Vá em **API Keys**
4. Clique em **"Create new secret key"**
5. Copie a chave (ex: `sk-proj-xxxxx...`)

#### 2. Adicionar $5 de Crédito
1. Vá em **Billing** → **Add payment method**
2. Adicione um cartão
3. Coloque $5 de crédito (dura meses!)

#### 3. Configurar no Railway

No seu serviço Railway, adicione estas variáveis:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-sua_chave_aqui
OPENAI_MODEL=gpt-3.5-turbo
```

**Pronto!** O chatbot usará OpenAI automaticamente! 🎉

### Custos Estimados:
- GPT-3.5-turbo: $0.0005 / 1000 tokens de entrada + $0.0015 / 1000 tokens de saída
- 1 conversa típica = ~500 tokens = $0.001 (um décimo de centavo!)
- Com $5, você tem **~5000 conversas**

### Modelos Disponíveis:
- `gpt-3.5-turbo` - Mais barato, rápido ✅ (recomendado)
- `gpt-4` - Mais inteligente, caro 
- `gpt-4-turbo` - Meio termo

---

## Opção 2: Ollama (Local apenas) 🏠

### Vantagens:
- ✅ 100% grátis
- ✅ Privacidade total
- ✅ Funciona offline

### Desvantagens:
- ❌ **NÃO funciona no Railway gratuito**
- ❌ Precisa de GPU/CPU potente
- ❌ Usa muita RAM (4GB+)

### Como Usar Localmente:

```bash
# Instalar Ollama
brew install ollama

# Baixar modelo
ollama pull llama3.2:3b

# Iniciar Ollama
ollama serve
```

No `.env` local:
```bash
# NÃO adicione OPENAI_API_KEY
# Sistema usa Ollama automaticamente

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

---

## 🔄 Como Funciona

O sistema **detecta automaticamente** qual IA usar:

```javascript
// Se OPENAI_API_KEY está configurada → Usa OpenAI
// Se não → Usa Ollama (local)
```

### No Railway:
```bash
✅ OPENAI_API_KEY configurada → Usa OpenAI
```

### Localmente:
```bash
❌ OPENAI_API_KEY vazia → Usa Ollama
```

---

## 🧪 Testar o Chatbot

### Via API:

```bash
# Testar se IA está disponível
curl https://sua-url.up.railway.app/api/chatbot/health

# Enviar mensagem
curl -X POST https://sua-url.up.railway.app/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Qual a diferença entre Fleet e Pay?"
  }'
```

### Via Frontend:
1. Faça login no sistema
2. Clique no ícone do chatbot (canto inferior direito)
3. Digite uma pergunta sobre Edenred
4. A IA responderá automaticamente!

---

## 🚨 Troubleshooting

### "IA indisponível" no Railway

**Causa:** OPENAI_API_KEY não configurada

**Solução:**
1. Crie uma conta OpenAI
2. Adicione crédito ($5 mínimo)
3. Configure `OPENAI_API_KEY` no Railway
4. Redeploy o serviço

### "Invalid API Key"

**Causa:** Chave OpenAI incorreta ou sem crédito

**Solução:**
1. Verifique se copiou a chave completa
2. Confirme se tem crédito na conta OpenAI
3. Gere uma nova chave se necessário

### "Ollama não responde" (local)

**Causa:** Ollama não está rodando

**Solução:**
```bash
# Verificar se está rodando
ollama list

# Iniciar Ollama
ollama serve

# Ou como serviço
brew services start ollama
```

---

## 💰 Estimativa de Custos (OpenAI)

Para um sistema com **100 usuários ativos/mês**:

- Conversas por usuário: ~10/mês
- Total de conversas: 1000/mês
- Tokens por conversa: ~500
- Custo: **~$1-2/mês** 💵

**Conclusão:** Muito barato! $5 de crédito dura **3-6 meses**.

---

## 🎯 Recomendação Final

### Para Produção (Railway):
✅ **Use OpenAI** (`gpt-3.5-turbo`)
- Adicione $5 de crédito
- Configure `OPENAI_API_KEY`
- Esqueça! Vai durar meses

### Para Desenvolvimento (Local):
✅ **Use Ollama** (grátis)
- Instale Ollama
- Baixe `llama3.2:3b`
- Rode `ollama serve`

---

## 📚 Links Úteis

- OpenAI Platform: https://platform.openai.com
- OpenAI Pricing: https://openai.com/api/pricing
- Ollama: https://ollama.com
- Documentação completa: Ver `DEPLOY_RAILWAY.md`

---

**Dúvidas?** Abra uma issue no GitHub! 🚀
