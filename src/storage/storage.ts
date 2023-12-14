import { STORAGE_TYPE } from '../constant/file.contant';
import { IMessage, TMetaDataMapper, TWhere } from '../model/fileType.model';

export interface Storage {
  /*
    @param queryObject ({ where: TWhere, something else... }).
    @param metadata for each storage type
    @returns the expected output.
    @throws NotFoundError
  */
  get<T>(
    where: TWhere,
    metadata: TMetaDataMapper[STORAGE_TYPE],
  ): Promise<T | undefined>;

  /*
    @param queryObject ({ where: TWhere, something else... }).
    @param metadata for each storage type
    @returns the expected output.
    @throws NotFoundError
  */
  list<T>(where: TWhere, metadata: TMetaDataMapper[STORAGE_TYPE]): Promise<T>;

  // @param data The object to save (upsert).
  // @returns The ID of the saved object.
  save<T>(data: T, metadata: TMetaDataMapper[STORAGE_TYPE]): Promise<IMessage>;

  saveList<T>(
    data: T,
    metadata: TMetaDataMapper[STORAGE_TYPE],
  ): Promise<IMessage>;

  /*
    @param queryObject ({ where: TWhere, something else... }).
    @param metadata for each storage type
  */
  delete(
    where: TWhere,
    metadata: TMetaDataMapper[STORAGE_TYPE],
  ): Promise<IMessage>;
}
