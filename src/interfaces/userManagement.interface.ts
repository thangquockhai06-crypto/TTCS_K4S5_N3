import type { ICustomer } from './customer.interface';
import type { IDeal } from './deal.interface';

export type UserAccountStatusType = 'Active' | 'Deactivated';

export type SystemRoleType =
  | 'Super Admin'
  | 'VP of Sales'
  | 'Sales Manager'
  | 'Account Executive'
  | 'RevOps Lead';

export type DataScopeType = 'ALL_ORG' | 'TEAM_TREE' | 'OWNED_ONLY';

export interface ISalesTeamNode {
  id: string;
  code: string;
  name: string;
  parentTeamId: string | null;
  parentTeamName: string | null;
  level: 1 | 2 | 3;
  managerName: string;
  dataScope: DataScopeType;
  dataScopeLabel: string;
  description: string;
}

export interface IManagedUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: SystemRoleType;
  title: string;
  department: string;
  salesTeamId: string;
  salesTeamName: string;
  dataScope: DataScopeType;
  dataScopeLabel: string;
  status: UserAccountStatusType;
  activeSessions: number;
  lastActiveAt: string;
  customersCount: number;
  dealsCount: number;
  totalPipelineArr: number;
  deactivatedAt?: string;
  deactivationReason?: string;
  handedOverToUserId?: string;
  handedOverToUserName?: string;
}

export interface CreateManagedUserDTO {
  fullName: string;
  email: string;
  title: string;
  role: SystemRoleType;
  salesTeamId: string;
}

export interface DeactivateUserRequestDTO {
  targetUserId: string;
  newOwnerUserId: string;
  reason: string;
  revokeActiveSessions: boolean;
}

export interface IHandoverAuditLog {
  id: string;
  createdAt: string;
  performedByName: string;
  performedByEmail: string;
  deactivatedUserId: string;
  deactivatedUserName: string;
  deactivatedUserEmail: string;
  newOwnerUserId: string;
  newOwnerUserName: string;
  newOwnerUserEmail: string;
  transferredCustomersCount: number;
  transferredDealsCount: number;
  transferredPipelineArr: number;
  transferredCustomerNames: string[];
  transferredDealTitles: string[];
  revokedSessionsCount: number;
  reason: string;
}

export interface DeactivateUserResponseDTO {
  success: boolean;
  deactivatedUser: IManagedUser;
  newOwnerUser: IManagedUser;
  auditLog: IHandoverAuditLog;
}

export interface UpdateUserRoleTeamDTO {
  userId: string;
  role: SystemRoleType;
  salesTeamId: string;
}

export interface IDeactivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: IManagedUser | null;
  activeUsers: ReadonlyArray<IManagedUser>;
  userCustomers: ReadonlyArray<ICustomer>;
  userDeals: ReadonlyArray<IDeal>;
  onConfirmDeactivate: (dto: DeactivateUserRequestDTO) => Promise<void>;
}
