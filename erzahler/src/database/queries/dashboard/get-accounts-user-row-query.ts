export const getAccountsUserRowQuery = `
  SELECT
    u.user_id,
    u.username,
    u.username_locked,
    u.user_status,
    u.signup_time,
    u.time_zone,
    u.meridiem_time,
    u.last_sign_in_time,
    u.classic_unit_render,
    u.city_render_size,
    u.label_render_size,
    u.unit_render_size,
    u.wins,
    u.nmr_total,
    u.nmr_orders,
    u.nmr_retreats,
    u.nmr_adjustments,
    u.dropouts,
    u.saves,
    u.color_theme,
    u.logged_in,
    u.display_presence,
    u.site_admin,
    u.real_name,
    u.display_real_name
  FROM users u
  INNER JOIN providers p
  ON u.user_id = p.user_id
  WHERE p.user_id = u.user_id
  AND p.uid = $1
`;
