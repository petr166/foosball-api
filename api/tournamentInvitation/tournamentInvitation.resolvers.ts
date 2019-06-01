import { TournamentInvitation } from '../../models';
import { tournamentFromParent } from '../tournament/tournament.resolvers';
import { fieldsProjectionX } from '../../utils';

export const tournamentInvitations = async (
  p: any,
  {
    first,
    cursor,
  }: {
    first: number;
    cursor: number;
  },
  { currentUser }: any,
  info: any
) => {
  const { docs, totalDocs = 0 } = await TournamentInvitation.paginate(
    {
      user: currentUser.id,
    },
    {
      limit: first,
      offset: cursor,
      select: fieldsProjectionX(info, {
        path: 'edges.node',
      }),
      sort: '-createdAt',
    }
  );

  const hasNextPage = totalDocs > cursor + first;

  return {
    totalCount: totalDocs,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? cursor + first : totalDocs,
    },
    edges: docs.map((doc, i) => ({
      node: doc.toObject(),
      cursor: cursor + i + 1,
    })),
  };
};

export default {
  Query: {
    tournamentInvitations,
  },
  TournamentInvitation: {
    tournament: tournamentFromParent('tournament'),
  },
};
