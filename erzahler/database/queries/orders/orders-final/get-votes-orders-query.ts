export const getVotesOrdersQuery = `
  SELECT os.votes
  FROM order_sets os
  WHERE os.turn_id = $1
    AND os.country_id = $2;
`;