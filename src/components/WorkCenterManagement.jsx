import { useState, useEffect } from 'react'
import { useWorkCenterManagement } from '../hooks/useWorkCenterManagement'

export function WorkCenterManagement() {
  const {
    loading,
    error,
    fetchWorkCenters,
    addWorkCenter,
    updateWorkCenterData,
    toggleActive
  } = useWorkCenterManagement()

  const [workCenters, setWorkCenters] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [filterActive, setFilterActive] = useState('')

  useEffect(() => {
    loadWorkCenters()
  }, [])

  const loadWorkCenters = async () => {
    const result = await fetchWorkCenters()
    if (result.success) {
      setWorkCenters(result.data)
    }
  }

  const handleOpenModal = (center = null) => {
    setEditingCenter(center)
    setFormData({
      name: center?.name || '',
      code: center?.code || ''
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCenter(null)
    setFormData({ name: '', code: '' })
    setMessage(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'El nombre es requerido' })
      return
    }

    if (!formData.code.trim()) {
      setMessage({ type: 'error', text: 'El código es requerido' })
      return
    }

    setSaving(true)
    setMessage(null)

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
        setMessage({
          type: 'success',
          text: editingCenter ? 'Centro actualizado correctamente' : 'Centro creado correctamente'
        })
        await loadWorkCenters()
        setTimeout(() => {
          handleCloseModal()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al guardar el centro' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar el centro' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (center) => {
    const result = await toggleActive(center.id)
    if (result.success) {
      setMessage({
        type: 'success',
        text: center.active ? 'Centro desactivado' : 'Centro activado'
      })
      await loadWorkCenters()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al cambiar el estado' })
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
          <h2 className="text-2xl font-bold text-gray-800">Centros de Trabajo</h2>
          <p className="text-sm text-gray-600 mt-1">
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

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filteredCenters.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No hay centros de trabajo registrados
                </td>
              </tr>
            )}
            {!loading && filteredCenters.map(center => (
              <tr key={center.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{center.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{center.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      center.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
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
                    className={`${
                      center.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingCenter ? 'Editar Centro de Trabajo' : 'Nuevo Centro de Trabajo'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Madrid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Ej: MAD"
                    maxLength="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Código único para identificar el centro
                  </p>
                </div>
              </div>

              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
