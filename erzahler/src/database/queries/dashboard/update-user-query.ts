export const updatePlayerSettings = `
  UPDATE users
  SET time_zone = $1,
    meridiem_time = $2
  WHERE user_id = $3;
`;
