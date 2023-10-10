export const clearBuildTransferOrdersQuery = `
  DELETE FROM orders_transfers
  WHERE order_set_id = $1
    AND order_type = 1;
`;

export const insertBuildTransferOrdersQuery = `
  INSERT INTO orders_transfers (
    order_set_id,
    order_type,
    foreign_country_id,
    foreign_country_name,
    quantity,
    ui_row
  ) VALUES (
    $1,
    2,
    $2::INTEGER,
    CASE
      WHEN $2::INTEGER = NULL THEN $3
      WHEN $2::INTEGER = 0 THEN '--Do Not Offer Tech--'
      ELSE (SELECT country_name FROM countries WHERE country_id = $2::INTEGER)
    END,
    $3,
    $4
  );
`;

export const updateTechTransferOrdersQuery = `
  UPDATE orders_transfer_tech
  SET
    foreign_country_id = $1::INTEGER,
    foreign_country_name = CASE
      WHEN $1 = NULL THEN $2::TEXT
      WHEN $1::INTEGER = 0 THEN null
      ELSE (SELECT country_name FROM countries WHERE country_id = $1::INTEGER)
    END
  WHERE order_set_id = $3
  RETURNING tech_transfer_order_id;
`;

export const insertTechTransferOrdersQuery = `
  INSERT INTO orders_transfers (
    order_set_id,
    order_type,
    foreign_country_id,
    foreign_country_name
  ) VALUES (
    $1,
    2,
    $2::INTEGER,
    CASE
      WHEN $2::INTEGER = NULL THEN $3
      WHEN $2::INTEGER = 0 THEN '--Do Not Offer Tech--'
      ELSE (SELECT country_name FROM countries WHERE country_id = $2::INTEGER)
    END
  );
`;


