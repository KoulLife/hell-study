const BASE_URL = 'http://localhost:8080';

export interface User {
  id: number;
  loginId: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

async function request<T = void>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(body.message ?? '알 수 없는 오류가 발생했습니다.');
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const auth = {
  register: (data: { loginId: string; password: string; name: string; email: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { loginId: string; password: string }) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),
};

export const user = {
  getMe: () => request<User>('/api/users/me'),
};

export const superAdmin = {
  getAllUsers: () => request<User[]>('/api/super-admin/users'),

  getPendingUsers: () => request<User[]>('/api/super-admin/users/pending'),

  approveUser: (userId: number) =>
    request(`/api/super-admin/users/${userId}/approve`, { method: 'POST' }),

  rejectUser: (userId: number) =>
    request(`/api/super-admin/users/${userId}/reject`, { method: 'POST' }),

  changeRole: (userId: number, role: User['role']) =>
    request<User>(`/api/super-admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};
