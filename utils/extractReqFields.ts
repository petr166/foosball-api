// const extractReqFieldsDeep = (selections: any[]): { root: string } => {
//   const deeperSelections: any = {};

//   selections.forEach(({ name: { value }, selectionSet }) => {
//     if (selectionSet) {
//       deeperSelections[value] = extractReqFieldsDeep(selectionSet.selections);
//     }
//   });

//   return {
//     root: selections
//       .filter((v: any) => !v.selectionSet)
//       .map(({ name: { value } }: any) => value)
//       .join(' '),
//     ...deeperSelections,
//   };
// };

// extract requested fields from grapql query
export default (info: any): { root: string } => {
  const {
    selectionSet: { selections },
  } = info.fieldNodes[0];

  return selections.map(({ name: { value } }: any) => value).join(' ');
};
