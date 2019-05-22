import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    users(term: String, first: Int!, cursor: Int!): UsersPaginated!
      @isAuthenticated
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
    trophyCount: Int!
    games(first: Int!, cursor: Int!): UserGamesConnection!
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

  type UserGamesConnection implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [UserGamesEdge]!
  }

  type UserGamesEdge {
    cursor: Int!
    node: Game
  }

  type UsersPaginated implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [UserEdge]!
  }

  type UserEdge {
    cursor: Int!
    node: User
  }
`;
