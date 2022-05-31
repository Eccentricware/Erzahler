export const createProviderQuery = `
  INSERT INTO firebase_providers(
    user_id,
    uid,
    provider_id,
    display_name,
    email,
    photo_url,
    creation_time,
    last_sign_in_time
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8
  );
`;