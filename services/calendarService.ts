import ICAL from "ical.js";
// import {CALENDAR_PERSONAL, CALENDAR_CODELU} from "@env"

const CALENDAR_PERSONAL = process.env.CALENDAR_PERSONAL
const CALENDAR_CODELU = process.env.CALENDAR_CODELU

interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  calendar: string;
}

const CALENDARS = [
  { name: "Personal", url: CALENDAR_PERSONAL || "" },
  { name: "University Classes", url: CALENDAR_CODELU || "" },
];

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

async function fetchCalendarEvents(
  name: string,
  url: string,
  filterFn: (date: Date) => boolean
): Promise<CalendarEvent[]> {
  const response = await fetch(url);
  const rawData = await response.text();

  const jcalData = ICAL.parse(rawData);
  const comp = new ICAL.Component(jcalData);
  const events = comp.getAllSubcomponents("vevent");
  console.log("event found ")

  return events
    
    .map((event: any) => {
      const icalEvent = new ICAL.Event(event);
      return {
        title: icalEvent.summary,
        startTime: icalEvent.startDate.toJSDate(),
        endTime: icalEvent.endDate.toJSDate(),
        calendar: name,
      };
    })
    .filter((event: CalendarEvent) => filterFn(event.startTime));
    
}

export async function getTodaysEvents(): Promise<CalendarEvent[]> {
  const allEvents: CalendarEvent[] = [];

  console.log("CALENDAR_PERSONAL:", process.env.CALENDAR_PERSONAL);
  console.log("CALENDAR_CODELU:", process.env.CALENDAR_CODELU);

  for (const cal of CALENDARS) {
    if (!cal.url)
        
        continue;
    
    const events = await fetchCalendarEvents(cal.name, cal.url, isToday);
    
    allEvents.push(...events);
  }

  return allEvents.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
}

export async function getTomorrowsEvents(): Promise<CalendarEvent[]> {
  const allEvents: CalendarEvent[] = [];

  for (const cal of CALENDARS) {
    if (!cal.url) continue;
    const events = await fetchCalendarEvents(cal.name, cal.url, isTomorrow);
    allEvents.push(...events);
  }

  return allEvents.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
}
