// TODO: A factory that provides the storage provider based on the environment

import { Inject, Injectable } from '@nestjs/common';
import { FileStorage } from './file.storage';
import { generateResponseMessageUtil } from '../utils';
import { Storage } from './storage';
import { CUSTOM_STORAGE, STORAGE_TYPE } from '../constant/file.contant';
import { TBaseQuery, TMetaDataMapper } from '../model/fileType.model';

@Injectable()
export default class StorageProvider {
  constructor(
    @Inject(CUSTOM_STORAGE.FILE)
    private readonly fileStorage: FileStorage /* inject other services under (cache, external) */,
  ) {}

  someMethod(v: unknown) {
    console.log('just a temporary method', v);
    return v;
  }

  getStorageInstance(type: STORAGE_TYPE): Storage {
    switch (type) {
      case STORAGE_TYPE.FILE:
        return this.fileStorage;

      default:
        throw new Error('Storage type is not availabled');
    }
  }

  get<T>({ storage, metadata, where }: TBaseQuery) {
    const instance = this.getStorageInstance(storage);
    return instance?.get<T>(where, metadata as any);
  }
  list<T>({ storage, metadata, where }: TBaseQuery) {
    const instance = this.getStorageInstance(storage);
    return instance?.list<T>(where, metadata as any);
  }
  delete<T>({ storage, metadata, where }: TBaseQuery) {
    const instance = this.getStorageInstance(storage);
    return instance?.delete(where, metadata as any);
  }
  async save<T>(
    data: T,
    metadata: TMetaDataMapper[STORAGE_TYPE],
    storageType: STORAGE_TYPE,
  ) {
    const instance = this.getStorageInstance(storageType);
    try {
      return await instance?.save<T>(data, metadata as any);
    } catch (error) {
      return this.handleError(error);
    }
  }
  async saveList<T>(
    data: T,
    metadata: TMetaDataMapper[STORAGE_TYPE],
    storageType: STORAGE_TYPE,
  ) {
    const instance = this.getStorageInstance(storageType);
    try {
      return await instance?.saveList<T>(data, metadata as any);
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleError(error: any) {
    return generateResponseMessageUtil(error);
  }
}
