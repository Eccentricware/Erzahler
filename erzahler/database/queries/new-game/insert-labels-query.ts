export const insertLabelsQuery = `
  INSERT INTO labels (
    province_id,
    loc,
    label_text
  ) VALUES (
    $1,
    $2,
    $3
  );
`;