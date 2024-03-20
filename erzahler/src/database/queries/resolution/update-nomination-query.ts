export const updateNominationQuery = `
  UPDATE nominations
  SET yay_voter_ids = $1,
    votes_received = $2,
    win_diff = $3,
    winner = $4
  WHERE nomination_id = $5;
`;
