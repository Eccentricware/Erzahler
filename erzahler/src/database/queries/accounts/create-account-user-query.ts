export const createAccountUserQuery = `
  INSERT INTO users (
    username,
    username_locked,
    user_status,
    signup_time,
    last_sign_in_time,
    time_zone
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  ) RETURNING
    user_id,
    username,
    username_locked,
    user_status,
    signup_time,
    time_zone,
    meridiem_time,
    last_sign_in_time,
    classic_unit_render,
    city_render_size,
    label_render_size,
    unit_render_size,
    wins,
    nmr_total,
    nmr_orders,
    nmr_retreats,
    nmr_adjustments,
    dropouts,
    saves,
    color_theme,
    logged_in,
    display_presence,
    site_admin,
    real_name,
    display_real_name;
`;
