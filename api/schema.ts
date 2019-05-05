import { gql } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';

import directiveResolvers from './directiveResolvers';
import { userTypeDefs, userResolvers } from './user';
import { authTypeDefs, authResolvers } from './auth';
import { tournamentTypeDefs, tournamentResolvers } from './tournament';
import {
  tournamentInvitationTypeDefs,
  tournamentInvitationResolvers,
} from './tournamentInvitation';

const rootTypeDefs = gql`
  directive @isAuthenticated on FIELD | FIELD_DEFINITION

  type Query {
    empty: String
  }
  type Mutation {
    empty: String
  }

  schema {
    query: Query
    mutation: Mutation
  }

  interface Doc {
    createdAt: String!
    updatedAt: String!
  }
`;

export default makeExecutableSchema({
  typeDefs: [
    rootTypeDefs,
    userTypeDefs,
    authTypeDefs,
    tournamentTypeDefs,
    tournamentInvitationTypeDefs,
  ],
  resolvers: merge([
    { Doc: { __resolveType: () => null } },
    userResolvers,
    authResolvers,
    tournamentResolvers,
    tournamentInvitationResolvers,
  ]),
  directiveResolvers,
});
