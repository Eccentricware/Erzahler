import { db } from '../../database/connection';
import { RenderCategory } from '../../models/enumeration/render-category-enum';
import { City, Terrain } from '../../models/objects/map-objects';
import { terminalLog } from '../utils/general';

export class MapService {
  async getCurrentMap(gameId: number): Promise<any> {
    const gameState = await db.gameRepo.getGameState(gameId);
    terminalLog(`Current map requested for ${gameState.gameName} (${gameId})`);

    const terrain = await db.mapRepo.getTerrain(gameId, gameState.turnNumber);

    const seaTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.SEA);
    const landTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.LAND);
    const canalTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.CANAL);
    const lineTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.LINE);

    const cities = await db.mapRepo.getCities(gameId, gameState.turnNumber);

    const supplyCenters = cities.filter((city: City) => city.voteColor === null);
    const votingCenters = cities.filter((city: City) => city.voteColor !== null);

    const labels = await db.mapRepo.getLabels(gameId);
    const labelLines = await db.mapRepo.getLabelLines(gameId);

    const units = await db.mapRepo.getUnits(gameId, gameState.turnNumber);

    return {
      terrain: {
        sea: seaTerrain,
        land: landTerrain,
        canal: canalTerrain,
        line: lineTerrain
      },
      cities: {
        supplyCenters: supplyCenters,
        votingCenters: votingCenters
      },
      labels: labels,
      labelLines: labelLines,
      units: units
    };
  }
}
