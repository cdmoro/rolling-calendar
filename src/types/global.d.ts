declare global {
  interface Window {
    __INTERNAL__?: {
      state: AppState;
      calendarState: CalendarState;
    };
  }
}