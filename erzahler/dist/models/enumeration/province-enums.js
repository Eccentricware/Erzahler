"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolutionEvent = exports.ProvinceStatus = exports.VoteType = exports.ProvinceType = void 0;
var ProvinceType;
(function (ProvinceType) {
    ProvinceType["COAST"] = "coast";
    ProvinceType["SEA"] = "sea";
    ProvinceType["INLAND"] = "inland";
    ProvinceType["ISLAND"] = "island";
    ProvinceType["IMPASSIBLE"] = "impassible";
    ProvinceType["DECORATIVE"] = "decorative";
    ProvinceType["POLE"] = "pole";
})(ProvinceType = exports.ProvinceType || (exports.ProvinceType = {}));
var VoteType;
(function (VoteType) {
    VoteType["CAPITAL"] = "capital";
    VoteType["VOTE"] = "vote";
    VoteType["NONE"] = "none";
})(VoteType = exports.VoteType || (exports.VoteType = {}));
var ProvinceStatus;
(function (ProvinceStatus) {
    ProvinceStatus["ACTIVE"] = "active";
    ProvinceStatus["BOMBARDED"] = "bombarded";
    ProvinceStatus["DORMANT"] = "dormant";
    ProvinceStatus["NUKED"] = "nuked";
    ProvinceStatus["INERT"] = "inert";
})(ProvinceStatus = exports.ProvinceStatus || (exports.ProvinceStatus = {}));
var ResolutionEvent;
(function (ResolutionEvent) {
    ResolutionEvent["CONTESTED"] = "contested";
    ResolutionEvent["NUKED"] = "nuked";
    ResolutionEvent["PERPETUATION"] = "perpetuation";
    ResolutionEvent["PRESENCE"] = "presence";
    ResolutionEvent["VACATION"] = "vacation";
})(ResolutionEvent = exports.ResolutionEvent || (exports.ResolutionEvent = {}));
//# sourceMappingURL=province-enums.js.map