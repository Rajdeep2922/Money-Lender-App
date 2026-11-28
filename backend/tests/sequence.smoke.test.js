const { nextDocumentNumber } = require('../src/utils/sequence');
const runMigration = require('../migrations/20261127_integrity_indexes');

// Ensure all models load cleanly
require('../src/models/Counter');
require('../src/models/Invoice');
require('../src/models/Payment');
require('../src/models/LoanRequest');
require('../src/models/Message');
require('../src/models/Loan');
require('../src/models/Lender');

describe('Phase 0 smoke tests', () => {
  it('nextDocumentNumber increments atomically per key', async () => {
    const year = new Date().getFullYear();
    const first = await nextDocumentNumber('loan:x', 'LN');
    const second = await nextDocumentNumber('loan:x', 'LN');
    expect(first).toBe(`LN-${year}-0001`);
    expect(second).toBe(`LN-${year}-0002`);
  });

  it('migration runs idempotently twice on an empty scratch DB', async () => {
    const res1 = await runMigration();
    const res2 = await runMigration();
    expect(res1.duplicatesFound).toBe(0);
    expect(res2.duplicatesFound).toBe(0);
  });
});
