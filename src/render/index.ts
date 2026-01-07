import { renderCalendar } from "./calendar";
import { renderEventList } from "./events";
import { renderLegend } from "./legend";

export function renderUI() {
    renderEventList();
    renderCalendar();
    renderLegend();
}
