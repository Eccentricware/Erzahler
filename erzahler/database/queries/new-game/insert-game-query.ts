export const insertNewGameQuery = `
  INSERT INTO games (
    game_name,
    game_status,
    current_year,
    stylized_year_start,
    concurrent_games_limit,
    blind_administrator,
    private_game,
    hidden_game,
    deadline_type,
    orders_deadline,
    retreats_deadline,
    adjustments_deadline,
    nominations_deadline,
    votes_deadline,
    nmr_removal
  ) VALUES (
    $1,
    'registration',
    0,
    2000,
    $2,
    $3,
    $4,
    $5
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12
  );
`;