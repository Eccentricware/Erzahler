export const getBuildTransferOrdersQuery = `
  SELECT
    pc.country_id player_country_id,
    pc.country_name player_country_name,
    json_agg(
      json_build_object(
        'country_id', rc.country_id,
        'country_name', rc.country_name
      )
    ) AS build_transfer_recipients,
    os.build_transfer_tuples
  FROM order_sets os
  INNER JOIN countries pc ON pc.country_id = os.country_id
  INNER JOIN countries rc ON rc.country_id = any(os.build_transfer_recipients)
  WHERE turn_id = $1
    AND order_set_type = 'Orders'
    AND CASE WHEN 0 = $2 THEN true ELSE pc.country_id = $2 END
  GROUP BY os.order_set_id,
    pc.country_id,
    pc.country_name
  ORDER BY pc.country_id;
`;
