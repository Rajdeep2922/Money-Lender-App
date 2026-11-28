const Counter = require('../models/Counter');
const { generateDocumentNumber } = require('./formatters');

/** Returns the next integer for a counter key. */
async function nextSequence(key, session) {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session, setDefaultsOnInsert: true }
    );
    return counter.seq;
  } catch (err) {
    if (err?.code === 11000 && !session) {
      const counter = await Counter.findOneAndUpdate(
        { _id: key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return counter.seq;
    }
    throw err;
  }
}

/** Returns the next formatted document number, e.g. LN-2026-0007. */
async function nextDocumentNumber(key, prefix, session) {
  const seq = await nextSequence(key, session);
  // generateDocumentNumber(prefix, n) returns prefix-year-(n+1)
  return generateDocumentNumber(prefix, seq - 1);
}

/** Reserves a block of N numbers; returns the first number of the block. */
async function reserveSequenceBlock(key, count, session) {
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: count } },
    { new: true, upsert: true, session, setDefaultsOnInsert: true }
  );
  return counter.seq - count + 1;
}

module.exports = { nextSequence, nextDocumentNumber, reserveSequenceBlock };
