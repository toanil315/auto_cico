// get field value by string
// example: get(obj, "a.b.c")
export function get(obj: unknown, keys: string[] | string, defaultVal = null): any {
  keys = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, ".$2").split(".");
  obj = obj?.[keys[0] as keyof typeof obj];
  if (obj && keys.length > 1) {
    return get(obj, keys.slice(1), defaultVal);
  }
  return obj === undefined ? defaultVal : obj;
}
