export const getUserProfileQuery = `
  SELECT
    u.user_id,
    u.username,
    u.username_locked,
    ud.user_status,
    us.classic_unit_render,
    us.city_render_size,
    us.label_render_size,
    us.unit_render_size,
    ud.nmr_total,
    ud.nmr_orders,
    ud.nmr_retreats,
    ud.nmr_adjustments,
    ud.dropouts,
    us.color_theme,
    us.display_presence,
    us.real_name,
    us.display_real_name,
    us.time_zone,
    us.meridiem_time,
    p.uid,
    p.provider_id as "provider_type",
    p.email,
    p.email_verified,
    p.verification_deadline,
    us.preferred_contact_method,
    us.contact_email,
    us.contact_discord,
    us.contact_slack,
    us.contact_in_game,
    us.other_contact_method,
    us.other_contact_handle
  FROM users u
  INNER JOIN providers p ON u.user_id = p.user_id
  INNER JOIN user_settings us ON us.user_id = u.user_id
  INNER JOIN user_details ud ON ud.user_id = u.user_id
  WHERE p.user_id = u.user_id
  AND p.uid = $1;
`;
