-- ============================================
-- CTC Daily Hours - Database Setup Complete
-- Script completo para crear base de datos desde cero
-- Ejecutar este script en Supabase SQL Editor
-- ============================================

-- PASO 1: Crear tablas principales
-- ============================================

-- Tabla de centros de trabajo
CREATE TABLE IF NOT EXISTS work_centers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de departamentos asociados a centros
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  work_center_id BIGINT NOT NULL REFERENCES work_centers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (work_center_id, code)
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empleados con roles: employee, responsible, admin
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'responsible', 'admin')),
  password TEXT NOT NULL,
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajustes para instalaciones existentes
ALTER TABLE IF EXISTS employees
  ADD COLUMN IF NOT EXISTS password TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'password_hash'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'password'
  ) THEN
    ALTER TABLE employees RENAME COLUMN password_hash TO password;
  END IF;
END $$;

ALTER TABLE IF EXISTS employees
  ADD COLUMN IF NOT EXISTS department_id BIGINT;

-- Tabla de tareas con campo active para activar/desactivar
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_customer_service BOOLEAN DEFAULT false,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS tasks
  ADD COLUMN IF NOT EXISTS is_customer_service BOOLEAN DEFAULT false;

ALTER TABLE IF EXISTS tasks
  ADD COLUMN IF NOT EXISTS customer_id BIGINT;

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
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(active);
CREATE INDEX IF NOT EXISTS idx_tasks_customer ON tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_service ON tasks(is_customer_service);
CREATE INDEX IF NOT EXISTS idx_departments_center ON departments(work_center_id);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(active);
CREATE INDEX IF NOT EXISTS idx_work_centers_active ON work_centers(active);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON time_entries(employee_id, date);

-- Asegurar constraint y backfill de department_id en instalaciones existentes
DO $$
DECLARE
  default_center_id BIGINT;
  default_department_id BIGINT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
    SELECT id INTO default_center_id FROM work_centers ORDER BY id LIMIT 1;
    IF default_center_id IS NULL THEN
      INSERT INTO work_centers (name, code, active) VALUES ('Central', 'CTR', true)
      RETURNING id INTO default_center_id;
    END IF;

    SELECT id INTO default_department_id FROM departments WHERE work_center_id = default_center_id ORDER BY id LIMIT 1;
    IF default_department_id IS NULL THEN
      INSERT INTO departments (work_center_id, name, code, active)
      VALUES (default_center_id, 'Administracion', 'ADM', true)
      RETURNING id INTO default_department_id;
    END IF;

    UPDATE employees
    SET department_id = default_department_id
    WHERE department_id IS NULL;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'employees' AND constraint_name = 'employees_department_id_fkey'
    ) THEN
      ALTER TABLE employees
        ADD CONSTRAINT employees_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT;
    END IF;

    ALTER TABLE employees
      ALTER COLUMN department_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'tasks' AND constraint_name = 'tasks_customer_id_fkey'
  ) THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- PASO 3: Insertar centros, departamentos y clientes
-- ============================================

INSERT INTO work_centers (name, code, active) VALUES
('Madrid', 'MAD', true),
('Sevilla', 'SEV', true),
('Huevar', 'HUE', true),
('Central', 'CTR', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  active = EXCLUDED.active;

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

INSERT INTO customers (id, name, code, active) VALUES
(1, 'Cliente Alpha', 'ALPHA', true),
(2, 'Cliente Beta', 'BETA', true),
(3, 'Cliente Gamma', 'GAMMA', true)
ON CONFLICT (id) DO NOTHING;

-- PASO 4: Insertar tareas predefinidas
-- ============================================

INSERT INTO tasks (id, name, is_customer_service, customer_id, active) VALUES
(1, 'Clasificacion Ferricos', false, NULL, true),
(2, 'Carga de Camion', false, NULL, true),
(3, 'Limpieza', false, NULL, true),
(4, 'Mantenimiento', false, NULL, true),
(5, 'Asistencia Cliente', true, 1, true)
ON CONFLICT (id) DO NOTHING;

-- PASO 5: Insertar usuarios iniciales
-- ============================================

-- Administrador del sistema
INSERT INTO employees (id, name, role, password, department_id, active) VALUES
(1, 'Admin Sistema', 'admin', 'admin123', (SELECT id FROM departments ORDER BY id LIMIT 1), true)
ON CONFLICT (id) DO NOTHING;

-- Responsables/Supervisores
INSERT INTO employees (id, name, role, password, department_id, active) VALUES
(2, 'Pedro Sanchez', 'responsible', 'pedro123', 2, true),
(3, 'Laura Garcia', 'responsible', 'laura123', 3, true),
(4, 'Miguel Torres', 'responsible', 'miguel123', 4, true),
(5, 'Carmen Ruiz', 'responsible', 'carmen123', 5, true),
(6, 'Antonio Lopez', 'responsible', 'antonio123', 6, true),
(7, 'Maria Jose Fernandez', 'responsible', 'maria123', 7, true),
(8, 'Francisco Gomez', 'responsible', 'francisco123', 8, true)
ON CONFLICT (id) DO NOTHING;

-- Empleados
INSERT INTO employees (id, name, role, password, department_id, active) VALUES
(9, 'Juan Garcia', 'employee', 'juan123', 9, true),
(10, 'Maria Rodriguez', 'employee', 'maria123', 10, true),
(11, 'Jose Martinez', 'employee', 'jose123', 11, true),
(12, 'Ana Sanchez', 'employee', 'ana123', 12, true),
(13, 'Antonio Lopez Morales', 'employee', 'antonio123', 13, true),
(14, 'Carmen Gonzalez', 'employee', 'carmen123', 14, true),
(15, 'Francisco Perez', 'employee', 'francisco123', 15, true),
(16, 'Dolores Fernandez', 'employee', 'dolores123', 16, true),
(17, 'David Gomez', 'employee', 'david123', 17, true),
(18, 'Rosa Martin', 'employee', 'rosa123', 18, true),
(19, 'Manuel Jimenez', 'employee', 'manuel123', 19, true),
(20, 'Isabel Ruiz', 'employee', 'isabel123', 20, true),
(21, 'Javier Hernandez', 'employee', 'javier123', 21, true),
(22, 'Elena Diaz', 'employee', 'elena123', 22, true),
(23, 'Carlos Morales', 'employee', 'carlos123', 23, true),
(24, 'Lucia Alvarez', 'employee', 'lucia123', 24, true),
(25, 'Miguel Torres Blanco', 'employee', 'miguel123', 25, true),
(26, 'Patricia Serrano', 'employee', 'patricia123', 26, true),
(27, 'Rafael Blanco', 'employee', 'rafael123', 27, true),
(28, 'Mercedes Munoz', 'employee', 'mercedes123', 28, true)
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

SELECT setval('work_centers_id_seq', (SELECT MAX(id) FROM work_centers));
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- PASO 7: Habilitar Row Level Security
-- ============================================

ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Politicas: lectura publica de centros, departamentos y clientes activos
DROP POLICY IF EXISTS "public_read_active_work_centers" ON work_centers;
CREATE POLICY "public_read_active_work_centers" ON work_centers
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "public_read_active_departments" ON departments;
CREATE POLICY "public_read_active_departments" ON departments
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "public_read_active_customers" ON customers;
CREATE POLICY "public_read_active_customers" ON customers
  FOR SELECT USING (active = true);

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
