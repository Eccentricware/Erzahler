import { AtRiskUnit, BuildLoc, NominatableCountry, Nomination, TransferCountry, UnitOptionsFinalized } from "./option-context-objects";

export interface OptionsFinal {
  playerId: number;
  countryId: number;
  countryName: string;
  pending?: {
    id?: number;
    name?: string;
    deadline?: Date | string;
  };
  preliminary?: {
    id?: number;
    name?: string;
    deadline?: Date | string;
  };
  units?: {
    turnStatus: string;
    options: UnitOptionsFinalized[]; // If (spring orders/retreats or fall orders/retreats)}
  };
  buildTransfers?: {
    turnStatus: string;
    options: TransferCountry[];
    builds: number;
  };
  offerTechOptions?: {
    turnStatus: string;
    options: TransferTechCountry[];
  };
  receiveTechOptions?: {
    turnStatus: string;
    options: TransferTechCountry[];
  };
  builds?: {
    turnStatus: string;
    builds: number;
    locations: BuildOptions;
  }
  disbands?: {
    turnStatus: string;
    options: AtRiskUnit[];
  }
  nominations?: {
    turnStatus: string;
    options: NominatableCountry[];
  }
  votes?: {
    turnStatus: string;
    options: Nomination[];
  }
}

export interface BuildOptions {
  land: BuildLoc[],
  sea: BuildLoc[],
  air: BuildLoc[]
};

export interface TransferTechCountry {
  countryId: number;
  countryName: string;
}
export interface TransferBuildsCountry {
  countryId: number;
  countryName: string;
  builds: number;
}