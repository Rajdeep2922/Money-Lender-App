const { AppError } = require('../middleware/errorHandler');

function lenderIdOf(req) {
  const id = req.user?.lenderId?._id || req.user?.lenderId;
  if (!id) throw new AppError('Lender profile not configured', 403);
  return id;
}

function tenantFilter(req, extra = {}) {
  return { ...extra, lenderId: lenderIdOf(req) };
}

module.exports = { lenderIdOf, tenantFilter };
