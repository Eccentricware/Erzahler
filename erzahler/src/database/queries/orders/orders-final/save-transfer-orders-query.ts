export const updateTechTransferOrdersQuery = `
  UPDATE orders_transfers
  SET
    foreign_country_id = $1::INTEGER,
    foreign_country_name = CASE
      WHEN $1 = NULL THEN $2::TEXT
      WHEN $1::INTEGER = 0 THEN '--Do Not Offer Tech--'
      ELSE (SELECT country_name FROM countries WHERE country_id = $1::INTEGER)
    END
  WHERE order_set_id = $3
    AND order_type = 2
  RETURNING order_transfer_id;
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