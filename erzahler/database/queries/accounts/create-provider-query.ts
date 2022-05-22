export const createProviderQuery = `
  INSERT INTO providers(
    user_id,
    provider_type,
    uid,
    display_name,
    email,
    phone_number,
    photo_url
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7
  );
`;