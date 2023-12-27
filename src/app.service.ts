import { Injectable } from '@nestjs/common';
import { AppRepository } from './app.repository';
import { Leave, User } from './model';

@Injectable()
export class AppService {
  constructor(private readonly repository: AppRepository) {}

  getUsers() {
    return this.repository.getUsers();
  }

  upsertUser(user: User) {
    return this.repository.upsertUser(user);
  }

  async enableUser(params: { id: string; is_active: boolean }) {
    const users = await this.getUsers();
    const existingUser = users.find((user) => user.id === params.id);
    if (existingUser) {
      return this.repository.upsertUser({ ...existingUser, ...params });
    }
  }

  deleteUser(userId: string) {
    return this.repository.deleteUser(userId);
  }

  getLeaves() {
    return this.repository.getLeaves();
  }

  createLeave(leave: Leave) {
    return this.repository.createLeave({ ...leave, id: Date.now() });
  }

  deleteLeave(leaveId: number) {
    return this.repository.deleteLeave(leaveId);
  }
}
