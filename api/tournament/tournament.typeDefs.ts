import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    tournament(id: ID!): Tournament @isAuthenticated
  }

  extend type Mutation {
    addTournament(input: TournamentInput!): Tournament @isAuthenticated
  }

  type Tournament implements Doc {
    id: ID!
    name: String!
    cover: String
    description: String
    startDate: String!
    endDate: String!
    privacy: String!
    teamSize: Int!
    maxPlayers: Int!
    minGames: Int!
    creatorUser: User!
    standings: [Standing]!
    createdAt: String!
    updatedAt: String!
  }

  input TournamentInput {
    name: String!
    cover: String
    description: String
    startDate: String!
    endDate: String!
    privacy: String
    teamSize: Int
    maxPlayers: Int
    minGames: Int
    inviteList: [ID]
  }

  type Standing implements Doc {
    user: User!
    played: Int!
    won: Int!
    points: Float!
    createdAt: String!
    updatedAt: String!
  }
`;
