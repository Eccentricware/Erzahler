"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSetType = exports.OrderDisplay = void 0;
var OrderDisplay;
(function (OrderDisplay) {
    OrderDisplay["AIRLIFT"] = "Airlift";
    OrderDisplay["CONVOY"] = "Convoy";
    OrderDisplay["DISBAND"] = "Disband";
    OrderDisplay["HOLD"] = "Hold";
    OrderDisplay["INVALID"] = "Invalid (Holding)";
    OrderDisplay["MOVE"] = "Move";
    OrderDisplay["MOVE_CONVOYED"] = "Move Convoyed";
    OrderDisplay["NUKE"] = "Nuke";
    OrderDisplay["OFFER_TECH"] = "Offer Nuke Tech";
    OrderDisplay["RECEIVE_TECH"] = "Receive Nuke Tech From";
    OrderDisplay["RUSH_BUILD"] = "Rush Build";
    OrderDisplay["SUPPORT"] = "Support";
    OrderDisplay["SUPPORT_CONVOYED"] = "Support Convoyed";
    OrderDisplay["TRANSFER"] = "Transfer To";
})(OrderDisplay = exports.OrderDisplay || (exports.OrderDisplay = {}));
var OrderSetType;
(function (OrderSetType) {
    OrderSetType["ORDERS"] = "Orders";
    OrderSetType["PREDICTION"] = "Prediction";
    OrderSetType["SUGGESTION"] = "Suggestion";
})(OrderSetType = exports.OrderSetType || (exports.OrderSetType = {}));
//# sourceMappingURL=order-display-enum.js.map