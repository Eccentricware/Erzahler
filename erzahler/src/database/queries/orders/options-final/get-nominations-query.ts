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
    n.votes_required
  FROM nominations n
  INNER JOIN countries c ON c.country_id = any(n.country_ids)
  WHERE n.turn_id = $1
  GROUP BY n.nomination_id
  ORDER BY n.votes_required DESC;
`;
