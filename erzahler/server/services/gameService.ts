import { DecodedIdToken } from "firebase-admin/auth";
import { Pool, QueryResult } from "pg";
import { checkGameNameAvailabilityQuery } from "../../database/queries/game/check-game-name-availability-query";
import { insertAssignmentQuery } from "../../database/queries/game/insert-assignment-query";
import { insertCountryHistoryQuery } from "../../database/queries/game/insert-country-history-query";
import { insertCountryQuery } from "../../database/queries/game/insert-country-query";
import { insertNewGameQuery } from "../../database/queries/game/insert-game-query";
import { insertLabelQuery } from "../../database/queries/game/insert-label-query";
import { insertNodeAdjacencyQuery } from "../../database/queries/game/insert-node-adjacency-query";
import { insertNodeQuery } from "../../database/queries/game/insert-node-query";
import { insertProvinceHistoryQuery } from "../../database/queries/game/insert-province-history-query";
import { insertProvinceQuery } from "../../database/queries/game/insert-province-query";
import { insertRuleInGameQuery } from "../../database/queries/game/insert-rule-in-game-query";
import { insertTerrainQuery } from "../../database/queries/game/insert-terrain-query";
import { insertTurnQuery } from "../../database/queries/game/insert-turn-query";
import { insertUnitHistoryQuery } from "../../database/queries/game/insert-unit-history-query";
import { insertUnitQuery } from "../../database/queries/game/insert-unit-query";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";

export class GameService {
  idLibrary: any = {
    game: undefined,
    rules: {},
    countries: {},
    turns: {},
    provinces: {},
    nodes: {},
    units: {}
  };
  gameData: any = {};
  user: any = undefined;
  errors: string[] = [];

  async newGame(gameData: any, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      this.user = await accountService.getUserProfile(idToken);
      const pool: Pool = new Pool(victorCredentials);
      this.gameData = gameData;

      return await this.addNewGame(pool, this.gameData)
      .then(() => {
        console.log('Game Reponse Successful');
        pool.end();
        return { success: true };

      })
      .catch((error: Error) => {
        console.log('Game Response Failure:', error.message)
        this.errors.push('New Game Error' + error.message);
        pool.end();
        return {
          success: false,
          gameId: this.idLibrary.game,
          errors: this.errors
        }
      });

    } else {
      console.log('Invalid Token UID attempting to save new game');
      return {
        success: false,
        error: 'Invalid Token UID'
      }
    }
  }

  async addNewGame(pool: Pool, settings: any): Promise<void> {
    const settingsArray: any = [
      settings.gameName,
      settings.assignmentMethod,
      settings.stylizedStartYear,
      settings.turn1Timing,
      settings.deadlineType,
      settings.gameStart,
      settings.timeZone,
      settings.observeDst,
      settings.ordersDay,
      settings.ordersTime,
      settings.retreatsDay,
      settings.retreatsTime,
      settings.adjustmentsDay,
      settings.adjustmentsTime,
      settings.nominationsDay,
      settings.nominationsTime,
      settings.votesDay,
      settings.votesTime,
      settings.nmrTolerance,
      settings.concurrentGamesLimit,
      settings.privateGame,
      settings.hiddenGame,
      settings.blindCreator,
      settings.finalReadinessCheck,
      settings.voteDeadlineExtension,
      settings.partialRosterStart
    ];

    return pool.query(insertNewGameQuery, settingsArray)
      .then(async (results: QueryResult<any>) => {
        this.idLibrary.game = results.rows[0].game_id;
        console.log('Game Row Added Successfully');

        Promise.all([
          this.addCreatorAssignment(pool, this.idLibrary.game, this.user.user_id),
          this.addRulesInGame(pool, this.gameData.rules),
          this.addTurn0(pool)
        ]).then(() => {
          console.log('Assignment, rules, turns resolved');
        });

      })
      .catch((error: Error) => {
        console.log('New game Error:', error.message);
        this.errors.push('New Game Error: ' + error.message);
      });
  }

  async addCreatorAssignment(pool: Pool, gameId: number, userId: number): Promise<void> {
    pool.query(insertAssignmentQuery, [
      userId,
      gameId,
      null,
      'creator'
    ])
    .then(() => console.log('Assignment Row Added Successfully'))
    .catch((error: Error) => {
      console.log('New Assignment Error:', error.message);
      this.errors.push('New Assignment Error:' + error.message);
    });
  }

  async addTurn0(pool: Pool): Promise<void> {
    pool.query(insertTurnQuery, [
      this.idLibrary.game,
      this.gameData.gameStart,
      0,
      `Winter ${this.gameData.stylizedStartYear}`,
      'orders',
      'resolved'
    ])
    .then((result: any) => {
      console.log('Turn 0 Added Successfully');
      this.idLibrary.turns[0] = result.rows[0].turn_id;
      this.addTurn1(pool);
    })
    .catch((error: Error) => {
      console.log('Turn 0 Error: ', error.message);
      this.errors.push('Turn 0 Error: ' + error.message);
    });
  }

  async addTurn1(pool: Pool): Promise<void> {
    this.idLibrary.turns[1] = pool.query(insertTurnQuery, [
      this.idLibrary.game,
      this.gameData.firstTurnDeadline,
      1,
      `Spring ${this.gameData.stylizedStartYear + 1}`,
      'orders',
      'paused'
    ])
    .then(async (result: any) => {
      console.log('Turn 1 Added Successfully');
      this.idLibrary.turns[1] = result.rows[0].turn_id;
      await this.addCountries(pool);
    })
    .catch((error: Error) => {
      console.log('Turn 1 Error: ', error.message);
      this.errors.push('Turn 1 Error: ' + error.message);
      return 0;
    });
  }

  async addRulesInGame(pool: Pool, rules: any): Promise<any> {
    const rulePromises: Promise<QueryResult<any>>[] = rules.map(async (rule: any) => {
      await pool.query(insertRuleInGameQuery, [
        this.idLibrary.game,
        this.idLibrary.rules[rule.key],
        rule.enabled
      ])
      .catch((error: Error) => {
        console.log('Rule In Games Error:', error.message);
        this.errors.push('Error adding Rule In Game: ' + error.message);
      });
    });

    Promise.all(rulePromises).then(() => console.log('Add rules in game finished'));
  }

  async addCountries(pool: Pool): Promise<void> {
    const newCountries: Promise<any>[] = this.gameData.dbRows.countries.map(async (country: any) => {
      await pool.query(insertCountryQuery, [
        this.idLibrary.game,
        country.name,
        country.rank,
        country.color,
        country.keyName
      ])
      .then((result: QueryResult<any>) => {
        const newCountry = result.rows[0];
        this.idLibrary.countries[newCountry.country_name] = newCountry.country_id;
      })
      .catch((error: Error) => {
        console.log('Insert Country Error:', error.message);
        this.errors.push('Insert Country Error:' + error.message);
      });
    });

    Promise.all(newCountries)
    .then(async () => {
      console.log('Countries Added');
      await this.addProvinces(pool);
      await this.addCountryInitialHistories(pool);
    });
  }

  async addProvinces(pool: Pool): Promise<void> {
    const provincePromises: Promise<any>[] = this.gameData.dbRows.provinces.map((province: any) => {
      return pool.query(insertProvinceQuery, [
        this.idLibrary.game,
        province.name,
        province.fullName,
        province.type,
        province.voteType,
        province.cityLoc
      ])
      .then((newProvinceResult: QueryResult<any>) => {
        const newProvince = newProvinceResult.rows[0];
        this.idLibrary.provinces[newProvince.province_name] = newProvince.province_id;
      })
      .catch((error: Error) => {
        console.log('Insert Province Error:', error.message);
        this.errors.push('Insert Province Error: ' + error.message);
      });
    });

    Promise.all(provincePromises)
      .then(async (resolvedProvincePromises) => {
        console.log('Provinces Added');
        await this.addProvinceHistories(pool);
        await this.addTerrain(pool);
        await this.addLabels(pool);
        await this.addNodes(pool);
      });
  }

  async addProvinceHistories(pool: Pool): Promise<any> {
    this.gameData.dbRows.provinces.forEach(async (province: any) => {
      pool.query(insertProvinceHistoryQuery, [
        this.idLibrary.provinces[province.name],
        this.idLibrary.turns[0],
        this.idLibrary.countries[province.country],
        this.idLibrary.countries[province.owner],
        province.status,
        province.voteColor,
        province.statusColor,
        province.strokeColor
      ])
      .catch((error: Error) => {
        console.log('Insert Province History Error:', error.message);
        this.errors.push('Insert Province History Error:' + error.message);
      });
    });
  }

  async addTerrain(pool: Pool): Promise<void> {
    this.gameData.dbRows.terrain.forEach(async (terrain: any) => {
      pool.query(insertTerrainQuery, [
        this.idLibrary.provinces[terrain.province],
        terrain.type,
        terrain.renderCategory,
        terrain.points,
        this.idLibrary.provinces[terrain.start],
        this.idLibrary.provinces[terrain.end],
        terrain.bounds.top,
        terrain.bounds.left,
        terrain.bounds.right,
        terrain.bounds.bottom
      ])
      .catch((error: Error) => {
        console.log('Insert Sea Terrain Error:', error.message);
        this.errors.push('Insert Sea Terrain Error:' + error.message);
      });
    });
  }

  async addLabels(pool: Pool): Promise<any> {
    this.gameData.dbRows.labels.forEach(async (label: any) => {
      pool.query(insertLabelQuery, [
        this.idLibrary.provinces[label.province],
        label.name,
        label.type,
        label.loc,
        label.text,
        label.fill
      ])
      .catch((error: Error) => {
        console.log('Insert Label Error:', error.message);
        this.errors.push('Insert Label Error: ' + error.message);
      });
    });
  }

  async addNodes(pool: Pool): Promise<any> {
    const nodePromises: Promise<QueryResult<any>>[] = this.gameData.dbRows.nodes.map(async (node: any) => {
      return pool.query(insertNodeQuery, [
        this.idLibrary.provinces[node.province],
        node.name,
        node.type,
        node.loc
      ])
      .then((newNodeResult: any) => {
        const newNode = newNodeResult.rows[0];
        this.idLibrary.nodes[newNode.node_name] = newNode.node_id;
      })
      .catch((error: Error) => {
        console.log('Insert Node Error:', error.message);
        this.errors.push('Insert Node Error: ' + error.message);
      });
    });

    Promise.all(nodePromises).then((nodes: any) => {
      this.addNodeAdjacencies(pool);
      this.addUnits(pool);
    });
  }

  async addNodeAdjacencies(pool: Pool): Promise<any> {
    this.gameData.dbRows.links.forEach(async (link: any) => {
      pool.query(insertNodeAdjacencyQuery, [
        this.idLibrary.nodes[link.alpha.name],
        this.idLibrary.nodes[link.omega.name]
      ])
      .catch((error: Error) => {
        console.log('Insert Node Adjacency Error:', error.message);
        this.errors.push('Insert Node Adjacency Error: ' + error.message);
      });
    });
  }

  async addCountryInitialHistories(pool: Pool): Promise<any> {
    this.gameData.dbRows.countries.forEach(async (country: any) => {
      pool.query(insertCountryHistoryQuery, [
        this.idLibrary.countries[country.name],
        this.idLibrary.turns[0],
        country.rank !== 'n' ? 'available' : 'npc',
        country.cities.length,
        country.units.length,
        country.bankedBuilds,
        country.nuke,
        country.adjustments
      ])
      .catch((error: Error) => {
        console.log('Insert Country History Error:', error.message);
        this.errors.push('Insert Country History Error: ' + error.message);
      });
    });
  }

  async addUnits(pool: Pool): Promise<any> {
    const unitPromises: Promise<QueryResult<any>>[] = this.gameData.dbRows.units.map(async (unit: any) => {
      return pool.query(insertUnitQuery, [
        this.idLibrary.countries[unit.country],
        unit.fullName,
        unit.type
      ])
      .then((newUnitResult: any) => {
        const newUnit = newUnitResult.rows[0];
        this.idLibrary.units[newUnit.unit_name] = newUnit.unit_id;
      })
      .catch((error: Error) => {
        console.log('Insert Unit Error:', error.message);
        this.errors.push('Insert Unit Error: ' + error.message);
      });
    });

    Promise.all(unitPromises).then((units: any) => {
      this.addInitialUnitHistories(pool);
    });
  }

  async addInitialUnitHistories(pool: Pool): Promise<void> {
    this.gameData.dbRows.units.forEach(async (unit: any) => {
      pool.query(insertUnitHistoryQuery, [
        this.idLibrary.units[unit.fullName],
        this.idLibrary.turns[0],
        this.idLibrary.nodes[unit.node],
        'active'
      ])
      .catch((error: Error) => {
        console.log('Insert Unit History Error:', error.message);
        this.errors.push('Insert Unit History Error: ' + error.message);
      });
    });
  }

  async createNewGameIdLibrary(pool: Pool): Promise<void> {
    const ruleResults: QueryResult<any> = await pool.query('SELECT * FROM rules');
    ruleResults.rows.forEach((rule: any) => {
      this.idLibrary.rules[rule.rule_key] = rule.rule_id;
    });
  }

  async checkGameNameAvailability(gameName: string): Promise<boolean> {
    const pool: Pool = new Pool(victorCredentials);

    const gameNameResults: QueryResult<any> = await pool.query(checkGameNameAvailabilityQuery, [gameName]);

    return gameNameResults.rowCount === 0;
  }
}