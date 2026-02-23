import { useState, useMemo } from 'react'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function Calendar({ entries = [], onSelectDate, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6

    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, isCurrentMonth: false })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i)
      days.push({ date: d, isCurrentMonth: true })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({ date: d, isCurrentMonth: false })
    }

    return days
  }, [year, month])

  const entriesByDate = useMemo(() => {
    const map = {}
    entries.forEach(entry => {
      if (!map[entry.date]) map[entry.date] = 0
      map[entry.date] += entry.hours || 0
    })
    return map
  }, [entries])

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return selectedDate === formatDate(date)
  }

  const hasEntries = (date) => {
    const dateStr = formatDate(date)
    return entriesByDate[dateStr] > 0
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-xl font-bold"
        >
          ‹
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-xl font-bold"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day, i) => (
          <div key={i} className="text-center text-sm font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, i) => {
          const dateStr = formatDate(day.date)
          const isCurrentMonth = day.isCurrentMonth
          
          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className={`
                relative p-2 min-h-[48px] rounded-lg text-center transition-all
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected(day.date) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                ${isToday(day.date) && !isSelected(day.date) ? 'bg-blue-50 border-2 border-blue-300' : ''}
              `}
            >
              <span className="text-lg font-medium">{day.date.getDate()}</span>
              {hasEntries(day.date) && (
                <div className={`
                  absolute bottom-1 left-1/2 transform -translate-x-1/2 
                  w-2 h-2 rounded-full
                  ${isSelected(day.date) ? 'bg-white' : 'bg-green-500'}
                `} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
