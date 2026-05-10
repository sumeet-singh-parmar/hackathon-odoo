import type { User, UserRole } from "@prisma/client";
import { prisma } from "@/core/prisma";

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  country: string;
  additionalInfo?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserInput {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  additionalInfo?: string | null;
  language?: string | null;
  avatarUrl?: string | null;
  password?: string;
  role?: UserRole;
}

export interface IUserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(id: number, input: UpdateUserInput): Promise<User>;
  delete(id: number): Promise<void>;
  setLastLogin(id: number): Promise<void>;
  list(opts: { skip: number; take: number }): Promise<{ items: User[]; total: number }>;
  countSince(date: Date): Promise<number>;
  countActiveSince(date: Date): Promise<number>;
}

export const userRepository: IUserRepository = {
  create: (input) => prisma.user.create({ data: input }),
  findById: (id) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findByUsername: (username) => prisma.user.findUnique({ where: { username } }),
  update: (id, input) => prisma.user.update({ where: { id }, data: input }),
  delete: async (id) => {
    await prisma.user.delete({ where: { id } });
  },
  setLastLogin: async (id) => {
    await prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },
  list: async ({ skip, take }) => {
    const [items, total] = await Promise.all([
      prisma.user.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      prisma.user.count(),
    ]);
    return { items, total };
  },
  countSince: (date) => prisma.user.count({ where: { createdAt: { gte: date } } }),
  countActiveSince: (date) => prisma.user.count({ where: { lastLoginAt: { gte: date } } }),
};
