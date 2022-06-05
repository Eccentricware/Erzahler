export const getUserProfileQuery = `
  SELECT u.username,
    u.user_status,
    u.email,
    u.email_verified,
    u.verification_deadline,
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
    json_agg (
      json_build_array (
        p.provider_id
      )
    ) as "providers"
  FROM users u
  INNER JOIN firebase_providers p
  ON u.user_id = p.user_id
  WHERE p.uid = $1
  AND p.user_id = u.user_id
  GROUP BY u.username,
    u.user_status,
    u.email,
    u.email_verified,
    u.verification_deadline,
    u.classic_unit_render,
    u.city_render_size,
    u.label_render_size,
    u.unit_render_size,
    u.nmr_count,
    u.dropouts,
    u.color_theme,
    u.display_presence,
    u.real_name,
    u.display_real_name;
`;