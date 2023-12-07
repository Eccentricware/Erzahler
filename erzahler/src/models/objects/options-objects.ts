import { TurnType } from '../enumeration/turn-type-enum';
import {
  BuildLoc,
  DisbandOptions,
  Nomination,
  NominationOptions,
  TransferCountry,
  UnitOptionsFinalized
} from './option-context-objects';

export interface OptionsFinal {
  playerId: number;
  countryId: number;
  countryName: string;
  message?: string;
  pending?: SpecificTurnDetails;
  preliminary?: SpecificTurnDetails;
  other?: SpecificTurnDetails;
}

interface SpecificTurnDetails {
  id: number;
  name: string;
  deadline: Date | string;
  applicable: boolean;
  message?: string;
  units?: UnitOptionsFinalized[]; // If (spring orders/retreats or fall orders/retreats)}
  buildTransfers?: {
    options: TransferCountry[];
    builds: number;
  };
  offerTechOptions?: TransferTechCountry[];
  receiveTechOptions?: TransferTechCountry[];
  builds?: {
    builds: number;
    locations: BuildOptions;
  };
  disbands?: DisbandOptions;
  nominations?: NominationOptions;
  votes?: VotingOptions;
}

export interface BuildOptions {
  land: BuildLoc[];
  sea: BuildLoc[];
  air: BuildLoc[];
}

export interface TransferTechCountry {
  countryId: number;
  countryName: string;
}
export interface TransferBuildsCountry {
  countryId: number;
  countryName: string;
  builds: number;
}

export interface VotingOptions {
  duplicateAlerts: string[];
  nominations: Nomination[];
}
