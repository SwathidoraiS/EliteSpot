const { slots } = require("../data/store");

const getLayout = async (parkingId) => {

  const counts = slots.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return {
    parkingId,
    slots,
    availableCount: counts.available || 0,
    reservedCount: counts.reserved || 0,
    parkedCount: counts.parked || 0
  };
};

module.exports = { getLayout };