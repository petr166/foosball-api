import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    users: [User] @isAuthenticated
    user(id: ID!): User @isAuthenticated
  }

  extend type Mutation {
    register(input: RegisterInput!): Login
    editUser(input: EditUserInput!): User @isAuthenticated
  }

  type User implements Doc {
    id: ID!
    email: String!
    name: String!
    avatar: String
    winStats: [Int]!
    createdAt: String!
    updatedAt: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    repeatPassword: String!
  }

  input EditUserInput {
    name: String
    email: String
    password: String
    repeatPassword: String
    avatar: String
    facebookId: String
  }
`;
