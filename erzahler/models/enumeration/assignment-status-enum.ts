export enum AssignmentStatus {
  ABANDONED = 'Abandoned', // Player has been removed from assignment due to neglect/NMR
  ACTIVE = 'Active', // Player is in an active game
  ASSIGNED = 'Assigned', // Player is assigned a country during registration
  BANNED = 'Banned', // A player is unable to join a game due uncivil conduct
  CONFIRMED = 'Confirmed', // Player has given final agreement to play the game
  DECLINED = 'Declined', // Player has turned down invite to join game
  INVITED = 'Invited', // A user has been invited to play, but has not responded
  LOCKED = 'Locked', // A player assigned a country that is not an option for other countries
  QUIT = 'Quit', // A player has voluntarily left the game after start
  REGISTERED = 'Registered', // A player joined or accepted an invite
  REQUESTED = 'Requested', // A player has requested to join but hasn't been accepted
  UNREGISTERED = 'Unregistered' // Player has left game before start
}