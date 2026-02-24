# 🏗️ Arquitectura del Sistema - CTC Daily Hours

**Documentación de Arquitectura y Diagramas**

Versión 2.0 - Febrero 2026

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Modelo de Datos](#modelo-de-datos)
4. [Arquitectura Frontend](#arquitectura-frontend)
5. [Flujos de Datos](#flujos-de-datos)
6. [Diagramas de Secuencia](#diagramas-de-secuencia)
7. [Patrones de Diseño](#patrones-de-diseño)

---

## Visión General

CTC Daily Hours es una aplicación web SPA (Single Page Application) construida con React que utiliza Supabase como backend. El sistema sigue una arquitectura de tres capas con separación clara de responsabilidades.

### Principios de Arquitectura

- **Separación de Responsabilidades**: UI, lógica de negocio y datos están claramente separados
- **Componentización**: Componentes React reutilizables y modulares
- **Estado Centralizado**: Hooks personalizados para gestión de estado
- **API First**: Toda la comunicación con datos a través de Supabase API
- **Responsive Design**: Diseño adaptativo para todos los dispositivos

---

## Arquitectura de Alto Nivel

### Vista General del Sistema

```mermaid
graph TB
    subgraph "Cliente (Navegador)"
        A[React SPA]
        B[Components Layer]
        C[Business Logic Layer]
        D[Data Access Layer]
    end
    
    subgraph "Backend (Supabase)"
        E[REST API]
        F[PostgreSQL]
        G[Row Level Security]
    end
    
    subgraph "Hosting"
        H[GitHub Pages]
        I[CDN]
    end
    
    A --> B
    B --> C
    C --> D
    D -->|HTTP/REST| E
    E --> F
    F --> G
    
    A -->|Deployed to| H
    H --> I
    I -->|Serves| A
    
    style A fill:#61DAFB
    style F fill:#336791
    style H fill:#181717
```

### Arquitectura en Capas

```mermaid
graph LR
    subgraph "Presentation Layer"
        A1[React Components]
        A2[TailwindCSS]
        A3[UI State]
    end
    
    subgraph "Business Logic Layer"
        B1[Custom Hooks]
        B2[Validation]
        B3[Formatters]
    end
    
    subgraph "Data Access Layer"
        C1[Supabase Client]
        C2[API Calls]
        C3[Cache]
    end
    
    subgraph "Data Layer"
        D1[PostgreSQL]
        D2[RLS Policies]
        D3[Indexes]
    end
    
    A1 --> B1
    A2 --> A1
    A3 --> A1
    B1 --> C1
    B2 --> C1
    B3 --> B1
    C1 --> D1
    C2 --> D1
    D1 --> D2
    D1 --> D3
    
    style A1 fill:#FFE5B4
    style B1 fill:#B4E5FF
    style C1 fill:#E5B4FF
    style D1 fill:#B4FFE5
```

---

## Modelo de Datos

### Diagrama Entidad-Relación Completo

```mermaid
erDiagram
    WORK_CENTERS ||--o{ DEPARTMENTS : "contiene"
    DEPARTMENTS ||--o{ EMPLOYEES : "emplea"
    EMPLOYEES ||--o{ TIME_ENTRIES : "registra"
    TASKS ||--o{ TIME_ENTRIES : "categoriza"
    CUSTOMERS ||--o{ TASKS : "solicita"
    
    WORK_CENTERS {
        bigserial id PK "Identificador único"
        text name "Nombre del centro"
        text code UK "Código único (ej: MAD)"
        boolean active "Estado activo/inactivo"
        timestamp created_at "Fecha de creación"
    }
    
    DEPARTMENTS {
        bigserial id PK "Identificador único"
        bigint work_center_id FK "Centro al que pertenece"
        text name "Nombre del departamento"
        text code "Código (ej: PROD)"
        boolean active "Estado activo/inactivo"
        timestamp created_at "Fecha de creación"
    }
    
    CUSTOMERS {
        bigserial id PK "Identificador único"
        text name "Nombre del cliente"
        text code UK "Código único"
        boolean active "Estado activo/inactivo"
        timestamp created_at "Fecha de creación"
    }
    
    TASKS {
        bigserial id PK "Identificador único"
        text name "Nombre de la tarea"
        boolean is_customer_service "¿Es asistencia a cliente?"
        bigint customer_id FK "Cliente asociado (opcional)"
        boolean active "Estado activo/inactivo"
        timestamp created_at "Fecha de creación"
    }
    
    EMPLOYEES {
        bigserial id PK "Identificador único"
        text name "Nombre completo"
        text role "Rol: employee, responsible, admin"
        text password "Contraseña (sin encriptar)"
        bigint department_id FK "Departamento asignado"
        boolean active "Estado activo/inactivo"
        timestamp created_at "Fecha de creación"
    }
    
    TIME_ENTRIES {
        bigserial id PK "Identificador único"
        bigint employee_id FK "Empleado que registra"
        bigint task_id FK "Tarea realizada"
        date date "Fecha del registro"
        numeric hours "Horas trabajadas (0.5-24)"
        timestamp created_at "Fecha de creación del registro"
    }
```

### Jerarquía Organizacional

```mermaid
graph TD
    A[CTC Organization] --> B1[Madrid]
    A --> B2[Sevilla]
    A --> B3[Huevar]
    A --> B4[Central]
    
    B1 --> C11[Producción]
    B1 --> C12[Logística]
    B1 --> C13[Mantenimiento]
    B1 --> C14[Calidad]
    B1 --> C15[RRHH]
    B1 --> C16[PRL]
    B1 --> C17[Administración]
    B1 --> C18[Comercial]
    
    C11 --> D1[Empleados]
    C12 --> D1
    C13 --> D1
    
    style A fill:#FF6B6B
    style B1 fill:#4ECDC4
    style B2 fill:#4ECDC4
    style B3 fill:#4ECDC4
    style B4 fill:#4ECDC4
    style C11 fill:#95E1D3
    style D1 fill:#F3A466
```

### Restricciones de Integridad

```mermaid
graph LR
    A[departments] -->|ON DELETE RESTRICT| B[work_centers]
    C[employees] -->|ON DELETE RESTRICT| D[departments]
    E[tasks] -->|ON DELETE SET NULL| F[customers]
    G[time_entries] -->|ON DELETE CASCADE| H[employees]
    I[time_entries] -->|ON DELETE RESTRICT| J[tasks]
    
    style A fill:#FFE66D
    style C fill:#FFE66D
    style G fill:#FFE66D
    style I fill:#FFE66D
```

---

## Arquitectura Frontend

### Jerarquía de Componentes

```mermaid
graph TD
    A[App.jsx<br/>Estado de autenticación] --> B{Usuario autenticado?}
    
    B -->|No| C[Login.jsx<br/>Formulario de login]
    B -->|Sí| D[Layout.jsx<br/>Navbar + Routing]
    
    D --> E{Rol del usuario}
    
    E -->|Employee| F1[📅 WeeklyCalendar]
    E -->|Employee| F2[📊 SummaryTable]
    
    E -->|Responsible| G1[📅 WeeklyCalendar]
    G1 --> G11[EmployeeSelector]
    E -->|Responsible| G2[📊 SummaryTable]
    
    E -->|Admin| H1[📅 WeeklyCalendar]
    E -->|Admin| H2[📊 SummaryTable]
    E -->|Admin| H3[⚙️ AdminPanel]
    
    F1 --> I[TimeEntryForm]
    F1 --> J[DayView]
    J --> K[TimeEntryRow]
    
    H3 --> L1[EmployeeManagement]
    H3 --> L2[TaskManagement]
    H3 --> L3[WorkCenterManagement]
    H3 --> L4[DepartmentManagement]
    
    H2 --> M[Export Functions]
    M --> M1[Excel]
    M --> M2[PDF]
    M --> M3[CSV]
    
    style A fill:#FF6B6B
    style D fill:#FFE66D
    style H3 fill:#95E1D3
    style C fill:#4ECDC4
```

### Flujo de Estado con Hooks

```mermaid
graph LR
    A[Component] -->|mounts| B[useEffect]
    B -->|calls| C[Custom Hook]
    C -->|calls| D[Supabase Function]
    D -->|returns| E[Data]
    E -->|updates| F[useState]
    F -->|triggers| G[Re-render]
    G --> A
    
    H[User Action] -->|triggers| I[Event Handler]
    I -->|calls| C
    
    style A fill:#61DAFB
    style C fill:#FFD93D
    style D fill:#3ECF8E
```

### Patrón de Custom Hook

```mermaid
sequenceDiagram
    participant C as Component
    participant H as Custom Hook
    participant S as Supabase Client
    participant DB as Database
    
    C->>H: useEmployees()
    H->>H: useState([])
    H->>H: useEffect()
    H->>S: fetchEmployees()
    S->>DB: SELECT * FROM employees
    DB-->>S: rows
    S-->>H: data
    H->>H: setEmployees(data)
    H-->>C: { employees, loading, error }
    C->>C: render with data
```

---

## Flujos de Datos

### Flujo Principal de Operaciones CRUD

```mermaid
graph TD
    A[Usuario interactúa con UI] --> B{Tipo de operación}
    
    B -->|Create| C1[Formulario de creación]
    B -->|Read| C2[Carga de datos]
    B -->|Update| C3[Formulario de edición]
    B -->|Delete| C4[Confirmación]
    
    C1 --> D1[Validación cliente]
    C3 --> D1
    
    D1 -->|Válido| E[Hook de gestión]
    D1 -->|Inválido| F[Mostrar error]
    
    E --> G[Supabase Client]
    G --> H[API REST]
    H --> I[PostgreSQL]
    
    I --> J[Row Level Security]
    J -->|Permitido| K[Ejecutar operación]
    J -->|Denegado| L[Error 403]
    
    K --> M[Retornar resultado]
    M --> N[Actualizar estado local]
    N --> O[Re-render UI]
    N --> P[Mostrar confirmación]
    
    C2 --> G
    C4 --> E
    
    style A fill:#4ECDC4
    style E fill:#FFD93D
    style K fill:#95E1D3
    style O fill:#F3A466
```

### Flujo de Registro de Horas

```mermaid
sequenceDiagram
    participant U as Usuario
    participant TF as TimeEntryForm
    participant H as useTimeEntries
    participant S as Supabase
    participant DB as PostgreSQL
    
    U->>TF: Completa formulario
    U->>TF: Click "Guardar"
    TF->>TF: Validar campos localmente
    
    alt Validación falla
        TF-->>U: Mostrar error
    else Validación exitosa
        TF->>H: createEntry({ employee_id, task_id, date, hours })
        H->>H: Validar datos
        H->>S: supabase.from('time_entries').insert(data)
        S->>DB: INSERT INTO time_entries...
        DB->>DB: Validar constraints
        
        alt Constraints OK
            DB-->>S: Registro creado
            S-->>H: { data, error: null }
            H->>H: Actualizar caché local
            H-->>TF: { success: true, data }
            TF->>TF: Limpiar formulario
            TF-->>U: "✅ Entrada guardada"
            TF->>TF: Refetch entries
        else Constraint violation
            DB-->>S: Error
            S-->>H: { data: null, error }
            H-->>TF: { success: false, error }
            TF-->>U: "❌ Error al guardar"
        end
    end
```

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant L as Login Component
    participant S as Supabase
    participant DB as Database
    participant App as App Context
    
    U->>L: Abre aplicación
    L->>L: Renderiza formulario
    U->>L: Selecciona usuario del dropdown
    U->>L: Introduce contraseña
    U->>L: Click "Iniciar Sesión"
    
    L->>L: Validar campos no vacíos
    
    alt Campos vacíos
        L-->>U: "Complete todos los campos"
    else Campos completos
        L->>S: fetchEmployees()
        S->>DB: SELECT * FROM employees WHERE active = true
        DB-->>S: Lista de empleados
        S-->>L: employees[]
        
        L->>L: Buscar usuario por nombre
        L->>L: Comparar contraseña
        
        alt Credenciales correctas
            L->>App: setUser({ id, name, role })
            App->>App: Actualizar estado global
            App-->>U: Redirigir a Dashboard
        else Credenciales incorrectas
            L-->>U: "Usuario o contraseña incorrectos"
        end
    end
```

### Flujo de Exportación de Reportes

```mermaid
graph TD
    A[Usuario en SummaryTable] --> B[Configura filtros]
    B --> C{Selecciona formato}
    
    C -->|Excel| D1[Preparar datos]
    C -->|PDF| D2[Preparar datos]
    C -->|CSV| D3[Preparar datos]
    
    D1 --> E1[Aplicar filtros]
    D2 --> E1
    D3 --> E1
    
    E1 --> F1[Formatear datos según vista]
    
    F1 --> G{Vista seleccionada}
    
    G -->|Por Empleado| H1[Agrupar por empleado]
    G -->|Por Tarea| H2[Agrupar por tarea]
    G -->|Por Período| H3[Agrupar por fecha]
    
    H1 --> I[Generar archivo]
    H2 --> I
    H3 --> I
    
    I --> J{Formato}
    
    J -->|Excel| K1[XLSX.writeFile]
    J -->|PDF| K2[jsPDF.save]
    J -->|CSV| K3[Blob download]
    
    K1 --> L[Descargar archivo]
    K2 --> L
    K3 --> L
    
    L --> M[Usuario recibe archivo]
    
    style A fill:#4ECDC4
    style I fill:#FFD93D
    style M fill:#95E1D3
```

---

## Diagramas de Secuencia

### Ciclo de Vida de un Componente con Hook

```mermaid
sequenceDiagram
    participant R as React
    participant C as Component
    participant H as Custom Hook
    participant S as Supabase
    
    R->>C: Mount Component
    C->>H: Call useEmployees()
    H->>H: Initialize state: loading=true
    H->>H: useEffect triggers
    H->>S: fetchEmployees()
    
    S->>S: Execute query
    S-->>H: Return data
    
    H->>H: setEmployees(data)
    H->>H: setLoading(false)
    H-->>C: { employees, loading: false }
    
    C->>C: Re-render with data
    C->>R: Update DOM
    
    Note over C,H: User interaction
    C->>H: addEmployee(name, role, ...)
    H->>H: setLoading(true)
    H->>S: insert employee
    S-->>H: success
    H->>H: refetch employees
    H->>H: setLoading(false)
    H-->>C: updated employees
    C->>R: Update DOM
```

### Gestión de Estado en Formularios

```mermaid
sequenceDiagram
    participant U as User
    participant F as Form Component
    participant S as Local State
    participant H as Management Hook
    participant DB as Database
    
    U->>F: Opens form
    F->>S: Initialize formData = {}
    F-->>U: Render empty form
    
    U->>F: Type in field
    F->>S: Update formData[field]
    F-->>U: Show updated value
    
    U->>F: Click Submit
    F->>F: Validate formData
    
    alt Validation fails
        F-->>U: Show validation errors
    else Validation passes
        F->>H: createItem(formData)
        H->>DB: INSERT ...
        
        alt DB Success
            DB-->>H: Created item
            H-->>F: { success: true }
            F->>S: Reset formData = {}
            F-->>U: Show success message
            F->>F: Close modal
        else DB Error
            DB-->>H: Error
            H-->>F: { success: false, error }
            F-->>U: Show error message
        end
    end
```

### Autorización por Rol

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant C as Component
    participant H as Hook
    participant DB as Database
    
    U->>A: Navigate to page
    A->>A: Check user.role
    
    alt role === 'admin'
        A->>C: Render AdminPanel
        U->>C: Click "Manage Employees"
        C->>H: fetchEmployees()
        H->>DB: SELECT * FROM employees
        DB-->>H: All employees
        H-->>C: employees[]
        C-->>U: Show all employees
    else role === 'responsible'
        A->>C: Render Dashboard with filters
        U->>C: View time entries
        C->>H: fetchTimeEntries()
        H->>DB: SELECT * FROM time_entries
        DB-->>H: All entries
        H-->>C: entries[]
        C-->>U: Show all team entries
    else role === 'employee'
        A->>C: Render Dashboard
        U->>C: View time entries
        C->>H: fetchTimeEntries(userId)
        H->>DB: SELECT * WHERE employee_id = userId
        DB-->>H: User's entries only
        H-->>C: entries[]
        C-->>U: Show own entries only
    end
```

---

## Patrones de Diseño

### Container/Presenter Pattern

```mermaid
graph TD
    A[Container Component] -->|Data & Logic| B[Presenter Component]
    A -->|Uses| C[Custom Hooks]
    A -->|Manages| D[State]
    
    B -->|Pure UI| E[Render Data]
    B -->|Emits| F[Events]
    F -->|Handled by| A
    
    C -->|Fetches| G[Data from API]
    G --> D
    D --> A
    
    style A fill:#FFE66D
    style B fill:#95E1D3
    style C fill:#FFD93D
```

### Custom Hook Pattern

```mermaid
graph LR
    A[Multiple Components] -->|use| B[Custom Hook]
    B -->|encapsulates| C[Logic]
    B -->|manages| D[State]
    B -->|handles| E[Side Effects]
    
    C --> F[Data Fetching]
    C --> G[Validation]
    C --> H[Transformation]
    
    D --> I[Loading State]
    D --> J[Error State]
    D --> K[Data State]
    
    E --> L[useEffect]
    E --> M[Cleanup]
    
    style B fill:#FFD93D
    style A fill:#61DAFB
```

### Composition Pattern

```mermaid
graph TD
    A[AdminPanel] --> B[Tab Navigation]
    
    B --> C1[EmployeeManagement]
    B --> C2[TaskManagement]
    B --> C3[WorkCenterManagement]
    B --> C4[DepartmentManagement]
    
    C1 --> D[Shared Table Component]
    C2 --> D
    C3 --> D
    C4 --> D
    
    C1 --> E[Shared Modal Component]
    C2 --> E
    C3 --> E
    C4 --> E
    
    C1 --> F[Shared Filter Component]
    C2 --> F
    C3 --> F
    C4 --> F
    
    style A fill:#FF6B6B
    style D fill:#95E1D3
    style E fill:#95E1D3
    style F fill:#95E1D3
```

---

## Infraestructura y Despliegue

### Pipeline de Despliegue

```mermaid
graph LR
    A[Local Dev] -->|git push| B[GitHub Repo]
    B -->|npm run deploy| C[Vite Build]
    C --> D[Optimización]
    D --> E[Generación dist/]
    E --> F[gh-pages Package]
    F --> G[Push to gh-pages branch]
    G --> H[GitHub Pages]
    H --> I[CDN Distribution]
    I --> J[Users]
    
    style A fill:#4ECDC4
    style C fill:#646CFF
    style H fill:#181717
    style J fill:#95E1D3
```

### Arquitectura de Hosting

```mermaid
graph TD
    A[GitHub Repository] --> B[gh-pages Branch]
    B --> C[GitHub Pages Server]
    C --> D[Global CDN]
    
    E[User Browser] -->|Request| D
    D -->|Deliver| F[Static Assets]
    F --> E
    
    E -->|API Calls| G[Supabase API]
    G --> H[PostgreSQL Database]
    
    style A fill:#181717
    style D fill:#FF6B6B
    style G fill:#3ECF8E
    style H fill:#336791
```

### Flujo de Datos End-to-End

```mermaid
graph TD
    A[User Browser] -->|1. Load App| B[GitHub Pages CDN]
    B -->|2. Serve React App| A
    
    A -->|3. User Login| C[React App]
    C -->|4. Auth Request| D[Supabase API]
    D -->|5. Query| E[(PostgreSQL)]
    E -->|6. User Data| D
    D -->|7. Response| C
    
    C -->|8. Fetch Data| D
    D -->|9. Query with RLS| E
    E -->|10. Filtered Data| D
    D -->|11. JSON Response| C
    
    C -->|12. Render UI| A
    
    A -->|13. User Action| C
    C -->|14. Create/Update| D
    D -->|15. Validate & Insert| E
    E -->|16. Confirm| D
    D -->|17. Success| C
    C -->|18. Update UI| A
    
    style A fill:#4ECDC4
    style C fill:#61DAFB
    style D fill:#3ECF8E
    style E fill:#336791
```

---

## Seguridad y Performance

### Row Level Security Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Supabase API
    participant RLS as RLS Engine
    participant DB as PostgreSQL
    
    C->>API: Request data with JWT
    API->>RLS: Check policies
    RLS->>RLS: Evaluate user context
    
    alt Policy allows
        RLS->>DB: Execute query with filters
        DB-->>RLS: Filtered results
        RLS-->>API: Allowed data
        API-->>C: Response
    else Policy denies
        RLS-->>API: Access denied
        API-->>C: 403 Forbidden
    end
```

### Optimización de Queries

```mermaid
graph TD
    A[Query Request] --> B{Tiene índice?}
    
    B -->|Sí| C[Index Scan]
    B -->|No| D[Sequential Scan]
    
    C --> E[Rápido 🚀]
    D --> F[Lento 🐌]
    
    E --> G[Caché en Cliente]
    F --> H[Agregar índice recomendado]
    
    G --> I[Response instantánea]
    
    style C fill:#95E1D3
    style D fill:#FF6B6B
    style I fill:#FFD93D
```

---

## Glosario de Arquitectura

**SPA (Single Page Application)**: Aplicación web que se carga una sola vez y actualiza dinámicamente el contenido.

**BaaS (Backend as a Service)**: Servicio que proporciona funcionalidad de backend lista para usar.

**RLS (Row Level Security)**: Sistema de seguridad a nivel de fila en PostgreSQL.

**CDN (Content Delivery Network)**: Red de distribución de contenido para servir assets estáticos.

**REST API**: Interfaz de programación basada en HTTP siguiendo principios REST.

**Custom Hook**: Hook de React personalizado que encapsula lógica reutilizable.

**State Management**: Gestión del estado de la aplicación en React.

**Server-Side Rendering (SSR)**: No aplicable (el proyecto usa CSR - Client-Side Rendering).

---

**Versión del documento**: 2.0 - Febrero 2026  
**Última actualización**: 24/02/2026  

---

*Arquitectura del Sistema - CTC Daily Hours*
