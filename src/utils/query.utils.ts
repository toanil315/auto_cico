import { CONDITION, OPERATOR } from '../constant/file.contant';
import {
  TAnd,
  TNot,
  TObject,
  TOperatorQuery,
  TOr,
  TQueryObject,
  TWhere,
} from '../model/fileType.model';
import { get } from './get.util';

// property value of a record
const operatorsToFn = (
  proVal: number | string,
  filMeta: TOperatorQuery[OPERATOR],
) => {
  filMeta = filMeta ?? ({} as any);

  if (OPERATOR.EQUALS in filMeta) {
    const filVal = filMeta.equals;
    return proVal === filVal;
  }

  if (OPERATOR.CONTAINS in filMeta) {
    const filVal = filMeta.contains;
    if (typeof proVal === 'number' || typeof filVal === 'number') return false;
    return proVal.includes(filVal);
  }

  if (OPERATOR.IN in filMeta) {
    const filVal = filMeta.in;
    if (!Array.isArray(filVal)) return false;
    return filVal.includes(proVal);
  }

  if (OPERATOR.LT in filMeta) {
    const filVal = filMeta.lt;
    if (typeof proVal === 'string' || typeof filVal === 'string') return false;
    return proVal < filVal;
  }

  if (OPERATOR.LTE in filMeta) {
    const filVal = filMeta.lte;
    if (typeof proVal === 'string' || typeof filVal === 'string') return false;
    return proVal <= filVal;
  }

  if (OPERATOR.GT in filMeta) {
    const filVal = filMeta.gt;
    if (typeof proVal === 'string' || typeof filVal === 'string') return false;
    return proVal > filVal;
  }

  if (OPERATOR.GTE in filMeta) {
    const filVal = filMeta.gte;
    if (typeof proVal === 'string' || typeof filVal === 'string') return false;
    return proVal >= filVal;
  }

  if (OPERATOR.START_WITHS in filMeta) {
    const filVal = filMeta.startsWith;
    if (typeof proVal === 'number' || typeof filVal === 'number') return false;
    return proVal[0] === filVal;
  }

  if (OPERATOR.END_WITHS in filMeta) {
    const filVal = filMeta.endWiths;
    if (typeof proVal === 'number' || typeof filVal === 'number') return false;
    if (proVal.length === 0) return false;
    return proVal[proVal.length - 1] === filVal;
  }

  return false;
};

// filter with the `OnlyOperator` object where with one property
const OnlyOneOperatorQuery = (data: TObject, where: TOperatorQuery) => {
  const k = Object.keys(where)[0];

  const proVal = get(data, k);
  const filMeta = where[k as OPERATOR];
  return operatorsToFn(proVal as string | number, filMeta);
};

// filter with the `OnlyCondition` object where with one property
const OnlyOneConditionQuery = (data: TObject, where: TWhere): boolean => {
  if (CONDITION.AND in where) {
    const result: boolean[] = [];
    const subWheres = where.AND;
    for (const wh of subWheres as TAnd[CONDITION.AND]) {
      if (wh) {
        result.push(OnlyOneConditionQuery(data, wh));
      }
    }
    return result.every((r) => r);
  }
  if (CONDITION.OR in where) {
    const result: boolean[] = [];
    const subWheres = where.OR;
    for (const wh of subWheres as TOr[CONDITION.OR]) {
      result.push(OnlyOneConditionQuery(data, wh));
    }
    return result.some((r) => r);
  }
  if (CONDITION.NOT in where) {
    const subWhere = where.NOT as TNot[CONDITION.NOT];
    return !OnlyOneConditionQuery(data, subWhere);
  }

  return OnlyOneOperatorQuery(data, where);
};

export const filterFn = (data: TObject, { where }: TQueryObject) => {
  return OnlyOneConditionQuery(data, where);
};

/**
 * To combine a base filter with a list of
 * extra filter tupples that use the equals operator.: `[[ name, 'abc' ], [ age, 3 ]]`
 */
export const mergeFilterWithExtraEquals = (
  baseFilter: TWhere | undefined,
  list: [string, string | number][],
) => {
  const whereCondition: {
    AND: TOperatorQuery[];
  } = {
    AND: [],
  };

  for (const item of list) {
    whereCondition.AND.push({
      [item[0]]: {
        equals: item[1],
      },
    });
  }

  if (baseFilter) {
    if (CONDITION.AND in baseFilter) {
      whereCondition.AND = whereCondition.AND.concat((baseFilter as TAnd).AND);
    } else {
      whereCondition.AND.push(baseFilter as TOperatorQuery);
    }
  }

  return whereCondition as TWhere;
};

export function mergeFilterWithRole(
  baseFilter: TWhere | undefined,
  role: string,
) {
  const whereCondition: {
    AND: TOperatorQuery[];
  } = {
    AND: [
      {
        roles: { contains: role },
      },
    ],
  };

  if (baseFilter) {
    if ((baseFilter as unknown as TAnd).AND) {
      whereCondition.AND = whereCondition.AND.concat(
        (baseFilter as unknown as TAnd).AND,
      );
    } else {
      whereCondition.AND.push(baseFilter as TOperatorQuery);
    }
  }
  return whereCondition as TWhere;
}
