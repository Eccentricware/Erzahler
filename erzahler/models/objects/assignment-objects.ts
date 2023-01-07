import { AssignmentType } from "../enumeration/assignment-type-enum";

export interface AssignmentDataObject {
  gameId: number;
  assignments: any[];
  registrants: any[];
  userStatus: any[];
  userIsAdmin: boolean;
  allAssigned: boolean;
  partialRosterStart: boolean;
  finalReadinessCheck: boolean;
}

export interface UserAssignmentResult {
  username: string;
  assignment_type?: string;
  country_id?: number;
  country_name?: string;
  country_status?: string;
  nuke_range?: number | null;
  blind_administrators?: boolean;
}

export interface UserAssignment {
  username: string;
  assignmentType?: AssignmentType;
  countryId: number;
  countryName?: string;
  countryStatus?: string;
  nukeTech?: boolean;
  blindAdministrators?: boolean;
}