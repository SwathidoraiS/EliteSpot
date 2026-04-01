/* =========================================================
   Base URL (from environment)
========================================================= */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* =========================================================
   Helper: Get Auth Headers
========================================================= */

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* =========================================================
   Helper: Handle Response
========================================================= */

const handleResponse = async (res: Response) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

/* =========================================================
   Fetch Parking Layout
========================================================= */

export async function fetchLayout(
  parkingId: string,
  date: string,
  fromTime: string,
  toTime: string
) {
  // Format date + time → "YYYY-MM-DD HH:mm:ss"
  const formatDateTime = (date: string, time: string) =>
    `${date} ${time}:00`;

  const startTime = formatDateTime(date, fromTime);
  const endTime = formatDateTime(date, toTime);

  console.log("START:", startTime);
  console.log("END:", endTime);

  const res = await fetch(
    `${BASE_URL}/parking/${parkingId}/layout?startTime=${encodeURIComponent(
      startTime
    )}&endTime=${encodeURIComponent(endTime)}`
  );

  return handleResponse(res);
}

/* =========================================================
   Create Booking
========================================================= */

export async function createBooking<T = unknown>(data: T) {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

/* =========================================================
   Cancel Booking
========================================================= */

export async function cancelBooking(bookingId: string) {
  const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
}

/* =========================================================
   Fetch All Bookings (Admin)
========================================================= */

export async function fetchBookings() {
  const res = await fetch(`${BASE_URL}/bookings`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
}

/* =========================================================
   Fetch My Bookings (User)
========================================================= */

export async function fetchMyBookings() {
  const res = await fetch(`${BASE_URL}/bookings/my`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
}