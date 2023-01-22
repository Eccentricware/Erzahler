import { db } from "../../database/connection";
import { TurnStatus } from "../../models/enumeration/turn-status-enum";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { TurnTS } from "../../models/objects/database-objects";
import { StartDetails } from "../../models/objects/initial-times-object";
import { OptionsService } from "./options-service";

export class ResolutionService {
  async startGame(gameData: any, startDetails: StartDetails): Promise<void> {
    const optionsService = new OptionsService();
    const firstTurn: TurnTS = {
      gameId: gameData.gameId,
      turnNumber: 1,
      turnName: `${TurnType.SPRING_ORDERS} ${gameData.stylizedStartYear + 1}`,
      turnType: TurnType.SPRING_ORDERS,
      turnStatus: TurnStatus.PENDING,
      yearNumber: 1,
      deadline: startDetails.firstTurn
    };
    const nextTurn: TurnTS = await db.schedulerRepo.insertTurn(firstTurn);

    if (nextTurn.turnId) {
      await optionsService.saveOptionsForNextTurn(gameData.gameId, nextTurn.turnId);
    }
    // Alert service call
  }

  async resolveTurn(turnId: number): Promise<void> {
    console.log(`Turn ${turnId} timer just hit but the function isn't ready!`);
  }

  async resolveTurnByGameAndCount(gameId: number, turnNumber: number): Promise<void> {
    console.log(`Turn for gameId ${gameId} and turnNumber ${turnNumber} just triggered but the fuction isn't ready!`);
  }
}