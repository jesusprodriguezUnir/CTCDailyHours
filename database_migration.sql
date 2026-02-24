-- ============================================
-- CTC Daily Hours - Database Setup Complete
-- Script completo para crear base de datos desde cero
-- Ejecutar este script en Supabase SQL Editor
-- ============================================

-- PASO 1: Crear tablas principales
-- ============================================

-- Tabla de empleados con roles: employee, responsible, admin
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'responsible', 'admin')),
  password_hash TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas con campo active para activar/desactivar
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de entradas de tiempo
CREATE TABLE IF NOT EXISTS time_entries (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES tasks(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 2: Crear índices para optimizar consultas
-- ============================================

CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(active);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(active);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON time_entries(employee_id, date);

-- PASO 3: Insertar tareas predefinidas
-- ============================================

INSERT INTO tasks (id, name, active) VALUES
(1, 'Clasificación Férricos', true),
(2, 'Carga de Camión', true),
(3, 'Limpieza', true),
(4, 'Mantenimiento', true)
ON CONFLICT (id) DO NOTHING;

-- PASO 4: Insertar usuarios iniciales
-- ============================================

-- Administrador del sistema
INSERT INTO employees (id, name, role, password, active) VALUES
(1, 'Admin Sistema', 'admin', 'admin123', true)
ON CONFLICT (id) DO NOTHING;

-- Responsables/Supervisores
INSERT INTO employees (id, name, role, password, active) VALUES
(2, 'Pedro Sánchez', 'responsible', 'pedro123', true),
(3, 'Laura García', 'responsible', 'laura123', true),
(4, 'Miguel Torres', 'responsible', 'miguel123', true),
(5, 'Carmen Ruiz', 'responsible', 'carmen123', true),
(6, 'Antonio López', 'responsible', 'antonio123', true),
(7, 'María José Fernández', 'responsible', 'maria123', true),
(8, 'Francisco Gómez', 'responsible', 'francisco123', true)
ON CONFLICT (id) DO NOTHING;

-- Empleados
INSERT INTO employees (id, name, role, password, active) VALUES
(9, 'Juan García', 'employee', 'juan123', true),
(10, 'María Rodríguez', 'employee', 'maría123', true),
(11, 'José Martínez', 'employee', 'josé123', true),
(12, 'Ana Sánchez', 'employee', 'ana123', true),
(13, 'Antonio López Morales', 'employee', 'antonio123', true),
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
(25, 'Miguel Torres Blanco', 'employee', 'miguel123', true),
(26, 'Patricia Serrano', 'employee', 'patricia123', true),
(27, 'Rafael Blanco', 'employee', 'rafael123', true),
(28, 'Mercedes Muñoz', 'employee', 'mercedes123', true)
ON CONFLICT (id) DO NOTHING;

-- PASO 5: Insertar entradas de ejemplo (opcional)
-- ============================================

INSERT INTO time_entries (employee_id, task_id, date, hours) VALUES
-- Entradas para Juan García (id: 9) - semana actual
(9, 1, CURRENT_DATE, 3.0),
(9, 2, CURRENT_DATE, 1.5),
(9, 3, CURRENT_DATE, 0.5),
(9, 1, CURRENT_DATE - 1, 4.0),
(9, 4, CURRENT_DATE - 1, 2.0),
(9, 2, CURRENT_DATE - 2, 3.5),

-- Entradas para María Rodríguez (id: 10)
(10, 1, CURRENT_DATE, 2.0),
(10, 2, CURRENT_DATE, 3.0),
(10, 1, CURRENT_DATE - 1, 3.5),
(10, 3, CURRENT_DATE - 2, 2.0),

-- Entradas para José Martínez (id: 11)
(11, 3, CURRENT_DATE, 4.0),
(11, 4, CURRENT_DATE, 1.5),
(11, 2, CURRENT_DATE - 2, 5.0),

-- Entradas para Ana Sánchez (id: 12)
(12, 1, CURRENT_DATE, 2.5),
(12, 2, CURRENT_DATE, 2.5),
(12, 4, CURRENT_DATE - 1, 4.0)
ON CONFLICT DO NOTHING;

-- PASO 6: Resetear secuencias
-- ============================================

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- PASO 7: Habilitar Row Level Security
-- ============================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer empleados activos (necesario para login)
DROP POLICY IF EXISTS "public_read_active_employees" ON employees;
CREATE POLICY "public_read_active_employees" ON employees
  FOR SELECT USING (active = true);

-- Política: Todos pueden leer tareas activas
DROP POLICY IF EXISTS "public_read_active_tasks" ON tasks;
CREATE POLICY "public_read_active_tasks" ON tasks
  FOR SELECT USING (active = true);

-- ============================================
-- NOTA DE SEGURIDAD IMPORTANTE / IMPORTANT SECURITY NOTE
-- ============================================
-- Esta aplicación utiliza autenticación personalizada (tabla employees) en lugar de
-- Supabase Auth. Por este motivo, las políticas RLS no pueden usar auth.uid() para
-- restringir el acceso por fila a nivel de base de datos.
--
-- MITIGACIÓN APLICADA:
--   - El acceso de lectura (SELECT) está restringido en la capa de aplicación:
--     fetchTimeEntries() aplica un filtro por employee_id cuando el usuario tiene
--     rol 'employee', garantizando que sólo se solicitan al servidor los registros
--     propios. Esto complementa el filtrado client-side existente.
--   - Las operaciones de escritura (INSERT/UPDATE/DELETE) no están restringidas a
--     nivel RLS por la misma razón; deben validarse en la capa de servicio.
--
-- PARA UNA SEGURIDAD COMPLETA A NIVEL DE BASE DE DATOS:
--   Integra Supabase Auth y reemplaza las políticas permisivas por las siguientes
--   (descomentar y adaptar cuando se use Supabase Auth):
--
--   -- SELECT: cada usuario sólo ve sus propias entradas (o admin/responsible ven todas)
--   -- CREATE POLICY "employee_select_own_time_entries" ON time_entries
--   --   FOR SELECT USING (
--   --     auth.uid()::text = (SELECT auth_id FROM employees WHERE id = employee_id)
--   --     OR EXISTS (
--   --       SELECT 1 FROM employees
--   --       WHERE auth_id = auth.uid()::text AND role IN ('admin', 'responsible')
--   --     )
--   --   );
--
--   -- INSERT: un usuario sólo puede insertar entradas para sí mismo
--   -- CREATE POLICY "employee_insert_own_time_entries" ON time_entries
--   --   FOR INSERT WITH CHECK (
--   --     auth.uid()::text = (SELECT auth_id FROM employees WHERE id = employee_id)
--   --   );
--
--   -- UPDATE/DELETE: un usuario sólo puede modificar/borrar sus propias entradas
--   -- CREATE POLICY "employee_modify_own_time_entries" ON time_entries
--   --   FOR UPDATE USING (
--   --     auth.uid()::text = (SELECT auth_id FROM employees WHERE id = employee_id)
--   --   ) WITH CHECK (
--   --     auth.uid()::text = (SELECT auth_id FROM employees WHERE id = employee_id)
--   --   );
--   -- CREATE POLICY "employee_delete_own_time_entries" ON time_entries
--   --   FOR DELETE USING (
--   --     auth.uid()::text = (SELECT auth_id FROM employees WHERE id = employee_id)
--   --   );
-- ============================================

-- Políticas para time_entries (permisivas mientras se use auth personalizada)
DROP POLICY IF EXISTS "allow_all_time_entries" ON time_entries;
DROP POLICY IF EXISTS "anon_select_time_entries" ON time_entries;
DROP POLICY IF EXISTS "anon_insert_time_entries" ON time_entries;
DROP POLICY IF EXISTS "anon_update_time_entries" ON time_entries;
CREATE POLICY "anon_select_time_entries" ON time_entries
  FOR SELECT USING (true);
CREATE POLICY "anon_insert_time_entries" ON time_entries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_time_entries" ON time_entries
  FOR UPDATE USING (true) WITH CHECK (true);

-- Políticas para gestión de tasks (operaciones de administrador)
DROP POLICY IF EXISTS "allow_all_tasks_management" ON tasks;
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks
  FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_tasks" ON tasks
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_tasks" ON tasks
  FOR DELETE USING (true);

-- Políticas para gestión de employees (operaciones de administrador)
DROP POLICY IF EXISTS "allow_all_employees_management" ON employees;
DROP POLICY IF EXISTS "anon_insert_employees" ON employees;
DROP POLICY IF EXISTS "anon_update_employees" ON employees;
DROP POLICY IF EXISTS "anon_delete_employees" ON employees;
CREATE POLICY "anon_insert_employees" ON employees
  FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_employees" ON employees
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_employees" ON employees
  FOR DELETE USING (true);

-- PASO 8: Verificación de datos
-- ============================================

DO $$ 
DECLARE
  total_employees INT;
  total_tasks INT;
  total_entries INT;
BEGIN
  SELECT COUNT(*) INTO total_employees FROM employees;
  SELECT COUNT(*) INTO total_tasks FROM tasks;
  SELECT COUNT(*) INTO total_entries FROM time_entries;
  
  RAISE NOTICE '✅ Base de datos creada exitosamente!';
  RAISE NOTICE '📊 Empleados totales: %', total_employees;
  RAISE NOTICE '📋 Tareas creadas: %', total_tasks;
  RAISE NOTICE '⏰ Entradas de tiempo: %', total_entries;
END $$;

-- Mostrar resumen por roles
SELECT 
  CASE 
    WHEN role = 'admin' THEN '🔴 Administradores'
    WHEN role = 'responsible' THEN '🟡 Responsables'
    WHEN role = 'employee' THEN '🟢 Empleados'
  END as tipo_usuario,
  COUNT(*) as total
FROM employees
GROUP BY role
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'responsible' THEN 2 
    ELSE 3 
  END;

-- Mostrar tareas disponibles
SELECT 
  '📋 ' || name as tarea, 
  CASE WHEN active THEN '✅ Activa' ELSE '❌ Inactiva' END as estado
FROM tasks
ORDER BY id;

-- ============================================
-- 🎯 USUARIOS DE PRUEBA
-- ============================================

/*
CREDENCIALES PARA PROBAR:

🔴 ADMINISTRADOR (Acceso total):
   Usuario: Admin Sistema
   Contraseña: admin123

🟡 RESPONSABLES (Gestionan tareas y ven todos los empleados):
   Usuario: Pedro Sánchez → Contraseña: pedro123
   Usuario: Laura García → Contraseña: laura123
   Usuario: Miguel Torres → Contraseña: miguel123

🟢 EMPLEADOS (Solo ven sus propios datos):
   Usuario: Juan García → Contraseña: juan123
   Usuario: María Rodríguez → Contraseña: maría123
   Usuario: José Martínez → Contraseña: josé123

✅ Todos los usuarios de prueba usan el formato: [nombre]123
*/
