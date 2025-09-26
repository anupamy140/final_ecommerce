import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE;

const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChange"));
};

const api = {
  async request(method: string, endpoint: string, body: any = null) {
    let accessToken = localStorage.getItem("accessToken");

    const makeRequest = async (token: string | null) => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const options: RequestInit = { method, headers };
      if (body) options.body = JSON.stringify(body);
      return fetch(`${API_BASE}${endpoint}`, options);
    };

    let res = await makeRequest(accessToken);

    if (res.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        throw new Error("Session expired. Please log in again.");
      }
      try {
        const refreshRes = await fetch(`${API_BASE}/users/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (!refreshRes.ok) {
            const errorData = await refreshRes.json().catch(() => ({}));
            throw new Error(errorData.detail || "Session expired.");
        }

        const data = await refreshRes.json();
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        res = await makeRequest(data.access_token);
      } catch (error: any) {
        logout();
        toast.error(error.message);
        throw error;
      }
    }
    return res;
  },
  async get(endpoint: string) { return this.request('GET', endpoint); },
  async post(endpoint: string, body: any) { return this.request('POST', endpoint, body); },
  async put(endpoint: string, body: any) { return this.request('PUT', endpoint, body); },
  async delete(endpoint: string) { return this.request('DELETE', endpoint); },
  logout,
};

export default api;
