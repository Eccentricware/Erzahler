export const transferRemainingProvincesQuery = `
  UPDATE province_histories
  SET controller_id = $1
  WHERE province_id = ANY($2::BIGINT[])
    AND turn_id = $3;
`;