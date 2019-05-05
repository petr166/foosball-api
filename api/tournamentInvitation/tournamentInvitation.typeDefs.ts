import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    tournamentInvitations: [TournamentInvitation]! @isAuthenticated
  }

  # extend type Mutation {

  # }

  type TournamentInvitation {
    id: String!
    tournament: Tournament!
  }
`;
