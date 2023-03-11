export const getUserProfileQuery = `
  SELECT
    u.user_id,
    u.username,
    u.username_locked,
    u.user_status,
    u.classic_unit_render,
    u.city_render_size,
    u.label_render_size,
    u.unit_render_size,
    u.nmr_total,
    u.nmr_orders,
    u.nmr_retreats,
    u.nmr_adjustments,
    u.dropouts,
    u.color_theme,
    u.display_presence,
    u.real_name,
    u.display_real_name,
    u.time_zone,
    u.meridiem_time,
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
