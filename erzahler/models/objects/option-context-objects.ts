export interface OptionsContext {
  unitInfo: UnitOptions[]
  unitIdToIndexLib: any;
  sharedAdjProvinces: any;
  transportPaths: any;
  transports: any;
  transportables: any;
  transportDestinations: any;
}

export interface UnitOptions {
  unitId: number;
  unitName: string;
  unitType: string;
  nodeId: number;
  nodeName: string;
  provinceId: number;
  provinceName: string;
  adjacencies: AdjacenctMovement[];
  holdSupports: HoldSupport[] | undefined;
  moveSupports: any;
  adjacentTransports: AdjacentTransport[] | undefined;
  adjacentTransportables: AdjacentTransportable[] | undefined;
  transportDestinations: TransportDestination[] | undefined;
}

export interface AdjacenctMovement {
  nodeId: number;
  provinceId: number;
}


interface HoldSupport {
  unitId: number;
  unitName: string;
}

export interface MoveSupport {
  unitId: number;
  nodeId: number[];
}

interface AdjacentTransport {
  unitId: number;
  unitName: string;
}

interface AdjacentTransportable {
  unitId: number;
  unitName: string;
}

interface TransportDestination {
  nodeId: number;
  nodeName: string;
}

export interface UnitAdjacyInfoResult {
  unit_id: number;
  unit_name: string;
  unit_type: string;
  node_id: number;
  node_name: string;
  province_id: number;
  province_name: string;
  adjacencies: AdjacenctMovementResult[];
  hold_supports: HoldSupportResult[] | undefined;
  adjacent_transports: AdjacentTransportResult[] | undefined;
  adjacent_transportables: AdjacentTransportableResult[] | undefined;
  transport_destinations: TransportDestinationResult[] | undefined;
}


interface AdjacenctMovementResult {
  node_id: number;
  province_id: number;
}

interface HoldSupportResult {
  unit_id: number;
  unit_name: string;
}

interface AdjacentTransportResult {
  unit_id: number;
  unit_name: string;
}

interface AdjacentTransportableResult {
  unit_id: number;
  unit_name: string;
}

interface TransportDestinationResult {
  node_id: number;
  node_name: string;
}

export interface TransportPathLink {
  transportsSoFar: number[];
  destinationsSoFar: number[];
  transportOptions: number[];
  nextTransportLink: any;
}