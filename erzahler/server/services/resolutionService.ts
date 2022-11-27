export class ResolutionService {
  async startGame(gameId: number): Promise<void> {
    // Update DB status to playing
    // Alert service call
  }

  async resolveTurn(turnId: number): Promise<void> {
    console.log(`Turn ${turnId} timer just hit but the function isn't ready!`);
  }

  async esolveTurnByGameAndCount(gameId: number, turnNumber: number): Promise<void> {
    console.log(`Turn for gameId ${gameId} and turnNumber ${turnNumber} just triggered but the fuction isn't ready!`);
  }
}