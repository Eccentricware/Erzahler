export const getLabelsQuery = `
  SELECT l.label_name,
    l.label_type,
    l.loc,
    l.label_text,
    l.fill,
    p.province_name
  FROM labels l
  INNER JOIN provinces p ON p.province_id = l.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  WHERE g.game_id = $1;
`;
