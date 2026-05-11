import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User } from 'src/domain/user/user';
import {
  UserRepository,
  UserFilters,
  PaginatedResult,
} from 'src/domain/user/user-repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const newPrismaUser = await this.prisma.user.create({
      data: user,
    });

    return this.toDomainUser([newPrismaUser])[0];
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });
    return prismaUser ? this.toDomainUser([prismaUser])[0] : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return prismaUser ? this.toDomainUser([prismaUser])[0] : null;
  }

  async findAll(
    filters: UserFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<User>> {
    const where = {
      ...(filters.id && { id: filters.id }),
      ...(filters.email && {
        email: { contains: filters.email, mode: 'insensitive' as const },
      }),
      ...(filters.name && {
        name: { contains: filters.name, mode: 'insensitive' as const },
      }),
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    return this.toDomainUser([prismaUser])[0];
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
  private toDomainUser(prismaUsers: PrismaUser[]): User[] {
    const users: User[] = prismaUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    return users;
  }
}
