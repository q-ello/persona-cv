import { EventResponse, IEvent, IPriority, Language } from "@cv/shared";

const API = `${import.meta.env.VITE_API_URL}/api`;

async function client(url: string, lang: Language) {
  const res = await fetch(`${API}${url}`, {
    headers: { "accept-language": lang }
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export const timelineApi = {
  getPriorities: (lang: Language): Promise<IPriority[]> => client("/timeline/priorities", lang),

  getMonthEvents: (lang: Language, year: number, month: number): Promise<EventResponse> => client(`/timeline/events?month=${month}&year=${year}`, lang)
}
