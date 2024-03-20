import { DateTime } from 'luxon';
import { AssignmentStatus } from '../enumeration/assignment-status-enum';
import { AssignmentType } from '../enumeration/assignment-type-enum';
import { as } from 'pg-promise';
import { ContactPreferences } from './user-profile-object';

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
  assignment_start?: string | Date | DateTime | null;
  assignment_end?: string | Date | DateTime | null;
  country_id?: number;
  country_name?: string;
  country_status?: string;
  nuke_range?: number | null;
  blind_administrators?: boolean;
}

export interface UserAssignment {
  username: string;
  assignmentType?: AssignmentType;
  assignmentStart?: string | Date | DateTime | null;
  assignmentEnd?: string | Date | DateTime | null;
  countryId: number;
  countryName?: string;
  countryStatus?: string;
  nukeTech?: boolean;
  blindAdministrators?: boolean;
}

export interface AssignmentResult {
  user_id: number;
  username: string;
  assignment_id: number;
  assignment_type: AssignmentType;
  assignment_status: AssignmentStatus;
  assignment_start: string | Date | DateTime;
  assignment_end: string | Date | DateTime | undefined;
  country_id: number | undefined;
  game_id: number;
}

export interface Assignment {
  userId: number;
  username: string;
  assignmentId: number;
  assignmentType: AssignmentType;
  assignmentStatus: AssignmentStatus;
  assignmentStart: string | Date | DateTime;
  assignmentEnd: string | Date | DateTime | undefined;
  countryId: number | undefined;
  gameId: number;
}

export interface AssignmentDetailsResult {
  assignment_id: number;
  country_id: number;
  country_name: string;
  rank: string;
  player_id: number;
  username: string;
  assignment_status: string;
  contact_preferences: ContactPreferences[];
}

export interface AssignmentDetails {
  assignmentId: number;
  countryId: number;
  countryName: string;
  rank: string;
  playerId: number;
  username: string;
  assignmentStatus: string;
  contactPreferences: ContactPreferences;
}
