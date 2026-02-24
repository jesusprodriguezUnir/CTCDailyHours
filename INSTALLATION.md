# 🚀 Guía de Instalación y Configuración - CTC Daily Hours

## ⚡ Inicio Rápido

### 1. Clonar el Repositorio
```bash
git clone https://github.com/jesusprodriguezUnir/CTCDailyHours.git
cd CTCDailyHours
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configuración de Supabase

#### Credenciales Actuales
Las credenciales ya están configuradas en `src/lib/supabase.js`:
```javascript
const supabaseUrl = 'https://ipbvulbzxrnbiipberxh.supabase.co'
const supabaseKey = 'sb_publishable_CFRyVd9rCpVIERPyhtN0Bg_N_cjfyRC'
```

#### Configurar Base de Datos

1. **Accede al Dashboard de Supabase**: https://supabase.com/dashboard
2. **Ve a SQL Editor** en tu proyecto
3. **Ejecuta los scripts en este orden**:

**Paso 1 - Migración (database_migration.sql)**
```sql
-- Este script modifica el esquema existente para agregar:
-- - Rol 'admin' a la tabla employees
-- - Campo 'active' a la tabla tasks
-- - Índices para optimización

-- Copiar todo el contenido de database_migration.sql y ejecutarlo
```

**Paso 2 - Datos Iniciales (database_seed.sql)**
```sql
-- Este script inserta:
-- - 4 tareas predefinidas
-- - 1 usuario administrador
-- - 7 responsables
-- - 50 empleados de ejemplo
-- - Entradas de tiempo de ejemplo (opcional)

-- Copiar todo el contenido de database_seed.sql y ejecutarlo
```

### 4. Iniciar Aplicación
```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

---

## 👤 Usuarios de Acceso Inmediato

### 🔴 Administrador (Acceso Total)
| Usuario | Contraseña |
|---------|------------|
| Admin Sistema | `admin123` |

**Permisos:**
- ✅ Gestión de empleados (crear, editar, desactivar)
- ✅ Gestión de tareas (crear, editar, desactivar)
- ✅ Ver todas las entradas de tiempo
- ✅ Exportar reportes (Excel, PDF, CSV)
- ✅ Acceso a todas las vistas

### 🟡 Responsables (Supervisión)
| Usuario | Contraseña |
|---------|------------|
| Pedro Sánchez | `pedro123` |
| Laura García | `laura123` |
| Miguel Torres | `miguel123` |

**Permisos:**
- ✅ Ver entradas de todos los empleados
- ✅ Agregar/editar entradas para cualquier empleado
- ✅ Exportar reportes
- ❌ No pueden gestionar empleados ni tareas

### 🟢 Empleados (Autogestión)
| Usuario | Contraseña |
|---------|------------|
| Juan García | `juan123` |
| María Rodríguez | `maría123` |
| José Martínez | `josé123` |

**Permisos:**
- ✅ Ver solo sus propias entradas
- ✅ Agregar/editar solo sus propias entradas
- ❌ No pueden ver entradas de otros
- ❌ No pueden exportar reportes globales

---

## 🧪 Verificar Instalación

### Test 1: Login y Roles
1. Accede a http://localhost:5173
2. Login como `admin123` → Deberías ver badge 🔴 rojo
3. Verifica que aparece el tab "⚙️ Administración"
4. Cierra sesión
5. Login como `pedro123` → Badge 🟡 amarillo, sin tab Admin
6. Cierra sesión
7. Login como `juan123` → Badge 🟢 verde, sin tab Admin

### Test 2: Gestión de Tareas (Solo Admin)
1. Login como admin
2. Ve a "⚙️ Administración" → "📋 Tareas"
3. Haz clic en "➕ Nueva Tarea"
4. Crea tarea "Prueba Sistema"
5. Verifica que aparece en la lista
6. Desactiva la tarea
7. Verifica que cambia el estado a "Inactiva"

### Test 3: Gestión de Empleados (Solo Admin)
1. En Administración → "👥 Empleados"
2. Haz clic en "➕ Nuevo Empleado"
3. Crea empleado: "Test User", rol "Empleado", password "test123"
4. Verifica que aparece en la lista
5. Usa filtros: selecciona rol "Empleado"
6. Edita el empleado creado

### Test 4: Registro de Horas
1. Login como empleado (juan123)
2. Ve a "📅 Calendario"
3. Haz clic en el día actual
4. Agrega entrada: Tarea "Limpieza", 2 horas
5. Verifica que aparece en el calendario

### Test 5: Reportes y Exportación
1. Login como responsable (pedro123)
2. Ve a "📊 Resumen"
3. Configura filtros:
   - Fecha inicio: primer día del mes
   - Fecha fin: último día del mes
4. Prueba los tres modos de vista:
   - Por Empleado
   - Por Tarea
   - Por Período
5. Exporta a Excel → Verifica que descarga el archivo
6. Exporta a PDF → Verifica el formato
7. Exporta a CSV → Abre en Excel y verifica acentos

---

## 📦 Dependencias Instaladas

### Dependencias de Producción
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "xlsx": "latest",
  "jspdf": "latest",
  "jspdf-autotable": "latest"
}
```

### Dependencias de Desarrollo
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.16",
  "gh-pages": "^6.1.0",
  "postcss": "^8.4.32",
  "tailwindcss": "^3.4.0",
  "vite": "^5.0.8",
  "vite-plugin-pwa": "^0.17.4"
}
```

---

## 🔧 Solución de Problemas

### Problema: Error al conectar con Supabase
**Síntoma:** Loading infinito, error en consola "Failed to fetch"

**Solución:**
1. Verifica las credenciales en `src/lib/supabase.js`
2. Asegúrate de que el proyecto Supabase esté activo
3. Verifica que ejecutaste los scripts SQL de migración y seed

### Problema: No aparecen usuarios en el login
**Síntoma:** Dropdown vacío en login

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores de red o JavaScript
3. Verifica que `USE_MOCK = false` en `src/hooks/useEmployees.js`
4. Confirma que ejecutaste `database_seed.sql` en Supabase

### Problema: Error al exportar a Excel/PDF
**Síntoma:** "Error al exportar" o archivo no se descarga

**Solución:**
1. Verifica que instalaste las dependencias: `npm install`
2. Limpia caché: `rm -rf node_modules package-lock.json && npm install`
3. Revisa la consola del navegador para mensajes de error específicos

### Problema: No puedo acceder a Administración
**Síntoma:** No aparece el tab "⚙️ Administración"

**Solución:**
1. Verifica que estás logueado con un usuario admin
2. Confirma en la base de datos que el usuario tiene `role = 'admin'`
3. Cierra sesión y vuelve a entrar

### Problema: Las tareas creadas no aparecen en dropdowns
**Síntoma:** Nuevas tareas no se muestran al registrar horas

**Solución:**
1. Verifica que la tarea esté marcada como `active = true`
2. Recarga la página (F5)
3. Revisa que `USE_MOCK = false` en `src/hooks/useTasks.js`

---

## 📊 Estructura de la Base de Datos

### Diagrama de Relaciones
```
┌─────────────────┐       ┌─────────────────┐
│   employees     │       │     tasks       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ role            │       │ active          │
│ password        │       │ created_at      │
│ active          │       └─────────────────┘
│ created_at      │                │
└────────┬────────┘                │
         │                          │
         │      ┌──────────────────┴────────┐
         │      │                            │
         └──────►  time_entries              │
                │                            │
                ├──────────────────────────◄─┘
                │ id (PK)                    
                │ employee_id (FK)           
                │ task_id (FK)               
                │ date                       
                │ hours                      
                │ created_at                 
                └────────────────────────────┘
```

### Índices Creados
- `idx_time_entries_date` - Optimiza búsquedas por fecha
- `idx_time_entries_employee` - Optimiza filtros por empleado
- `idx_time_entries_task` - Optimiza filtros por tarea
- `idx_employees_role` - Optimiza filtros de rol
- `idx_employees_active` - Optimiza filtros de estado
- `idx_tasks_active` - Optimiza listado de tareas activas

---

## 🚀 Deployment en Producción

### Opción 1: GitHub Pages (Recomendado para pruebas)
```bash
npm run deploy
```

### Opción 2: Netlify
1. Conecta tu repositorio de GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`

### Opción 3: Vercel
1. Importa proyecto desde GitHub
2. Framework Preset: Vite
3. Deploy automático

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa esta guía de solución de problemas
2. Consulta el README.md principal
3. Contacta al equipo de desarrollo

---

**✅ Si completaste todos los tests exitosamente, tu instalación está correcta.**
