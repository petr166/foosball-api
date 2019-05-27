import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    tournament(id: ID!): Tournament @isAuthenticated
    tournaments(
      term: String
      category: String
      first: Int!
      cursor: Int!
    ): TournamentsPaginated! @isAuthenticated
  }

  extend type Mutation {
    createTournament(input: TournamentInput!): Tournament @isAuthenticated
    editTournament(id: ID!, input: EditTournamentInput!): Tournament
      @isAuthenticated
    joinTournament(id: ID!): Tournament @isAuthenticated
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

  input EditTournamentInput {
    name: String
    cover: String
    description: String
    startDate: String
    endDate: String
    privacy: String
    teamSize: Int
    maxPlayers: Int
    minGames: Int
  }

  type Standing implements Doc {
    id: String!
    user: User!
    played: Int!
    won: Int!
    points: Float!
    createdAt: String!
    updatedAt: String!
  }

  type TournamentsPaginated implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [TournamentEdge]!
  }

  type TournamentEdge {
    cursor: Int!
    node: Tournament
  }
`;
