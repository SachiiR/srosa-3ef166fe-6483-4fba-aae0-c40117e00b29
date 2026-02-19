export const API_BASE = 'http://localhost:3000/api';

export const API_URLS = {
  tasks: `${API_BASE}/tasks`,
  users: `${API_BASE}/user`,
  audit: `${API_BASE}/audit`,
} as const;