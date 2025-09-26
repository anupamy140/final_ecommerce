import { toast } from 'sonner';
const API_BASE = "https://backfinal-7pi0.onrender.com";

const logout = () => {
    localStorage.removeItem("vendorAccessToken");
    localStorage.removeItem("vendorRefreshToken");
    localStorage.removeItem("vendor");
    window.dispatchEvent(new Event("vendorAuthChange"));
};

const vendorApi = {
    async request(method: string, endpoint: string, body: any = null) {
        let accessToken = localStorage.getItem("vendorAccessToken");

        const makeRequest = async (token: string | null) => {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const options: RequestInit = { method, headers };
            if (body) options.body = JSON.stringify(body);
            return fetch(`${API_BASE}${endpoint}`, options);
        };

        let res = await makeRequest(accessToken);
        
        if (res.status === 401) {
            const refreshToken = localStorage.getItem("vendorRefreshToken");
            if (!refreshToken) {
                logout();
                throw new Error("Vendor session expired. Please log in again.");
            }
            try {
                const refreshRes = await fetch(`${API_BASE}/vendors/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (!refreshRes.ok) {
                    const errorData = await refreshRes.json().catch(() => ({}));
                    throw new Error(errorData.detail || "Could not refresh vendor session.");
                }

                const data = await refreshRes.json();
                localStorage.setItem("vendorAccessToken", data.access_token);
                localStorage.setItem("vendorRefreshToken", data.refresh_token);
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

export default vendorApi;
