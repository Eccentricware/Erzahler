import { CountryHistoryRow, CountryStatChanges, InitialUnit, ProvinceHistoryRow, UnitHistoryRow } from "../../database/schema/table-fields";
import { terminalAddendum } from "../../server/utils/general";
import { CountryStatus } from "../enumeration/country-enum";
import { UnitType } from "../enumeration/unit-enum";
import { Unit } from "../objects/map-objects";
import { AvailableProvince } from "../objects/resolution/order-resolution-objects";

/**
 * Handles defaults and changes for country stat changes
 */
export class CountryHistoryBuilder {
  countryId: number;
  countryName: string;
  countryStatus: CountryStatus;
  controlsCapital: boolean;
  capitalControllerId: number;
  cities: ProvinceHistoryRow[];
  votes: ProvinceHistoryRow[];
  capitals: ProvinceHistoryRow[];
  cityCount: number;
  units: (UnitHistoryRow | InitialUnit)[];
  unitCount: number;
  adjustments: number;
  voteCount: number;
  nukeRange: number | null;
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
  defaultBuild: string;
  resources: {
    adjustments: number;
    bankedBuilds: number;
    nukesInProduction: number;
    availableProvinces: AvailableProvince[];
  }
  constructor(countryStats: CountryStatChanges, countryHistory: CountryHistoryRow | undefined) {
    if (!countryStats) {
      terminalAddendum('CountryHistoryBuilder ERROR:', 'No country stats provided');
    }

    this.countryId = countryHistory ? countryHistory.countryId : -1;
    this.countryStatus = countryHistory ? countryHistory.countryStatus : CountryStatus.NPC;
    this.cityCount = countryHistory ? countryHistory.cityCount : -1;
    this.unitCount = countryHistory ? countryHistory.unitCount : -1;
    this.adjustments = countryHistory ? countryHistory.adjustments : -1;
    this.voteCount = countryHistory ? countryHistory.voteCount : -1;
    this.nukeRange = countryHistory ? countryHistory.nukeRange : -1;
    this.bankedBuilds = countryHistory ? countryHistory.bankedBuilds : -1;
    this.nukesInProduction = countryHistory ? countryHistory.nukesInProduction : -1;
    this.inRetreat = countryHistory ? countryHistory.inRetreat : false;

    this.countryName = countryStats.countryName ? countryStats.countryName : '';
    this.controlsCapital = countryStats.controlsCapital ? countryStats.controlsCapital : true;
    this.capitalControllerId = countryStats.capitalControllerId ? countryStats.capitalControllerId : 0;
    this.cities = countryStats.cities ? countryStats.cities : [];
    this.units = countryStats.units ? countryStats.units : [];
    this.votes = countryStats.votes ? countryStats.votes : [];
    this.capitals = countryStats.capitals ? countryStats.capitals : [];
    this.buildsBeingBanked = countryStats.buildsBeingBanked ? countryStats.buildsBeingBanked : 0;
    this.buildsIncreasingRange = countryStats.buildsIncreasingRange ? countryStats.buildsIncreasingRange : 0;
    this.bankedBuildsIncreasingRange = countryStats.bankedBuildsIncreasingRange ? countryStats.bankedBuildsIncreasingRange : 0;
    this.buildsStartingNukes = countryStats.buildsStartingNukes ? countryStats.buildsStartingNukes : 0;
    this.nukesFinished = countryStats.nukesFinished ? countryStats.nukesFinished : 0;
    this.bankedBuildsGifted = countryStats.bankedBuildsGifted ? countryStats.bankedBuildsGifted : 0;
    this.bankedBuildsReceived = countryStats.bankedBuildsReceived ? countryStats.bankedBuildsReceived : 0;
    this.defaultBuild = countryStats.defaultBuild ? countryStats.defaultBuild : UnitType.ARMY;
    this.resources = countryStats.resources ? countryStats.resources : {
      adjustments: 0,
      bankedBuilds: 0,
      nukesInProduction: 0,
      availableProvinces: []
    }
  }

  processChanges() {
    this.cityCount = this.cities.length;
    this.unitCount = this.units.length;
    this.voteCount = this.votes.length;
    this.adjustments = this.cityCount - this.unitCount;
    this.bankedBuilds += this.buildsBeingBanked + this.bankedBuildsReceived - this.bankedBuildsGifted;

    if (this.nukeRange && this.nukeRange > 0) {
      this.nukeRange += this.buildsIncreasingRange + this.bankedBuildsIncreasingRange;
    }

    // Nukes that were in production are forced to be placed or disbanded
    this.nukesInProduction = 0 + this.buildsStartingNukes;

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