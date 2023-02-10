"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSummaryBuilder = void 0;
const scheduler_service_1 = require("../../server/services/scheduler-service");
class GameSummaryBuilder {
    constructor(rawGame, localTimeZoneName, meridiemTime) {
        this.scheduler = new scheduler_service_1.SchedulerService();
        this.gameId = rawGame.game_id;
        this.gameName = rawGame.game_name;
        this.creator = rawGame.creator;
        this.gameStatus = rawGame.game_status;
        this.deadlineType = rawGame.deadline_type;
        this.nominationTiming = rawGame.nomination_timing;
        this.nominationYear = rawGame.nomination_year;
        this.playerCount = rawGame.player_count ? rawGame.player_count : 0;
        this.countryCount = rawGame.country_count ? rawGame.country_count : 0;
        this.turn1Timing = rawGame.turn1_timing;
        this.startTime = rawGame.start_time;
        this.timeCreated = rawGame.timeCreated;
        this.currentYear = rawGame.current_year;
        this.ordersDay = this.scheduler.enforceLocalDay(rawGame.orders_day, rawGame.orders_time, localTimeZoneName);
        this.ordersTime = this.scheduler.enforceLocalTime(rawGame.orders_time, localTimeZoneName, meridiemTime);
        this.ordersSpan = rawGame.orders_span;
        this.retreatsDay = this.scheduler.enforceLocalDay(rawGame.retreats_day, rawGame.retreats_time, localTimeZoneName);
        this.retreatsTime = this.scheduler.enforceLocalTime(rawGame.retreats_time, localTimeZoneName, meridiemTime);
        this.retreatsSpan = rawGame.retreats_span;
        this.adjustmentsDay = this.scheduler.enforceLocalDay(rawGame.adjustments_day, rawGame.adjustments_time, localTimeZoneName);
        this.adjustmentsTime = this.scheduler.enforceLocalTime(rawGame.adjustments_time, localTimeZoneName, meridiemTime);
        this.adjustmentsSpan = rawGame.adjustments_span;
        this.nominationsDay = this.scheduler.enforceLocalDay(rawGame.nominations_day, rawGame.nominations_time, localTimeZoneName);
        this.nominationsTime = this.scheduler.enforceLocalTime(rawGame.nominations_time, localTimeZoneName, meridiemTime);
        this.nominationsSpan = rawGame.nominations_span;
        this.votesDay = this.scheduler.enforceLocalDay(rawGame.votes_day, rawGame.votes_time, localTimeZoneName);
        this.votesTime = this.scheduler.enforceLocalTime(rawGame.votes_time, localTimeZoneName, meridiemTime);
        this.votesSpan = rawGame.votes_span;
    }
}
exports.GameSummaryBuilder = GameSummaryBuilder;
//# sourceMappingURL=game-summary-builder.js.map