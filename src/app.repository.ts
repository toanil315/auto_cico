import { Injectable } from '@nestjs/common';
import StorageProvider from './storage/storage.provider';
import { STORAGE_TYPE } from './constant';
import { Leave, User } from './model';

@Injectable()
export class AppRepository {
  private CONFIG_PATH = './config.json';
  private LEAVE_PATH = './leaves.json';

  constructor(private readonly store: StorageProvider) {}

  async getUsers(): Promise<User[]> {
    const users = await this.store.list<User[]>({
      storage: STORAGE_TYPE.FILE,
      where: {},
      metadata: {
        pathToFile: this.CONFIG_PATH,
        rootProperty: 'data',
      },
    });
    return users || [];
  }

  async upsertUser(user: User) {
    return this.store.save(
      user,
      {
        pathToFile: this.CONFIG_PATH,
        rootProperty: 'data',
      },
      STORAGE_TYPE.FILE,
    );
  }

  async deleteUser(userId: string) {
    return this.store.delete({
      storage: STORAGE_TYPE.FILE,
      metadata: {
        pathToFile: this.CONFIG_PATH,
        rootProperty: 'data',
      },
      where: {
        id: {
          equals: userId,
        },
      },
    });
  }

  async getLeaves(): Promise<Leave[]> {
    const leaves = await this.store.list<Leave[]>({
      storage: STORAGE_TYPE.FILE,
      where: {},
      metadata: {
        pathToFile: this.LEAVE_PATH,
        rootProperty: 'data',
      },
    });
    return leaves || [];
  }

  async createLeave(leave: Leave) {
    return this.store.save(
      leave,
      {
        pathToFile: this.LEAVE_PATH,
        rootProperty: 'data',
      },
      STORAGE_TYPE.FILE,
    );
  }

  async deleteLeave(leaveId: number) {
    return this.store.delete({
      storage: STORAGE_TYPE.FILE,
      where: {
        id: {
          equals: leaveId,
        },
      },
      metadata: {
        pathToFile: this.LEAVE_PATH,
        rootProperty: 'data',
      },
    });
  }
}
