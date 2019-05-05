import { gql } from 'apollo-server';

export default gql`
  extend type Mutation {
    login(input: LoginInput!): Login
  }

  type Login {
    token: String!
    user: User
  }

  input LoginInput {
    email: String!
    password: String!
  }
`;
