-- ============================================
-- CTC Daily Hours - Database Migration
-- Actualización del esquema para soportar:
-- - Rol de administrador
-- - Campo active en tareas
-- - Índices para optimización
-- ============================================

-- 1. Modificar la tabla employees para incluir el rol 'admin'
-- Primero eliminamos el constraint existente
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_role_check;

-- Agregamos el nuevo constraint con los tres roles
ALTER TABLE employees 
ADD CONSTRAINT employees_role_check 
CHECK (role IN ('employee', 'responsible', 'admin'));

-- 2. Agregar campo active a la tabla tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 3. Crear índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_time_entries_date 
ON time_entries(date);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee 
ON time_entries(employee_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_task 
ON time_entries(task_id);

CREATE INDEX IF NOT EXISTS idx_employees_role 
ON employees(role);

CREATE INDEX IF NOT EXISTS idx_employees_active 
ON employees(active);

CREATE INDEX IF NOT EXISTS idx_tasks_active 
ON tasks(active);

-- 4. Opcional: Crear índice compuesto para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date 
ON time_entries(employee_id, date);

COMMENT ON TABLE employees IS 'Tabla de empleados del sistema con roles: employee, responsible, admin';
COMMENT ON TABLE tasks IS 'Catálogo de tareas que pueden registrarse';
COMMENT ON TABLE time_entries IS 'Registros de horas trabajadas por empleado';
COMMENT ON COLUMN employees.role IS 'Rol del usuario: employee (empleado), responsible (supervisor), admin (administrador)';
COMMENT ON COLUMN employees.active IS 'Indica si el empleado está activo en el sistema';
COMMENT ON COLUMN tasks.active IS 'Indica si la tarea está disponible para registro';
