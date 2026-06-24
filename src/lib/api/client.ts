export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error ?? "请求失败");
  return json.data as T;
}

export const api = {
  auth: {
    me: () => request<{ user: { id: string; email: string; name: string; plan: string; credits: number; totalCredits?: number } | null }>("/api/auth/me"),
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string; name: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string) =>
      request<{ user: { id: string; email: string; name: string } }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      }),
    demo: () =>
      request<{ user: { id: string; email: string; name: string } }>("/api/auth/demo", { method: "POST" }),
    logout: () => fetch("/api/auth/me", { method: "DELETE", credentials: "include" }),
  },
  ai: {
    generateImage: (params: Record<string, unknown>) =>
      request<{ images: { id: string; url: string; width: number; height: number; provider: string }[]; providers: unknown }>(
        "/api/ai/image/generate",
        { method: "POST", body: JSON.stringify(params) }
      ),
    generateVideo: (params: Record<string, unknown>) =>
      request<{ video: { id: string; url: string; thumbnailUrl?: string; duration: number; provider: string }; taskId?: string }>(
        "/api/ai/video/generate",
        { method: "POST", body: JSON.stringify(params) }
      ),
    providers: () => request<{ providers: unknown }>("/api/ai/image/generate"),
  },
  compliance: {
    check: (texts: { content: string; location?: string }[], hasAiLabel?: boolean) =>
      request<{ status: string; items: { id: string; type: string; severity: string; message: string; location?: string }[]; score: number }>(
        "/api/compliance/check",
        { method: "POST", body: JSON.stringify({ texts, hasAiLabel }) }
      ),
  },
  batch: {
    parse: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return fetch("/api/batch/parse", { method: "POST", body: fd, credentials: "include" }).then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        return json.data;
      });
    },
    submit: (items: Record<string, unknown>[], name?: string) =>
      request<{ taskId: string }>("/api/batch/submit", {
        method: "POST",
        body: JSON.stringify({ items, name }),
      }),
    templateUrl: "/api/batch/parse",
  },
  tasks: {
    list: (status?: string) =>
      request<{ tasks: unknown[] }>(`/api/tasks${status ? `?status=${status}` : ""}`),
    get: (id: string) => request<{ task: unknown }>(`/api/tasks/${id}`),
    retry: (id: string) => request<{ message: string }>(`/api/tasks/${id}`, { method: "POST" }),
  },
  materials: {
    list: (type?: string) =>
      request<{ materials: unknown[] }>(`/api/materials${type ? `?type=${type}` : ""}`),
  },
  campaigns: {
    create: (message: string, materialType?: "image" | "video") =>
      request<{ campaign: import("@/lib/campaign/types").CampaignSnapshot }>("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({ message, materialType }),
      }),
    get: (id: string) =>
      request<{ campaign: import("@/lib/campaign/types").CampaignSnapshot }>(`/api/campaigns/${id}`),
    action: (id: string, action: string, payload?: Record<string, unknown>) =>
      request<{ campaign: import("@/lib/campaign/types").CampaignSnapshot }>(
        `/api/campaigns/${id}/actions`,
        { method: "POST", body: JSON.stringify({ action, ...payload }) }
      ),
    generate: (id: string) =>
      request<{ campaign: import("@/lib/campaign/types").CampaignSnapshot; material: { id: string; url: string } }>(
        `/api/campaigns/${id}/generate`,
        { method: "POST" }
      ),
    auditStatus: (id: string) =>
      request<{ status: string; campaign?: import("@/lib/campaign/types").CampaignSnapshot; reason?: string }>(
        `/api/campaigns/${id}/audit-status`
      ),
  },
};
