// Script para importar dados do backup local para o Railway
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function importData() {
  // URL pública do Railway PostgreSQL
  const DATABASE_URL = 'postgresql://postgres:HLvBZqeEAesIsJXBiyZzGhfGbcWvUbRl@metro.proxy.rlwy.net:45797/railway';
  
  // Conectar usando a URL do Railway
  const pool = new Pool({
    connectionString: DATABASE_URL
  });

  try {
    console.log('🔌 Conectando ao banco Railway...');
    const client = await pool.connect();
    console.log('✅ Conectado!');

    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'backup-local.sql');
    console.log('📖 Lendo backup:', sqlFile);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Executar o SQL
    console.log('⚙️  Importando dados...');
    await client.query(sql);
    console.log('✅ Dados importados com sucesso!');

    // Verificar dados importados
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Usuários importados: ${result.rows[0].count}`);

    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

importData();
