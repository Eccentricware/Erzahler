export const getUserWithEmailProviderQuery = `
  SELECT u.username,
    u.user_status,
    u.email as "user_email",
    u.email_verified as "user_email_verified",
    u.verification_deadline,
    p.uid,
    p.email as "provider_email",
    p.email_verified as "provider_email_verified"
  FROM users u
  INNER JOIN providers p
  ON u.user_id = p.user_id
  WHERE p.uid = $1;
`;

// If email is NOT verified
//  => u.user_status = 'unverified'
    // u.email = {oldEmail}
//  => u.email_verified = false
//  => u.verification_deadline = {DateTime}
    // p.uid {uid}
    // p.email {oldEmail}
//  => p.email_verified null

// I email is ALREADY verified
//  => u.user_status = 'active'
    // u.email = {oldEmail}
//  => u.email_verified = true
//  => u.verification_deadline = null
    // p.uid {uid}
    // p.email {oldEmail}
//  => p.email_verified true