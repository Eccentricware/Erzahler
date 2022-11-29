export interface UnitAdjacencyInfo {
  unitId: number;
  unitName: string;
  unitType: string;
  nodeId: number;
  nodeName: string;
  provinceId: number;
  provinceName: string;
  adjacencies: AdjacenctMovement[];
  holdSupports: HoldSupport[];
  adjacentTransports: AdjacentTransport[];
  adjacentTransportables: AdjacentTransportable[];
  transportDestinations: TransportDestination[];
  turnType: string;
}

interface AdjacenctMovement {
  nodeId: number;
  provinceId: number;
}

interface HoldSupport {
  unitId: number;
  unitName: string;
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
  provinceId: number;
  provinceName: string;
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
  hold_supports: HoldSupportResult[];
  adjacent_transports: AdjacentTransportResult[];
  adjacent_transportables: AdjacentTransportableResult[];
  transport_destinations: TransportDestinationResult[];
  turn_type: string;
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
  province_id: number;
  province_name: string;
}