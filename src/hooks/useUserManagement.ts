import { useCallback, useMemo, useState } from 'react';
import { useCRMData } from '../context/CRMDataContext';
import { useAuth } from './useAuth';
import type {
  CreateManagedUserDTO,
  DeactivateUserRequestDTO,
  DeactivateUserResponseDTO,
  ICustomer,
  IDeal,
  IHandoverAuditLog,
  IManagedUser,
  ISalesTeamNode,
  UpdateUserRoleTeamDTO,
} from '../interfaces';
import { AUTH_STORAGE_KEYS, type IStoredAccount } from '../mock/auth.mock';
import {
  INITIAL_HANDOVER_AUDIT_LOGS,
  INITIAL_MANAGED_USERS,
  INITIAL_SALES_TEAMS,
  ROLE_DATA_SCOPE_MAP,
  USER_MANAGEMENT_STORAGE_KEYS,
} from '../mock/userManagement.mock';
import { createAvatarSvgDataUri } from '../utils/formatters';

interface IOwnershipReassignmentMap {
  customerOwnerByCustomerId: Record<
    string,
    { id: string; name: string; email: string; avatarUrl: string }
  >;
  dealOwnerByDealId: Record<string, { name: string; avatarUrl: string }>;
}

const OWNERSHIP_STORAGE_KEY = 'nexus_crm_ownership_reassignments_v2';

function mergeWithRegisteredAccounts(baseList: IManagedUser[]): IManagedUser[] {
  try {
    const rawReg = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
    if (!rawReg) return baseList;
    const regAccounts = JSON.parse(rawReg) as IStoredAccount[];
    if (!Array.isArray(regAccounts)) return baseList;

    const existingEmails = new Set(baseList.map((u) => u.email.toLowerCase()));
    const additionalUsers: IManagedUser[] = [];

    regAccounts.forEach((acc, idx) => {
      const normalizedEmail = acc.email.toLowerCase();
      if (!existingEmails.has(normalizedEmail)) {
        existingEmails.add(normalizedEmail);
        const role = acc.user.role || 'Account Executive';
        const scopeInfo = ROLE_DATA_SCOPE_MAP[role];
        additionalUsers.push({
          id: acc.user.id || `usr-reg-${idx}`,
          fullName: acc.user.fullName,
          email: acc.user.email,
          avatarUrl: acc.user.avatarUrl || createAvatarSvgDataUri(acc.user.fullName, idx + 2),
          role,
          title: acc.user.title || 'Chuyên viên Kinh doanh',
          department: acc.user.department || 'Khối Kinh doanh APAC',
          salesTeamId: 'team-ent-apac',
          salesTeamName: 'Khối Khách hàng Trọng điểm Việt Nam & APAC',
          dataScope: scopeInfo.scope,
          dataScopeLabel: scopeInfo.label,
          status: 'Active',
          activeSessions: 1,
          lastActiveAt: 'Vừa đăng nhập',
          customersCount: 0,
          dealsCount: 0,
          totalPipelineArr: 0,
        });
      }
    });

    return [...baseList, ...additionalUsers];
  } catch {
    return baseList;
  }
}

function loadStoredUsers(): IManagedUser[] {
  try {
    const raw = window.localStorage.getItem(USER_MANAGEMENT_STORAGE_KEYS.MANAGED_USERS);
    if (!raw) return mergeWithRegisteredAccounts([...INITIAL_MANAGED_USERS]);
    const parsed = JSON.parse(raw) as IManagedUser[];
    const validList =
      Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_MANAGED_USERS];
    return mergeWithRegisteredAccounts(validList);
  } catch {
    return mergeWithRegisteredAccounts([...INITIAL_MANAGED_USERS]);
  }
}

function loadStoredHandoverLogs(): IHandoverAuditLog[] {
  try {
    const raw = window.localStorage.getItem(USER_MANAGEMENT_STORAGE_KEYS.HANDOVER_LOGS);
    if (!raw) return [...INITIAL_HANDOVER_AUDIT_LOGS];
    const parsed = JSON.parse(raw) as IHandoverAuditLog[];
    return Array.isArray(parsed) ? parsed : [...INITIAL_HANDOVER_AUDIT_LOGS];
  } catch {
    return [...INITIAL_HANDOVER_AUDIT_LOGS];
  }
}

function loadStoredOwnershipMap(): IOwnershipReassignmentMap {
  try {
    const raw = window.localStorage.getItem(OWNERSHIP_STORAGE_KEY);
    if (!raw) {
      return { customerOwnerByCustomerId: {}, dealOwnerByDealId: {} };
    }
    const parsed = JSON.parse(raw) as IOwnershipReassignmentMap;
    return {
      customerOwnerByCustomerId: parsed.customerOwnerByCustomerId ?? {},
      dealOwnerByDealId: parsed.dealOwnerByDealId ?? {},
    };
  } catch {
    return { customerOwnerByCustomerId: {}, dealOwnerByDealId: {} };
  }
}

function syncDeactivatedEmailsStorage(users: ReadonlyArray<IManagedUser>): void {
  const deactivatedEmails = users
    .filter((u) => u.status === 'Deactivated')
    .map((u) => u.email.toLowerCase());
  window.localStorage.setItem(
    USER_MANAGEMENT_STORAGE_KEYS.DEACTIVATED_EMAILS,
    JSON.stringify(deactivatedEmails)
  );
}

export interface IUseUserManagementReturn {
  users: IManagedUser[];
  activeUsers: IManagedUser[];
  deactivatedUsers: IManagedUser[];
  salesTeams: ReadonlyArray<ISalesTeamNode>;
  handoverLogs: IHandoverAuditLog[];
  getCustomersForUser: (targetUser: IManagedUser) => ICustomer[];
  getDealsForUser: (targetUser: IManagedUser) => IDeal[];
  deactivateAndHandoverUser: (dto: DeactivateUserRequestDTO) => Promise<DeactivateUserResponseDTO>;
  updateUserRoleAndTeam: (dto: UpdateUserRoleTeamDTO) => void;
  addManagedUser: (dto: CreateManagedUserDTO) => IManagedUser;
  reactivateUser: (userId: string) => void;
}

export function useUserManagement(): IUseUserManagementReturn {
  const { customers, deals, addCustomerActivity } = useCRMData();
  const { user: currentAdminUser } = useAuth();

  const [baseUsers, setBaseUsers] = useState<IManagedUser[]>(() => loadStoredUsers());
  const [handoverLogs, setHandoverLogs] = useState<IHandoverAuditLog[]>(() =>
    loadStoredHandoverLogs()
  );
  const [ownershipMap, setOwnershipMap] = useState<IOwnershipReassignmentMap>(() =>
    loadStoredOwnershipMap()
  );

  const effectiveCustomers = useMemo<ICustomer[]>(() => {
    return customers.map((c) => {
      const override = ownershipMap.customerOwnerByCustomerId[c.id];
      if (!override) return c;
      return {
        ...c,
        owner: {
          id: override.id,
          name: override.name,
          email: override.email,
          avatarUrl: override.avatarUrl,
        },
      };
    });
  }, [customers, ownershipMap.customerOwnerByCustomerId]);

  const effectiveDeals = useMemo<IDeal[]>(() => {
    return deals.map((d) => {
      const override = ownershipMap.dealOwnerByDealId[d.id];
      if (!override) return d;
      return {
        ...d,
        ownerName: override.name,
        ownerAvatar: override.avatarUrl,
      };
    });
  }, [deals, ownershipMap.dealOwnerByDealId]);

  const getCustomersForUser = useCallback(
    (targetUser: IManagedUser): ICustomer[] => {
      return effectiveCustomers.filter(
        (c) =>
          c.owner.id === targetUser.id ||
          c.owner.email.toLowerCase() === targetUser.email.toLowerCase() ||
          c.owner.name.toLowerCase() === targetUser.fullName.toLowerCase()
      );
    },
    [effectiveCustomers]
  );

  const getDealsForUser = useCallback(
    (targetUser: IManagedUser): IDeal[] => {
      return effectiveDeals.filter(
        (d) => d.ownerName.toLowerCase() === targetUser.fullName.toLowerCase()
      );
    },
    [effectiveDeals]
  );

  const users = useMemo<IManagedUser[]>(() => {
    return baseUsers.map((u) => {
      if (u.status === 'Deactivated') {
        return {
          ...u,
          customersCount: 0,
          dealsCount: 0,
          totalPipelineArr: 0,
        };
      }
      const ownedCustomers = getCustomersForUser(u);
      const ownedDeals = getDealsForUser(u);
      const totalPipelineArr = ownedDeals.reduce((sum, d) => sum + d.value, 0);

      return {
        ...u,
        customersCount: ownedCustomers.length,
        dealsCount: ownedDeals.length,
        totalPipelineArr,
      };
    });
  }, [baseUsers, getCustomersForUser, getDealsForUser]);

  const activeUsers = useMemo<IManagedUser[]>(
    () => users.filter((u) => u.status === 'Active'),
    [users]
  );

  const deactivatedUsers = useMemo<IManagedUser[]>(
    () => users.filter((u) => u.status === 'Deactivated'),
    [users]
  );

  const deactivateAndHandoverUser = useCallback(
    async (dto: DeactivateUserRequestDTO): Promise<DeactivateUserResponseDTO> => {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 850);
      });

      const targetUser = users.find((u) => u.id === dto.targetUserId);
      const newOwnerUser = users.find(
        (u) => u.id === dto.newOwnerUserId && u.status === 'Active'
      );

      if (!targetUser) {
        throw new Error('TARGET_USER_NOT_FOUND');
      }
      if (!newOwnerUser || newOwnerUser.id === targetUser.id) {
        throw new Error('INVALID_NEW_OWNER');
      }

      const targetCustomers = getCustomersForUser(targetUser);
      const targetDeals = getDealsForUser(targetUser);
      const transferredPipelineArr = targetDeals.reduce((sum, d) => sum + d.value, 0);

      const nextCustomerOverrides: IOwnershipReassignmentMap['customerOwnerByCustomerId'] = {
        ...ownershipMap.customerOwnerByCustomerId,
      };
      targetCustomers.forEach((cust) => {
        nextCustomerOverrides[cust.id] = {
          id: newOwnerUser.id,
          name: newOwnerUser.fullName,
          email: newOwnerUser.email,
          avatarUrl: newOwnerUser.avatarUrl,
        };
      });

      const nextDealOverrides: IOwnershipReassignmentMap['dealOwnerByDealId'] = {
        ...ownershipMap.dealOwnerByDealId,
      };
      targetDeals.forEach((deal) => {
        nextDealOverrides[deal.id] = {
          name: newOwnerUser.fullName,
          avatarUrl: newOwnerUser.avatarUrl,
        };
      });

      const nextOwnershipMap: IOwnershipReassignmentMap = {
        customerOwnerByCustomerId: nextCustomerOverrides,
        dealOwnerByDealId: nextDealOverrides,
      };
      setOwnershipMap(nextOwnershipMap);
      window.localStorage.setItem(OWNERSHIP_STORAGE_KEY, JSON.stringify(nextOwnershipMap));

      if (targetCustomers.length > 0) {
        addCustomerActivity(
          targetCustomers[0].id,
          `Bàn giao chủ sở hữu từ ${targetUser.fullName} sang ${newOwnerUser.fullName}`,
          `Tài khoản ${targetUser.email} đã bị khóa và thu hồi phiên. Toàn bộ ${targetCustomers.length} khách hàng và ${targetDeals.length} cơ hội đã được chuyển giao cho ${newOwnerUser.fullName}.`,
          'deal_update',
          currentAdminUser?.fullName ?? 'Quản Trị Viên Hệ Thống'
        );
      }

      const nowIso = new Date().toISOString();
      const updatedDeactivatedUser: IManagedUser = {
        ...targetUser,
        status: 'Deactivated',
        activeSessions: 0,
        lastActiveAt: 'Đã thu hồi toàn bộ phiên',
        customersCount: 0,
        dealsCount: 0,
        totalPipelineArr: 0,
        deactivatedAt: nowIso,
        deactivationReason: dto.reason.trim() || 'Khóa tài khoản & bàn giao dữ liệu chủ sở hữu',
        handedOverToUserId: newOwnerUser.id,
        handedOverToUserName: newOwnerUser.fullName,
      };

      const updatedNewOwner: IManagedUser = {
        ...newOwnerUser,
        customersCount: newOwnerUser.customersCount + targetCustomers.length,
        dealsCount: newOwnerUser.dealsCount + targetDeals.length,
        totalPipelineArr: newOwnerUser.totalPipelineArr + transferredPipelineArr,
      };

      const nextUsers = baseUsers.map((u) => {
        if (u.id === targetUser.id) return updatedDeactivatedUser;
        if (u.id === newOwnerUser.id) return updatedNewOwner;
        return u;
      });

      setBaseUsers(nextUsers);
      window.localStorage.setItem(
        USER_MANAGEMENT_STORAGE_KEYS.MANAGED_USERS,
        JSON.stringify(nextUsers)
      );
      syncDeactivatedEmailsStorage(nextUsers);

      const newAuditLog: IHandoverAuditLog = {
        id: `handover-${Date.now()}`,
        createdAt: nowIso,
        performedByName: currentAdminUser?.fullName ?? 'Quản Trị Viên Hệ Thống',
        performedByEmail: currentAdminUser?.email ?? 'admin@nexuscrm.vn',
        deactivatedUserId: targetUser.id,
        deactivatedUserName: targetUser.fullName,
        deactivatedUserEmail: targetUser.email,
        newOwnerUserId: newOwnerUser.id,
        newOwnerUserName: newOwnerUser.fullName,
        newOwnerUserEmail: newOwnerUser.email,
        transferredCustomersCount: targetCustomers.length,
        transferredDealsCount: targetDeals.length,
        transferredPipelineArr,
        transferredCustomerNames: targetCustomers.slice(0, 6).map((c) => c.company),
        transferredDealTitles: targetDeals.slice(0, 4).map((d) => d.title),
        revokedSessionsCount: targetUser.activeSessions,
        reason: dto.reason.trim() || 'Khóa tài khoản & bàn giao dữ liệu chủ sở hữu.',
      };

      const nextLogs = [newAuditLog, ...handoverLogs];
      setHandoverLogs(nextLogs);
      window.localStorage.setItem(
        USER_MANAGEMENT_STORAGE_KEYS.HANDOVER_LOGS,
        JSON.stringify(nextLogs)
      );

      return {
        success: true,
        deactivatedUser: updatedDeactivatedUser,
        newOwnerUser: updatedNewOwner,
        auditLog: newAuditLog,
      };
    },
    [
      addCustomerActivity,
      baseUsers,
      currentAdminUser?.email,
      currentAdminUser?.fullName,
      getCustomersForUser,
      getDealsForUser,
      handoverLogs,
      ownershipMap.customerOwnerByCustomerId,
      ownershipMap.dealOwnerByDealId,
      users,
    ]
  );

  const updateUserRoleAndTeam = useCallback(
    (dto: UpdateUserRoleTeamDTO): void => {
      const teamNode = INITIAL_SALES_TEAMS.find((t) => t.id === dto.salesTeamId);
      const roleScopeInfo = ROLE_DATA_SCOPE_MAP[dto.role];

      const nextUsers = baseUsers.map((u) => {
        if (u.id !== dto.userId) return u;
        return {
          ...u,
          role: dto.role,
          salesTeamId: teamNode ? teamNode.id : u.salesTeamId,
          salesTeamName: teamNode ? teamNode.name : u.salesTeamName,
          dataScope: roleScopeInfo.scope,
          dataScopeLabel: roleScopeInfo.label,
        };
      });

      setBaseUsers(nextUsers);
      window.localStorage.setItem(
        USER_MANAGEMENT_STORAGE_KEYS.MANAGED_USERS,
        JSON.stringify(nextUsers)
      );
    },
    [baseUsers]
  );

  const addManagedUser = useCallback(
    (dto: CreateManagedUserDTO): IManagedUser => {
      const teamNode =
        INITIAL_SALES_TEAMS.find((t) => t.id === dto.salesTeamId) ?? INITIAL_SALES_TEAMS[0];
      const roleScopeInfo = ROLE_DATA_SCOPE_MAP[dto.role];
      const newUser: IManagedUser = {
        id: `usr-${Date.now()}`,
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        avatarUrl: createAvatarSvgDataUri(dto.fullName.trim(), baseUsers.length + 1),
        role: dto.role,
        title: dto.title.trim() || 'Chuyên viên Kinh doanh',
        department: teamNode.name,
        salesTeamId: teamNode.id,
        salesTeamName: teamNode.name,
        dataScope: roleScopeInfo.scope,
        dataScopeLabel: roleScopeInfo.label,
        status: 'Active',
        activeSessions: 1,
        lastActiveAt: 'Vừa khởi tạo',
        customersCount: 0,
        dealsCount: 0,
        totalPipelineArr: 0,
      };

      const nextUsers = [...baseUsers, newUser];
      setBaseUsers(nextUsers);
      window.localStorage.setItem(
        USER_MANAGEMENT_STORAGE_KEYS.MANAGED_USERS,
        JSON.stringify(nextUsers)
      );
      return newUser;
    },
    [baseUsers]
  );

  const reactivateUser = useCallback(
    (userId: string): void => {
      const nextUsers = baseUsers.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          status: 'Active' as const,
          activeSessions: 1,
          lastActiveAt: 'Vừa kích hoạt lại',
          deactivatedAt: undefined,
          deactivationReason: undefined,
          handedOverToUserId: undefined,
          handedOverToUserName: undefined,
        };
      });
      setBaseUsers(nextUsers);
      window.localStorage.setItem(
        USER_MANAGEMENT_STORAGE_KEYS.MANAGED_USERS,
        JSON.stringify(nextUsers)
      );
      syncDeactivatedEmailsStorage(nextUsers);
    },
    [baseUsers]
  );

  return {
    users,
    activeUsers,
    deactivatedUsers,
    salesTeams: INITIAL_SALES_TEAMS,
    handoverLogs,
    getCustomersForUser,
    getDealsForUser,
    deactivateAndHandoverUser,
    updateUserRoleAndTeam,
    addManagedUser,
    reactivateUser,
  };
}
