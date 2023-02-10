"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUserFromAccountsQuery = void 0;
exports.insertUserFromAccountsQuery = `
  INSERT INTO users (
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
    display_real_name
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
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    $17,
    $18,
    $19,
    $20,
    $21,
    $22,
    $23,
    $24,
    $25
  ) RETURNING
    user_id;
`;
//# sourceMappingURL=insert-user-from-accounts-query.js.map