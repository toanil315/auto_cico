import { Module } from "@nestjs/common";
import { CUSTOM_STORAGE } from "../constant/file.contant";
import { FileStorage } from "./file.storage";
import StorageProvider from "./storage.provider";

@Module({
  imports: [],
  providers: [
    {
      provide: CUSTOM_STORAGE.FILE,
      useValue: new FileStorage(),
    },
    StorageProvider,
  ],
  exports: [StorageProvider],
})
export default class StorageModule {}
