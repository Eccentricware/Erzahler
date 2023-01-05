import { db } from "../../database/connection";
import { RenderCategory } from "../../models/enumeration/render-category-enum";
import { Terrain } from "../../models/objects/map-objects";

export class MapService {
  async getCurrentMap(gameId: number): Promise<any> {
    const terrain = await this.getTerrain(gameId, 61);
    return {
      terrain: {
        sea: terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.SEA),
        land: terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.LAND),
        canal: terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.CANAL),
        line: terrain.filter((terrain: Terrain) => terrain.renderCategory === RenderCategory.LINE),
      },
      cities: {
        supplyCenters: [],
        votingCenters: []
      },
      units: [],
      labels: [],
      labelLines: []
    };
  }


  async getTerrain(gameId: number, turnId: number): Promise<any> {
    return await db.mapRepo.getTerrain(gameId, turnId);
  }
}