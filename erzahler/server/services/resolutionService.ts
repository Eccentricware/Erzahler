export class ResolutionService {
  resolveTurn(turnId: number): void {
    console.log(`Turn ${turnId} timer just hit but the function isn't ready!`);
  }

  resolveTurnByGameAndCount(gameId: number, turnNumber: number): void {
    console.log(`Turn for gameId ${gameId} and turnNumber ${turnNumber} just triggered but the fuction isn't ready!`);
  }
}