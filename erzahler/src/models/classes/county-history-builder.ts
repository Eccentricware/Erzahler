import { CountryHistoryRow, CountryStatChanges } from "../../database/schema/table-fields";
import { CountryStatus } from "../enumeration/country-enum";

/**
 * Handles defaults and changes for country stat changes
 */
export class CountryHistoryBuilder {
  countryId: number;
  countryStatus: CountryStatus;
  controlsCapital: boolean;
  capitalControllerId: number;
  cityCount: number;
  unitCount: number;
  adjustments: number;
  voteCount: number;
  nukeRange: number;
  bankedBuilds: number;
  nukesInProduction: number;
  inRetreat: boolean;
  buildsBeingBanked: number;
  buildsIncreasingRange: number;
  bankedBuildsIncreasingRange: number;
  buildsStartingNukes: number;
  nukesFinished: number;
  bankedBuildsGifted: number;
  bankedBuildsReceived: number;

  constructor(countryStats: CountryStatChanges) {
    this.countryId = countryStats.countryId ? countryStats.countryId : 0;
    this.countryStatus = countryStats.countryStatus ? countryStats.countryStatus : CountryStatus.ACTIVE;
    this.controlsCapital = countryStats.controlsCapital ? countryStats.controlsCapital : true;
    this.capitalControllerId = countryStats.capitalControllerId ? countryStats.capitalControllerId : 0;
    this.cityCount = countryStats.cityCount ? countryStats.cityCount : 0;
    this.unitCount = countryStats.unitCount ? countryStats.unitCount : 0;
    this.adjustments = countryStats.adjustments ? countryStats.adjustments : 0;
    this.voteCount = countryStats.voteCount ? countryStats.voteCount : 0;
    this.nukeRange = countryStats.nukeRange ? countryStats.nukeRange : 0;
    this.bankedBuilds = countryStats.bankedBuilds ? countryStats.bankedBuilds : 0;
    this.nukesInProduction = countryStats.nukesInProduction ? countryStats.nukesInProduction : 0;
    this.inRetreat = countryStats.inRetreat ? countryStats.inRetreat : false;
    this.buildsBeingBanked = countryStats.buildsBeingBanked ? countryStats.buildsBeingBanked : 0;
    this.buildsIncreasingRange = countryStats.buildsIncreasingRange ? countryStats.buildsIncreasingRange : 0;
    this.bankedBuildsIncreasingRange = countryStats.bankedBuildsIncreasingRange ? countryStats.bankedBuildsIncreasingRange : 0;
    this.buildsStartingNukes = countryStats.buildsStartingNukes ? countryStats.buildsStartingNukes : 0;
    this.nukesFinished = countryStats.nukesFinished ? countryStats.nukesFinished : 0;
    this.bankedBuildsGifted = countryStats.bankedBuildsGifted ? countryStats.bankedBuildsGifted : 0;
    this.bankedBuildsReceived = countryStats.bankedBuildsReceived ? countryStats.bankedBuildsReceived : 0;
  }

  copyCountryHistory(countryHistory: CountryHistoryRow) {
    this.countryStatus = countryHistory.countryStatus;
    this.unitCount = countryHistory.unitCount;
    this.cityCount = countryHistory.cityCount;
    this.voteCount = countryHistory.voteCount;
    this.adjustments = countryHistory.adjustments;
    this.bankedBuilds = countryHistory.bankedBuilds;
    this.nukeRange = countryHistory.nukeRange;
    this.nukesInProduction = countryHistory.nukesInProduction;
    this.inRetreat = countryHistory.inRetreat;
  }

  processChanges() {
    this.adjustments = this.cityCount - this.unitCount;
    this.bankedBuilds += this.buildsBeingBanked + this.bankedBuildsReceived - this.bankedBuildsGifted;

    this.nukeRange += this.buildsIncreasingRange + this.bankedBuildsIncreasingRange;
    this.nukesInProduction += this.buildsStartingNukes - this.nukesFinished;

    if (this.cityCount === 0 && this.unitCount === 0 && this.voteCount === 1) {
      this.countryStatus = CountryStatus.ELIMINATED;
    }
  }

  build(): CountryHistoryRow {
    return {
      countryId: this.countryId,
      turnId: 0,
      countryStatus: this.countryStatus,
      cityCount: this.cityCount,
      unitCount: this.unitCount,
      adjustments: this.adjustments,
      voteCount: this.voteCount,
      nukeRange: this.nukeRange,
      bankedBuilds: this.bankedBuilds,
      nukesInProduction: this.nukesInProduction,
      inRetreat: this.inRetreat
    }
  }
}