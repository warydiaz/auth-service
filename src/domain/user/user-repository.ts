import { User } from './user';

export interface UserRepository {
  save(input: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(
    filters: UserFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<User>>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  id?: string;
  name?: string;
  email?: string;
}
