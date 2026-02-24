-- ============================================
-- CTC Daily Hours - Seed Data
-- Datos iniciales para desarrollo y pruebas
-- ============================================

-- IMPORTANTE: Ejecutar este script DESPUÉS de database_migration.sql

-- 1. Insertar centros de trabajo
INSERT INTO work_centers (name, code, active) VALUES
('Madrid', 'MAD', true),
('Sevilla', 'SEV', true),
('Huevar', 'HUE', true),
('Central', 'CTR', true)
ON CONFLICT (code) DO UPDATE SET
	name = EXCLUDED.name,
	active = EXCLUDED.active;

-- 2. Insertar departamentos por centro
INSERT INTO departments (work_center_id, name, code, active) VALUES
((SELECT id FROM work_centers WHERE code = 'MAD'), 'Produccion', 'PROD', true),
((SELECT id FROM work_centers WHERE code = 'MAD'), 'Logistica', 'LOG', true),
((SELECT id FROM work_centers WHERE code = 'MAD'), 'Mantenimiento', 'MANT', true),
((SELECT id FROM work_centers WHERE code = 'MAD'), 'Calidad', 'CAL', true),
((SELECT id FROM work_centers WHERE code = 'MAD'), 'RRHH', 'RRHH', true),
((SELECT id FROM work_centers WHERE code = 'MAD'), 'PRL', 'PRL', true),
((SELECT id FROM work_centers WHERE code = 'MAD'), 'Administracion', 'ADM', true),
((SELECT id FROM work_centers WHERE code = 'MAD'), 'Comercial', 'COM', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'Produccion', 'PROD', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'Logistica', 'LOG', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'Mantenimiento', 'MANT', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'Calidad', 'CAL', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'RRHH', 'RRHH', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'PRL', 'PRL', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'Administracion', 'ADM', true),
((SELECT id FROM work_centers WHERE code = 'SEV'), 'Comercial', 'COM', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'Produccion', 'PROD', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'Logistica', 'LOG', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'Mantenimiento', 'MANT', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'Calidad', 'CAL', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'RRHH', 'RRHH', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'PRL', 'PRL', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'Administracion', 'ADM', true),
((SELECT id FROM work_centers WHERE code = 'HUE'), 'Comercial', 'COM', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'Produccion', 'PROD', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'Logistica', 'LOG', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'Mantenimiento', 'MANT', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'Calidad', 'CAL', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'RRHH', 'RRHH', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'PRL', 'PRL', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'Administracion', 'ADM', true),
((SELECT id FROM work_centers WHERE code = 'CTR'), 'Comercial', 'COM', true)
ON CONFLICT (work_center_id, code) DO NOTHING;

-- 3. Insertar clientes
INSERT INTO customers (id, name, code, active) VALUES
(1, 'Cliente Alpha', 'ALPHA', true),
(2, 'Cliente Beta', 'BETA', true),
(3, 'Cliente Gamma', 'GAMMA', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar las tareas predefinidas
INSERT INTO tasks (id, name, is_customer_service, customer_id, active) VALUES
(1, 'Clasificacion Ferricos', false, NULL, true),
(2, 'Carga de Camion', false, NULL, true),
(3, 'Limpieza', false, NULL, true),
(4, 'Mantenimiento', false, NULL, true),
(5, 'Asistencia Cliente', true, 1, true)
ON CONFLICT (id) DO NOTHING;

-- Resetear la secuencia de tasks
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- 5. Insertar usuario administrador
INSERT INTO employees (id, name, role, password, department_id, active) VALUES
(1, 'Admin Sistema', 'admin', 'admin123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true)
ON CONFLICT (id) DO NOTHING;

-- 6. Insertar responsables/supervisores
INSERT INTO employees (id, name, role, password, department_id, active) VALUES
(2, 'Pedro Sanchez', 'responsible', 'pedro123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(3, 'Laura Garcia', 'responsible', 'laura123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(4, 'Miguel Torres', 'responsible', 'miguel123', (SELECT id FROM departments WHERE code = 'MANT' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(5, 'Carmen Ruiz', 'responsible', 'carmen123', (SELECT id FROM departments WHERE code = 'CAL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(6, 'Antonio Lopez', 'responsible', 'antonio123', (SELECT id FROM departments WHERE code = 'RRHH' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(7, 'Maria Jose Fernandez', 'responsible', 'maria123', (SELECT id FROM departments WHERE code = 'PRL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(8, 'Francisco Gomez', 'responsible', 'francisco123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true)
ON CONFLICT (id) DO NOTHING;

-- 7. Insertar empleados de ejemplo (50 empleados)
INSERT INTO employees (id, name, role, password, department_id, active) VALUES
(9, 'Juan Garcia', 'employee', 'juan123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(10, 'Maria Rodriguez', 'employee', 'maria123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(11, 'Jose Martinez', 'employee', 'jose123', (SELECT id FROM departments WHERE code = 'MANT' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(12, 'Ana Sanchez', 'employee', 'ana123', (SELECT id FROM departments WHERE code = 'CAL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(13, 'Antonio Lopez', 'employee', 'antonio123', (SELECT id FROM departments WHERE code = 'RRHH' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(14, 'Carmen Gonzalez', 'employee', 'carmen123', (SELECT id FROM departments WHERE code = 'PRL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(15, 'Francisco Perez', 'employee', 'francisco123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(16, 'Dolores Fernandez', 'employee', 'dolores123', (SELECT id FROM departments WHERE code = 'COM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(17, 'David Gomez', 'employee', 'david123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(18, 'Rosa Martin', 'employee', 'rosa123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(19, 'Manuel Jimenez', 'employee', 'manuel123', (SELECT id FROM departments WHERE code = 'MANT' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(20, 'Isabel Ruiz', 'employee', 'isabel123', (SELECT id FROM departments WHERE code = 'CAL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(21, 'Javier Hernandez', 'employee', 'javier123', (SELECT id FROM departments WHERE code = 'RRHH' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(22, 'Elena Diaz', 'employee', 'elena123', (SELECT id FROM departments WHERE code = 'PRL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(23, 'Carlos Morales', 'employee', 'carlos123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(24, 'Lucia Alvarez', 'employee', 'lucia123', (SELECT id FROM departments WHERE code = 'COM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(25, 'Miguel Torres', 'employee', 'miguel123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(26, 'Patricia Serrano', 'employee', 'patricia123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(27, 'Rafael Blanco', 'employee', 'rafael123', (SELECT id FROM departments WHERE code = 'MANT' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(28, 'Mercedes Munoz', 'employee', 'mercedes123', (SELECT id FROM departments WHERE code = 'CAL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(29, 'Fernando Castro', 'employee', 'fernando123', (SELECT id FROM departments WHERE code = 'RRHH' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(30, 'Andrea Ortega', 'employee', 'andrea123', (SELECT id FROM departments WHERE code = 'PRL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(31, 'Alejandro Romero', 'employee', 'alejandro123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(32, 'Sandra Nunez', 'employee', 'sandra123', (SELECT id FROM departments WHERE code = 'COM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(33, 'Jorge Garcia', 'employee', 'jorge123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(34, 'Natalia Rodriguez', 'employee', 'natalia123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(35, 'Raul Martinez', 'employee', 'raul123', (SELECT id FROM departments WHERE code = 'MANT' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(36, 'Margarita Sanchez', 'employee', 'margarita123', (SELECT id FROM departments WHERE code = 'CAL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(37, 'Luis Lopez', 'employee', 'luis123', (SELECT id FROM departments WHERE code = 'RRHH' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(38, 'Sonia Gonzalez', 'employee', 'sonia123', (SELECT id FROM departments WHERE code = 'PRL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(39, 'Andres Perez', 'employee', 'andres123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(40, 'Esther Fernandez', 'employee', 'esther123', (SELECT id FROM departments WHERE code = 'COM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'CTR') LIMIT 1), true),
(41, 'Diego Gomez', 'employee', 'diego123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(42, 'Veronica Martin', 'employee', 'veronica123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(43, 'Adrian Jimenez', 'employee', 'adrian123', (SELECT id FROM departments WHERE code = 'MANT' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(44, 'Cristina Ruiz', 'employee', 'cristina123', (SELECT id FROM departments WHERE code = 'CAL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(45, 'Oscar Hernandez', 'employee', 'oscar123', (SELECT id FROM departments WHERE code = 'RRHH' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(46, 'Laura Diaz', 'employee', 'laura123', (SELECT id FROM departments WHERE code = 'PRL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(47, 'Ivan Morales', 'employee', 'ivan123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(48, 'Silvia Alvarez', 'employee', 'silvia123', (SELECT id FROM departments WHERE code = 'COM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'MAD') LIMIT 1), true),
(49, 'Sergio Torres', 'employee', 'sergio123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(50, 'Raquel Serrano', 'employee', 'raquel123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(51, 'Alvaro Blanco', 'employee', 'alvaro123', (SELECT id FROM departments WHERE code = 'MANT' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(52, 'Noelia Munoz', 'employee', 'noelia123', (SELECT id FROM departments WHERE code = 'CAL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(53, 'Pablo Castro', 'employee', 'pablo123', (SELECT id FROM departments WHERE code = 'RRHH' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(54, 'Monica Ortega', 'employee', 'monica123', (SELECT id FROM departments WHERE code = 'PRL' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(55, 'Ruben Romero', 'employee', 'ruben123', (SELECT id FROM departments WHERE code = 'ADM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(56, 'Beatriz Nunez', 'employee', 'beatriz123', (SELECT id FROM departments WHERE code = 'COM' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'SEV') LIMIT 1), true),
(57, 'Victor Garcia', 'employee', 'victor123', (SELECT id FROM departments WHERE code = 'PROD' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true),
(58, 'Diana Rodriguez', 'employee', 'diana123', (SELECT id FROM departments WHERE code = 'LOG' AND work_center_id = (SELECT id FROM work_centers WHERE code = 'HUE') LIMIT 1), true)
ON CONFLICT (id) DO NOTHING;

-- Resetear secuencias
SELECT setval('work_centers_id_seq', (SELECT MAX(id) FROM work_centers));
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- 5. Insertar algunas entradas de ejemplo para la semana actual (opcional)
-- Puedes comentar esta sección si prefieres empezar con datos en blanco

INSERT INTO time_entries (employee_id, task_id, date, hours) VALUES
-- Entradas para Juan García (id: 9)
(9, 1, CURRENT_DATE, 3.0),
(9, 2, CURRENT_DATE, 1.5),
(9, 3, CURRENT_DATE, 0.5),
(9, 1, CURRENT_DATE - 1, 4.0),
(9, 4, CURRENT_DATE - 1, 2.0),

-- Entradas para María Rodríguez (id: 10)
(10, 1, CURRENT_DATE, 2.0),
(10, 2, CURRENT_DATE, 3.0),
(10, 1, CURRENT_DATE - 1, 3.5),

-- Entradas para José Martínez (id: 11)
(11, 3, CURRENT_DATE, 4.0),
(11, 4, CURRENT_DATE, 1.5),
(11, 2, CURRENT_DATE - 2, 5.0)
ON CONFLICT DO NOTHING;

-- Verificación de datos insertados
SELECT 'Tasks insertadas:', COUNT(*) FROM tasks;
SELECT 'Empleados insertados:', COUNT(*) FROM employees;
SELECT 'Administradores:', COUNT(*) FROM employees WHERE role = 'admin';
SELECT 'Responsables:', COUNT(*) FROM employees WHERE role = 'responsible';
SELECT 'Empleados estándar:', COUNT(*) FROM employees WHERE role = 'employee';
SELECT 'Entradas de tiempo:', COUNT(*) FROM time_entries;
