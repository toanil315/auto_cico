import { writeFile } from 'fs/promises';
import {
  processAddOrUpdateItemToList,
  writeLargeJson,
  readLargeFileUtil,
  PromiseQueue,
  generateResponseMessageUtil,
} from '../utils';
import * as fs from 'fs';
import { filterFn } from '../utils/query.utils';
import { Storage } from './storage';
import {
  IMessage,
  TMetaDataMapper,
  TObject,
  TWhere,
} from '../model/fileType.model';
import {
  FILE_ACTION,
  FILE_STATUS,
  STORAGE_TYPE,
} from '../constant/file.contant';

export class FileStorage implements Storage {
  private lockFilePaths: string[] = [];
  private queues: Record<string, PromiseQueue> = {};

  lockFile(filePath: string) {
    this.lockFilePaths.push(filePath);
  }

  releaseFileLock(filePath: string) {
    this.lockFilePaths = this.lockFilePaths.filter((path) => path !== filePath);
  }

  checkLock(filePath: string) {
    return this.lockFilePaths.find((path) => path === filePath)
      ? FILE_STATUS.LOCK
      : FILE_STATUS.UNLOCK;
  }

  async waitForFileLock(
    action: FILE_ACTION,
    filePath: string,
    callBack: () => Promise<IMessage | string>,
  ): Promise<IMessage | string> {
    try {
      if (!this.queues[filePath]) {
        this.queues[filePath] = new PromiseQueue(filePath);
      }
      if (action === FILE_ACTION.WRITE) {
        const result = (await this.queues[filePath].add(callBack)) as
          | IMessage
          | string;
        return result;
      }
      const result = await callBack();
      return result;
    } catch (error) {
      return generateResponseMessageUtil(error);
    }
  }

  async delete<T>(
    where: TWhere,
    metadata: TMetaDataMapper[STORAGE_TYPE.FILE],
  ): Promise<IMessage> {
    const { pathToFile, rootProperty } = metadata;
    const fileData = await fs.promises.readFile(pathToFile, 'utf8');
    const jsonData = JSON.parse(fileData);
    const list = jsonData[rootProperty] as TObject[];
    if (list === undefined) {
      return generateResponseMessageUtil('not found root key in data!');
    }
    const newData = list.filter((i) => !filterFn(i, { where }));
    if (newData === undefined) throw new Error('NotFoundError');
    return this.waitForFileLock(FILE_ACTION.WRITE, pathToFile, () =>
      writeFile(
        pathToFile,
        JSON.stringify({ ...jsonData, [rootProperty]: newData }, null, 2),
        'utf8',
      )
        .then(() => {
          return generateResponseMessageUtil('success');
        })
        .catch((err) => {
          return generateResponseMessageUtil(err);
        }),
    ) as IMessage;
  }

  async get<T>(
    where: TWhere,
    metadata: TMetaDataMapper[STORAGE_TYPE.FILE],
  ): Promise<T | undefined> {
    try {
      const { pathToFile, rootProperty } = metadata;
      let jsonData = (await this.waitForFileLock(
        FILE_ACTION.READ,
        pathToFile,
        async () => await readLargeFileUtil(pathToFile, 'utf8'),
      )) as Record<string, any>;
      if (jsonData) {
        const list = jsonData[rootProperty] as TObject[];
        if (Array.isArray(list)) {
          const res = list.find((i) => filterFn(i, { where }));
          if (res === undefined) throw new Error('NotFoundError');
          return res as T;
        } else {
          if (Object.keys(where).length == 0) {
            return list;
          }
          return undefined;
        }
      } else {
        if (!jsonData) throw new Error('File not found or file empty');
      }
    } catch (error) {
      return null as T;
    }
  }

  async list<T>(
    where: TWhere,
    metadata: TMetaDataMapper[STORAGE_TYPE.FILE],
  ): Promise<T> {
    try {
      const { pathToFile, rootProperty } = metadata;
      let jsonData = (await this.waitForFileLock(
        FILE_ACTION.READ,
        pathToFile,
        async () => await readLargeFileUtil(pathToFile, 'utf8'),
      )) as Record<string, any>;
      const list = jsonData[rootProperty] as TObject[];
      if (Object.keys(where).length == 0) {
        return list as T;
      } else {
        const res = list.filter((i) => filterFn(i, { where }));
        if (res === undefined) throw new Error('NotFoundError');
        return res as T;
      }
    } catch (error) {
      return [] as T;
    }
  }

  async save<T>(
    data: T,
    metadata: TMetaDataMapper[STORAGE_TYPE.FILE],
  ): Promise<IMessage> {
    const { pathToFile, rootProperty } = metadata;
    let jsonData = await readLargeFileUtil(pathToFile, 'utf8');
    let list = jsonData[rootProperty];
    list = processAddOrUpdateItemToList(data, list);
    return this.waitForFileLock(FILE_ACTION.WRITE, pathToFile, async () => {
      await writeLargeJson(pathToFile, { [rootProperty]: list });
      return generateResponseMessageUtil('success');
    }) as IMessage;
  }

  async saveList<T>(
    data: T,
    metadata: TMetaDataMapper[STORAGE_TYPE.FILE],
  ): Promise<IMessage> {
    const { pathToFile, rootProperty } = metadata;
    return this.waitForFileLock(FILE_ACTION.WRITE, pathToFile, async () => {
      await writeLargeJson(pathToFile, { [rootProperty]: data });
      return generateResponseMessageUtil('success');
    }) as IMessage;
  }

  trimFileData(fileData: string) {
    fileData = fileData.trim();
    if (fileData[0] === '[' && fileData[fileData.length - 1] === ']') {
      return fileData.slice(1, -1);
    }
    return fileData;
  }
}
