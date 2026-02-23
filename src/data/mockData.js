export const TASKS = [
  { id: 1, name: 'Clasificación Férricos' },
  { id: 2, name: 'Carga de Camión' },
  { id: 3, name: 'Limpieza' },
  { id: 4, name: 'Mantenimiento' }
]

const firstNames = [
  'Juan', 'María', 'José', 'Ana', 'Antonio', 'Carmen', 'Francisco', 'Dolores',
  'David', 'Rosa', 'Manuel', 'Isabel', 'Javier', 'Elena', 'Carlos', 'Lucia',
  'Miguel', 'Patricia', 'Rafael', 'Mercedes', 'Fernando', 'Andrea', 'Alejandro', 'Sandra',
  'Jorge', 'Natalia', 'Raúl', 'Margarita', 'Luis', 'Sonia', 'Andrés', 'Esther',
  'Diego', 'Verónica', 'Adrián', 'Cristina', 'Óscar', 'Laura', 'Iván', 'Silvia',
  'Sergio', 'Raquel', 'Álvaro', 'Noelia', 'Pablo', 'Mónica', 'Rubén', 'Beatriz',
  'Víctor', 'Diana'
]

const lastNames = [
  'García', 'Rodríguez', ' Martínez', 'Sánchez', 'López', 'González', 'Pérez', 'Fernández',
  'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Morales', 'Álvarez',
  'Torres', 'Serrano', 'Blanco', 'Muñoz', 'Castro', 'Ortega', 'Romero', 'Núñez'
]

function generateEmployees() {
  const employees = []
  
  const responsibles = [
    { id: 1, name: 'Pedro Sánchez', role: 'responsible', password: 'pedro123' },
    { id: 2, name: 'Laura García', role: 'responsible', password: 'laura123' },
    { id: 3, name: 'Miguel Torres', role: 'responsible', password: 'miguel123' },
    { id: 4, name: 'Carmen Ruiz', role: 'responsible', password: 'carmen123' },
    { id: 5, name: 'Antonio López', role: 'responsible', password: 'antonio123' },
    { id: 6, name: 'María José Fernández', role: 'responsible', password: 'maria123' },
    { id: 7, name: 'Francisco Gómez', role: 'responsible', password: 'francisco123' }
  ]
  
  employees.push(...responsibles)
  
  for (let i = 8; i <= 57; i++) {
    const firstName = firstNames[i - 8] || `Empleado${i - 7}`
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`
    const simplePassword = firstName.toLowerCase() + '123'
    employees.push({
      id: i,
      name: name,
      role: 'employee',
      password: simplePassword,
      active: true
    })
  }
  
  return employees
}

export const MOCK_EMPLOYEES = generateEmployees()

export const TIME_INCREMENTS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8]
