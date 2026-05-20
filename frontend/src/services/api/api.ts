import { IEvent, IPriority } from "@cv/shared";

const API = `${import.meta.env.VITE_API_URL}/api`;

async function client(url: string) {
  const res = await fetch(`${API}${url}`);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export const timelineApi = {
  getPriorities: () : Promise<IPriority[]> => client("/timeline/priorities"),

  getMonthEvents: (year: number, month: number) : Promise<Record<string, IEvent[]>> => client(`/timeline/events?month=${month}&year=${year}`)
}
