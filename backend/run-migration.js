#!/usr/bin/env node

/**
 * Script para executar migrations do Sequelize
 * Uso: node run-migration.js
 */

import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco de dados (Railway PostgreSQL)
const sequelize = new Sequelize(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function runMigrations() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Criar tabela de migrations se não existir
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Buscar migrations já executadas
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name'
    );
    const executed = new Set(executedMigrations.map(m => m.name));

    // Buscar arquivos de migration
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    console.log(`📁 Encontradas ${files.length} migrations\n`);

    // Executar migrations pendentes
    for (const file of files) {
      if (executed.has(file)) {
        console.log(`⏭️  Pulando ${file} (já executada)`);
        continue;
      }

      console.log(`🚀 Executando migration: ${file}`);
      
      const migration = await import(path.join(migrationsDir, file));
      await migration.default.up(sequelize.getQueryInterface(), Sequelize);
      
      // Registrar migration como executada
      await sequelize.query(
        'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
        { replacements: [file] }
      );
      
      console.log(`✅ Migration ${file} executada com sucesso!\n`);
    }

    console.log('🎉 Todas as migrations foram executadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar migrations
runMigrations();
