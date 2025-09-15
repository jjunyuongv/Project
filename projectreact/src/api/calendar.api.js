import api from './axios';

export function isoLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const listCalendars   = async () => (await api.get('/calendars')).data;
export const createCalendar  = async (payload) => (await api.post('/calendars', payload)).data;
export const deleteCalendar  = async (id) => { await api.delete(`/calendars/${id}`); };
