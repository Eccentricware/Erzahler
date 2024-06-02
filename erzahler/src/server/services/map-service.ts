import { db } from '../../database/connection';
import { CityType } from '../../models/enumeration/province-enums';
import { RenderCategory } from '../../models/enumeration/render-category-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { City, MapDetails, Terrain } from '../../models/objects/map-objects';
import { terminalLog } from '../utils/general';

export class MapService {
  async getMap(gameId: number, turnNumber?: number): Promise<MapDetails> {
    const gameState = await db.gameRepo.getGameState(gameId);
    const turnNumberToUse = turnNumber !== undefined ? turnNumber : gameState.turnNumber;
    terminalLog(`Map requested: ${gameState.gameName} (${gameId}-${turnNumberToUse})`);

    const terrain = await db.mapRepo.getTerrain(gameId, turnNumberToUse);

    const seaTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.SEA);
    const landTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.LAND);
    const canalTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.CANAL);
    const lineTerrain = terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.LINE);

    const cities = await db.mapRepo.getCities(gameId, turnNumberToUse);

    const supplyCenters = cities.filter(
      (city: City) => city.type === CityType.SUPPLY && ['active', 'dormant'].includes(city.status)
    );

    const votingCenters = cities.filter((city: City) => [CityType.VOTE, CityType.CAPITAL].includes(city.type));

    const labels = await db.mapRepo.getLabels(gameId);
    const labelLines = await db.mapRepo.getLabelLines(gameId);

    const allUnits = await db.mapRepo.getUnits(gameId, turnNumberToUse);
    const units = allUnits.filter((unit) => ['Active', 'Retreat'].includes(unit.status) || turnNumberToUse < unit.falloutEndTurn);

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
