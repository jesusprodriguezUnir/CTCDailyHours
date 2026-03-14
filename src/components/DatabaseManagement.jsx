import { useState, useRef } from 'react'
import {
  Database, Upload, Download, AlertTriangle, CheckCircle2,
  X, ShieldAlert, Loader2, TriangleAlert, FileSpreadsheet
} from 'lucide-react'
import { useDatabaseManagement } from '../hooks/useDatabaseManagement'

// ─── Barra de progreso ────────────────────────────────────────────────────────
function ProgressBar({ progress, label }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ─── Modal de confirmación ────────────────────────────────────────────────────
function ConfirmModal({ file, onConfirm, onCancel }) {
  const [step, setStep]           = useState(1) // 1 = aviso, 2 = confirmación
  const [typed, setTyped]         = useState('')
  const CONFIRM_WORD               = 'CONFIRMAR'
  const isConfirmReady             = typed === CONFIRM_WORD

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Cabecera */}
        <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-white flex-shrink-0" />
          <h2 className="text-lg font-bold text-white">Regenerar Base de Datos</h2>
          <button onClick={onCancel} className="ml-auto text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 1 && (
            <>
              {/* Advertencias */}
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4" /> ⚠️ Acción irreversible
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                  <li>Se borrarán <strong>todos los registros de horas</strong> (time_entries)</li>
                  <li>Se borrarán todos los empleados, tareas, clientes, departamentos y centros</li>
                  <li>Los datos se reemplazarán con los del fichero seleccionado</li>
                  <li>Esta operación <strong>no se puede deshacer</strong></li>
                </ul>
              </div>

              {/* Fichero seleccionado */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                  Entendido, continuar →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Para confirmar la operación, escribe la palabra{' '}
                <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-1 rounded">
                  {CONFIRM_WORD}
                </span>{' '}
                en el campo de abajo:
              </p>
              <input
                type="text"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                placeholder={CONFIRM_WORD}
                autoFocus
                className="w-full border-2 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest uppercase
                  focus:outline-none transition-colors
                  border-gray-300 dark:border-gray-600
                  dark:bg-gray-800 dark:text-gray-100
                  focus:border-red-500 dark:focus:border-red-500"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setStep(1); setTyped('') }}
                  className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  ← Volver
                </button>
                <button
                  onClick={onConfirm}
                  disabled={!isConfirmReady}
                  className={`px-5 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${
                    isConfirmReady
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🗑️ Regenerar ahora
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function DatabaseManagement({ user }) {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile]   = useState(null)
  const [showModal, setShowModal]         = useState(false)
  const [dragOver, setDragOver]           = useState(false)

  const { loading, progress, progressLabel, error, result, resetFromExcel, reset } = useDatabaseManagement()

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400 dark:text-gray-600">
        <ShieldAlert className="w-12 h-12" />
        <p className="text-lg font-medium">Acceso restringido a administradores</p>
      </div>
    )
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) { setSelectedFile(f); reset() }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.name.endsWith('.xlsx')) { setSelectedFile(f); reset() }
  }

  const handleConfirm = async () => {
    setShowModal(false)
    await resetFromExcel(selectedFile)
  }

  const handleDownloadTemplate = () => {
    const a = document.createElement('a')
    const baseUrl = import.meta.env.BASE_URL || '/'
    // Ensure we don't have double slashes but keep the base path
    const fullPath = `${baseUrl}/plantilla_bd_ctc_muestra.xlsx`.replace(/\/+/g, '/')
    a.href = fullPath
    a.download = 'plantilla_bd_ctc_muestra.xlsx'
    a.click()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <Database className="w-7 h-7 text-red-500" />
          Gestión de Base de Datos
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Solo disponible para administradores. Las operaciones de esta sección son <strong>irreversibles</strong>.
        </p>
      </div>

      {/* Descargar plantilla */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Download className="w-4 h-4" /> Plantilla Excel de muestra
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Descarga la plantilla oficial con el formato y datos de ejemplo para rellenar y cargar en la base de datos.
          </p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" /> Descargar plantilla
        </button>
      </div>

      {/* Zona de peligro */}
      <div className="border-2 border-red-200 dark:border-red-900 rounded-2xl overflow-hidden">
        {/* Cabecera zona peligro */}
        <div className="bg-red-50 dark:bg-red-950/50 px-5 py-4 flex items-center gap-3 border-b border-red-200 dark:border-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="font-semibold text-red-700 dark:text-red-400">Zona de peligro — Regenerar Base de Datos</p>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona un fichero <strong className="text-gray-800 dark:text-gray-200">.xlsx</strong> con el formato de la plantilla oficial.
            Al confirmar, se borrarán <strong>todos los datos actuales</strong> y se reemplazarán con los del fichero.
          </p>

          {/* Dropzone */}
          {!loading && !result && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                  : selectedFile
                    ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-green-500 dark:text-green-400" />
                  <p className="font-semibold text-green-700 dark:text-green-400">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB · Haz clic para cambiar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500" />
                  <p className="font-medium text-gray-600 dark:text-gray-400">
                    Arrastra el fichero .xlsx aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Solo ficheros .xlsx (Excel)</p>
                </div>
              )}
            </div>
          )}

          {/* Barra de progreso */}
          {loading && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Procesando… no cierres la ventana</span>
              </div>
              <ProgressBar progress={progress} label={progressLabel} />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Error al regenerar la base de datos</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Resultado exitoso */}
          {result && !loading && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                <p className="font-semibold text-green-700 dark:text-green-400">¡Base de datos regenerada con éxito!</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Centros de trabajo', value: result.workCenters },
                  { label: 'Departamentos',       value: result.departments },
                  { label: 'Clientes',            value: result.customers },
                  { label: 'Tareas',              value: result.tasks },
                  { label: 'Empleados',           value: result.employees },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Se recomienda cerrar sesión y volver a iniciarla para reflejar los nuevos datos.
              </p>
              <button
                onClick={() => { setSelectedFile(null); reset() }}
                className="text-sm text-green-700 dark:text-green-400 underline hover:no-underline"
              >
                Cargar otro fichero
              </button>
            </div>
          )}

          {/* Botón de acción */}
          {!loading && !result && (
            <button
              disabled={!selectedFile}
              onClick={() => setShowModal(true)}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                selectedFile
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-red-950'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Database className="w-4 h-4" />
              Regenerar base de datos
            </button>
          )}
        </div>
      </div>

      {/* Modal de doble confirmación */}
      {showModal && selectedFile && (
        <ConfirmModal
          file={selectedFile}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
