export class OptionsService {
  async saveOptionsByGameId(gameId: number): Promise<void> {
    // Need a query to find the latest resolved turn for the state of the world
  }

  async processHolds(): Promise<void> {
    // Fleets can't hold in the fall, UNLESS THEY HAVE POWER!!!
  }

  async processMovementStandard(): Promise<void> {
    // Standard is not convoyed
  }

  async processMovementConvoyed(): Promise<void> {
    // Convoyed is not standard
  }
}