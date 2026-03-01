import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useWorkCenterManagement } from '../hooks/useWorkCenterManagement'

export function WorkCenterManagement() {
  const {
    workCenters,
    loading,
    error,
    addWorkCenter,
    updateWorkCenterData,
    toggleActive
  } = useWorkCenterManagement()

  const [showModal, setShowModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  })
  const [saving, setSaving] = useState(false)
  const [filterActive, setFilterActive] = useState('')

  const handleOpenModal = (center = null) => {
    setEditingCenter(center)
    setFormData({
      name: center?.name || '',
      code: center?.code || ''
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCenter(null)
    setFormData({ name: '', code: '' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!formData.code.trim()) {
      toast.error('El código es requerido')
      return
    }

    setSaving(true)

    try {
      let result
      if (editingCenter) {
        result = await updateWorkCenterData(editingCenter.id, {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase()
        })
      } else {
        result = await addWorkCenter(
          formData.name.trim(),
          formData.code.trim().toUpperCase()
        )
      }

      if (result.success) {
        toast.success(editingCenter ? 'Centro actualizado correctamente' : 'Centro creado correctamente')
        handleCloseModal()
      } else {
        toast.error(result.error || 'Error al guardar el centro')
      }
    } catch (err) {
      toast.error('Error al guardar el centro')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (center) => {
    const result = await toggleActive(center.id)
    if (result.success) {
      toast.success(center.active ? 'Centro desactivado' : 'Centro activado')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
  }

  const filteredCenters = workCenters.filter(center => {
    if (filterActive === '') return true
    return center.active === (filterActive === 'true')
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Centros de Trabajo</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los centros de trabajo de la organización
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Nuevo Centro</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900 transition-colors">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
            {loading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filteredCenters.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay centros de trabajo registrados
                </td>
              </tr>
            )}
            {!loading && filteredCenters.map(center => (
              <tr key={center.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{center.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{center.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${center.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {center.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(center)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(center)}
                    className={`${center.active ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                  >
                    {center.active ? '🚫 Desactivar' : '✅ Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {editingCenter ? 'Editar Centro de Trabajo' : 'Nuevo Centro de Trabajo'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Ej: Madrid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 uppercase transition-colors"
                    placeholder="Ej: MAD"
                    maxLength="10"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Código único para identificar el centro
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : editingCenter ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
