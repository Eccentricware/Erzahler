export enum CountryStatus {
  ACTIVE = 'Active',
  CIVIL_DISORDER = 'Civil Disorder',
  ELIMINATED = 'Eliminated',
  NPC = 'Non-Player Country',
  // End Behavior
  SURVIVED = 'Survived',
  WON = 'Won',
  // Misc Behavior
  // DISCARDED = 'Discarded' // Suspending/Abandoning use as a db reversion
}

export enum CountryRank {
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  N = 'n',
  DASH = '-' // Only for placeholder
}
