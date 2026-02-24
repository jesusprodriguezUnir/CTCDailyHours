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

#### 📌 Credenciales Configuradas
Las credenciales ya están en `src/lib/supabase.js`:
```javascript
const supabaseUrl = 'https://ipbvulbzxrnbiipberxh.supabase.co'
const supabaseKey = 'sb_publishable_CFRyVd9rCpVIERPyhtN0Bg_N_cjfyRC'
```

#### 🗄️ Configurar Base de Datos paso a paso

**IMPORTANTE:** Ejecuta este proceso en Supabase Dashboard:

1. **Accede a tu proyecto Supabase:**
   - URL: https://supabase.com/dashboard
   - Selecciona el proyecto `ipbvulbzxrnbiipberxh`

2. **Abre el SQL Editor:**
   - En el menú lateral izquierdo busca **"SQL Editor"**
   - Clic en **"New query"** para abrir un editor en blanco

3. **Copia y pega TODO el contenido del archivo:**
   - 📄 Archivo: `database_migration.sql` (en la raíz del proyecto)
   - Este script hace TODO en un solo paso:
     - ✅ Crea las 3 tablas (employees, tasks, time_entries)
     - ✅ Crea índices para optimización
     - ✅ Inserta 4 tareas predefinidas
     - ✅ Inserta 1 admin + 7 responsables + 20 empleados
     - ✅ Inserta entradas de tiempo de ejemplo
     - ✅ Configura políticas de seguridad (RLS)
     - ✅ Muestra resumen de datos creados

4. **Ejecuta el script:**
   - Clic en **"Run"** o presiona `Ctrl + Enter`
   - ⏳ Espera 10-15 segundos
   - ✅ Deberías ver mensajes de éxito y un resumen

5. **Verifica la creación:**
   - Deberías ver en los resultados:
     ```
     🔴 Administradores: 1
     🟡 Responsables: 7
     🟢 Empleados: 20
     📋 4 tareas activas
     ```

### 4. Iniciar Aplicación
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

---

## 👤 Usuarios de Acceso Inmediato

### 🔴 Administrador (Acceso Total)
| Usuario | Contraseña | Capacidades |
|---------|------------|-------------|
| Admin Sistema | `admin123` | ✅ Todo: Gestión empleados, tareas, ver todos los datos, exportar |

### 🟡 Responsables (Gestión y Supervisión)
| Usuario | Contraseña | Capacidades |
|---------|------------|-------------|
| Pedro Sánchez | `pedro123` | ✅ Gestionar tareas<br>✅ Ver todos los empleados<br>✅ Exportar reportes<br>❌ No gestionar empleados |
| Laura García | `laura123` | (mismas capacidades) |
| Miguel Torres | `miguel123` | (mismas capacidades) |

**⚡ CAMBIO IMPORTANTE:** Los responsables ahora pueden:
- ✅ Ver el tab **"⚙️ Administración"**
- ✅ Gestionar tareas (crear, editar, activar/desactivar)
- ✅ Ver entradas de todos los empleados
- ✅ Exportar reportes completos

### 🟢 Empleados (Solo sus datos)
| Usuario | Contraseña | Capacidades |
|---------|------------|-------------|
| Juan García | `juan123` | ✅ Ver solo SUS entradas<br>✅ Registrar sus horas<br>❌ No ver datos de otros |
| María Rodríguez | `maría123` | (mismas capacidades) |
| José Martínez | `josé123` | (mismas capacidades) |

---

## 🧪 Verificar Instalación

### ✅ Test 1: Login y Roles - 2 min

1. **Accede a la aplicación:** http://localhost:5173
2. **Login como Admin:**
   - Usuario: `Admin Sistema`
   - Contraseña: `admin123`
   - ✅ Deberías ver badge **🔴 ADMIN** en rojo
   - ✅ Aparece el tab **"⚙️ Administración"**
3. **Cierra sesión**
4. **Login como Responsable:**
   - Usuario: `Pedro Sánchez`
   - Contraseña: `pedro123`
   - ✅ Badge **🟡 RESPONSABLE** en amarillo
   - ✅ **IMPORTANTE:** También aparece el tab **"⚙️ Administración"**
5. **Cierra sesión**
6. **Login como Empleado:**
   - Usuario: `Juan García`
   - Contraseña: `juan123`
   - ✅ Badge **🟢 EMPLEADO** en verde
   - ❌ **NO** aparece el tab Administración

**✅ Resultado esperado:** Admin y Responsable tienen acceso a Administración, Empleado NO.

### ✅ Test 2: Gestión de Tareas - 3 min (Admin o Responsable)

1. **Login como responsable:** `pedro123`
2. **Ve a "⚙️ Administración"** → **"📋 Tareas"**
3. **Haz clic en "➕ Nueva Tarea"**
4. **Completa el formulario:**
   - Nombre: `Prueba Sistema`
   - Activa: ☑️ Sí
5. **Clic en "Crear Tarea"**
6. ✅ **Verifica que aparece en la lista**
7. **Haz clic en "✏️" (editar)** en la tarea que creaste
8. **Cambia el estado** a "Inactiva" (desmarca el checkbox)
9. **Guarda cambios**
10. ✅ **Verifica que el badge cambia a "Inactiva"** en rojo

**✅ Resultado esperado:** Tanto Admin como Responsable pueden gestionar tareas.

### ✅ Test 3: Gestión de Empleados - 3 min (**Solo Admin**)

1. **Cierra sesión** y **login como Admin:** `admin123`
2. **Ve a Administración** → **"👥 Empleados"**
3. **Haz clic en "➕ Nuevo Empleado"**
4. **Completa el formulario:**
   - Nombre: `Test User`
   - Rol: `Empleado`
   - Contraseña: `test123`
5. **Clic en "Crear Empleado"**
6. ✅ **Verifica que aparece en la lista**
7. **Usa los filtros:** Selecciona rol "Empleado"
8. **Haz clic en "✏️"** en el empleado creado
9. **Prueba editar** el nombre y guardar cambios

**✅ Resultado esperado:** Solo Admin puede gestionar empleados. Responsable NO ve esta opción.

### ✅ Test 4: Registro de Horas - 2 min

1. **Login como empleado:** `juan123`
2. **Ve a "📅 Calendario"**
3. **Haz clic en el día actual**
4. **Agrega entrada de tiempo:**
   - Tarea: `Limpieza`
   - Horas: `2`
5. **Guarda la entrada**
6. ✅ **Verifica que aparece en el calendario** con el color de la tarea

**✅ Resultado esperado:** Empleado puede registrar solo sus propias horas.

### ✅ Test 5: Reportes y Exportación - 5 min (Admin o Responsable)

1. **Login como responsable:** `pedro123`
2. **Ve a "📊 Resumen"**
3. **Configura filtros de fecha:**
   - Fecha inicio: Primer día del mes actual
   - Fecha fin: Último día del mes actual
4. **Prueba los TRES modos de vista:**
   - 👤 **Por Empleado:** Horas totales agrupadas por empleado
   - 📋 **Por Tarea:** Horas totales agrupadas por tarea
   - 📅 **Por Período:** Horas diarias por empleado
5. **Exporta a Excel** (📊 Botón verde):
   - ✅ Verifica que descarga archivo `.xlsx`
   - ✅ Abre en Excel y verifica formato con bordes y colores
6. **Exporta a PDF** (📄 Botón rojo):
   - ✅ Verifica que descarga archivo `.pdf`  
   - ✅ Abre y verifica tabla formateada
7. **Exporta a CSV** (📁 Botón azul):
   - ✅ Verifica que descarga archivo `.csv`
   - ✅ Abre en Excel y verifica que los acentos se ven correctamente

**✅ Resultado esperado:** Admin y Responsable pueden ver datos de todos y exportar. Empleado NO ve esta vista.

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

### ❌ Problema: No puedo acceder a Administración
**Síntoma:** No aparece el tab "⚙️ Administración"

**Solución:**
1. ✅ **Verifica tu rol:** Solo usuarios con rol `admin` o `responsible` pueden acceder
2. **Comprueba en Supabase:**
   - Ve al SQL Editor
   - Ejecuta: `SELECT name, role FROM employees WHERE name = 'Tu Nombre';`
   - Debe retornar `admin` o `responsible`
3. **Si eres empleado (role = 'employee'):** NO tendrás acceso a Administración (es correcto)
4. **Cierra sesión y vuelve a entrar** para refrescar permisos

**⚠️ IMPORTANTE:** Con el cambio reciente, los responsables **SÍ** tienen acceso a Administración para gestionar tareas.

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
