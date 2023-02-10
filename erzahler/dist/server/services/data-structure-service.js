"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyObjectOfArrays = exports.subtractArray = exports.mergeArrays = void 0;
function mergeArrays(array1, array2) {
    array2.forEach((element) => {
        if (!array1.includes(element)) {
            array1.push(element);
        }
    });
    return array1;
}
exports.mergeArrays = mergeArrays;
function subtractArray(filterArray, removeArray) {
    if (filterArray === undefined) {
        return [];
    }
    return filterArray.filter((element) => !removeArray.includes(element));
}
exports.subtractArray = subtractArray;
function copyObjectOfArrays(object) {
    const copy = {};
    for (const key in object) {
        copy[key] = object[key].slice();
    }
    return copy;
}
exports.copyObjectOfArrays = copyObjectOfArrays;
//# sourceMappingURL=data-structure-service.js.map