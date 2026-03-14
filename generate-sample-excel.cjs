/**
 * Script para generar el Excel de muestra (plantilla para el cliente)
 * Uso: node generate-sample-excel.cjs
 */
const XLSX = require('xlsx')
const path = require('path')

// ============================================================
// DATOS DE MUESTRA (ficticios, para el cliente)
// ============================================================

const centrosTrabajo = [
  ['Nombre',          'Código', 'Activo'],
  ['Madrid',          'MAD',    'SI'],
  ['Sevilla',         'SEV',    'SI'],
  ['Huelva',          'HUE',    'SI'],
  ['Central',         'CTR',    'SI'],
  // El cliente puede añadir más filas:
  ['Valencia',        'VAL',    'SI'],
  ['Barcelona',       'BAR',    'NO'],
]

const departamentos = [
  ['Centro (Código)', 'Nombre Departamento', 'Código Dpto.', 'Activo'],
  ['MAD', 'Producción',      'PROD', 'SI'],
  ['MAD', 'Logística',       'LOG',  'SI'],
  ['MAD', 'Mantenimiento',   'MANT', 'SI'],
  ['MAD', 'Calidad',         'CAL',  'SI'],
  ['MAD', 'RRHH',            'RRHH', 'SI'],
  ['MAD', 'PRL',             'PRL',  'SI'],
  ['MAD', 'Administración',  'ADM',  'SI'],
  ['MAD', 'Comercial',       'COM',  'SI'],
  ['SEV', 'Producción',      'PROD', 'SI'],
  ['SEV', 'Logística',       'LOG',  'SI'],
  ['SEV', 'Mantenimiento',   'MANT', 'SI'],
  ['SEV', 'Calidad',         'CAL',  'SI'],
  ['SEV', 'RRHH',            'RRHH', 'SI'],
  ['SEV', 'PRL',             'PRL',  'SI'],
  ['SEV', 'Administración',  'ADM',  'SI'],
  ['SEV', 'Comercial',       'COM',  'SI'],
  ['HUE', 'Producción',      'PROD', 'SI'],
  ['HUE', 'Logística',       'LOG',  'SI'],
  ['HUE', 'Mantenimiento',   'MANT', 'SI'],
  ['HUE', 'Calidad',         'CAL',  'SI'],
  ['CTR', 'Administración',  'ADM',  'SI'],
  ['CTR', 'RRHH',            'RRHH', 'SI'],
  ['VAL', 'Producción',      'PROD', 'SI'],
  ['VAL', 'Logística',       'LOG',  'SI'],
]

const clientes = [
  ['Nombre',                    'Código',     'Activo'],
  ['Aceros del Norte S.L.',     'ACNOR',      'SI'],
  ['Metalúrgica Ibérica S.A.',  'METIB',      'SI'],
  ['Fundiciones del Sur',       'FUNDSUR',    'SI'],
  ['Recuperaciones Verdes',     'RECVER',     'SI'],
  ['Gestión de Residuos S.A.',  'GESTRESI',   'NO'],
]

const tareas = [
  ['Nombre Tarea',              'Es Servicio Cliente (SI/NO)', 'Código Cliente (si aplica)', 'Activo'],
  ['Clasificación Férricos',    'NO',  '',         'SI'],
  ['Clasificación No Férricos', 'NO',  '',         'SI'],
  ['Carga de Camión',           'NO',  '',         'SI'],
  ['Limpieza General',          'NO',  '',         'SI'],
  ['Mantenimiento',             'NO',  '',         'SI'],
  ['Control de Calidad',        'NO',  '',         'SI'],
  ['Asistencia Cliente',        'SI',  'ACNOR',    'SI'],
  ['Servicio Metalúrgica',      'SI',  'METIB',    'SI'],
  ['Servicio Fundiciones',      'SI',  'FUNDSUR',  'SI'],
  ['Gestión Residuos',          'SI',  'GESTRESI', 'NO'],
]

const empleados = [
  ['Nombre Completo',         'Rol (admin/responsible/employee)', 'Contraseña',     'Centro (Código)', 'Departamento (Código)', 'Activo'],
  // Administrador
  ['Admin Sistema',           'admin',       'admin2024',       'CTR',  'ADM',  'SI'],
  // Responsables
  ['Carlos Martínez López',   'responsible', 'carlos2024',      'MAD',  'PROD', 'SI'],
  ['Ana García Pérez',        'responsible', 'ana2024',         'MAD',  'LOG',  'SI'],
  ['Luis Fernández Ruiz',     'responsible', 'luis2024',        'SEV',  'PROD', 'SI'],
  ['María Sánchez Gómez',     'responsible', 'maria2024',       'HUE',  'PROD', 'SI'],
  ['Pedro González Torres',   'responsible', 'pedro2024',       'CTR',  'RRHH', 'SI'],
  // Empleados - Madrid
  ['Juan Rodríguez Díaz',     'employee',    'juan2024',        'MAD',  'PROD', 'SI'],
  ['Laura Martín Castro',     'employee',    'laura2024',       'MAD',  'PROD', 'SI'],
  ['Antonio López Moreno',    'employee',    'antonio2024',     'MAD',  'LOG',  'SI'],
  ['Carmen Jiménez Vega',     'employee',    'carmen2024',      'MAD',  'LOG',  'SI'],
  ['Francisco Álvarez Ruiz',  'employee',    'francisco2024',   'MAD',  'MANT', 'SI'],
  ['Rosa Herrera Blanco',     'employee',    'rosa2024',        'MAD',  'CAL',  'SI'],
  // Empleados - Sevilla
  ['Diego Morales Serrano',   'employee',    'diego2024',       'SEV',  'PROD', 'SI'],
  ['Patricia Castro Ortega',  'employee',    'patricia2024',    'SEV',  'PROD', 'SI'],
  ['Roberto Navarro Cruz',    'employee',    'roberto2024',     'SEV',  'LOG',  'SI'],
  ['Elena Ramos Iglesias',    'employee',    'elena2024',       'SEV',  'MANT', 'SI'],
  // Empleados - Huelva
  ['Sergio Molina Fuentes',   'employee',    'sergio2024',      'HUE',  'PROD', 'SI'],
  ['Beatriz Aguilar León',    'employee',    'beatriz2024',     'HUE',  'PROD', 'SI'],
  ['Álvaro Medina Parra',     'employee',    'alvaro2024',      'HUE',  'LOG',  'SI'],
  // Empleados - Valencia (nuevo centro)
  ['Noelia Torres Vera',      'employee',    'noelia2024',      'VAL',  'PROD', 'SI'],
  ['Rubén Santos Campos',     'employee',    'ruben2024',       'VAL',  'LOG',  'SI'],
  // Inactivo (ejemplo)
  ['Pilar Delgado Marín',     'employee',    'pilar2024',       'MAD',  'COM',  'NO'],
]

// ============================================================
// CONSTRUCCIÓN DEL LIBRO EXCEL
// ============================================================

function crearHoja(datos, estilosCabecera) {
  const ws = XLSX.utils.aoa_to_sheet(datos)

  // Ajustar el ancho de las columnas automáticamente
  const colWidths = []
  datos.forEach(fila => {
    fila.forEach((celda, i) => {
      const len = celda ? String(celda).length : 0
      if (!colWidths[i] || len > colWidths[i].wch) {
        colWidths[i] = { wch: Math.max(len + 2, 12) }
      }
    })
  })
  ws['!cols'] = colWidths

  return ws
}

const wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, crearHoja(centrosTrabajo),  '1_Centros_Trabajo')
XLSX.utils.book_append_sheet(wb, crearHoja(departamentos),   '2_Departamentos')
XLSX.utils.book_append_sheet(wb, crearHoja(clientes),        '3_Clientes')
XLSX.utils.book_append_sheet(wb, crearHoja(tareas),          '4_Tareas')
XLSX.utils.book_append_sheet(wb, crearHoja(empleados),       '5_Empleados')

// Hoja de instrucciones
const instrucciones = [
  ['CTC Daily Hours — Plantilla de Carga de Base de Datos'],
  [''],
  ['INSTRUCCIONES DE USO'],
  [''],
  ['1. Este fichero contiene 5 hojas con la información necesaria para cargar la base de datos.'],
  ['2. Rellena o modifica los datos en cada hoja siguiendo el formato de ejemplo.'],
  ['3. NO cambies el nombre de las hojas ni las cabeceras de las columnas.'],
  ['4. Los campos "Código" deben ser únicos dentro de cada hoja.'],
  ['5. El campo "Activo" debe ser SI o NO.'],
  ['6. En la hoja Departamentos, el "Centro (Código)" debe coincidir con un código existente en la hoja Centros_Trabajo.'],
  ['7. En la hoja Empleados, el "Centro (Código)" y el "Departamento (Código)" deben existir previamente.'],
  ['8. En la hoja Tareas, si "Es Servicio Cliente" es SI, el "Código Cliente" debe existir en la hoja Clientes.'],
  ['9. Los roles válidos para empleados son: admin, responsible, employee.'],
  [''],
  ['NOTAS IMPORTANTES'],
  [''],
  ['⚠️  Al importar este fichero se BORRARÁ toda la información actual de la base de datos.'],
  ['⚠️  Asegúrate de hacer una copia de seguridad de los datos actuales antes de importar.'],
  ['✅  Guarda siempre el fichero en formato .xlsx (Excel).'],
]
const wsInstr = XLSX.utils.aoa_to_sheet(instrucciones)
wsInstr['!cols'] = [{ wch: 90 }]
XLSX.utils.book_append_sheet(wb, wsInstr, 'INSTRUCCIONES')

// ============================================================
// GUARDAR EL FICHERO
// ============================================================

const outputPath = path.join(__dirname, 'public', 'plantilla_bd_ctc_muestra.xlsx')
XLSX.writeFile(wb, outputPath)

console.log('✅ Excel de muestra generado correctamente:')
console.log('   →', outputPath)
console.log('')
console.log('   Hojas incluidas:')
console.log('   · INSTRUCCIONES')
console.log('   · 1_Centros_Trabajo    (6 centros de muestra)')
console.log('   · 2_Departamentos      (25 departamentos de muestra)')
console.log('   · 3_Clientes           (5 clientes de muestra)')
console.log('   · 4_Tareas             (10 tareas de muestra)')
console.log('   · 5_Empleados          (22 empleados de muestra)')
