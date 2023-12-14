export enum CUSTOM_STORAGE {
  FILE = "FILE",
  EXTERNAL = "EXTERNAL",
}

export enum STORAGE_TYPE {
  FILE = "FILE",
  CACHE = "CACHE",
  EXTERNAL = "EXTERNAL",
}

export enum OPERATOR {
  EQUALS = "equals",
  IN = "in",
  LT = "lt",
  LTE = "lte",
  GT = "gt",
  GTE = "gte",
  CONTAINS = "contains",
  START_WITHS = "startsWith",
  END_WITHS = "endWiths",
}

export enum CONDITION {
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
}

export enum FILE_STATUS {
  LOCK = 1,
  UNLOCK = 0,
}

export enum FILE_ACTION {
  WRITE = "WRITE",
  READ = "READ",
}
