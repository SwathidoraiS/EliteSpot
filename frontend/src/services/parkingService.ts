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
 const formatDateTime = (date: string, time: string) =>
   `${date} ${time}:00`;
 const startTime = formatDateTime(date, fromTime);
 // Default: same day
 let endDate = date;
 // If TO time is earlier than FROM time,
 // the booking crosses midnight.
 if (toTime < fromTime) {
   const nextDay = new Date(`${date}T00:00:00`);
   nextDay.setDate(nextDay.getDate() + 1);
   endDate = [
    nextDay.getFullYear(),
    String(nextDay.getMonth() + 1).padStart(2,"0"),
    String(nextDay.getDate()).padStart(2,"0"),].join("-");
 }
 const endTime = formatDateTime(endDate, toTime);
 console.log("START:", startTime);
 console.log("END:", endTime);
 const res = await fetch(
   `${BASE_URL}/parking/${parkingId}/layout?startTime=${encodeURIComponent(
     startTime
   )}&endTime=${encodeURIComponent(endTime)}`
 );
 return handleResponse(res);
}

export async function fetchLayoutByRange(
 parkingId: string,
 bookingStart: string,
 bookingEnd: string
) {
 const res = await fetch(
   `${BASE_URL}/parking/${parkingId}/layout?startTime=${encodeURIComponent(
     bookingStart
   )}&endTime=${encodeURIComponent(bookingEnd)}`
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
   Edit Booking
========================================================= */

export async function editBooking(
  bookingId: number,
  bookingData: {
    slotId: string;
    booking_start: string;
    booking_end: string;
    purpose?: string;
  }
) {
  const res = await fetch(
    `${BASE_URL}/bookings/edit/${bookingId}`,
    {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    }
  );

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
   Business Trip Logic
========================================================= */

export async function getPendingBusinessTrips() {
 const res = await fetch(
   `${BASE_URL}/business-trips/pending`,
   {
     method: "GET",
     credentials: "include",
   }
 );
 return handleResponse(res);
}

export const approveBusinessTrip = async (requestId: number) => {
 const res = await fetch(
   `${BASE_URL}/business-trips/${requestId}/approve`,
   {
     method: "PUT",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${localStorage.getItem("token")}`,
     },
   }
 );
 return handleResponse(res);
};
export const rejectBusinessTrip = async (
 requestId: number,
 reason: string
) => {
 const res = await fetch(
   `${BASE_URL}/business-trips/${requestId}/reject`,
   {
     method: "PUT",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${localStorage.getItem("token")}`,
     },
     body: JSON.stringify({
       reason,
     }),
   }
 );
 return handleResponse(res);
};
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