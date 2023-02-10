export const getOrderSetQuery = `
  WITH build_transfers AS (
    SELECT  os.order_set_id,
      json_agg(
        json_build_object(
          'country_id', rc.country_id,
          'country_name', rc.country_name
        )

      ) AS build_transfers
    FROM order_sets os
    INNER JOIN countries pc ON pc.country_id = os.country_id
    INNER JOIN countries rc ON rc.country_id = any(os.build_transfer_recipients)
    WHERE turn_id = $1
        AND order_set_type = 'Orders'
      AND pc.country_id = $2
      AND CASE WHEN $2 = 0 THEN true ELSE pc.country_id = $2 END
    GROUP BY os.order_set_id
  )
  SELECT
    os.order_set_id,
    pc.country_id,
    pc.country_name,
    os.default_orders,
    os.tech_partner_id,
    os.new_unit_types,
    os.new_unit_locs,
    os.units_disbanding,
    bt.build_transfers build_transfer_recipients,
    os.build_transfer_amounts
  FROM order_sets os
  INNER JOIN countries pc ON pc.country_id = os.country_id
  LEFT JOIN build_transfers bt ON bt.order_set_id = os.order_set_id
  WHERE turn_id = $1
    AND order_set_type = 'Orders'
    AND pc.country_id = $2
    AND CASE WHEN $2 = 0 THEN true ELSE pc.country_id = $2 END;
`;
