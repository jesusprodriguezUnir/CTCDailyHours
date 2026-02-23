# 🏭 CTC Daily Hours - Patio de Materiales

Sistema de registro y gestión de horas diarias para empleados del patio de materiales de CTC.

## 📋 Descripción

CTC Daily Hours es una aplicación web moderna diseñada para facilitar el registro de horas de trabajo de los empleados del patio de materiales. La aplicación permite a los trabajadores registrar sus horas de forma intuitiva y a los responsables gestionar y supervisar las entradas de tiempo de todo el equipo.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Login diferenciado para empleados y responsables
- Sistema de contraseñas simple y efectivo
- Gestión de roles (Empleado / Responsable)

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

### 📊 Resumen y Estadísticas
- Total de horas por día
- Total de horas por semana
- Visualización de productividad por empleado
- Indicadores visuales de carga de trabajo

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

## 📦 Estructura del Proyecto

```
CTCDailyHours/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes React
│   │   ├── Calendar.jsx          # Calendario mensual
│   │   ├── DayView.jsx           # Vista detallada del día
│   │   ├── EmployeeSelector.jsx  # Selector de empleados
│   │   ├── Layout.jsx            # Layout principal
│   │   ├── Login.jsx             # Pantalla de login
│   │   ├── SummaryTable.jsx      # Tabla resumen
│   │   ├── TimeEntryForm.jsx     # Formulario de registro
│   │   ├── TimeEntryRow.jsx      # Fila de entrada de tiempo
│   │   └── WeeklyCalendar.jsx    # Calendario semanal
│   ├── data/
│   │   └── mockData.js           # Datos de prueba y constantes
│   ├── hooks/
│   │   ├── useEmployees.js       # Hook para gestión de empleados
│   │   └── useTimeEntries.js     # Hook para gestión de entradas
│   ├── lib/
│   │   └── supabase.js           # Configuración de Supabase
│   ├── App.jsx                   # Componente principal
│   ├── index.css                 # Estilos globales
│   └── main.jsx                  # Punto de entrada
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
git clone [URL_DEL_REPOSITORIO]
cd CTCDailyHours
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**
- Crear un proyecto en [Supabase](https://supabase.com)
- Actualizar las credenciales en `src/lib/supabase.js`:
```javascript
const supabaseUrl = 'TU_SUPABASE_URL'
const supabaseKey = 'TU_SUPABASE_KEY'
```

4. **Crear las tablas en Supabase**

Ejecutar los siguientes SQL en el editor SQL de Supabase:

```sql
-- Tabla de empleados
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'responsible')),
  password TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
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
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera la versión de producción
- `npm run preview` - Previsualiza la build de producción

## 👤 Usuarios de Ejemplo

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

### Pantalla de Login
- Diseño limpio y moderno
- Selección de usuario desde dropdown
- Campo de contraseña
- Validación de credenciales

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
- Roles diferenciados (Empleado/Responsable)
- Los empleados solo pueden ver/editar sus propios registros
- Los responsables tienen acceso completo a todos los registros

## 🌐 Base de Datos

### Tablas Principales

1. **employees** - Información de empleados
   - id, name, role, password, active

2. **tasks** - Catálogo de tareas
   - id, name

3. **time_entries** - Registro de horas
   - id, employee_id, task_id, date, hours

## 📈 Futuras Mejoras

- [ ] Exportación de reportes a Excel/PDF
- [ ] Gráficas de productividad
- [ ] Notificaciones push
- [ ] Modo offline (PWA completo)
- [ ] Filtros avanzados de fechas
- [ ] Reportes mensuales automáticos
- [ ] Dashboard de estadísticas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## � Deployment en GitHub Pages

### Configuración Inicial

1. **Crear repositorio en GitHub**
   - Ve a [GitHub](https://github.com/new)
   - Crea un nuevo repositorio (público o privado)
   - **NO inicialices** con README, .gitignore o licencia

2. **Configurar GitHub Pages**
   - Ve a Settings → Pages en tu repositorio
   - En "Source", selecciona "GitHub Actions"

3. **Actualizar vite.config.js**
   - Asegúrate de que la línea `base` en `vite.config.js` tenga el nombre correcto de tu repositorio:
   ```javascript
   base: '/nombre-de-tu-repositorio/'
   ```

### Desplegar por Primera Vez

```bash
# Inicializar git (si no está inicializado)
git init

# Añadir todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit"

# Añadir el remote de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/tu-repositorio.git

# Renombrar rama a main (si es necesario)
git branch -M main

# Push al repositorio
git push -u origin main
```

### Deployment Automático

Una vez configurado, cada push a la rama `main` desplegará automáticamente la aplicación gracias a GitHub Actions.

### Despliegues Posteriores

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de los cambios"
git push
```

### Verificar el Deployment

1. Ve a la pestaña "Actions" en tu repositorio de GitHub
2. Verás el workflow ejecutándose
3. Una vez completado, tu app estará disponible en:
   ```
   https://tu-usuario.github.io/tu-repositorio/
   ```

### Problemas Comunes

**Error 404 después del deployment:**
- Verifica que `base` en `vite.config.js` coincida con el nombre del repositorio
- Asegúrate de que GitHub Pages esté configurado para usar GitHub Actions

**Rutas no funcionan:**
- Verifica la configuración de `base` en vite.config.js
- Asegúrate de usar rutas relativas en tu código

## �📄 Licencia

Este proyecto es privado y está bajo la licencia de CTC.

## 📞 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para el Patio de Materiales CTC**
