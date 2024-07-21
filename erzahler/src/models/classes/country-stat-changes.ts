import { CountryStatChanges } from "../../database/schema/table-fields";

/**
 * Handles defaults and changes for country stat changes
 */
export class CountryStatChangesClass {
  countryId: number;
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
  bankedBuildsGifted: number;
  bankedBuildsReceived: number;

  constructor(countryStats: CountryStatChanges) {
    this.countryId = countryStats.countryId ? countryStats.countryId : 0;
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
    this.bankedBuildsGifted = countryStats.bankedBuildsGifted ? countryStats.bankedBuildsGifted : 0;
    this.bankedBuildsReceived = countryStats.bankedBuildsReceived ? countryStats.bankedBuildsReceived : 0;
  }
}