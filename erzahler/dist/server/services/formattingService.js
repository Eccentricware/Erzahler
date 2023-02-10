"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormattingService = void 0;
class FormattingService {
    convertSnakeToCamelCase(snakeCase) {
        const snakeSplit = snakeCase.split('_');
        for (let index = 0; index < snakeSplit.length; index++) {
            snakeSplit[index] = snakeSplit[index].toLowerCase();
            if (index > 0) {
                snakeSplit[index] = snakeSplit[index][0].toUpperCase() + snakeSplit[index].slice(1);
            }
        }
        return snakeSplit.join('');
    }
    convertKeysSnakeToCamel(snakeCaseObject) {
        const camelCaseObject = {};
        for (const snakeCaseKey in snakeCaseObject) {
            camelCaseObject[this.convertSnakeToCamelCase(snakeCaseKey)] = snakeCaseObject[snakeCaseKey];
        }
        return camelCaseObject;
    }
}
exports.FormattingService = FormattingService;
//# sourceMappingURL=formattingService.js.map