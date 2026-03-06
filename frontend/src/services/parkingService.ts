const BASE_URL = "http://localhost:5000/api";

export async function fetchLayout(parkingId: string) {
  const res = await fetch(`${BASE_URL}/parking/${parkingId}/layout`);
  if (!res.ok) throw new Error("Failed to fetch layout");
  return res.json();
}

export async function createBooking(data: any) {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error(result);
    throw new Error(result.message || "Booking failed");
  }

  return result;
}

export async function cancelBooking(bookingId: string) {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Cancel failed");
  }

  return result;
}

export async function fetchBookings() {
  const res = await fetch(`${BASE_URL}/bookings`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}


export async function fetchMyBookings() {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/bookings/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Failed to fetch my bookings");

  return res.json();
}