import express from 'express';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Configuração do banco
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'cnpj_consultation',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: false
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rota principal
app.get('/', async (req, res) => {
  try {
    // Adicionar coluna isActive à tabela consultations se não existir
    await sequelize.query(`
      ALTER TABLE consultations
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true
    `);

    const tables = ['users', 'companies', 'consultations', 'landscapes'];
    const data = {};

    for (const table of tables) {
      if (table === 'consultations') {
        // Para consultas, fazer JOIN com users para obter o email
        const result = await sequelize.query(`
          SELECT c.*, u.email as userEmail
          FROM consultations c
          LEFT JOIN users u ON c."userId" = u.id
          ORDER BY c.id
        `, {
          type: sequelize.QueryTypes.SELECT
        });
        data[table] = result;
      } else {
        const result = await sequelize.query(`SELECT * FROM "${table}" ORDER BY id`, {
          type: sequelize.QueryTypes.SELECT
        });
        data[table] = result;
      }
    }

    res.send(String.raw`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🗄️ Visualizador do Banco de Dados - Edenred</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #E53E3E 0%, #C53030 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }

        .nav {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }

        .nav-tabs {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .tab-btn {
            padding: 12px 24px;
            border: none;
            background: #e9ecef;
            color: #495057;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .tab-btn.active {
            background: #007bff;
            color: white;
        }

        .tab-btn:hover {
            background: #007bff;
            color: white;
            transform: translateY(-2px);
        }

        .tab-content {
            display: none;
            padding: 30px;
        }

        .tab-content.active {
            display: block;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }

        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            opacity: 0.9;
        }

        .table-container {
            overflow-x: auto;
            margin-top: 20px;
            -webkit-overflow-scrolling: touch;
            position: relative;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        table {
            width: 100%;
            min-width: 800px;
            border-collapse: separate;
            border-spacing: 0;
            background: white;
            margin: 0;
        }

        th, td {
            padding: 12px 15px;
            text-align: left;
            white-space: nowrap;
            position: relative;
            border-bottom: 1px solid #dee2e6;
        }

        th {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
        }

        tr:nth-child(even) {
            background: #f8f9fa;
        }

        tr:hover {
            background: #e3f2fd;
            transition: background 0.3s ease;
        }

        .empty-table {
            text-align: center;
            padding: 50px;
            color: #6c757d;
            font-style: italic;
        }

        .refresh-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }

        .refresh-btn:hover {
            background: #218838;
            transform: scale(1.05);
        }

        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 500;
        }

        .badge.active {
            background: #28a745;
            color: white;
        }

        .badge.inactive {
            background: #dc3545;
            color: white;
        }

        .badge.user {
            background: #007bff;
            color: white;
        }

        .badge.admin {
            background: #6f42c1;
            color: white;
        }

        .action-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            font-weight: 500;
            transition: all 0.3s ease;
            margin: 2px;
        }

        .activate-btn {
            background: #28a745;
            color: white;
        }

        .activate-btn:hover {
            background: #218838;
            transform: scale(1.05);
        }

        .delete-btn {
            background: #dc3545;
            color: white;
        }

        .delete-btn:hover {
            background: #c82333;
            transform: scale(1.05);
        }

        .confirm-dialog {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .confirm-dialog.show {
            display: flex;
        }

        .confirm-content {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }

        .confirm-content h3 {
            margin-bottom: 15px;
            color: #333;
        }

        .confirm-content p {
            margin-bottom: 25px;
            color: #666;
        }

        .confirm-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .confirm-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .confirm-btn.cancel {
            background: #6c757d;
            color: white;
        }

        .confirm-btn.cancel:hover {
            background: #5a6268;
        }

        .confirm-btn.delete {
            background: #dc3545;
            color: white;
        }

        .confirm-btn.delete:hover {
            background: #c82333;
        }

        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast.success {
            background: #28a745;
        }

        .toast.error {
            background: #dc3545;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2em;
            }

            .nav-tabs {
                flex-direction: column;
            }

            .tab-btn {
                width: 100%;
            }

            .stats {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ Visualizador do Banco de Dados</h1>
            <p>Sistema de Consulta CNPJ - Edenred</p>
        </div>

        <div class="nav">
            <div class="nav-tabs">
                <button class="tab-btn active" onclick="showTab('overview')">📊 Visão Geral</button>
                <button class="tab-btn" onclick="showTab('users')">👥 Usuários</button>
                <button class="tab-btn" onclick="showTab('companies')">🏢 Empresas</button>
                <button class="tab-btn" onclick="showTab('consultations')">🔍 Consultas</button>
                <button class="tab-btn" onclick="showTab('landscapes')">🏞️ Paisagens</button>
            </div>
        </div>

        <div id="overview" class="tab-content active">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${data.users.length}</div>
                    <div class="stat-label">👥 Usuários</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.companies.length}</div>
                    <div class="stat-label">🏢 Empresas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.consultations.length}</div>
                    <div class="stat-label">🔍 Consultas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.landscapes.length}</div>
                    <div class="stat-label">🏞️ Paisagens</div>
                </div>
            </div>

            <h2 style="margin-bottom: 20px; color: #333;">📋 Resumo das Tabelas</h2>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h3>👥 Usuários</h3>
                    <p>${data.users.length} registros</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                        Último usuário: ${data.users.length > 0 ? data.users[data.users.length - 1].name : 'Nenhum'}
                    </p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h3>🏢 Empresas</h3>
                    <p>${data.companies.length} registros</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                        Última empresa: ${data.companies.length > 0 ? data.companies[data.companies.length - 1].razaoSocial : 'Nenhuma'}
                    </p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h3>🔍 Consultas</h3>
                    <p>${data.consultations.length} registros</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                        Última consulta: ${data.consultations.length > 0 ? new Date(data.consultations[data.consultations.length - 1].createdAt).toLocaleString('pt-BR') : 'Nenhuma'}
                    </p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h3>🏞️ Paisagens</h3>
                    <p>${data.landscapes.length} registros</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                        Tabela ainda não utilizada
                    </p>
                </div>
            </div>
        </div>

        <div id="users" class="tab-content">
            <h2>👥 Tabela de Usuários</h2>
            <div class="table-container">
                ${data.users.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Criado em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.users.map(user => `
                        <tr id="user-${user.id}">
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">${user.role}</span></td>
                            <td><span class="badge ${user.isActive !== false ? 'active' : 'inactive'}">${user.isActive !== false ? 'Ativo' : 'Inativo'}</span></td>
                            <td>${new Date(user.createdAt).toLocaleString('pt-BR')}</td>
                            <td>
                                <button class="action-btn ${user.isActive !== false ? 'delete-btn' : 'activate-btn'}" onclick="toggleUserStatus(${user.id}, ${user.isActive !== false})" title="${user.isActive !== false ? 'Desativar Usuário' : 'Ativar Usuário'}">
                                    ${user.isActive !== false ? '🚫 Desativar' : '✅ Ativar'}
                                </button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div class="empty-table">📭 Nenhum usuário encontrado</div>'}
            </div>
        </div>

        <div id="companies" class="tab-content">
            <h2>🏢 Tabela de Empresas</h2>
            <div class="table-container">
                ${data.companies.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>CNPJ</th>
                            <th>Razão Social</th>
                            <th>Nome Fantasia</th>
                            <th>Situação</th>
                            <th>Porte</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.companies.map(company => `
                        <tr id="company-${company.id}">
                            <td>${company.id}</td>
                            <td>${company.cnpj}</td>
                            <td>${company.razaoSocial}</td>
                            <td>${company.nomeFantasia || '-'}</td>
                            <td><span class="badge ${company.situacao === 'ATIVA' ? 'active' : 'inactive'}">${company.situacao}</span></td>
                            <td>${company.porte}</td>
                            <td>${company.telefone || '-'}</td>
                            <td>${company.email || '-'}</td>
                            <td>
                                <button class="action-btn delete-btn" onclick="deleteCompany(${company.id})" title="Excluir Empresa">
                                    🗑️ Excluir Empresa
                                </button>
                                <button class="action-btn activate-btn" onclick="clearCNPJ(${company.id}, '${company.cnpj}')" title="Limpar CNPJ" style="margin-left: 5px;">
                                    🧹 Limpar CNPJ
                                </button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div class="empty-table">📭 Nenhuma empresa encontrada</div>'}
            </div>
        </div>

        <div id="consultations" class="tab-content">
            <h2>🔍 Tabela de Consultas</h2>
            <div class="table-container">
                ${data.consultations.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>CNPJ</th>
                            <th>Produto</th>
                            <th>User ID</th>
                            <th>Email do Usuário</th>
                            <th>Status</th>
                            <th>Criado em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.consultations.map(consultation => `
                        <tr id="consultation-${consultation.id}">
                            <td>${consultation.id}</td>
                            <td>${consultation.cnpj}</td>
                            <td><span class="badge user">${consultation.produto || 'N/A'}</span></td>
                            <td>${consultation.userId}</td>
                            <td>${consultation.userEmail || 'N/A'}</td>
                            <td><span class="badge ${consultation.isActive !== false ? 'active' : 'inactive'}">${consultation.isActive !== false ? 'Ativa' : 'Inativa'}</span></td>
                            <td>${new Date(consultation.createdAt).toLocaleString('pt-BR')}</td>
                            <td>
                                <button class="action-btn delete-btn" onclick="deleteConsultation(${consultation.id})" title="Excluir esta Consulta">
                                    🗑️ Excluir
                                </button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<div class="empty-table">📭 Nenhuma consulta encontrada</div>'}
            </div>
        </div>
        
        <div id="landscapes" class="tab-content">
  <h2>🏞️ Tabela de Paisagens</h2>
  <div class="table-container">
    ${
      data.landscapes.length > 0
        ? '<table><thead><tr><th>ID</th><th>Título</th><th>Descrição</th><th>User ID</th><th>Criado em</th></tr></thead><tbody>' +
          data.landscapes
            .map(
              (landscape) =>
                '<tr><td>' +
                landscape.id +
                '</td><td>' +
                landscape.title +
                '</td><td>' +
                landscape.description +
                '</td><td>' +
                landscape.userId +
                '</td><td>' +
                new Date(landscape.createdAt).toLocaleString('pt-BR') +
                '</td></tr>'
            )
            .join('') +
          '</tbody></table>'
        : '<div class="empty-table">📭 Nenhuma paisagem encontrada</div>'
    }
  </div>
</div>

      

    <!-- Dialog de confirmação -->
    <div id="confirmDialog" class="confirm-dialog">
        <div class="confirm-content">
            <h3 id="confirmTitle">Confirmar Exclusão</h3>
            <p id="confirmMessage">Tem certeza que deseja excluir este item?</p>
            <div class="confirm-buttons">
                <button class="confirm-btn cancel" onclick="closeConfirmDialog()">Cancelar</button>
                <button class="confirm-btn delete" id="confirmDeleteBtn" onclick="confirmDelete()">Excluir</button>
            </div>
        </div>
    </div>

    <!-- Toast de notificação -->
    <div id="toast" class="toast"></div>

    <button class="refresh-btn" onclick="location.reload()">🔄 Atualizar Dados</button>

    <script>
        let deleteCallback = null;

        function showTab(tabName) {
            // Hide all tab contents
            const contents = document.querySelectorAll('.tab-content');
            contents.forEach(content => content.classList.remove('active'));

            // Remove active class from all buttons
            const buttons = document.querySelectorAll('.tab-btn');
            buttons.forEach(button => button.classList.remove('active'));

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        function showConfirmDialog(title, message, callback) {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            deleteCallback = callback;
            document.getElementById('confirmDialog').classList.add('show');
        }

        function closeConfirmDialog() {
            document.getElementById('confirmDialog').classList.remove('show');
            deleteCallback = null;
        }

        function confirmDelete() {
            if (deleteCallback) {
                deleteCallback();
            }
            closeConfirmDialog();
        }

        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast ' + type;
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        async function toggleUserStatus(userId, isActive) {
            const action = isActive ? 'desativar' : 'ativar';
            const newStatus = isActive ? 'Inativo' : 'Ativo';
            const newBadgeClass = isActive ? 'inactive' : 'active';
            const newButtonText = isActive ? '✅ Ativar' : '🚫 Desativar';
            const newButtonClass = isActive ? 'activate-btn' : 'delete-btn';

          showConfirmDialog(
    action.charAt(0).toUpperCase() + action.slice(1) + ' Usuário',
    'Esta ação irá ' + action + ' o usuário. ' + 
    (isActive
        ? 'Ele não poderá mais fazer login até ser reativado.'
        : 'Ele poderá fazer login novamente.'
    ) + ' Deseja continuar?',
    async () => {
        try {
            const response = await fetch('/api/users/' + userId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive })
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Usuário ' + newStatus.toLowerCase() + ' com sucesso!', 'success');
                // Atualizar linha da tabela
                const row = document.getElementById('user-' + userId);
                if (row) {
                    row.style.opacity = isActive ? '0.5' : '1';
                    row.querySelector('td:nth-child(5) span').textContent = newStatus;
                    row.querySelector('td:nth-child(5) span').className = 'badge ' + newBadgeClass;
                    const button = row.querySelector('.action-btn');
                    button.textContent = newButtonText;
                    button.className = 'action-btn ' + newButtonClass;
                    button.onclick = function () {
                        toggleUserStatus(userId, !isActive);
                    };
                    button.title = isActive ? 'Ativar Usuário' : 'Desativar Usuário';
                }
            } else {
                showToast('Erro: ' + result.error, 'error');
            }
        } catch (error) {
            showToast('Erro ao alterar status do usuário', 'error');
            console.error('Erro:', error);
        }
    }
);

        }




      async function deleteCompany(companyId) {
    showConfirmDialog(
        'Excluir Empresa',
        'Esta ação irá remover permanentemente a empresa e TODAS as consultas relacionadas ao mesmo CNPJ. O CNPJ poderá ser consultado novamente. Deseja continuar?',
        async () => {
            try {
                const response = await fetch('/api/companies/' + companyId, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    showToast(result.message || 'Empresa excluída com sucesso!', 'success');
                    // Remover linha da tabela
                    const row = document.getElementById('company-' + companyId);
                    if (row) {
                        row.remove();
                    }
                } else {
                    showToast('Erro: ' + result.error, 'error');
                }
            } catch (error) {
                showToast('Erro ao excluir empresa', 'error');
                console.error('Erro:', error);
            }
        }
    );
}

async function clearCNPJ(companyId, cnpj) {
    showConfirmDialog(
        'Limpar CNPJ',
        'Esta ação irá remover TODAS as consultas relacionadas ao CNPJ ' + cnpj + ', mas manterá a empresa no sistema. O CNPJ poderá ser consultado novamente. Deseja continuar?',
        async () => {
            try {
                const response = await fetch('/api/companies/' + companyId + '/clear-cnpj', {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    showToast(result.message || 'CNPJ limpo com sucesso!', 'success');
                    // Atualizar a linha da tabela - manter empresa mas indicar que CNPJ foi limpo
                    const row = document.getElementById('company-' + companyId);
                    if (row) {
                        // Adicionar uma classe ou indicador visual
                        row.style.backgroundColor = '#fff3cd';
                        row.style.borderLeft = '4px solid #ffc107';
                        // Opcional: adicionar um badge indicando que o CNPJ foi limpo
                        const actionsCell = row.querySelector('td:last-child');
                        if (actionsCell) {
                            const badge = document.createElement('span');
                            badge.className = 'badge inactive';
                            badge.textContent = 'CNPJ Limpo';
                            badge.style.marginLeft = '10px';
                            actionsCell.appendChild(badge);
                        }
                    }
                } else {
                    showToast('Erro: ' + result.error, 'error');
                }
            } catch (error) {
                showToast('Erro ao limpar CNPJ', 'error');
                console.error('Erro:', error);
            }
        }
    );
}

async function deleteConsultation(consultationId) {
    showConfirmDialog(
        'Excluir Consulta',
        'Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.',
        async () => {
            try {
                // Antes de apagar, obter dados da linha para feedback visual
                const row = document.getElementById('consultation-' + consultationId);
                let cnpj = null;
                let produto = null;
                if (row) {
                    cnpj = row.querySelector('td:nth-child(2)')?.textContent?.trim();
                    produto = row.querySelector('td:nth-child(3)')?.textContent?.trim();
                }

                const response = await fetch('/api/consultations/' + consultationId, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    showToast(result.message || 'Consulta excluída com sucesso!', 'success');

                    // Remove a linha da tabela de consultas
                    if (row) row.remove();

                    // Se tivermos CNPJ e produto, marcar visualmente na tabela de empresas
                    if (cnpj && produto) {
                        // Procurar a linha da empresa correspondente (por cnpj)
                        const companyRows = Array.from(document.querySelectorAll('#companies tbody tr'));
                        const matching = companyRows.find(r => r.querySelector('td:nth-child(2)') && r.querySelector('td:nth-child(2)').textContent.trim() === cnpj);
                        if (matching) {
                            // Adiciona badge temporária indicando qual produto foi liberado
                            const badge = document.createElement('span');
                            badge.className = 'badge user';
                            badge.textContent = 'Produto liberado: ' + produto;
                            badge.style.marginLeft = '10px';
                            matching.querySelector('td:last-child').appendChild(badge);

                            // Remover o badge após 5 segundos
                            setTimeout(() => {
                                badge.remove();
                            }, 5000);
                        }
                    }
                } else {
                    showToast('Erro: ' + result.error, 'error');
                }
            } catch (error) {
                showToast('Erro ao excluir consulta', 'error');
                console.error('Erro:', error);
            }
        }
    );
}

    </script>
</body>
</html>
`);
  } catch (error) {
    res.status(500).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Erro - Visualizador DB</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error { color: #d32f2f; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="error">
        <h1>❌ Erro ao conectar ao banco</h1>
        <p>${error.message}</p>
        <button onclick="location.reload()">🔄 Tentar Novamente</button>
    </div>
</body>
</html>
    `);
  }
});

// API endpoint para dados JSON
app.get('/api/data', async (req, res) => {
  try {
    const tables = ['users', 'companies', 'consultations', 'landscapes'];
    const data = {};

    for (const table of tables) {
      if (table === 'consultations') {
        // Para consultas, fazer JOIN com users para obter o email
        const result = await sequelize.query(`
          SELECT c.*, u.email as userEmail
          FROM consultations c
          LEFT JOIN users u ON c."userId" = u.id
          ORDER BY c.id
        `, {
          type: sequelize.QueryTypes.SELECT
        });
        data[table] = result;
      } else {
        const result = await sequelize.query(`SELECT * FROM "${table}" ORDER BY id`, {
          type: sequelize.QueryTypes.SELECT
        });
        data[table] = result;
      }
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint para alterar status do usuário
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Verificar se usuário existe
    const user = await sequelize.query(
      'SELECT * FROM users WHERE id = $1',
      { bind: [id], type: sequelize.QueryTypes.SELECT }
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar status
    await sequelize.query(
      'UPDATE users SET "isActive" = $1 WHERE id = $2',
      { bind: [isActive, id] }
    );

    res.json({ success: true, message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso` });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ error: error.message });
  }
});



// API endpoint para excluir empresa
app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se empresa existe e obter o CNPJ
    const company = await sequelize.query(
      'SELECT * FROM companies WHERE id = $1',
      { bind: [id], type: sequelize.QueryTypes.SELECT }
    );

    if (company.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const cnpj = company[0].cnpj;

    // Excluir todas as consultas relacionadas ao mesmo CNPJ
    await sequelize.query(
      'DELETE FROM consultations WHERE cnpj = $1',
      { bind: [cnpj] }
    );

    // Excluir empresa
    await sequelize.query(
      'DELETE FROM companies WHERE id = $1',
      { bind: [id] }
    );

    res.json({
      success: true,
      message: 'Empresa e todas as consultas relacionadas excluídas com sucesso. O CNPJ pode ser consultado novamente.'
    });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint para limpar CNPJ (remover apenas as consultas)
app.delete('/api/companies/:id/clear-cnpj', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se empresa existe e obter o CNPJ
    const company = await sequelize.query(
      'SELECT * FROM companies WHERE id = $1',
      { bind: [id], type: sequelize.QueryTypes.SELECT }
    );

    if (company.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const cnpj = company[0].cnpj;

    // Excluir apenas as consultas relacionadas ao CNPJ (manter empresa)
    await sequelize.query(
      'DELETE FROM consultations WHERE cnpj = $1',
      { bind: [cnpj] }
    );

    res.json({
      success: true,
      message: 'Todas as consultas relacionadas ao CNPJ foram removidas. A empresa permanece no sistema e o CNPJ pode ser consultado novamente.'
    });
  } catch (error) {
    console.error('Erro ao limpar CNPJ:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint para excluir uma consulta por ID
app.delete('/api/consultations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Excluir a consulta específica pelo ID
    const result = await sequelize.query(
      'DELETE FROM consultations WHERE id = $1',
      { bind: [id] }
    );

    if (result[1].rowCount === 0) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    res.json({
      success: true,
      message: 'Consulta excluída com sucesso. Você já pode consultar este CNPJ novamente para o mesmo produto.'
    });
  } catch (error) {
    console.error('Erro ao excluir consulta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de teste (LOCAL) para inserir uma consulta manualmente
// Uso: POST /api/insert-consultation  { cnpj, produto, userId, status }
// Atenção: somente para uso local com o db-viewer; não adicionar em produção.
app.post('/api/insert-consultation', async (req, res) => {
    try {
        const { cnpj, produto, userId, status = 'SUCCESS' } = req.body || {};

        if (!cnpj || !produto) {
            return res.status(400).json({ error: 'cnpj e produto são obrigatórios' });
        }

        const now = new Date().toISOString();

        const insertResult = await sequelize.query(
            `INSERT INTO consultations (cnpj, produto, "userId", status, "createdAt", "updatedAt", "isActive") VALUES ($1, $2, $3, $4, $5, $5, true) RETURNING id, cnpj, produto, "userId", status, "createdAt"`,
            { bind: [cnpj, produto, userId || 1, status, now], type: sequelize.QueryTypes.INSERT }
        );

        // Alguns dialectos retornam metadata diferente, vamos buscar o último inserido
        const last = await sequelize.query('SELECT * FROM consultations WHERE cnpj = $1 AND produto = $2 ORDER BY id DESC LIMIT 1', {
            bind: [cnpj, produto],
            type: sequelize.QueryTypes.SELECT
        });

        res.json({ success: true, inserted: last[0] || null });
    } catch (error) {
        console.error('Erro ao inserir consulta via test endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Visualizador do Banco de Dados rodando em: http://localhost:${PORT}`);
  console.log(`📊 API JSON disponível em: http://localhost:${PORT}/api/data`);
});

export default app;



