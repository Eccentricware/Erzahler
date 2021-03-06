export const getUserProfileQuery = `
  SELECT
    u.username,
    u.username_locked,
    u.user_status,
    u.classic_unit_render,
    u.city_render_size,
    u.label_render_size,
    u.unit_render_size,
    u.nmr_count,
    u.dropouts,
    u.color_theme,
    u.display_presence,
    u.real_name,
    u.display_real_name,
    p.uid,
    p.provider_id as "provider_type",
    p.email,
    p.email_verified,
    p.verification_deadline
  FROM users u
  INNER JOIN providers p
  ON u.user_id = p.user_id
  WHERE p.user_id = u.user_id
  AND p.uid = $1
`;