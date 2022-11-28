import { createHash } from "crypto";

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

  async saveOptionsHashes(turnId: number): Promise<void> {
    const testString1 = [[1,1,10],[2,1,2]].toString();
    console.log('testString1', createHash('sha256').update(testString1).digest('hex'));
    const testString2 = [[1,1,10],[2,1,3]].toString();
    console.log('testString2', createHash('sha256').update(testString2).digest('hex'));
  }

}