-- ============================================
-- CTC Daily Hours - Seed Data
-- Datos iniciales para desarrollo y pruebas
-- ============================================

-- IMPORTANTE: Ejecutar este script DESPUÉS de database_migration.sql

-- 1. Insertar las tareas predefinidas
INSERT INTO tasks (id, name, active) VALUES
(1, 'Clasificación Férricos', true),
(2, 'Carga de Camión', true),
(3, 'Limpieza', true),
(4, 'Mantenimiento', true)
ON CONFLICT (id) DO NOTHING;

-- Resetear la secuencia de tasks
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- 2. Insertar usuario administrador
INSERT INTO employees (id, name, role, password, active) VALUES
(1, 'Admin Sistema', 'admin', 'admin123', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar responsables/supervisores
INSERT INTO employees (id, name, role, password, active) VALUES
(2, 'Pedro Sánchez', 'responsible', 'pedro123', true),
(3, 'Laura García', 'responsible', 'laura123', true),
(4, 'Miguel Torres', 'responsible', 'miguel123', true),
(5, 'Carmen Ruiz', 'responsible', 'carmen123', true),
(6, 'Antonio López', 'responsible', 'antonio123', true),
(7, 'María José Fernández', 'responsible', 'maria123', true),
(8, 'Francisco Gómez', 'responsible', 'francisco123', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar empleados de ejemplo (50 empleados)
INSERT INTO employees (id, name, role, password, active) VALUES
(9, 'Juan García', 'employee', 'juan123', true),
(10, 'María Rodríguez', 'employee', 'maría123', true),
(11, 'José Martínez', 'employee', 'josé123', true),
(12, 'Ana Sánchez', 'employee', 'ana123', true),
(13, 'Antonio López', 'employee', 'antonio123', true),
(14, 'Carmen González', 'employee', 'carmen123', true),
(15, 'Francisco Pérez', 'employee', 'francisco123', true),
(16, 'Dolores Fernández', 'employee', 'dolores123', true),
(17, 'David Gómez', 'employee', 'david123', true),
(18, 'Rosa Martín', 'employee', 'rosa123', true),
(19, 'Manuel Jiménez', 'employee', 'manuel123', true),
(20, 'Isabel Ruiz', 'employee', 'isabel123', true),
(21, 'Javier Hernández', 'employee', 'javier123', true),
(22, 'Elena Díaz', 'employee', 'elena123', true),
(23, 'Carlos Morales', 'employee', 'carlos123', true),
(24, 'Lucia Álvarez', 'employee', 'lucia123', true),
(25, 'Miguel Torres', 'employee', 'miguel123', true),
(26, 'Patricia Serrano', 'employee', 'patricia123', true),
(27, 'Rafael Blanco', 'employee', 'rafael123', true),
(28, 'Mercedes Muñoz', 'employee', 'mercedes123', true),
(29, 'Fernando Castro', 'employee', 'fernando123', true),
(30, 'Andrea Ortega', 'employee', 'andrea123', true),
(31, 'Alejandro Romero', 'employee', 'alejandro123', true),
(32, 'Sandra Núñez', 'employee', 'sandra123', true),
(33, 'Jorge García', 'employee', 'jorge123', true),
(34, 'Natalia Rodríguez', 'employee', 'natalia123', true),
(35, 'Raúl Martínez', 'employee', 'raúl123', true),
(36, 'Margarita Sánchez', 'employee', 'margarita123', true),
(37, 'Luis López', 'employee', 'luis123', true),
(38, 'Sonia González', 'employee', 'sonia123', true),
(39, 'Andrés Pérez', 'employee', 'andrés123', true),
(40, 'Esther Fernández', 'employee', 'esther123', true),
(41, 'Diego Gómez', 'employee', 'diego123', true),
(42, 'Verónica Martín', 'employee', 'verónica123', true),
(43, 'Adrián Jiménez', 'employee', 'adrián123', true),
(44, 'Cristina Ruiz', 'employee', 'cristina123', true),
(45, 'Óscar Hernández', 'employee', 'óscar123', true),
(46, 'Laura Díaz', 'employee', 'laura123', true),
(47, 'Iván Morales', 'employee', 'iván123', true),
(48, 'Silvia Álvarez', 'employee', 'silvia123', true),
(49, 'Sergio Torres', 'employee', 'sergio123', true),
(50, 'Raquel Serrano', 'employee', 'raquel123', true),
(51, 'Álvaro Blanco', 'employee', 'álvaro123', true),
(52, 'Noelia Muñoz', 'employee', 'noelia123', true),
(53, 'Pablo Castro', 'employee', 'pablo123', true),
(54, 'Mónica Ortega', 'employee', 'mónica123', true),
(55, 'Rubén Romero', 'employee', 'rubén123', true),
(56, 'Beatriz Núñez', 'employee', 'beatriz123', true),
(57, 'Víctor García', 'employee', 'víctor123', true),
(58, 'Diana Rodríguez', 'employee', 'diana123', true)
ON CONFLICT (id) DO NOTHING;

-- Resetear la secuencia de employees
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
