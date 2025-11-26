-- ====================================
-- IMPORTAÇÃO DE DADOS PARA RAILWAY
-- ====================================
-- Copie e cole este arquivo inteiro na interface do Railway
-- Dashboard → Postgres → Data → Cole aqui e clique em "Run"

-- ====================================
-- USUÁRIOS (49 usuários)
-- ====================================

INSERT INTO users (id, name, email, password, role, avatar, "isActive", "lastLogin", preferences, "createdAt", "updatedAt") VALUES
(1, 'Usuario Teste', 'teste@edenred.com', '$2a$12$l0391mIz2EDTpWkTdykuNe7dTN/bm8VWeliC1aVtmx17XThu84d6m', 'user', NULL, true, NULL, '{"theme":"light","notifications":true}', '2025-10-14 20:56:47.381-03', '2025-10-14 20:56:47.381-03'),
(2, 'Admin Edenred', 'admin@edenred.com.br', '$2a$12$Nv.j3kKsVZ7QXj0ZUz40KuDSlxAeGgSzDpDE5q05HxCs.Q3BghKQK', 'admin', NULL, true, '2025-11-16 23:01:19.951-03', '{"theme":"light","notifications":true}', '2025-10-14 20:57:19.654-03', '2025-11-16 23:01:19.951-03'),
(3, 'Consultor Edenred', 'consultor@edenred.com.br', '$2a$12$E.AOVay0V9Cl25h/n3a./OjITVstwB5A7Y2OnQQK2PxR9DaP9l/GW', 'user', NULL, true, NULL, '{"theme":"light","notifications":true}', '2025-10-14 20:57:19.913-03', '2025-10-14 20:57:19.913-03'),
(4, 'Test User', 'test@example.com', '$2a$12$DkhTjrFygpQDvbHYjLmcR.dEAODQt6Ng4xjiXYQXYgbZVVbbbTRaO', 'user', NULL, true, '2025-10-23 10:35:33.873-03', '{"theme":"light","notifications":true}', '2025-10-23 10:35:27.994-03', '2025-10-23 10:35:33.874-03'),
(5, 'Test User', 'test3@example.com', '$2a$12$lPJel/W37wqlOTO2nvdcaOFq0dK4ZSh9SImOJF9jrMU9Ba7pfXh5u', 'user', NULL, true, NULL, '{"theme":"light","notifications":true}', '2025-10-23 10:38:15.594-03', '2025-10-23 10:38:15.594-03'),
(6, 'Test User', 'test4@example.com', '$2a$12$wnRM6/sprjBw7q8ZO0vX..9go2zJjZmavXFolwiKUgl3bUmmMB3Wa', 'user', NULL, true, NULL, '{"theme":"light","notifications":true}', '2025-10-23 10:39:59.278-03', '2025-10-23 10:39:59.278-03'),
(7, 'Test User', 'test5@example.com', '$2a$12$zMzj/n6n4Zs8B709HfWjn./nk7SQh5tV4rzJ8Fp2zU0ihPv0n9rny', 'user', NULL, true, NULL, '{"theme":"light","notifications":true}', '2025-10-23 10:40:41.841-03', '2025-10-23 10:40:41.841-03'),
(8, 'Test User', 'test6@example.com', '$2a$12$k3DXDn.luQn7StSzUROy3OYm3H.E/dGw00wUEYHxEIxyTD6ojQ1b6', 'user', NULL, true, NULL, '{"theme":"light","notifications":true}', '2025-10-23 10:41:05.672-03', '2025-10-23 10:41:05.672-03'),
(9, 'Wisley', 'wisley353@gmail.com', '$2a$12$LjOYhMyoZPG2w4J2JR2y/uuP7HjO8v05GFttTLCfkmunzPH.PoSNe', 'user', NULL, true, '2025-10-23 10:41:49.155-03', '{"theme":"light","notifications":true}', '2025-10-23 10:41:23.446-03', '2025-10-23 10:41:49.155-03'),
(10, 'Test User', 'test7@example.com', '$2a$12$kizIFlxT.OqcOxB3op2houD2tMoA.r9mT8gyK02otgR2xFwcI2GgO', 'user', NULL, true, '2025-10-23 11:20:32.541-03', '{"theme":"light","notifications":true}', '2025-10-23 11:20:22.903-03', '2025-10-23 11:20:32.541-03'),
(17, 'Test User', 'test16@example.com', '$2a$12$R0umizdy.5b2DHTdn1VaKulMMl0089ldKeNSRqrelblcjcAIUfq82', 'user', NULL, true, '2025-10-23 12:35:37.891-03', '{"theme":"light","notifications":true}', '2025-10-23 11:24:03.096-03', '2025-10-23 12:35:37.892-03'),
(22, 'batman', 'batman@gmail.com', '$2a$12$j8HVXdmt/fY9QdkaFglAj.9EGofhnm9wyjF55S42MqqvB8oe5MnLG', 'user', NULL, true, '2025-10-23 11:26:26.819-03', '{"theme":"light","notifications":true}', '2025-10-23 11:26:07.441-03', '2025-10-23 11:26:26.819-03'),
(23, 'Joao', 'joao@gmail.com', '$2a$12$xAp.X7SQfGT.94bMk29IU.0kDtXVIpCle6zRIRA/j7HXxE5Wp/iva', 'user', NULL, true, '2025-10-23 11:28:18.812-03', '{"theme":"light","notifications":true}', '2025-10-23 11:28:01.457-03', '2025-10-23 11:28:18.812-03'),
(24, 'jorge', 'jorge@gmail.com', '$2a$12$lfsOMhgJQOPEsxs4EEIOr.uOruFUqt4HIAU7i.uTckQbJ8dohNiKu', 'user', NULL, true, '2025-10-23 11:33:51-03', '{"theme":"light","notifications":true}', '2025-10-23 11:33:28.268-03', '2025-10-23 11:33:51-03'),
(45, 'Wisley', 'wisleygabriel@gmail.com', '$2b$10$2kU2EXYMWk03/UAVKYsgaO8ALdbnDGSnF5.AjcJs4kQkV4Ecg7A6i', 'user', NULL, true, '2025-11-04 10:12:38.915-03', '{"theme":"light","notifications":true}', '2025-11-01 16:59:01.807-03', '2025-11-04 10:12:38.916-03'),
(49, 'Vamessa', 'vamessa1@gmail.com', '$2a$12$wlmmcmEQIEVC1pMjA0TqCOjSpSS.AHYsixPYvfw.PsGl1i0wDglDi', 'user', NULL, true, '2025-11-16 23:20:49.645-03', '{"theme":"light","notifications":true}', '2025-11-16 23:20:37.065-03', '2025-11-16 23:20:49.646-03'),
(50, 'Mikael', 'mikael@gmail.com', '$2a$12$VI/pJwHkOi0/6dFYFXxgEOS1J30xrjmg8ufhX7ZIrY9YCv8nc0w4m', 'user', NULL, true, '2025-11-25 11:07:55.732-03', '{"theme":"light","notifications":true}', '2025-11-25 09:28:44.47-03', '2025-11-25 11:07:55.732-03');

-- ====================================
-- VERIFICAÇÃO
-- ====================================
-- Execute estes comandos após importar para verificar:

SELECT COUNT(*) as total_users FROM users;
SELECT id, name, email, role FROM users WHERE role = 'admin';
SELECT id, name, email FROM users ORDER BY "createdAt" DESC LIMIT 5;
