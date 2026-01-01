import type { CalendarEvent } from '../types/calendar'
import { calendarState } from '../state/calendar'

export function isDayMarked(day: Date): CalendarEvent | null {
  return (
    calendarState.events.find(e =>
      new Date(e.start) <= day &&
      new Date(e.end) >= day
    ) ?? null
  )
}

export function getDayMark(
  day: Date
): { event: CalendarEvent; halfDay: boolean } | null {

  const iso = day.toISOString().slice(0, 10)

  const event = calendarState.events.find(e => {
    if (e.start === e.end) {
      return e.start === iso
    }

    return new Date(e.start) <= day && new Date(e.end) >= day
  })

  if (!event) return null

  return {
    event,
    halfDay: !!event.halfDay
  }
}