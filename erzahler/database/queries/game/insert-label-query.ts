export const insertLabelQuery = `
  INSERT INTO labels (
    province_id,
    label_name,
    label_type,
    loc,
    label_text,
    fill
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  );
`;