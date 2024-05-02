export const getHistoricVotesQuery = `
  WITH votes AS (
    SELECT n.nomination_id,
      jsonb_agg(
        jsonb_build_object(
          'country_id', c.country_id,
              'country_name', c.country_name,
          'votes_controlled', lch.vote_count
        )
      ) yay_votes
    FROM nominations n
    INNER JOIN countries c ON c.country_id = any(n.yay_voter_ids)
    INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
    INNER JOIN turns t ON t.turn_id = n.turn_id
    WHERE t.game_id = $1
      AND t.turn_number = $2
    GROUP BY n.nomination_id
  )
  SELECT n.nomination_id,
    json_agg(
      json_build_object(
        'country_id', c.country_id,
        'country_name', c.country_name,
        'rank', c.rank
      )
    ) countries,
    n.signature,
    n.votes_required,
    n.votes_received,
    n.winner,
    v.yay_votes
  FROM nominations n
  INNER JOIN turns t ON t.turn_id = n.turn_id
  INNER JOIN countries c ON c.country_id = any(n.country_ids)
  LEFT JOIN votes v ON v.nomination_id = n.nomination_id
  WHERE t.game_id = $1
    AND t.turn_number = $2
  GROUP BY n.nomination_id,
    v.yay_votes
  ORDER BY n.signature;
`;