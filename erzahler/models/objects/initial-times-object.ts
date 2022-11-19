import { DateTime } from "luxon";

export interface StartDetails {
  gameStatus: string;
  gameStart: DateTime;
  firstTurn: DateTime;
}