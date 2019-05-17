import { fieldsProjection, FieldsListOptions } from 'graphql-fields-list';
import { merge } from 'lodash';
import { GraphQLResolveInfo } from 'graphql';

export interface FieldProjectionOptions extends FieldsListOptions {
  resolvableFields?: string[];
}

export const fieldsProjectionX = (
  info: GraphQLResolveInfo,
  {
    resolvableFields = [],
    skip = [],
    ...extraOptions
  }: FieldProjectionOptions = {}
) => {
  const options = { transform: { id: '_id' } };
  const enhancedSkip = [...skip, ...resolvableFields.map(v => v + '.*')];
  merge(options, extraOptions, { skip: enhancedSkip });

  const projection = fieldsProjection(info, options);

  Object.keys({ ...projection }).forEach(key => {
    const propList = key.split('.');

    if (propList.length > 1) {
      if (propList[propList.length - 1] === 'id') {
        propList[propList.length - 1] = '_id';
        projection[propList.join('.')] = projection[key];
        delete projection[key];
      }

      propList.forEach((prop, index) => {
        const newPropName = propList.slice(0, index + 1).join('.');
        if (projection[newPropName] === undefined) projection[newPropName] = 1;
      });
    }
  });

  resolvableFields.forEach(v => {
    projection[v] = 1;
  });

  return projection;
};
