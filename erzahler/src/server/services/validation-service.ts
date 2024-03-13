import { AssignmentType } from "../../models/enumeration/assignment-type-enum";
import { terminalLog } from "../utils/general";

export interface RequestValidationObject {
  route: string;
  countryId?: string | string[] | undefined;
  gameId?: string | string[] | undefined;
  playerId?: string | string[] | undefined;
  turnNumber?: string | string[] | undefined;
  idToken?: {
    value: string;
    guestAllowed: boolean;
  }
  assignmentType?: string | string[] | undefined;
  environment?: string | string[] | undefined;
  magicWord?: string | string[] | undefined;
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
    environment?: string;
    magicWord?: string;
  };
}

export class ValidationService {
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
        ].includes(<AssignmentType>request.assignmentType)
      ) {
        validationResponse.sanitizedVariables.assignmentType = <AssignmentType>request.assignmentType;
      } else {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid assignmentType');
      }
    }

    if (request.environment) {
      if (request.environment === 'test' || request.environment === 'live') {
        validationResponse.sanitizedVariables.environment = request.environment;
      } else {
        validationResponse.valid = false;
        validationResponse.errors.push('Invalid environment');
      }
    }

    if (request.magicWord) {
      validationResponse.sanitizedVariables.magicWord = String(request.magicWord);
    }

    if (!validationResponse.valid) {
      terminalLog(`Invalid request to ${request.route}: ${validationResponse.errors.join(', ')}`);
    }

    return validationResponse;
  }
}