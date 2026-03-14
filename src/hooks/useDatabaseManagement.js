import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { resetDatabase } from '../lib/supabase'

// Columnas esperadas por hoja (insensible a mayúsculas/tildes)
const SHEET_COLUMNS = {
  centros:      ['nombre', 'código', 'activo'],
  departamentos: ['centro (código)', 'nombre departamento', 'código dpto.', 'activo'],
  clientes:     ['nombre', 'código', 'activo'],
  tareas:       ['nombre tarea', 'es servicio cliente (si/no)', 'activo'],
  empleados:    ['nombre completo', 'rol (admin/responsible/employee)', 'contraseña', 'centro (código)', 'departamento (código)', 'activo'],
}

const SHEET_KEYS = {
  '1_centros_trabajo':  'centros',
  '2_departamentos':    'departamentos',
  '3_clientes':         'clientes',
  '4_tareas':           'tareas',
  '5_empleados':        'empleados',
  // Nombres alternativos por si el usuario renombra las hojas
  'centros_trabajo':    'centros',
  'departamentos':      'departamentos',
  'clientes':           'clientes',
  'tareas':             'tareas',
  'empleados':          'empleados',
}

function normalizeKey(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function parseBool(val) {
  const s = normalizeKey(val)
  return s === 'si' || s === 'true' || s === '1' || s === 'yes'
}

function parseSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  if (rows.length < 2) return []
  const headers = rows[0].map(normalizeKey)
  return rows.slice(1).filter(r => r.some(c => c !== '')).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] ?? '' })
    return obj
  })
}

function mapCentros(rows) {
  return rows.map(r => ({
    name:   String(r['nombre'] ?? r['name'] ?? '').trim(),
    code:   String(r['codigo'] ?? r['code'] ?? '').trim().toUpperCase(),
    active: parseBool(r['activo'] ?? r['active'] ?? 'SI'),
  })).filter(r => r.name && r.code)
}

function mapDepartamentos(rows) {
  return rows.map(r => ({
    work_center_code: String(r['centro (codigo)'] ?? r['centro (code)'] ?? '').trim().toUpperCase(),
    name:   String(r['nombre departamento'] ?? r['nombre'] ?? r['name'] ?? '').trim(),
    code:   String(r['codigo dpto.'] ?? r['codigo'] ?? r['code'] ?? '').trim().toUpperCase(),
    active: parseBool(r['activo'] ?? 'SI'),
  })).filter(r => r.name && r.code && r.work_center_code)
}

function mapClientes(rows) {
  return rows.map(r => ({
    name:   String(r['nombre'] ?? r['name'] ?? '').trim(),
    code:   String(r['codigo'] ?? r['code'] ?? '').trim().toUpperCase(),
    active: parseBool(r['activo'] ?? 'SI'),
  })).filter(r => r.name && r.code)
}

function mapTareas(rows) {
  return rows.map(r => ({
    name:                String(r['nombre tarea'] ?? r['nombre'] ?? r['name'] ?? '').trim(),
    is_customer_service: parseBool(r['es servicio cliente (si/no)'] ?? r['es servicio cliente'] ?? 'NO'),
    customer_code:       String(r['codigo cliente (si aplica)'] ?? r['codigo cliente'] ?? '').trim().toUpperCase() || null,
    active:              parseBool(r['activo'] ?? 'SI'),
  })).filter(r => r.name)
}

function mapEmpleados(rows) {
  return rows.map(r => ({
    name:            String(r['nombre completo'] ?? r['nombre'] ?? r['name'] ?? '').trim(),
    role:            String(r['rol (admin/responsible/employee)'] ?? r['rol'] ?? r['role'] ?? 'employee').trim().toLowerCase(),
    password:        String(r['contrasena'] ?? r['password'] ?? r['contraseña'] ?? '').trim(),
    work_center_code: String(r['centro (codigo)'] ?? r['centro (code)'] ?? '').trim().toUpperCase(),
    department_code: String(r['departamento (codigo)'] ?? r['departamento (code)'] ?? '').trim().toUpperCase(),
    active:          parseBool(r['activo'] ?? 'SI'),
  })).filter(r => r.name && r.role)
}

export function useDatabaseManagement() {
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError]       = useState(null)
  const [result, setResult]     = useState(null)

  const step = useCallback((pct, label) => {
    setProgress(pct)
    setProgressLabel(label)
  }, [])

  const resetFromExcel = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      // 1. Leer fichero Excel
      step(5, 'Leyendo fichero Excel…')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })

      // 2. Localizar hojas
      step(10, 'Validando estructura del Excel…')
      const found = {}
      wb.SheetNames.forEach(name => {
        const key = SHEET_KEYS[normalizeKey(name)]
        if (key) found[key] = wb.Sheets[name]
      })

      const missing = Object.keys(SHEET_COLUMNS).filter(k => !found[k])
      if (missing.length > 0) {
        throw new Error(`Faltan las siguientes hojas en el Excel: ${missing.map(m => `"${m}"`).join(', ')}. Asegúrate de usar la plantilla oficial.`)
      }

      // 3. Parsear datos
      step(20, 'Procesando centros de trabajo…')
      const workCenters = mapCentros(parseSheet(found.centros))
      if (workCenters.length === 0) throw new Error('La hoja "Centros_Trabajo" no tiene datos válidos.')

      step(30, 'Procesando departamentos…')
      const departments = mapDepartamentos(parseSheet(found.departamentos))
      if (departments.length === 0) throw new Error('La hoja "Departamentos" no tiene datos válidos.')

      step(40, 'Procesando clientes…')
      const customers = mapClientes(parseSheet(found.clientes))

      step(50, 'Procesando tareas…')
      const tasks = mapTareas(parseSheet(found.tareas))
      if (tasks.length === 0) throw new Error('La hoja "Tareas" no tiene datos válidos.')

      step(60, 'Procesando empleados…')
      const employees = mapEmpleados(parseSheet(found.empleados))
      if (employees.length === 0) throw new Error('La hoja "Empleados" no tiene datos válidos.')

      // 4. Validar que hay al menos un admin
      const hasAdmin = employees.some(e => e.role === 'admin')
      if (!hasAdmin) throw new Error('Debe existir al menos un empleado con rol "admin" en la hoja Empleados.')

      // 5. Ejecutar reset en BD
      step(70, 'Borrando datos actuales de la base de datos…')
      const stats = await resetDatabase({ workCenters, departments, customers, tasks, employees })

      step(100, '¡Completado!')
      setResult(stats)
    } catch (err) {
      setError(err.message ?? 'Error desconocido al regenerar la base de datos.')
    } finally {
      setLoading(false)
    }
  }, [step])

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
    setProgress(0)
    setProgressLabel('')
  }, [])

  return { loading, progress, progressLabel, error, result, resetFromExcel, reset }
}
