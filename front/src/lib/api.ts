const BASE_URL = 'http://172.28.5.89:8080';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

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
    throw new ApiError(res.status, body.message ?? '알 수 없는 오류가 발생했습니다.');
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

export interface Course {
  id: number;
  title: string;
  description: string;
  totalRounds: number;
  completedRounds: number;
  createdByName: string;
  createdAt: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  roundNumber: number;
  closed: boolean;
  courseId: number;
  createdByName: string;
  createdAt: string;
}

export const course = {
  getAll: () => request<Course[]>('/api/courses'),

  getById: (id: number) => request<Course>(`/api/courses/${id}`),

  create: (data: { title: string; description: string; totalRounds: number }) =>
    request<Course>('/api/admin/courses', { method: 'POST', body: JSON.stringify(data) }),

  completeRound: (id: number) =>
    request<Course>(`/api/admin/courses/${id}/complete-round`, { method: 'POST' }),
};

export const assignment = {
  getByCourse: (courseId: number) =>
    request<Assignment[]>(`/api/courses/${courseId}/assignments`),

  create: (courseId: number, data: { title: string; description: string; deadline: string; roundNumber: number }) =>
    request<Assignment>(`/api/admin/courses/${courseId}/assignments`, {
      method: 'POST',
      body: JSON.stringify({ ...data, deadline: data.deadline }),
    }),
};

export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Enrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  applicantId: number;
  applicantName: string;
  status: EnrollmentStatus;
  createdAt: string;
}

export const enrollment = {
  getMy: () =>
    request<Enrollment[]>('/api/enrollments/my'),

  apply: (courseId: number) =>
    request<Enrollment>(`/api/courses/${courseId}/enroll`, { method: 'POST' }),

  getEnrollments: (courseId: number) =>
    request<Enrollment[]>(`/api/admin/courses/${courseId}/enrollments`),

  approve: (enrollmentId: number) =>
    request<Enrollment>(`/api/admin/enrollments/${enrollmentId}/approve`, { method: 'PUT' }),

  reject: (enrollmentId: number) =>
    request<Enrollment>(`/api/admin/enrollments/${enrollmentId}/reject`, { method: 'PUT' }),
};

export type SubmissionStatus = 'SUBMITTED' | 'PASSED' | 'FAILED';

export interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  userName: string;
  content: string;
  status: SubmissionStatus;
  feedback: string | null;
  createdAt: string;
}

export const submission = {
  submit: (assignmentId: number, content: string) =>
    request<Submission>(`/api/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getMy: (assignmentId: number) =>
    request<Submission>(`/api/assignments/${assignmentId}/my-submission`)
      .then(r => r ?? null)
      .catch((err) => { console.warn(`[submission.getMy] assignmentId=${assignmentId}`, err); return null; }),

  getByAssignment: (assignmentId: number) =>
    request<Submission[]>(`/api/admin/assignments/${assignmentId}/submissions`),

  evaluate: (submissionId: number, status: 'PASSED' | 'FAILED', feedback: string) =>
    request<Submission>(`/api/admin/submissions/${submissionId}/evaluate`, {
      method: 'PUT',
      body: JSON.stringify({ status, feedback }),
    }),
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
