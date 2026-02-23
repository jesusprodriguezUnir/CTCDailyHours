import { useState } from 'react'
import { Layout } from './components/Layout'
import { Login } from './components/Login'
import { WeeklyCalendar } from './components/WeeklyCalendar'
import { useTimeEntries } from './hooks/useTimeEntries'

function App() {
  const [user, setUser] = useState(null)
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useTimeEntries()

  const isResponsible = user?.role === 'responsible'

  const handleLogin = (employee) => {
    setUser(employee)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const renderContent = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />
    }

    return (
      <WeeklyCalendar
        entries={entries}
        onAdd={addEntry}
        onUpdate={updateEntry}
        onDelete={deleteEntry}
        user={user}
        isResponsible={isResponsible}
      />
    )
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  )
}

export default App
