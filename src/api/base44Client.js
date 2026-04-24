const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token');
}

export async function apiGet(path) {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[API GET] ${API_BASE}${path}`);
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[API GET Error] ${path}:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API GET Success] ${path}:`, data);
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      console.error(`[API GET Error] Cannot connect to backend at ${API_BASE}`);
      throw new Error('Cannot connect to backend server. Please ensure it is running on port 3001.');
    }
    throw err;
  }
}

export async function apiPost(path, data) {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[API POST] ${API_BASE}${path}`, data);
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[API POST Error] ${path}:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[API POST Success] ${path}:`, result);
    return result;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      console.error(`[API POST Error] Cannot connect to backend at ${API_BASE}`);
      throw new Error('Cannot connect to backend server. Please ensure it is running on port 3001.');
    }
    throw err;
  }
}

// Legacy exports for compatibility during migration
export const db = {
  auth: {
    isAuthenticated: async () => !!getToken(),
    me: async () => {
      try {
        const data = await apiGet('/api/auth/me');
        return data.user;
      } catch {
        return null;
      }
    }
  },
  entities: new Proxy({}, {
    get: () => ({
      filter: async () => [],
      get: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' })
    }
  }
};

export const base44 = db;
export default db;