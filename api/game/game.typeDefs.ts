import { gql } from 'apollo-server';

export default gql`
  # extend type Query {
  #   tournamentInvitations: [TournamentInvitation]! @isAuthenticated
  # }

  extend type Mutation {
    createGame(input: GameInput!): Game @isAuthenticated
  }

  type Game implements Doc {
    id: String!
    tournament: Tournament!
    creatorUser: User!
    time: String!
    team1: [User]!
    team2: [User]!
    score1: Float!
    score2: Float!
    createdAt: String!
    updatedAt: String!
  }

  input GameInput {
    tournament: ID!
    time: String!
    team1: [ID]!
    team2: [ID]!
    score1: Float!
    score2: Float!
  }
`;
