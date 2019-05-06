const extractReqFieldsDeep = (selections: any[], key: string = ''): string => {
  let deeperSelections = key ? key + ' ' : '';
  const prefix = key ? key + '.' : '';

  selections.forEach(({ name: { value }, selectionSet }) => {
    if (selectionSet) {
      deeperSelections += extractReqFieldsDeep(
        selectionSet.selections,
        prefix + value
      );
    }
  });

  return (
    prefix +
    '_id' +
    ' ' +
    selections
      .filter((v: any) => !v.selectionSet)
      .map(({ name: { value } }: any) => prefix + value)
      .join(' ') +
    ' ' +
    deeperSelections
  );
};

// extract requested fields from grapql query
export default (info: any): string => {
  const {
    selectionSet: { selections },
  } = info.fieldNodes[0];

  return extractReqFieldsDeep(selections);
};
