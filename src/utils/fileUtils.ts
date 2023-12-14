export const processAddOrUpdateItemToList = <T>(
  element: T,
  listData: T[] = [],
) => {
  const elementIndex = listData.findIndex(
    (item) => (item as any).id === (element as any).id,
  );
  if (elementIndex === -1) {
    listData.push(element);
  } else {
    listData[elementIndex] = element;
  }

  return listData;
};
