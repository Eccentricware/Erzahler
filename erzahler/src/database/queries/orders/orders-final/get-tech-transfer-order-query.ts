// export const getTechTransferOrderQuery = `
//   SELECT c.country_id,
//     c.country_name,
//     ch.country_status,
//     os.tech_partner_id,
//     pc.country_name tech_partner_name,
//     CASE WHEN ch.nuke_range IS NOT NULL THEN true ELSE false END has_nukes
//   FROM order_sets os
//   INNER JOIN countries c ON c.country_id = os.country_id
//   INNER JOIN country_histories ch ON ch.country_id = c.country_id
//   INNER JOIN get_last_country_history($1, $2) lch
//     ON lch.country_id = ch.country_id AND lch.turn_id = ch.turn_id
//   LEFT JOIN countries pc ON pc.country_id = os.tech_partner_id
//   WHERE os.turn_id = $3
//     AND ch.country_status IN ('Active', 'Civil Disorder')
//     AND c.rank != 'n'
//     AND os.tech_partner_id != 0
//     AND CASE WHEN 0 = $4 THEN true ELSE os.country_id = $4 END;
// `;

export const getTechTransferOrderQuery = `
  SELECT
    ot.order_transfer_id,
    os.order_set_id,
    c.country_id,
    c.country_name,
    --ch.country_status,
    ot.foreign_country_id tech_partner_id,
    ot.foreign_country_name tech_partner_name
    --CASE WHEN ch.nuke_range IS NOT NULL THEN true ELSE false END has_nukes
  FROM orders_transfers ot
  INNER JOIN order_sets os ON os.order_set_id = ot.order_set_id
  INNER JOIN countries c ON c.country_id = os.country_id
  WHERE os.turn_id = $1
    AND os.country_id = $2
    AND ot.order_type IN (2, 3);
`;
