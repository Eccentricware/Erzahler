export const getVotesOrdersQuery = `
  SELECT os.votes
  FROM order_sets os
  WHERE os.turn_id = $1
    AND os.country_id = $2;
`;

export const getVotesForResolutionQuery = `
  SELECT os.country_id,
    os.votes,
    lch.vote_count
  FROM order_sets os
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = os.country_id
  WHERE os.turn_id = $3;
`;