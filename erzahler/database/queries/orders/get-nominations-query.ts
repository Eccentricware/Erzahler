export const getNominationsQuery = `
  SELECT n.nomination_id,
    n.rank_signature,
    json_agg(json_build_object('country_id', c.country_id, 'country_name', c.country_name, 'country_rank', c.rank)) countries,
    n.votes_required
  FROM countries_in_nominations cn
  INNER JOIN countries c ON c.country_id = cn.country_id
  INNER JOIN nominations n ON n.nomination_id = cn.nomination_id
  WHERE n.turn_id = 61
  GROUP BY n.nomination_id,
    n.rank_signature,
    n.votes_required
`;