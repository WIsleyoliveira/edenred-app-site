import { consultCNPJ } from '../src/controllers/consultationController.js';
import { obterAdaptadorBanco } from '../src/config/dbAdapter.js';

// Mock minimal response object
function createMockRes() {
  let statusCode = 200;
  let body = null;
  return {
    status(code) { statusCode = code; return this; },
    json(obj) { body = obj; console.log('RESPONSE', statusCode, JSON.stringify(obj)); return this; },
    send(obj) { body = obj; console.log('RESPONSE', statusCode, obj); return this; }
  };
}

// Mock user and headers
const mockReq = (cnpj, produto, userId) => ({
  body: { cnpj, produto },
  user: { id: userId || 1 },
  headers: { 'user-agent': 'manual-test' },
  ip: '127.0.0.1'
});

(async () => {
  // Conectar adaptador (mas não é necessário se apenas testar a regra usando o método criado)
  const db = obterAdaptadorBanco();
  try {
    await db.conectar();
  } catch (e) {
    console.warn('Não foi possível conectar ao DB. O teste ainda verifica a rota que usa o adaptador local.');
  }

  // Primeira consulta deve passar (caso não haja histórico)
  console.log('Chamando primeira vez');
  await consultCNPJ(mockReq('12.345.678/0001-90', 'FLEET', 1), createMockRes());

  // Segunda consulta imediata deve ser bloqueada pela regra de 3 meses
  console.log('Chamando segunda vez');
  await consultCNPJ(mockReq('12.345.678/0001-90', 'FLEET', 1), createMockRes());

  process.exit(0);
})();
