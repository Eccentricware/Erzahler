"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildType = exports.UnitType = exports.UnitStatus = void 0;
var UnitStatus;
(function (UnitStatus) {
    UnitStatus["ACTIVE"] = "Active";
    UnitStatus["DESTROYED_RETREAT"] = "Destroyed in Retreat";
    UnitStatus["DISBANNED_ADJUSTMENT"] = "Disbanned as Adjustment";
    UnitStatus["DISBANNED_RETREAT"] = "Disbanned in Retreat";
    UnitStatus["DETONATED"] = "Detonated";
    UnitStatus["NUKED"] = "Nuked";
    UnitStatus["RETREAT"] = "Retreat";
})(UnitStatus = exports.UnitStatus || (exports.UnitStatus = {}));
var UnitType;
(function (UnitType) {
    UnitType["ARMY"] = "Army";
    UnitType["FLEET"] = "Fleet";
    UnitType["GARRISON"] = "Garrison";
    UnitType["NUKE"] = "Nuke";
    UnitType["WING"] = "Wing";
})(UnitType = exports.UnitType || (exports.UnitType = {}));
var BuildType;
(function (BuildType) {
    BuildType["NUKE_START"] = "Start Nuke";
    BuildType["RANGE"] = "Nuke Range";
    BuildType["DISBAND"] = "Disband";
    BuildType["BUILD"] = "Banked Build";
    BuildType["ARMY"] = "Army";
    BuildType["FLEET"] = "Fleet";
    BuildType["WING"] = "Wing";
    BuildType["NUKE_RUSH"] = "Rush Nuke";
    BuildType["NUKE_FINISH"] = "Finish Nuke"; // 5
})(BuildType = exports.BuildType || (exports.BuildType = {}));
//# sourceMappingURL=unit-enum.js.map