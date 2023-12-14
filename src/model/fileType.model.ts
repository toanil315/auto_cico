import { CONDITION, OPERATOR, STORAGE_TYPE } from '../constant';

export type TObject = Record<string, unknown>;

export type TMetaDataMapper = {
  [STORAGE_TYPE.FILE]: {
    pathToFile: string;
    rootProperty: string;
  };
  [STORAGE_TYPE.CACHE]: {
    something: unknown;
  };
  [STORAGE_TYPE.EXTERNAL]: {
    url: string;
  };
};

// `where` type
type TEquals = { [OPERATOR.EQUALS]: string | number | boolean };
type TIn = { [OPERATOR.IN]: (string | number)[] };
type TLt = { [OPERATOR.LT]: number };
type TLte = { [OPERATOR.LTE]: number };
type TGt = { [OPERATOR.GT]: number };
type TGte = { [OPERATOR.GTE]: number };
type TContains = { [OPERATOR.CONTAINS]: string };
type TStartWiths = { [OPERATOR.START_WITHS]: string };
type TEndWiths = { [OPERATOR.END_WITHS]: string };

export type TOperatorQuery = {
  [k: string]:
    | TEquals
    | TIn
    | TLt
    | TLte
    | TGt
    | TGte
    | TContains
    | TStartWiths
    | TEndWiths;
};

export type TAnd = { [CONDITION.AND]: TOperatorQuery[] };
export type TOr = { [CONDITION.OR]: TOperatorQuery[] };
export type TNot = { [CONDITION.NOT]: TOperatorQuery & TAnd & TOr };
export type TConditionQuery = TAnd | TOr | TNot;

export type TWhere = TOperatorQuery | TConditionQuery;

export type TQueryObject = {
  where: TWhere;
};

export type TBaseQuery = {
  storage: STORAGE_TYPE;
  metadata: TMetaDataMapper[STORAGE_TYPE];
} & TQueryObject;
export type IMessage = {
  [key: string]: any;
};
