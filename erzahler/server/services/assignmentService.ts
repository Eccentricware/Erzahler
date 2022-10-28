import { DecodedIdToken } from "firebase-admin/auth";
import { AccountService } from "./accountService";

export class AssignmentService {
  user: any = undefined;

  async addUserAsPlayer(idToken: string, gameId: number) {
    const accountService: AccountService = new AccountService();

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {

    }
  }
}