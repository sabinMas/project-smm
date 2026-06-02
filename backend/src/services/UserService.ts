import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';

export class UserService {
  async createUser(email: string, name: string): Promise<User> {
    return prisma.user.create({
      data: { email, name },
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}

export const userService = new UserService();
