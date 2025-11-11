function notFound(req, res) {
  res.status(404).json({ ok: false, error: "Route not found" });
}

function onError(err, req, res, _next) {
  console.error("[error]", err);
  const status = err.status || 500;
  res.status(status).json({ ok: false, error: err.message || "Server error" });
}

module.exports = { notFound, onError };
