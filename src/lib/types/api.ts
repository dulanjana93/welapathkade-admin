/** Types matching NestJS API responses (no invented fields). */

export type UserRole = 'PUBLIC' | 'ASTROLOGER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
export type Language = 'SI' | 'EN' | 'TA';

export type AstrologerApplicationStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'APPROVED';

export type AstrologerProfileStatus = 'INACTIVE' | 'ACTIVE' | 'SUSPENDED';
export type AstrologerServiceStatus = 'ACTIVE' | 'INACTIVE';
export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

/** Money amounts are decimal strings from the API (e.g. "1500.00"). */
export type MoneyString = string;

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  status: UserStatus;
  language: Language;
  referralCode: string;
  referredByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  profileStatus?: AstrologerProfileStatus | null;
  applicationStatus?: AstrologerApplicationStatus | null;
  rejectionReason?: string | null;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type RequestOtpResponse = {
  message: string;
  purpose: string;
  expiresIn: number;
};

export type AdminAstrologerService = {
  id: string;
  serviceId: string;
  code: string;
  nameSi: string;
  nameEn: string;
  minPrice: MoneyString;
  maxPrice: MoneyString;
  price: MoneyString;
  status: AstrologerServiceStatus;
  serviceStatus: ServiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminAstrologerApplication = {
  id: string;
  status: AstrologerApplicationStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type AdminAstrologerUser = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  language: Language;
  referralCode: string;
  referredByUserId: string | null;
};

export type AdminAstrologerListItem = {
  id: string;
  displayName: string;
  bio: string | null;
  experienceYears: number;
  photo: string | null;
  city: string | null;
  district: string | null;
  status: AstrologerProfileStatus;
  createdAt: string;
  updatedAt: string;
  user: AdminAstrologerUser;
  application: AdminAstrologerApplication | null;
  services: AdminAstrologerService[];
};

export type AvailabilityWindow = {
  id: string;
  startTime: string;
  endTime: string;
};

export type AvailabilityException = {
  id: string;
  date: string;
  type: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAstrologerAvailability = {
  timezone: string;
  weekly: Record<string, AvailabilityWindow[]>;
  exceptions: AvailabilityException[];
};

export type AdminAstrologerDetail = AdminAstrologerListItem & {
  availability: AdminAstrologerAvailability;
};

export type ReviewApplicationDto = {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
};

export type ReviewApplicationResponse = {
  applicationStatus: AstrologerApplicationStatus;
  profileStatus: AstrologerProfileStatus;
  rejectionReason: string | null;
};

export type AdminService = {
  id: string;
  code: string;
  nameSi: string;
  nameEn: string;
  descriptionSi: string | null;
  descriptionEn: string | null;
  minPrice: MoneyString;
  maxPrice: MoneyString;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceDto = {
  code: string;
  nameSi: string;
  nameEn: string;
  descriptionSi?: string;
  descriptionEn?: string;
  minPrice: number;
  maxPrice: number;
  status?: ServiceStatus;
};

export type UpdateServiceDto = Partial<CreateServiceDto>;
