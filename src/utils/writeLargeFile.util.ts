//@ts-nocheck
import * as fs from "fs";
import { RESPONSE_TYPE_ENUM } from "src/constant";
import { Transform } from "stream";

class Slicer extends Transform {
  constructor() {
    super();
  }

  _transform(chunk, encoding, done) {
    this.push(chunk);
    done();
  }
}

async function transformObject(obj, stream, isRoot = false) {
  const keys = Object.keys(obj);
  stream.write("{");
  for (let i = 0; i < keys.length; i++) {
    if (i > 0) {
      stream.write(",");
    }
    const key = keys[i];
    stream.write(`"${key}":`);
    await transformValue(obj[key], stream);
  }
  stream.write("}");
  if (isRoot) {
    stream.end();
  }
}

async function transformValue(value, stream) {
  const type = Object.prototype.toString.call(value);
  switch (type) {
    case "[object Array]":
      stream.write("[");
      for (let index = 0; index < value.length; index++) {
        await transformValue(value[index], stream);
        if (index + 1 < value.length) {
          stream.write(",");
        }
      }
      stream.write("]");
      break;
    case "[object Object]":
      await transformObject(value, stream);
      break;
    case "[object Number]":
    case "[object Boolean]":
    case "[object String]":
    case "[object Date]":
    case "[object Null]":
    case "[object Undefined]":
    default: {
      const canWrite = stream.write(`${JSON.stringify(value === undefined ? null : value)}`);
      if (!canWrite) {
        await new Promise((resolve, reject) => {
          stream.once("drain", resolve);
        });
      }
    }
  }
}

export const writeLargeJson = (filePath: string, data: any): Promise<RESPONSE_TYPE_ENUM> => {
  return new Promise((resolve, reject) => {
    if (typeof data !== "object") {
      reject(new Error("Please pass an object!"));
      return;
    }
    const writeStream = fs.createWriteStream(filePath, { encoding: "utf8" });
    const transformStream = new Slicer();
    transformStream.pipe(writeStream);
    transformStream.on("finish", () => {
      resolve(RESPONSE_TYPE_ENUM.SUCCESS);
    });
    transformStream.on("error", error => {
      reject(error);
    });
    transformObject(data, transformStream, true);
  });
};
