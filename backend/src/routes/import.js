// Rota temporária para importar dados do backup
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.post('/execute-sql', async (req, res) => {
  try {
    const { sql } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'SQL não fornecido' });
    }

    console.log('📥 Executando SQL...');
    await pool.query(sql);
    
    // Verificar dados importados
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const companyCount = await pool.query('SELECT COUNT(*) FROM companies');
    
    res.json({
      success: true,
      message: 'Dados importados com sucesso!',
      stats: {
        users: userCount.rows[0].count,
        companies: companyCount.rows[0].count
      }
    });
  } catch (error) {
    console.error('❌ Erro ao importar:', error.message);
    res.status(500).json({ 
      error: error.message,
      detail: error.detail
    });
  }
});

module.exports = router;
