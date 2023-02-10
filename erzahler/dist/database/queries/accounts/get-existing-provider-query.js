"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingProviderQuery = void 0;
exports.getExistingProviderQuery = `
  SELECT u.username,
    p.uid,
    p.provider_type
  FROM users u
  INNER JOIN providers p
  ON u.user_id = p.user_id
  WHERE uid = $1
  OR (u.username = $2 AND p.provider_type = 'password');
`;
//# sourceMappingURL=get-existing-provider-query.js.map