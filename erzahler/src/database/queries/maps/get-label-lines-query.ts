export const getLabelLinesQuery = `
  SELECT l.label_line_name,
    l.x1,
    l.x2,
    l.y1,
    l.y2,
    l.stroke
  FROM label_lines l
  INNER JOIN provinces p ON p.province_id = l.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  WHERE g.game_id = $1;
`;
