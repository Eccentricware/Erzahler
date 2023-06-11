import { ScheduleSettingsQueryResult } from '../objects/schedule-settings-query-object';
import { StartScheduleEvents } from '../objects/start-schedule-events-object';

export class SchedulerSettingsBuilder {
  gameId: number;
  gameName: string;
  currentYear: number;
  stylizedStartYear: number;
  deadlineType: string;
  turn1Timing: string;
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

  constructor(queriedSettings: ScheduleSettingsQueryResult) {
    this.gameId = queriedSettings.game_id;
    this.gameName = queriedSettings.game_name;
    this.currentYear = queriedSettings.current_year;
    this.stylizedStartYear = queriedSettings.stylized_start_year;
    this.deadlineType = queriedSettings.deadline_type;
    this.turn1Timing = queriedSettings.turn_1_timing;
    this.ordersDay = queriedSettings.orders_day;
    this.ordersTime = queriedSettings.orders_time;
    this.retreatsDay = queriedSettings.retreats_day;
    this.retreatsTime = queriedSettings.retreats_time;
    this.adjustmentsDay = queriedSettings.adjustments_day;
    this.adjustmentsTime = queriedSettings.adjustments_time;
    this.nominationsDay = queriedSettings.nominations_day;
    this.nominationsTime = queriedSettings.nominations_time;
    this.votesDay = queriedSettings.votes_day;
    this.votesTime = queriedSettings.votes_time;
  }
}
