"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerSettingsBuilder = void 0;
class SchedulerSettingsBuilder {
    constructor(queriedSettings) {
        this.gameId = queriedSettings.game_id;
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
exports.SchedulerSettingsBuilder = SchedulerSettingsBuilder;
//# sourceMappingURL=schedule-settings-builder.js.map