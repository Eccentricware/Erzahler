export const resolveVotingQuery = `
  WITH votes_received AS (
    SELECT c.country_id voting_country_id,
      c.country_name voting_country,
      v.nomination_id,
      v.declaration,
      lch.vote_count
    FROM votes v
    INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = v.voting_country_id
    INNER JOIN countries c ON c.country_id = lch.country_id
  )
  SELECT n.nomination_id,
    n.signature,
    n.votes_required,
    n.country_ids,
    ARRAY_AGG(c.country_name) nominated_countries,
    vr.voting_country_id,
    vr.voting_country,
    vr.declaration,
    vr.vote_count
  FROM nominations n
  LEFT JOIN votes_received vr ON vr.nomination_id = n.nomination_id
  INNER JOIN countries c ON c.country_id = any(n.country_ids)
  GROUP BY n.nomination_id,
    n.country_ids,
    nominator_id,
    vr.voting_country_id,
    vr.voting_country,
    vr.declaration,
    vr.vote_count
  ORDER BY n.signature;
`;