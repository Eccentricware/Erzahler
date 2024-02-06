export const getNominationsQuery = `
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
    n.yay_voter_ids,
    n.votes_received,
    n.winner,
    n.win_diff
  FROM nominations n
  INNER JOIN countries c ON c.country_id = any(n.country_ids)
  WHERE n.turn_id = $1
  GROUP BY n.nomination_id
  ORDER BY n.votes_required DESC;
`;
