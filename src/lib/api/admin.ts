import { apiClient } from '@/lib/api/client';
import type {
  AdminAstrologerDetail,
  AdminAstrologerListItem,
  AdminService,
  AstrologerApplicationStatus,
  AuthUser,
  CreateServiceDto,
  ReviewApplicationDto,
  ReviewApplicationResponse,
  UpdateServiceDto,
} from '@/lib/types/api';

export const authApi = {
  login(email: string, password: string) {
    return apiClient<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  me() {
    return apiClient<AuthUser>('/auth/me');
  },

  logout() {
    return apiClient<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  },
};

export const astrologersApi = {
  list(applicationStatus?: AstrologerApplicationStatus) {
    return apiClient<AdminAstrologerListItem[]>('/admin/astrologers', {
      query: { applicationStatus },
    });
  },

  get(id: string) {
    return apiClient<AdminAstrologerDetail>(`/admin/astrologers/${id}`);
  },

  review(id: string, dto: ReviewApplicationDto) {
    return apiClient<ReviewApplicationResponse>(
      `/admin/astrologers/${id}/application`,
      { method: 'PATCH', body: dto },
    );
  },
};

export const servicesApi = {
  list() {
    return apiClient<AdminService[]>('/admin/services');
  },

  create(dto: CreateServiceDto) {
    return apiClient<AdminService>('/admin/services', {
      method: 'POST',
      body: dto,
    });
  },

  update(id: string, dto: UpdateServiceDto) {
    return apiClient<AdminService>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },
};
