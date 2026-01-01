import { getFixedMonthGrid } from '../calendar/monthGrid'
import { calendarState } from '../state/calendar'
import { getDayMark } from '../events/events'
import { getLocalizedWeekdays } from '../calendar/weekdays'
import { state } from '../state/app'

export function renderCalendar() {
    const grid = document.getElementById('calendar-grid')!
    grid.innerHTML = ''

    for (let i = 0; i < 12; i++) {
        const date = new Date(
            calendarState.startYear,
            calendarState.startMonth + i
        )

        const monthEl = document.createElement('div')
        monthEl.className = 'month'

        /* ---- Month title ---- */
        const title = document.createElement('div')
        title.className = 'month-title'
        title.textContent = date.toLocaleString(state.language, {
            month: 'long',
            year: 'numeric'
        })
        monthEl.appendChild(title)

        /* ---- Weekday header ---- */
        const header = document.createElement('div')
        header.className = 'week-header'

        getLocalizedWeekdays(state.language).forEach(label => {
            const h = document.createElement('div')
            h.textContent = label
            header.appendChild(h)
        })

        monthEl.appendChild(header)

        /* ---- Days grid ---- */
        const monthGrid = document.createElement('div')
        monthGrid.className = 'month-grid'

        const weeks = getFixedMonthGrid(
            date.getFullYear(),
            date.getMonth()
        )

        weeks.flat().forEach(day => {
            const cell = document.createElement('div')
            cell.className = 'day'

            if (day) {
                cell.textContent = day.getDate().toString()

                const weekday = day.getDay()
                if (weekday === 0 || weekday === 6) {
                    cell.classList.add('weekend')
                }

                const mark = getDayMark(day)

                if (mark) {
                    cell.classList.add('marked')

                    if (mark.halfDay) {
                        cell.classList.add('half')
                    }

                    cell.title = mark.event.title
                }

            }
            else {
                cell.classList.add('empty')
            }

            monthGrid.appendChild(cell)
        })

        monthEl.appendChild(monthGrid)
        grid.appendChild(monthEl)
    }
}
