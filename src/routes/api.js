const express = require("express");
const { id, hmacHex } = require("../lib/crypto");

const router = express.Router();

// In-memory stores (stateless between deploys; fine for demo)
const proofs = new Map();      // proof -> { amount, to, memo, ts, nonce }
const receipts = new Map();    // receiptId -> { proof, signature, issuedAt }
const txs = [];                // { id, signature, proof, to, amount, asset, status, ts }

const PROVER_SECRET = process.env.PROVER_SECRET || "dashlabs-dev-secret";

/**
 * GET /api/health
 */
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    name: "dashlabs-backend",
    time: new Date().toISOString(),
    uptime: process.uptime(),
    commit: process.env.RENDER_GIT_COMMIT || null
  });
});

/**
 * POST /api/prove
 * Body: { amount, to, memo? }
 * Returns: { ok, proof, ts, timeMs }
 */
router.post("/prove", async (req, res) => {
  const t0 = Date.now();
  const { amount, to, memo = "" } = req.body || {};

  if (!amount || !to) {
    return res.status(400).json({ ok: false, error: "amount and to are required" });
  }

  // Minimal validation
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ ok: false, error: "amount must be a positive number" });
  }

  const nonce = id(4);
  const ts = Date.now();

  // "Proof" = HMAC of inputs + nonce; replace with real ZK later
  const proof = hmacHex(PROVER_SECRET, { amount: amt, to, memo, ts, nonce });

  proofs.set(proof, { amount: amt, to, memo, ts, nonce });

  // Simulate a short computation time
  await new Promise((r) => setTimeout(r, 120));

  res.json({
    ok: true,
    proof,
    ts,
    timeMs: Date.now() - t0
  });
});

/**
 * POST /api/verify
 * Body: { proof }
 * Returns: { ok, valid, meta? }
 */
router.post("/verify", (req, res) => {
  const { proof } = req.body || {};
  if (!proof) return res.status(400).json({ ok: false, error: "proof is required" });

  const found = proofs.get(proof);
  return res.json({ ok: true, valid: Boolean(found), meta: found || null });
});

/**
 * POST /api/transfer
 * Body: { proof }
 * Returns: { ok, signature, id, status }
 */
router.post("/transfer", async (req, res) => {
  const { proof } = req.body || {};
  if (!proof) return res.status(400).json({ ok: false, error: "proof is required" });

  // In a real impl, verify proof and submit on-chain transaction.
  const meta = proofs.get(proof);
  if (!meta) return res.status(400).json({ ok: false, error: "unknown proof" });

  // Simulated "on-chain" signature
  const signature = "sig_" + id(16);
  const tx = {
    id: "tx_" + id(6),
    signature,
    proof,
    to: meta.to,
    amount: meta.amount,
    asset: "UNKNOWN",
    status: "submitted",
    ts: Date.now()
  };
  txs.unshift(tx);

  // async "confirm"
  setTimeout(() => {
    tx.status = "confirmed";
  }, 1000);

  res.json({ ok: true, signature, id: tx.id, status: tx.status });
});

/**
 * POST /api/receipt
 * Body: { proof, signature }
 * Returns: { ok, receipt, issuedAt }
 */
router.post("/receipt", (req, res) => {
  const { proof, signature } = req.body || {};
  if (!proof || !signature) {
    return res.status(400).json({ ok: false, error: "proof and signature are required" });
  }

  const receipt = "zkr_" + id(10);
  const issuedAt = new Date().toISOString();
  receipts.set(receipt, { proof, signature, issuedAt });
  res.json({ ok: true, receipt, issuedAt });
});

/**
 * GET /api/activity
 * Returns recent txs (most recent first)
 */
router.get("/activity", (_req, res) => {
  res.json({ ok: true, items: txs.slice(0, 50) });
});

module.exports = router;
