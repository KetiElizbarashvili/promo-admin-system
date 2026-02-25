export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'SUPER_ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface LoginResponse {
  user: User;
}

export interface Participant {
  id: number;
  uniqueId: string;
  firstName: string;
  lastName: string;
  govId: string;
  phone: string;
  email: string;
  totalPoints: number;
  activePoints: number;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
}

export interface Prize {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  costPoints: number;
  stockQty: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  uniqueId: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  activePoints: number;
}

export interface TransactionLog {
  id: number;
  type: string;
  participantId: number | null;
  participantName: string | null;
  staffUserId: number | null;
  staffName: string | null;
  pointsChange: number | null;
  prizeId: number | null;
  prizeName: string | null;
  note: string | null;
  createdAt: string;
}

export interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'SUPER_ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface RegistrationSession {
  sessionId: string;
  participant: {
    firstName: string;
    lastName: string;
    govId: string;
    phone: string;
    email: string;
  };
  step: 'phone' | 'email' | 'complete';
}
