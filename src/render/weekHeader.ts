import { getLocalizedWeekdays } from '../calendar/weekdays'
import { state } from '../state/app'

export function renderWeekHeader(
  container: HTMLElement
) {
  const header = document.createElement('div')
  header.className = 'week-header'

  const weekdays = getLocalizedWeekdays(state.language)

  weekdays.forEach(day => {
    const cell = document.createElement('div')
    cell.className = 'weekday'
    cell.textContent = day
    header.appendChild(cell)
  })

  container.appendChild(header)
}
