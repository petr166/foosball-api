import { gql } from 'apollo-server';

export default gql`
  extend type Query {
    tournamentInvitations(
      first: Int!
      cursor: Int!
    ): TournamentInvitationsPaginated! @isAuthenticated
  }

  # extend type Mutation {

  # }

  type TournamentInvitation {
    id: String!
    tournament: Tournament!
  }

  type TournamentInvitationsPaginated implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [TournamentInvitationEdge]!
  }

  type TournamentInvitationEdge {
    cursor: Int!
    node: TournamentInvitation
  }
`;
