import { CoalitionSchedule } from './coalition-schedule-objects';

export interface NewGameData {
  gameName: string;
  assignmentMethod: string;
  stylizedStartYear: number;
  deadlineType: string;
  observeDst: boolean;
  gameStart: string;
  firstTurnDeadline: string;
  ordersDay: string;
  ordersTime: string;
  retreatsDay: string;
  retreatsTime: string;
  adjustmentsDay: string;
  adjustmentsTime: string;
  nominationsDay: string;
  nominationsTime: string;
  votesDay: string;
  votesTime: string;
  firstOrdersTimeSpan: number;
  firstOrdersTimeType: string;
  ordersTimeSpan: number;
  ordersTimeType: string;
  retreatsTimeSpan: number;
  retreatsTimeType: string;
  adjustmentsTimeSpan: number;
  adjustmentsTimeType: string;
  nominationsTimeSpan: number;
  nominationsTimeType: string;
  votesTimeSpan: number;
  votesTimeType: string;
  nominateDuringAdjustments: boolean;
  voteDuringOrders: boolean;
  turn1Timing: string;
  nominationTiming: string;
  nominationYear: number;
  concurrentGamesLimit: number;
  automaticAssignments: boolean;
  ratingLimits: boolean;
  funRange: number[];
  skillRange: number[];
  nmrTolerance: number | undefined;
  finalReadinessCheck: boolean;
  rules: any;
  voteDeadlineExtension: boolean | undefined;
  blindCreator: boolean;
  partialRosterStart: boolean;
  coalitionSchedule: CoalitionSchedule;
  privateGame: boolean;
  hiddenGame: boolean;
  dbRows: any;
}

export interface NewGameResponse {
  success: boolean;
  gameId?: number;
  errors?: string[];
  error?: string;
}
