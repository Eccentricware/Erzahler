export class FormattingService {
  convertSnakeToCamelCase(snakeCase: string): string {
    const snakeSplit: string[] = snakeCase.split('_');
    for (let index = 0; index < snakeSplit.length; index++) {
      snakeSplit[index] = snakeSplit[index].toLowerCase();
      if (index > 0) {
        snakeSplit[index] = snakeSplit[index][0].toUpperCase() + snakeSplit[index].slice(1);
      }
    }
    return snakeSplit.join('');
  }

  convertKeysSnakeToCamel(snakeCaseObject: Record<string, unknown>): Record<string, unknown> {
    const camelCaseObject: Record<string, unknown> = {};

    for (const snakeCaseKey in snakeCaseObject) {
      camelCaseObject[this.convertSnakeToCamelCase(snakeCaseKey)] = snakeCaseObject[snakeCaseKey];
    }

    return camelCaseObject;
  }
}
