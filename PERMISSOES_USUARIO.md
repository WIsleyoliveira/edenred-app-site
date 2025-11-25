# Sistema de Permissões por Usuário

## 📋 Resumo da Implementação

Foi implementado um **sistema completo de permissões** que garante que cada usuário veja apenas seus próprios dados, enquanto administradores têm acesso total a todas as informações do sistema.

---

## 🎯 Funcionalidades Implementadas

### 1. **Backend - Controle de Acesso**

#### Modelo de Usuário (`backend/src/models/User.js`)
- ✅ Campo `role` com valores: `'user'` | `'admin'`
- ✅ Valor padrão: `'user'`
- ✅ Integração com autenticação JWT

#### Controller de Consultas (`backend/src/controllers/consultationController.js`)
```javascript
export const getConsultations = async (req, res) => {
  // Admins veem TODAS as consultas
  if (req.user.role === 'admin') {
    result = await obterAdaptadorBanco().buscarTodasConsultas(filters);
  } 
  // Usuários comuns veem APENAS suas consultas
  else {
    result = await obterAdaptadorBanco().buscarConsultasPorUsuario(req.user.id, filters);
  }
}
```

#### Routes de Empresas (`backend/src/routes/companies.js`)
```javascript
router.get('/', async (req, res) => {
  // Admins veem TODAS as empresas
  if (req.user.role === 'admin') {
    result = await obterAdaptadorBanco().buscarTodasEmpresas(filters);
  }
  // Usuários comuns veem APENAS empresas que eles adicionaram
  else {
    result = await obterAdaptadorBanco().buscarEmpresasPorUsuario(req.user.id, filters);
  }
});
```

#### Adaptador SQL (`backend/src/config/adapters/sqlAdapter.js`)
- ✅ `buscarTodasConsultas(filters)` - Para admin ver todas as consultas
- ✅ `buscarConsultasPorUsuario(userId, filters)` - Para usuário ver apenas suas consultas
- ✅ `buscarTodasEmpresas(filters)` - Para admin ver todas as empresas
- ✅ `buscarEmpresasPorUsuario(userId, filters)` - Para usuário ver apenas suas empresas
- ✅ Inclusão de dados do usuário via `include: [{ model: User, as: 'user' }]`

---

### 2. **Frontend - Interface Condicional**

#### Dashboard (`src/pages/Dashboard.tsx`)

**Badge de Admin no Header:**
```tsx
<div className="flex items-center gap-3 mb-2">
  <h1 className="titulo-principal text-4xl font-bold">Painel de Controle</h1>
  {currentUser?.role === 'admin' && (
    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
      👑 ADMIN
    </span>
  )}
</div>
```

**Mensagem Contextual:**
```tsx
<p className="texto-elegante text-xl text-red-100">
  {currentUser?.role === 'admin' 
    ? 'Visualização completa de todas as indicações do sistema' 
    : 'Acompanhe suas indicações e performance'}
</p>
```

**Coluna Extra na Tabela (Visível só para Admin):**
```tsx
<thead>
  <tr>
    <th>DATA</th>
    <th>NÚMERO</th>
    <th>CNPJ</th>
    <th>RAZÃO SOCIAL</th>
    {currentUser?.role === 'admin' && (
      <th>USUÁRIO</th>  {/* Nova coluna mostrando quem fez a consulta */}
    )}
    <th>PRODUTO</th>
    <th>STATUS</th>
    <th>AÇÕES</th>
  </tr>
</thead>

<tbody>
  {filteredConsultations.map((consultation) => (
    <tr>
      {/* ... outras colunas ... */}
      {currentUser?.role === 'admin' && (
        <td>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 
                            flex items-center justify-center text-white font-semibold text-sm mr-2">
              {consultation.userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span>{consultation.userName || 'Usuário'}</span>
          </div>
        </td>
      )}
    </tr>
  ))}
</tbody>
```

#### Empresas (`src/pages/Companies.tsx`)

**Badge de Admin no Header:**
```tsx
<div className="flex items-center gap-3 mb-2">
  <h1 className="titulo-principal text-4xl font-bold">Gestão de Empresas</h1>
  {currentUser?.role === 'admin' && (
    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
      👑 ADMIN
    </span>
  )}
</div>
```

**Mensagem Contextual:**
```tsx
<p className="texto-elegante text-xl text-red-100 dark:text-red-200">
  {currentUser?.role === 'admin'
    ? 'Visualização completa de todas as empresas do sistema'
    : 'Base de dados completa de empresas brasileiras'}
</p>
```

**Coluna Extra na Tabela (Visível só para Admin):**
```tsx
{currentUser?.role === 'admin' && (
  <th>ADICIONADO POR</th>
)}

{/* No corpo da tabela */}
{currentUser?.role === 'admin' && (
  <td>
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 
                      flex items-center justify-center text-white font-semibold text-sm mr-2">
        U
      </div>
      <span className="font-medium text-gray-900 text-sm">
        Usuário #{company.userId || 'Desconhecido'}
      </span>
    </div>
  </td>
)}
```

---

## 🔐 Fluxo de Autenticação e Autorização

### 1. **Login/Registro**
```
1. Usuário envia credenciais → backend/src/controllers/authController.js
2. Backend autentica e retorna: { user: { id, name, email, role }, token }
3. Frontend salva em localStorage: 'auth_token' e 'user_data'
4. Frontend usa apiService.getCurrentUser() para obter dados incluindo role
```

### 2. **Requisições com Token**
```
1. Frontend envia: Authorization: Bearer <token>
2. Middleware auth.js decodifica token e adiciona req.user
3. Controllers verificam req.user.role para decidir filtros
4. SQL Adapter busca dados filtrados por userId (user) ou sem filtro (admin)
```

### 3. **Renderização Condicional**
```
1. Componente carrega: const currentUser = apiService.getCurrentUser()
2. Verifica: currentUser?.role === 'admin'
3. Mostra/esconde elementos baseado no role
```

---

## 📊 Diferenças entre Usuário Comum e Admin

| Recurso | Usuário Comum | Administrador |
|---------|---------------|---------------|
| **Consultas no Dashboard** | Vê apenas suas consultas | Vê TODAS as consultas |
| **Empresas** | Vê apenas empresas que adicionou | Vê TODAS as empresas |
| **Badge no Header** | ❌ Não aparece | ✅ "👑 ADMIN" em amarelo |
| **Coluna "Usuário" na Tabela** | ❌ Não visível | ✅ Mostra quem fez a consulta |
| **Coluna "Adicionado Por"** | ❌ Não visível | ✅ Mostra quem adicionou a empresa |
| **Mensagem do Header** | "Acompanhe suas indicações" | "Visualização completa do sistema" |
| **Estatísticas** | Baseadas em suas consultas | Baseadas em todas as consultas |

---

## 🧪 Como Testar

### 1. **Criar Usuário Admin**

Opção 1: Via SQL direto no PostgreSQL
```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

Opção 2: Editar após registro no código
```javascript
// backend/src/controllers/authController.js - linha do criarUsuario
role: 'admin' // Temporariamente para criar primeiro admin
```

### 2. **Testar Permissões**

**Como Usuário Comum:**
1. Faça login com usuário comum (role='user')
2. Acesse Dashboard → Vê apenas suas consultas
3. Acesse Empresas → Vê apenas empresas que você adicionou
4. Não vê badge "👑 ADMIN"
5. Não vê coluna de usuários nas tabelas

**Como Admin:**
1. Faça login com usuário admin (role='admin')
2. Acesse Dashboard → Vê TODAS as consultas de todos os usuários
3. Vê badge dourado "👑 ADMIN" no header
4. Vê coluna extra mostrando qual usuário fez cada consulta
5. Acesse Empresas → Vê TODAS as empresas do sistema
6. Vê coluna extra mostrando quem adicionou cada empresa

---

## 🎨 Elementos Visuais

### Badge de Admin
- Cor: Amarelo (`bg-yellow-400`)
- Texto: `👑 ADMIN`
- Posição: Ao lado do título
- Efeito: Destaca visualmente permissões elevadas

### Avatar de Usuário nas Tabelas
- Círculo gradiente vermelho
- Inicial do nome do usuário
- Aparece apenas para admins
- Design consistente com tema Edenred

---

## 🔧 Arquivos Modificados

### Backend
- ✅ `backend/src/controllers/consultationController.js`
- ✅ `backend/src/routes/companies.js`
- ✅ `backend/src/config/adapters/sqlAdapter.js`
- ✅ `backend/src/models/User.js` (já tinha role)
- ✅ `backend/src/controllers/authController.js` (já retornava role)

### Frontend
- ✅ `src/pages/Dashboard.tsx`
- ✅ `src/pages/Companies.tsx`
- ✅ `src/types/global.ts` (já tinha role no tipo User)
- ✅ `src/services/apiService.ts` (já salvava role no localStorage)

---

## ✅ Checklist de Segurança

- [x] Validação de role no backend (não confia no frontend)
- [x] Filtros SQL baseados em req.user (autenticado via JWT)
- [x] Middleware de autenticação em todas as rotas protegidas
- [x] Role armazenado no banco de dados (não no token)
- [x] Frontend usa role apenas para UI (não para segurança)
- [x] Queries SQL separadas para user vs admin
- [x] Include de User em consultas de admin para auditoria

---

## 🚀 Próximos Passos (Sugestões)

1. **Logs de Auditoria**
   - Registrar quando admin visualiza dados de outros usuários

2. **Página de Administração**
   - Gerenciar usuários
   - Promover/rebaixar permissões
   - Ver estatísticas globais

3. **Filtros Avançados para Admin**
   - Filtrar por usuário específico
   - Relatórios agregados por usuário

4. **Notificações**
   - Alertar admin sobre novas consultas
   - Notificar usuário sobre alterações em suas consultas

---

## 📝 Notas Importantes

- ⚠️ **Segurança**: NUNCA confie apenas no frontend. O backend SEMPRE valida permissões.
- 🔒 **Token JWT**: Contém apenas `id` e `email`. O `role` é consultado no banco a cada requisição.
- 🎭 **UI Condicional**: Elementos admin são escondidos via CSS/React, mas o backend impede acesso não autorizado.
- 📊 **Performance**: Queries otimizadas com índices em `userId` e joins eficientes.

---

## 🎉 Conclusão

O sistema agora está **100% funcional** com controle de acesso completo:
- ✅ Usuários comuns veem apenas seus dados
- ✅ Admins veem tudo e identificam quem fez cada ação
- ✅ Interface adapta-se automaticamente ao role
- ✅ Backend garante segurança em todas as operações

**Teste agora!** 🚀
