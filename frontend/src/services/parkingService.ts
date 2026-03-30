const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchLayout(
  parkingId: string,
  date: string,
  fromTime: string,
  toTime: string
) {

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}:00`;
  };

  const startTime = formatDateTime(date, fromTime);
  const endTime = formatDateTime(date, toTime);

  console.log("START:", startTime);
  console.log("END:", endTime);

  const res = await fetch(
    `${BASE_URL}/parking/${parkingId}/layout?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );


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

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

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

  if (!res.ok) throw new Error("Failed to fetch bookings");

  return res.json();
}