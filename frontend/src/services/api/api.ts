const API = `${import.meta.env.VITE_API_URL}/api`;

async function client(url: string) {
  const res = await fetch(`${API}${url}`);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export const timelineApi = {
  getObjectives: () => client("/timeline/objectives"),

  getMonthEvents: (year: number, month: number) => client(`/timeline/events?month=${month}&year=${year}`)
}
