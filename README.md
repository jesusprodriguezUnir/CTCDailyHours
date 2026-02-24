# 🏭 CTC Daily Hours - Patio de Materiales

Sistema de registro y gestión de horas diarias para empleados del patio de materiales de CTC.

## 📋 Descripción

CTC Daily Hours es una aplicación web moderna diseñada para facilitar el registro de horas de trabajo de los empleados del patio de materiales. La aplicación permite a los trabajadores registrar sus horas de forma intuitiva y a los responsables gestionar y supervisar las entradas de tiempo de todo el equipo.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Login diferenciado para empleados, responsables y administradores
- Sistema de contraseñas simple y efectivo
- Gestión de roles (Empleado / Responsable / Administrador)
- Indicadores visuales de rol con códigos de color

### 📝 Registro de Horas
- Registro rápido de horas trabajadas por tarea
- Selección de tarea desde lista predefinida:
  - Clasificación Férricos
  - Carga de Camión
  - Limpieza
  - Mantenimiento
- Incrementos de tiempo configurables (0.5, 1, 1.5, 2, etc. horas)
- Fecha automática del día actual

### 📅 Visualización de Datos
- **Vista Semanal**: Calendario interactivo que muestra:
  - Entradas de tiempo de la semana actual
  - Navegación entre semanas
  - Resumen visual de horas por día
  - Total de horas semanales

- **Vista Diaria**: Detalle completo del día seleccionado con:
  - Lista de todas las entradas del día
  - Desglose por empleado y tarea
  - Total de horas del día
  - Capacidad de edición y eliminación (responsables)

### 👥 Gestión de Empleados (Responsables)
- Filtrado de entradas por empleado
- Visualización de registros de todo el equipo
- Capacidad de agregar entradas para cualquier empleado
- Edición y eliminación de registros existentes

### ⚙️ Panel de Administración (Administradores)
- **Gestión de Empleados**: CRUD completo de empleados
  - Crear nuevos empleados con rol y contraseña
  - Editar información de empleados existentes
  - Activar/Desactivar empleados
  - Filtros por rol y estado
- **Gestión de Tareas**: CRUD completo de tareas
  - Crear nuevas tareas
  - Editar nombres de tareas
  - Activar/Desactivar tareas
  - Visualización de tareas activas e inactivas

### 📊 Resumen y Estadísticas
- Total de horas por día
- Total de horas por semana
- Visualización de productividad por empleado
- Indicadores visuales de carga de trabajo

### 📄 Sistema de Reportes Avanzado
- **Filtros Avanzados**:
  - Rango de fechas personalizado
  - Filtro por empleados (multi-selección)
  - Filtro por tareas (multi-selección)
- **Tres Vistas de Reportes**:
  - Por Empleado: Muestra horas totales y desglose por tarea de cada empleado
  - Por Tarea: Muestra horas totales por cada tipo de tarea
  - Por Período: Muestra horas totales por día
- **Exportación Múltiple**:
  - 📊 **Excel (.xlsx)**: Formato con columnas autoajustadas
  - 📄 **PDF**: Formato profesional con encabezados y totales
  - 📄 **CSV**: Formato compatible con Excel (UTF-8 con BOM)

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.2** - Biblioteca de UI
- **Vite 5.0** - Build tool y dev server
- **TailwindCSS 3.4** - Framework de estilos CSS
- **PostCSS** - Procesamiento de CSS

### Backend
- **Supabase** - Base de datos y autenticación
  - PostgreSQL como base de datos
  - API REST generada automáticamente
  - Autenticación y autorización

### Herramientas de Desarrollo
- **PWA Plugin** - Soporte para Progressive Web App
- **Autoprefixer** - Compatibilidad CSS cross-browser
- **gh-pages** - Deployment automatizado

## 📦 Estructura del Proyecto

```
CTCDailyHours/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes React
│   │   ├── AdminPanel.jsx        # Panel de administración
│   │   ├── Calendar.jsx          # Calendario mensual
│   │   ├── DayView.jsx           # Vista detallada del día
│   │   ├── EmployeeManagement.jsx # Gestión de empleados
│   │   ├── EmployeeSelector.jsx  # Selector de empleados
│   │   ├── Layout.jsx            # Layout principal
│   │   ├── Login.jsx             # Pantalla de login
│   │   ├── SummaryTable.jsx      # Tabla resumen y reportes
│   │   ├── TaskManagement.jsx    # Gestión de tareas
│   │   ├── TimeEntryForm.jsx     # Formulario de registro
│   │   ├── TimeEntryRow.jsx      # Fila de entrada de tiempo
│   │   └── WeeklyCalendar.jsx    # Calendario semanal
│   ├── data/
│   │   └── mockData.js           # Datos de prueba y constantes
│   ├── hooks/
│   │   ├── useEmployeeManagement.js # Hook para CRUD de empleados
│   │   ├── useEmployees.js       # Hook para gestión de empleados
│   │   ├── useTasks.js           # Hook para CRUD de tareas
│   │   └── useTimeEntries.js     # Hook para gestión de entradas
│   ├── lib/
│   │   └── supabase.js           # Configuración de Supabase
│   ├── utils/
│   │   └── exportHelpers.js      # Utilidades de exportación
│   ├── App.jsx                   # Componente principal
│   ├── index.css                 # Estilos globales
│   └── main.jsx                  # Punto de entrada
├── database_migration.sql    # Script de migración de BD
├── database_seed.sql         # Script de datos iniciales
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16 o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/jesusprodriguezUnir/CTCDailyHours.git
cd CTCDailyHours
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**

Copia el archivo de ejemplo de variables de entorno y complétalo con tus credenciales de Supabase:

```bash
cp .env.example .env
```

Edita `.env` con tus valores de Supabase (los encontrarás en *Project Settings → API* en el panel de Supabase):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Configurar la Base de Datos en Supabase**

Ejecuta los siguientes scripts SQL en el editor SQL de Supabase **en este orden**:

**a) Primero ejecuta el script de migración:**
```bash
# Abre database_migration.sql y copia el contenido al editor SQL de Supabase
```

Este script:
- Modifica la tabla `employees` para incluir el rol `admin`
- Agrega el campo `active` a la tabla `tasks`
- Crea índices para optimizar las consultas

**b) Luego ejecuta el script de datos iniciales:**
```bash
# Abre database_seed.sql y copia el contenido al editor SQL de Supabase
```

Este script:
- Inserta las 4 tareas predefinidas
- Crea el usuario administrador (admin123)
- Crea 7 usuarios responsables
- Crea 50 empleados de ejemplo
- Opcionalmente, inserta entradas de ejemplo

-- Tabla de entradas de tiempo
CREATE TABLE time_entries (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id),
  task_id BIGINT REFERENCES tasks(id),
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👥 Sistema de Roles y Permisos

### Roles Disponibles

| Rol | 🏷️ Badge | Permisos |
|-----|--------|----------|
| **Administrador** | 🔴 Rojo | Acceso total: gestión de empleados, tareas, ver todos los registros, exportar reportes |
| **Responsable** | 🟡 Amarillo | Ver y gestionar registros de todos los empleados, exportar reportes |
| **Empleado** | 🟢 Verde | Ver y gestionar solo sus propios registros |

### Usuarios de Prueba

#### Administrador
| Usuario | Contraseña | Acceso |
|---------|-----------|--------|
| Admin Sistema | admin123 | Panel completo de administración |

#### Responsables
| Usuario | Contraseña |
|---------|------------|
| Pedro Sánchez | pedro123 |
| Laura García | laura123 |
| Miguel Torres | miguel123 |
| Carmen Ruiz | carmen123 |
| Antonio López | antonio123 |
| María José Fernández | maria123 |
| Francisco Gómez | francisco123 |

#### Empleados
Los empleados tienen contraseñas en formato: `[nombre]123`

Por ejemplo:
- Juan García → juan123
- María Rodríguez → maría123
- José Martínez → josé123

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera la versión de producción
- `npm run preview` - Previsualiza la build de producción
- `npm run deploy` - Construye y despliega en GitHub Pages

## 🌐 Deployment en GitHub Pages

### Método Simple con gh-pages

Este proyecto usa `gh-pages` para deployment automático.

### Configuración Inicial (Solo una vez)

1. **Configurar GitHub Pages**
   - Ve a: https://github.com/jesusprodriguezUnir/CTCDailyHours/settings/pages
   - En **"Source"**, selecciona: **`Deploy from a branch`**
   - En **"Branch"**, selecciona: **`gh-pages`** / **`/ (root)`**
   - Click en **Save**

### Desplegar la Aplicación

**Comando único para build y deploy:**
```bash
npm run deploy
```

Este comando:
1. ✅ Construye la aplicación optimizada
2. ✅ Crea/actualiza la rama `gh-pages` automáticamente
3. ✅ Sube los archivos compilados a GitHub
4. ✅ GitHub Pages lo publica automáticamente

### Workflow de Desarrollo

```bash
# Desarrollo local
npm run dev

# Cuando estés listo para publicar cambios:
git add .
git commit -m "Descripción de los cambios"
git push origin main      # Guarda tu código fuente
npm run deploy            # Publica en GitHub Pages
```

### Ver tu Aplicación Desplegada

Una vez desplegado (tarda 1-2 minutos):
```
https://jesusprodriguezunir.github.io/CTCDailyHours/
```

### Problemas Comunes

**Error 404 después del deployment:**
- Verifica que `base: '/CTCDailyHours/'` en `vite.config.js` coincida con el nombre del repositorio
- Asegúrate de que GitHub Pages esté configurado en "Deploy from a branch" → "gh-pages"

**Los cambios no se ven:**
- Espera 1-2 minutos después de `npm run deploy`
- Limpia el caché del navegador (Ctrl + Shift + R)

**Error de permisos al hacer deploy:**
- Asegúrate de estar autenticado en GitHub
- Verifica que tengas permisos de escritura en el repositorio

## 👤 Usuarios de Ejemplo
### Administrador
| Usuario | Contraseña | Descripción |
|---------|-----------|-------------|
| Admin Sistema | admin123 | Acceso completo al sistema |
### Responsables
| Usuario | Contraseña |
|---------|-----------|
| Pedro Sánchez | pedro123 |
| Laura García | laura123 |
| Miguel Torres | miguel123 |
| Carmen Ruiz | carmen123 |
| Antonio López | antonio123 |
| María José Fernández | maria123 |
| Francisco Gómez | francisco123 |

### Empleados
Los empleados tienen contraseñas en formato: `[nombre]123`
Por ejemplo: Juan García → juan123

## 🎨 Interfaz de Usuario

### Navegación Principal
- **📅 Calendario**: Vista semanal interactiva para registro de horas
- **📊 Resumen**: Reportes avanzados con filtros y exportación
- **📋 Detalle Día**: Vista detallada de entradas por día
- **⚙️ Administración**: Panel de gestión (solo administradores)

### Pantalla de Login
- Diseño limpio y moderno
- Selección de usuario desde dropdown con indicador de rol
- Campo de contraseña
- Validación de credenciales
- Badges de color según rol (🔴 Admin, 🟡 Responsable, 🟢 Empleado)

### Vista Principal (Empleados)
- Vista semanal del calendario
- Botón de registro rápido
- Visualización de entradas propias
- Navegación entre semanas

### Vista Principal (Responsables)
- Vista completa del equipo
- Filtrado por empleado
- Capacidad de edición
- Gestión de entradas de todos los empleados

## 📱 Características Responsivas

La aplicación está optimizada para:
- 💻 Escritorio
- 📱 Tablets
- 📱 Móviles

## 🔒 Seguridad

- Autenticación requerida para acceder
- Roles diferenciados (Empleado / Responsable / Administrador)
- Los empleados solo pueden ver/editar sus propios registros
- Los responsables tienen acceso completo a todos los registros
- Los administradores pueden gestionar empleados y tareas
- Control de acceso basado en roles para cada sección

## 🌐 Base de Datos

### Esquema Actualizado

```sql
-- Tabla de empleados (con rol admin)
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'responsible', 'admin')),
  password TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas (con campo active)
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de entradas de tiempo
CREATE TABLE time_entries (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id),
  task_id BIGINT REFERENCES tasks(id),
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_tasks_active ON tasks(active);
```

### Tablas Principales

1. **employees** - Información de empleados
   - id, name, role (employee/responsible/admin), password, active

2. **tasks** - Catálogo de tareas
   - id, name, active

3. **time_entries** - Registro de horas
   - id, employee_id, task_id, date, hours

## � Documentación Completa

Para información detallada sobre el uso y desarrollo del sistema, consulta la documentación completa en la carpeta `docs/`:

- **[Manual de Usuario](docs/MANUAL_USUARIO.md)** 📖 - Guía funcional completa para empleados, responsables y administradores
  - Proceso de login y navegación
  - Registro y gestión de horas
  - Generación de reportes y exportaciones
  - Preguntas frecuentes y solución de problemas

- **[Manual Técnico](docs/MANUAL_TECNICO.md)** 🔧 - Documentación para desarrolladores
  - Arquitectura del sistema
  - Stack tecnológico detallado
  - Estructura de componentes y hooks
  - API y servicios de Supabase
  - Guía de deployment y mantenimiento

- **[Arquitectura](docs/ARQUITECTURA.md)** 🏗️ - Diagramas y documentación visual
  - Diagramas Mermaid de arquitectura
  - Diagrama ERD de base de datos
  - Flujos de datos y secuencias
  - Patrones de diseño utilizados

Todos los documentos están en formato Markdown y pueden exportarse a PDF usando [Pandoc](https://pandoc.org/) o la extensión [Markdown PDF](https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf) de VS Code.

## �📈 Futuras Mejoras

- [ ] Sistema de aprobación de horas por responsables
- [ ] Gráficas interactivas de productividad
- [ ] Notificaciones push
- [ ] Modo offline (PWA completo)
- [ ] Historial de cambios/auditoría
- [ ] Reportes mensuales automatizados
- [ ] Dashboard de estadísticas en tiempo real
- [ ] Integración con sistemas de nómina
- [ ] API REST pública para integraciones

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está bajo la licencia de CTC.

## 📞 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para el Patio de Materiales CTC**
