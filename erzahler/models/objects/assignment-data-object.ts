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