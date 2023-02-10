"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProviderEmailStateQuery = void 0;
exports.syncProviderEmailStateQuery = `
  UPDATE providers
  SET email = $1,
    email_verified = $2,
    last_sign_in_time = $3
  WHERE uid = $4;
`;
//# sourceMappingURL=sync-provider-email-state-query.js.map