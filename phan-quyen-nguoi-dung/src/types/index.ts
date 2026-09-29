export interface IUser {
  id: string;
  name: string;
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'DIRECTOR';
  teamId: string;
}

export interface ICustomer {
  id: string;
  name: string;
  ownerId: string;
  teamId: string;
  company: string;
}
