const crypto = require("crypto");

function id(hexBytes = 8) {
  return crypto.randomBytes(hexBytes).toString("hex");
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function hmacHex(secret, payload) {
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto.createHmac("sha256", String(secret)).update(data).digest("hex");
}

module.exports = { id, sha256Hex, hmacHex };
