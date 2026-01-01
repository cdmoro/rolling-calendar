# Multi-Month Calendar Generator

A web-based multi-month calendar generator that displays 12 or more consecutive months starting from a selected month and year.  
Originally designed for academic and school planning, but flexible enough for any long-term or annual scheduling use case.

The calendar uses a fixed grid layout, supports full-day and half-day events, and allows dynamic event management with persistent storage.

## Motivation

Most existing calendar libraries focus on weekly or monthly views with event bars.
This project focuses on long-term planning, academic calendars, and visual clarity using a fixed grid approach.

## Features

- 📅 Render 12+ consecutive months from any starting month/year
- 🗓 Fixed grid layout (all months have the same number of rows)
- 🟥 Full-day and half-day events (cell-based, no event bars)
- 📆 Sunday as the first day of the week
- 🏫 Ideal for school and academic calendars (August–July, etc.)
- 🎨 Light / Dark themes with CSS variables
- 🌍 Localized month and weekday names
- 🧠 Events automatically sorted by start date
- 💾 Persistent storage using `localStorage`
- ➕ Add and remove events dynamically
- 📄 Planned export support (PDF, ICS)

---

## Tech Stack

- **Vite**
- **TypeScript**
- **Vanilla JavaScript**
- **CSS Grid**
- **CSS Variables**
- No external calendar libraries

---

## Calendar Layout

- Months are displayed in a **3 × 4 grid**
- Each month contains:
  - Localized weekday header
  - Fixed-size day cells (40 × 30 px)
  - Empty cells for alignment when needed
- Events fill entire day cells instead of using bars

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dewv
```

### Build for production

```bash
npm run build
```

## 🗺️ Roadmap

- Export calendar to PDF
- Export events as ICS
- Share calendar via URL (query params)
- Event editing
- Additional theme variants
- Print-friendly layout

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.