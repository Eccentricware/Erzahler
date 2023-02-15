export const createAccountProviderQuery = `
  INSERT INTO providers(
    user_id,
    uid,
    provider_type,
    display_name,
    email,
    email_verified,
    verification_deadline,
    creation_time,
    last_sign_in_time,
    photo_url
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10
  ) RETURNING
    provider_id;
`;
