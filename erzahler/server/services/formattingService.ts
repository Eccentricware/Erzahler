export class FormattingService {
  convertSnakeToCamelCase(snakeCase: string): string {
    let snakeSplit: string[] = snakeCase.split('_');
    for (let index: number = 0; index < snakeSplit.length; index++) {
      snakeSplit[index] = snakeSplit[index].toLowerCase();
      if (index > 0) {
        snakeSplit[index] = snakeSplit[index][0].toUpperCase() + snakeSplit[index].slice(1);
      }
    }
    return snakeSplit.join('');
  }

  convertKeysSnakeToCamel(snakeCaseObject: any): any {
    const camelCaseObject: any = {};

    for (let snakeCaseKey in snakeCaseObject) {
      camelCaseObject[this.convertSnakeToCamelCase(snakeCaseKey)] = snakeCaseObject[snakeCaseKey];
    }

    return camelCaseObject;
  }
}