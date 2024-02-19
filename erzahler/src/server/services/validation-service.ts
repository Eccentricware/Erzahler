import { as } from "pg-promise";
import { AssignmentType } from "../../models/enumeration/assignment-type-enum";
import { terminalLog } from "../utils/general";

export interface RequestValidationObject {
  route: string;
  countryId?: any;
  gameId?: any;
  playerId?: any;
  turnNumber?: any;
  idToken?: {
    value: any;
    guestAllowed: boolean;
  }
  assignmentType?: any;
}

export interface RequestValidationResponse {
  valid: boolean;
  errors: string[];
  sanitizedVariables: {
    countryId?: number;
    gameId?: number;
    playerId?: number;
    turnNumber?: number;
    idToken?: string;
    assignmentType?: AssignmentType;
  };
}

export class ValidationService {
  constructor() {
  }

  validateRequest(request: RequestValidationObject): RequestValidationResponse {
    const validationResponse: RequestValidationResponse = {
      valid: true,
      errors: [],
      sanitizedVariables: {}
    };

    if (request.countryId) {
      if (Number.isInteger(Number(request.countryId)) && Number(request.countryId) > 0) {
        validationResponse.sanitizedVariables.countryId = Number(request.countryId);
      } else {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid countryId');
      }
    }

    if (request.gameId) {
      if (Number.isInteger(Number(request.gameId)) && Number(request.gameId) > 0) {
        validationResponse.sanitizedVariables.gameId = Number(request.gameId);
      } else {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid gameId');
      }
    }

    if (request.playerId) {
      if (Number.isInteger(Number(request.playerId)) && Number(request.playerId) > 0) {
        validationResponse.sanitizedVariables.playerId = Number(request.playerId);
      } else {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid playerId');
      }
    }

    if (request.turnNumber) {
      if (Number.isInteger(Number(request.turnNumber)) && Number(request.turnNumber) >= 0) {
        validationResponse.sanitizedVariables.turnNumber = Number(request.turnNumber);
      } else {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid turnNumber');
      }
    }

    if (request.idToken) {
      if (request.idToken.guestAllowed || request.idToken.value !== '') {
        validationResponse.sanitizedVariables.idToken = String(request.idToken.value);
      } else if (!request.idToken.guestAllowed && request.idToken.value === '') {
        validationResponse.valid = false;
        validationResponse.errors.push('This operation does not accommodate guest users (idToken === \'\')');
      } else if (!request.idToken.value) {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid idToken');
      }
    }

    if (request.assignmentType) {
      // const assignmentType: AssignmentType | undefined =
      //   AssignmentType[String(request.assignmentType) as keyof typeof AssignmentType];
      if (
        [
          AssignmentType.ADMINISTRATOR,
          AssignmentType.CREATOR,
          AssignmentType.PLAYER,
          AssignmentType.RESERVE,
          AssignmentType.SPECTATOR
        ].includes(request.assignmentType)
      ) {
        validationResponse.sanitizedVariables.assignmentType = request.assignmentType;
      } else {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid assignmentType');
      }
    }

    if (!validationResponse.valid) {
      terminalLog(`Invalid request to ${request.route}: ${validationResponse.errors.join(', ')}`);
    }

    return validationResponse;
  }
}