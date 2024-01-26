import { Serializer } from 'v8';
import { CountryStatus } from '../../models/enumeration/country-enum';
import { DayOfWeek } from '../../models/enumeration/day_of_week-enum';
import { DeadlineSchedule } from '../../models/enumeration/deadline-schedule-enum';
import { GameStatus } from '../../models/enumeration/game-status-enum';
import { OrderDisplay } from '../../models/enumeration/order-display-enum';
import { ProvinceStatus } from '../../models/enumeration/province-enums';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { BuildType, UnitStatus, UnitType } from '../../models/enumeration/unit-enum';

export interface GameRowResult {
  game_id?: number;
  game_name?: string;
  time_created?: Date | string;
  game_status?: GameStatus;
  current_year?: number;
  stylized_start_year?: number;
  concurrent_games_limit?: number;
  private_game?: boolean;
  hidden_game?: boolean;
  blind_administrators?: boolean;
  assignment_method?: string;
  deadline_type?: DeadlineSchedule;
  game_time_zone?: string; // Can enumerate this
  observe_dst?: boolean;
  start_time?: Date | string;
  orders_day?: DayOfWeek;
  orders_time?: Date | string;
  orders_span?: number;
  retreats_day?: DayOfWeek;
  retreats_time?: Date | string;
  retreats_span?: number;
  adjustments_day?: DayOfWeek;
  adjustments_time?: Date | string;
  adjustments_span?: number;
  nominations_day?: DayOfWeek;
  nominations_time?: Date | string;
  nominations_span?: number;
  votes_day?: DayOfWeek;
  votes_time?: Date | string;
  votes_span?: number;
  nmr_tolerance_total?: number;
  nmr_tolerance_orders?: number;
  nmr_tolerance_retreats?: number;
  nmr_tolerance_adjustments?: number;
  vote_delay_enabled?: boolean;
  vote_delay_lock?: number;
  vote_delay_percent?: number;
  vote_delay_count?: number;
  vote_delay_display_percent?: number;
  vote_delay_display_count?: number;
  confirmation_time?: number;
  partial_roster_start?: boolean;
  final_readiness_check?: boolean;
  nomination_timing?: string;
  nomination_year?: number;
  automatic_assignments?: boolean;
  rating_limits_enabled?: boolean;
  fun_min?: number;
  fun_max?: number;
  skill_min?: number;
  skill_max?: number;
  // ready_to_start?: boolean;
  ready_time?: Date | string;
  nominate_during_adjustments?: boolean;
  vote_during_spring?: boolean;
  default_nuke_range?: number;
}

export interface DbStates {
  game: GameRow;
  turn: TurnRow;
  orderSets: OrderSetRow[];
  orders: OrderRow[];
  unitHistories: UnitHistoryRow[];
  provinceHistories: ProvinceHistoryRow[];
  countryHistories: CountryHistoryRow[];
}

export interface DbUpdates {
  game: GameRow;
  turn: TurnRow;
  orderSets: OrderSetRow[];
  adjOrderSets: Record<number, OrderSetRow>;
  orders: OrderRow[];
  adjustmentOrders: OrderAdjustmentRow[];
  newUnits: InitialUnit[];
  unitHistories: UnitHistoryRow[];
  provinceHistories: ProvinceHistoryRow[];
  countryHistories: Record<string, CountryHistoryRow>;
}

export interface GameRow {
  gameId?: number;
  gameName?: string;
  timeCreated?: Date | string;
  gameStatus?: GameStatus;
  currentYear?: number;
  stylizedStartYear?: number;
  concurrentGamesLimit?: number;
  privateGame?: boolean;
  hiddenGame?: boolean;
  blindAdministrators?: boolean;
  assignmentMethod?: string;
  deadlineType?: DeadlineSchedule;
  gameTimeZone?: string; // Can enumerate this
  observeDst?: boolean;
  startTime?: Date | string;
  ordersDay?: DayOfWeek;
  ordersTime?: Date | string;
  ordersSpan?: number;
  retreatsDay?: DayOfWeek;
  retreatsTime?: Date | string;
  retreatsSpan?: number;
  adjustmentsDay?: DayOfWeek;
  adjustmentsTime?: Date | string;
  adjustmentsSpan?: number;
  nominationsDay?: DayOfWeek;
  nominationsTime?: Date | string;
  nominationsSpan?: number;
  votesDay?: DayOfWeek;
  votesTime?: Date | string;
  votesSpan?: number;
  nmrToleranceTotal?: number;
  nmrToleranceOrders?: number;
  nmrToleranceRetreats?: number;
  nmrToleranceAdjustments?: number;
  voteDelayEnabled?: boolean;
  voteDelayLock?: number;
  voteDelayPercent?: number;
  voteDelayCount?: number;
  voteDelayDisplayPercent?: number;
  voteDelayDisplayCount?: number;
  confirmationTime?: number;
  partialRosterStart?: boolean;
  finalReadinessCheck?: boolean;
  nominationTiming?: string;
  nominationYear?: number;
  automaticAssignments?: boolean;
  ratingLimitsEnabled?: boolean;
  funMin?: number;
  funMax?: number;
  skillMin?: number;
  skillMax?: number;
  // readyToStart?: boolean;
  readyTime?: Date | string;
  nominateDuringAdjustments?: boolean;
  voteDuringSpring?: boolean;
  defaultNukeRange?: number;
}

export interface TurnRowResult {
  turn_id?: number;
  game_id?: number;
  deadline?: Date | string;
  turn_number?: number;
  turn_name?: string;
  turn_type?: TurnType;
  turn_status?: TurnStatus;
  resolved_time?: Date | string;
  deadline_missed?: boolean;
  year_number?: number;
  defaults_ready?: boolean;
}

export interface TurnRow {
  turnId?: number;
  gameId?: number;
  deadline?: Date | string;
  turnNumber?: number;
  turnName?: string;
  turnType?: TurnType;
  turnStatus?: TurnStatus;
  resolvedTime?: Date | string;
  deadlineMissed?: boolean;
  yearNumber?: number;
  defaultsReady?: boolean;
}

export interface OrderSetRowResult {
  order_set_id: number;
  country_id: number;
  turn_id: number;
  message_id: number;
  submission_time: Date | string;
  order_set_type: OrderDisplay;
  order_set_name: string;
  default_orders: boolean;
  tech_partner_id: number;
  tech_transfer_success: boolean;
  increase_range: number;
  increase_range_success: boolean;
  units_disbanding: number;
  nomination: number;
  nomination_success: boolean;
  votes: number;
  vote_success: boolean;
}

export interface OrderSetRow {
  orderSetId: number;
  countryId: number;
  turnId: number;
  messageId: number;
  submissionTime: Date | string;
  orderSetType: OrderDisplay;
  orderSetName: string;
  defaultOrders: boolean;
  techPartnerId: number;
  techTransferSuccess: boolean;
  increaseRange: number;
  increaseRangeSuccess: boolean;
  unitsDisbanding: number;
  nomination: number;
  nominationSuccess: boolean;
  votes: number;
  voteSuccess: boolean;
}

export interface OrderRowResult {
  order_id?: number;
  order_set_id?: number;
  order_type?: OrderDisplay;
  ordered_unit_id?: number;
  secondary_unit_id?: number;
  destination_id?: number;
  order_status?: string;
  valid?: boolean;
  order_success?: boolean;
  power?: number;
  description?: string;
  primary_resolution?: string;
  secondary_resolution?: string;
}

export interface OrderRow {
  orderId?: number;
  orderSetId?: number;
  orderType?: OrderDisplay;
  orderedUnitId?: number;
  secondaryUnitId?: number;
  destinationId?: number;
  orderStatus?: string;
  valid?: boolean;
  orderSuccess?: boolean;
  power?: number;
  description?: string;
  primaryResolution?: string;
  secondaryResolution?: string;
}

export interface OrderAdjustmentRowResult {
  build_order_id: number;
  order_set_id: number;
  node_id: number | null;
  build_type: BuildType;
  success: boolean;
}

export interface OrderAdjustmentRow {
  buildOrderId: number;
  orderSetId: number;
  nodeId: number | null;
  buildType: BuildType;
  success: boolean;
}

export interface UnitRowResult {
  unit_id: number;
  country_id: number;
  unit_name: string;
  unit_type: UnitType | BuildType;
}

export interface UnitRow {
  unitId?: number;
  countryId: number;
  unitName: string;
  unitType: UnitType | BuildType;
}

export interface UnitHistoryRowResult {
  unit_history_id?: number;
  unit_id: number;
  turn_id?: number;
  node_id: number;
  unit_status: UnitStatus;
  displacer_province_id?: number;
}

export interface UnitHistoryRow {
  unitHistoryId?: number;
  unitId: number;
  turnId?: number;
  nodeId: number;
  unitStatus: UnitStatus;
  displacerProvinceId?: number;
}

export interface ProvinceHistoryRowResult {
  province_id: number;
  turn_id?: number;
  controller_id: number | null;
  province_status: ProvinceStatus;
  valid_retreat: boolean;
}

export interface ProvinceHistoryRow {
  provinceId: number;
  turnId?: number;
  controllerId: number | null;
  capitalOwnerId: number | null;
  provinceStatus: ProvinceStatus;
  validRetreat: boolean;
}

export interface CountryHistoryRowResult {
  turn_id: number | undefined;
  country_id: number;
  country_status: CountryStatus;
  city_count: number;
  unit_count: number;
  banked_builds: number;
  nuke_range: number;
  adjustments: number;
  in_retreat: boolean;
  vote_count: number;
  nukes_in_production: number;
}

export interface CountryHistoryRow {
  turnId: number | undefined;
  countryId: number;
  countryStatus: CountryStatus;
  cityCount: number;
  unitCount: number;
  bankedBuilds: number;
  nukeRange: number;
  adjustments: number;
  inRetreat: boolean;
  voteCount: number;
  nukesInProduction: number;
}

export interface CountryStatCountsResult {
  country_id: number;
  unit_count: number;
  city_count: number;
  vote_count: number;
}

export interface CountryStatCounts {
  countryId: number;
  unitCount: number;
  cityCount: number;
  voteCount: number;
}

export interface InitialUnit {
  countryId: number;
  unitName: string;
  unitType: UnitType | BuildType;
  turnId: number;
  nodeId: number;
  unitStatus: UnitStatus;
}