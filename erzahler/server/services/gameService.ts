export class GameService {
  async newGame(requestBody: any, idToken: string): Promise<any> {
    console.log(requestBody);
    return 'A new phase begins!';
  }
}