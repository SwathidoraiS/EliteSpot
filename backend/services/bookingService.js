const { slots, bookings } = require("../data/store");

const getAllBookings = async () => {
  return { success: true, bookings };
};

const createBooking = async ({ slotId, date, fromTime, toTime, plateNumber}) => {

  const slot = slots.find(s => s.id === slotId);
  if (!slot) throw new Error("Slot not found");

  if (slot.status !== "available")
    throw new Error("Slot already reserved");

  const booking = {
    id: Date.now().toString(),
    slotId,
    plateNumber,
    date,
    fromTime,
    toTime
  };

  bookings.push(booking);
  slot.status = "reserved";

  return { success: true, booking };
};

const cancelBooking = async (bookingId) => {

  const index = bookings.findIndex(b => b.id === bookingId);
  if (index === -1) throw new Error("Booking not found");

  const { slotId } = bookings[index];
  const slot = slots.find(s => s.id === slotId);
  if (slot) slot.status = "available";

  bookings.splice(index, 1);

  return { success: true, message: "Cancelled successfully" };
};

module.exports = {
  getAllBookings,
  createBooking,
  cancelBooking
};