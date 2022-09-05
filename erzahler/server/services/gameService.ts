import { error } from "console";
import { DecodedIdToken } from "firebase-admin/auth";
import { Pool, QueryResult } from "pg";
import { getCountriesByGameIdQuery } from "../../database/queries/game/get-countries-by-gameId";
import { getProvincesByGameIdQuery } from "../../database/queries/game/get-provinces-by-gameId";
import { insertAssignmentQuery } from "../../database/queries/game/insert-assignment-query";
import { insertBridgeQuery } from "../../database/queries/game/insert-bridge-query";
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
    provinces: {}
  };
  gameData: any = {};
  user: any = undefined;

  async newGame(gameData: any, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      this.user = await accountService.getUserProfile(idToken);
      const pool: Pool = new Pool(victorCredentials);
      // console.log('Game Data:', gameData);

      const idLibrary: any = await this.createNewGameIdLibrary(pool);
      this.gameData = gameData;

      await this.addNewGame(pool, this.gameData);

      // Unnecessary progress tracker line

      await this.addTerrain(pool, gameData);
      await this.addBridges(pool, gameData);
      await this.addLabels(pool, gameData);
      await this.addNodes(pool, gameData);
      await this.addNodeAdjacencies(pool, gameData);
      await this.addCountryInitialHistory(pool, gameData, 0);
      await this.addUnits(pool, gameData);
      await this.addUnitInitialHistory(pool, gameData, 0);
    } else {
      console.log('Invalid Token UID');
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

    const result: any = await pool.query(insertNewGameQuery, settingsArray)
    .then(async (results: QueryResult<any>) => {
      this.idLibrary.game = results.rows[0].game_id;
      await this.addCreatorAssignment(pool, this.idLibrary.game, this.user.user_id);
      await this.addRulesInGame(pool, this.gameData.rules, this.idLibrary);
      await this.addTurn0(pool);


    })
    .catch((error: Error) => {
      console.log('New game Error:', error.message);
    });
  }

  async addCreatorAssignment(pool: Pool, gameId: number, userId: number): Promise<void> {
    pool.query(insertAssignmentQuery, [
      userId,
      gameId,
      null,
      'creator'
    ])
    .catch((error: Error) => {
      console.log('New Assignment Error:', error.message);
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
      this.idLibrary.turns[0] = result.rows[0].turn_id;
      this.addTurn1(pool);
    })
    .catch((error: Error) => {
      console.log('Turn 0 Error: ', error.message);
      return 0;
    });
  }

  async addTurn1(pool: Pool): Promise<void> {
    this.idLibrary.turns[1] = pool.query(insertTurnQuery, [
      this.idLibrary.game,
      this.gameData.firstTurnDeadline,
      1,
      `Winter ${this.gameData.stylizedStartYear + 1}`,
      'orders',
      'paused'
    ])
    .then(async (result: any) => {
      this.idLibrary.turns[1] = result.rows[0].turn_id;
      await this.addCountries(pool, this.gameData, this.idLibrary);
    })
    .catch((error: Error) => {
      console.log('Turn 1 Error: ', error.message);
      return 0;
    });
  }

  async addRulesInGame(pool: Pool, rules: any, idLibrary: any): Promise<any> {
    rules.forEach(async (rule: any) => {
      await pool.query(insertRuleInGameQuery, [
        this.idLibrary.game,
        this.idLibrary.rules[rule.key],
        rule.enabled
      ])
      .catch((error: Error) => {
        console.log('Rule In Games Error:', error.message);
      });
    });
  }

  async addCountries(pool: Pool, gameData: any, idLibrary: any): Promise<void> {
    const newCountries: Promise<any>[] = gameData.map.countries.map(async (country: any) => {
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
      });
    });

    Promise.all(newCountries)
    .then(async () => {
      await this.addProvinces(pool, this.gameData, this.idLibrary);
    });
  }

  async addCountriesToIdLibrary(pool: Pool, idLibrary: any): Promise<void> {
    const insertedCountryResults: QueryResult<any> = await pool.query(getCountriesByGameIdQuery, [idLibrary.game]);
    insertedCountryResults.rows.forEach((country: any) => {
      idLibrary.countries[country.country_name] = country.country_id;
    });
  }

  async addProvinces(pool: Pool, gameData: any, idLibrary: any): Promise<void> {
    const provincePromises: Promise<any>[] = this.gameData.map.provinces.map((province: any) => {
      return pool.query(insertProvinceQuery, [
        this.idLibrary.game,
        province.name,
        province.fullName,
        province.type,
        province.voteType
      ])
      .then((result: QueryResult<any>) => {
        return result.rows[0];
      })
      .catch((error: Error) => {
        console.log('Insert Province Error:', error.message);
      });
    });
    // await this.addProvincesToIdLibrary(pool, idLibrary);
    Promise.all(provincePromises)
      .then((resolvedProvincePromises) => {
        resolvedProvincePromises.forEach((province: any) => {
          this.idLibrary.provinces[province.province_name] = province.province_id;
        });
        this.addProvinceHistories(pool);
      });
  }

  // async addProvincesToIdLibrary(pool: Pool, idLibrary: any): Promise<void> {
  //   const { rows } = await pool.query(getProvincesByGameIdQuery, [idLibrary.game]);
  //   rows.forEach(async (province: any) => {
  //     idLibrary[province.province_name] = province.province_id;
  //   });
  // }

  async addProvinceHistories(pool: Pool): Promise<any> {
    console.log('idLibrary.turns at Province History:', this.idLibrary.turns);
    this.gameData.map.provinces.forEach(async (province: any) => {
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
      });
    });
  }

  async addTerrain(pool: Pool, gameData: any): Promise<any> {
    gameData.provinces.terrain.forEach(async (terrain: any) => {
      pool.query(insertTerrainQuery, [
        0,
        terrain.renderCategory,
        terrain.points,
        terrain.topBound,
        terrain.leftBound,
        terrain.rightBound,
        terrain.bottomBound
      ])
      .catch((error: Error) => {
        console.log('Insert Terrain Error:', error.message);
      });
    });
  }

  async addBridges(pool: Pool,  gameData: any): Promise<any>{
    gameData.bridges.forEach(async (bridge: any) => {
      pool.query(insertBridgeQuery, [
        bridge.province1,
        bridge.province2,
        bridge.points
      ])
      .catch((error: Error) => {
        console.log('Insert Bridgs Error:', error.message);
      });
    });
  }

  async addLabels(pool: Pool, gameData: any): Promise<any> {
    gameData.labels.forEach(async (label: any) => {
      pool.query(insertLabelQuery, [
        label.provinceId,
        label.loc,
        label.labelText
      ])
      .catch((error: Error) => {
        console.log('Insert Label Error:', error.message);
      });
    });
  }

  async addNodes(pool: Pool, gameData: any): Promise<any> {
    gameData.provinces.nodes.forEach(async (node: any) => {
      pool.query(insertNodeQuery, [
        node.province_id,
        node.node_type,
        node.loc
      ])
      .catch((error: Error) => {
        console.log('Insert Node Error:', error.message);
      });
    });
  }

  async addNodeAdjacencies(pool: Pool, gameData: any): Promise<any> {
    gameData.nodeAdjacencies.forEach(async (link: any) => {
      pool.query(insertNodeAdjacencyQuery, [
        link.node1,
        link.node2
      ])
      .catch((error: Error) => {
        console.log('Insert Node Adjacency Error:', error.message);
      });
    });
  }

  async addCountryInitialHistory(pool: Pool, gameData: any, newTurnId: number): Promise<any> {
    gameData.nodeAdjacencies.forEach(async (country: any) => {
      pool.query(insertCountryHistoryQuery, [
        country.country_id,
        newTurnId,
        country.status,
        country.city_count,
        country.unit_count,
        country.banked_builds,
        country.nuked_range,
        country.adjustments
      ])
      .catch((error: Error) => {
        console.log('Insert Country History Error:', error.message);
      });
    });
  }

  async addUnits(pool: Pool, gameData: any): Promise<any> {
    gameData.units.forEach(async (unit: any) => {
      pool.query(insertUnitQuery, [
        unit.country,
        unit.type
      ])
      .catch((error: Error) => {
        console.log('Insert Unit Error:', error.message);
      });
    });
  }

  async addUnitInitialHistory(pool: Pool, gameData: any, turnId: number): Promise<any> {
    gameData.units.forEach(async (unit: any) => {
      pool.query(insertUnitHistoryQuery, [
        unit.id,
        turnId,
        unit.node,
        'active'
      ])
      .catch((error: Error) => {
        console.log('Insert Unit History Error:', error.message);
      });
    });
  }

  async createNewGameIdLibrary(pool: Pool): Promise<void> {
    const ruleResults: QueryResult<any> = await pool.query('SELECT * FROM rules');
    ruleResults.rows.forEach((rule: any) => {
      this.idLibrary.rules[rule.rule_key] = rule.rule_id;
    });
  }
}