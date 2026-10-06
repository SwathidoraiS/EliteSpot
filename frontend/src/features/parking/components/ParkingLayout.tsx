import { useState, useEffect } from "react";
import { initialSlots } from "../data/parkingLayout";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import UserMenu from "./UserMenu";
import Swal from "sweetalert2";
import "../styles/login.css";
import {
  fetchLayout,
  fetchLayoutByRange,
  createBooking,
  editBooking as editBookingAPI,
  cancelBooking as cancelBookingAPI,
  fetchMyBookings
} from "../../../services/parkingService";

import FilterBar from "./FilterBar";
import Dashboard from "./Dashboard";
import Legend from "./Legend";
import ParkingCanvas from "./ParkingCanvas";

// ============== COMPONENTS ==============
export default function ParkingLayout() {
  // ================= STATE =================
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };;

  const [slots, setSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const navigate = useNavigate();
  const bookingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const username = localStorage.getItem("username") || "";
  const [selectedArea, setSelectedArea] = useState("2");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBusinessTrip, setIsBusinessTrip] = useState(false);
  // ================= BUSINESS TRIP =================

  const [businessFromDate, setBusinessFromDate] = useState<Date | null>(null);
  const [businessToDate, setBusinessToDate] = useState<Date | null>(null);
  const [businessFromTime, setBusinessFromTime] = useState("");
  const [businessToTime, setBusinessToTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [normalFromDate, setNormalFromDate] = useState<Date | null>(new Date());
  const [normalToDate, setNormalToDate] = useState<Date | null>(new Date());
  const [timeLeft, setTimeLeft] = useState("");
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ================= UTILITIES =================
  // Convert 12hr → 24hr
  const convertTo24Hour = (time: string) => {
    if (!time) return "";

    const [t, period] = time.split(" ");
    const [parsedHours, minutes] = t.split(":").map(Number);

    let hours = parsedHours;

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateTime: string) => {
    if (!dateTime) return "";

    return dateTime.split("T")[0];
  };

  const formatDateOnly = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateObject = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getNextQuarterHour = () => {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Round up to next 15 minutes
    minutes = Math.ceil(minutes / 15) * 15;

    if (minutes === 60) {
      minutes = 0;
      hours += 1;
    }

    if (hours === 24) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    return () => {
      if (bookingTimeout.current) {
        clearTimeout(bookingTimeout.current);
      }
    };
  }, []);

  // Extract HH:mm from datetime
  const formatTime = (dateTime: string) => {
    if (!dateTime) return "";

    const timePart = dateTime.split("T")[1] || dateTime.split(" ")[1];
    const [hours, minutes] = timePart.split(":");

    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  useEffect(() => {
    console.log("myBookings:", myBookings);
  }, [myBookings]);

  /* ================= API LOGIC ================= */

  // Load Layout

  const loadLayout = async (bookingsOverride?: any[]) => {
    try {
      console.log("Selected Area:", selectedArea);

      console.log("🔄 loadLayout called");
      console.log("Current myBookings:", myBookings);

      let layoutData;
      if (isBusinessTrip) {
        if (
          !businessFromDate ||
          !businessToDate ||
          !businessFromTime ||
          !businessToTime
        ) {
          return;
        }
        const formatBusinessDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        const bookingStart = `${formatBusinessDate(
          businessFromDate
        )}T${businessFromTime}:00`;
        const bookingEnd = `${formatBusinessDate(
          businessToDate
        )}T${businessToTime}:00`;
        layoutData = await fetchLayoutByRange(
          selectedArea,
          bookingStart,
          bookingEnd
        );
        console.log("🚗 Business Trip Range:", {
          bookingStart,
          bookingEnd,
        });
      } else {
        if (
          !normalFromDate ||
          !normalToDate ||
          !fromTime ||
          !toTime
        ) {
          return;
        }
        const bookingStart =
          `${formatDateOnly(normalFromDate)}T${fromTime}:00`;
        const bookingEnd =
          `${formatDateOnly(normalToDate)}T${toTime}:00`;
        layoutData = await fetchLayoutByRange(
          selectedArea,
          bookingStart,
          bookingEnd
        );
        console.log("🚗 Normal Booking Range:", {
          bookingStart,
          bookingEnd,
        });
      }
      const bookingsToUse = bookingsOverride ?? myBookings;
      const updatedSlots = initialSlots.map((layoutSlot) => {
        const backendSlot = layoutData?.data?.slots?.find(
          (s: any) => String(s.slot_id) === String(layoutSlot.id)
        );

        console.log(
          layoutSlot.id,
          backendSlot
        );

        let state: "available" | "fixed" | "reserved" | "parked" = layoutSlot.status;
        const myBooking = bookingsToUse.find(
          (b: any) =>
            String(b.slot_id) === String(layoutSlot.id) &&
            (b.status === "BOOKED" || b.status === "PARKED")
        );

        if (myBooking) {
          state = myBooking.status === "BOOKED" ? "reserved" : "parked";
        } else if (backendSlot) {
          if (backendSlot.status === "reserved" || backendSlot.status === "BOOKED") {
            state = "reserved";
          }
          else if (
            backendSlot.status === "parked" ||
            backendSlot.status === "PARKED"
          ) {
            state = "parked";
          }
          else {
            state = "available"; // ✅ IMPORTANT
          }

        }
        if (layoutSlot.id === "21-C5") {
          console.log({
            myBooking,
            backendSlot,
            finalState: state,
          });
        }
        return {
          ...layoutSlot,
          state,
        };
      });
      setSlots(updatedSlots);
    } catch (error) {
      console.error("Layout fetch failed", error);
    }
  };

  // Check User Booking
  const checkUserBooking = async () => {
    try {
      const data = await fetchMyBookings();

      const activeBookings = data.bookings.filter(
        (b: any) => b.status === "BOOKED" || b.status === "PARKED"
      );

      setMyBookings(activeBookings);

      // ==========================================
      // ALWAYS SET FILTER TO NEXT TIME SLOT
      // ==========================================

      const now = new Date();
      const start = new Date(now);
      start.setMinutes(0, 0, 0);
      start.setHours(start.getHours() + 1);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const formatLocalTime = (date: Date) => {
        return `${String(date.getHours()).padStart(2, "0")}:00`;
      };
      const date = formatLocalDate(start);
      const from = formatLocalTime(start);
      const to = formatLocalTime(end);
      const nextStartDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      setSelectedDate(date);
      setNormalFromDate(nextStartDate);
      setNormalToDate(nextStartDate);
      setFromTime(from);
      setToTime(to);
      localStorage.setItem("selectedDate", date);
      localStorage.setItem("fromTime", from);
      localStorage.setItem("toTime", to);
      setBookingsLoaded(true);

    } catch (error) {
      console.error("Booking check failed", error);
      setBookingsLoaded(true);
    }
  };

  // Load My Bookings
  const loadMyBookings = async () => {
    try {
      const data = await fetchMyBookings();

      const activeBookings = data.bookings.filter(
        (b: any) => b.status === "BOOKED" || b.status === "PARKED"
      );

      setMyBookings(activeBookings);

      return activeBookings;
    } catch (error) {
      console.error("Booking fetch failed", error);
      return [];
    }
  };

  const hasActiveBooking = myBookings.some(
    (b: any) =>
      b.status === "BOOKED" || b.status === "PARKED"
  );
  const activeBooking = myBookings.find(
    (b: any) =>
      b.status === "BOOKED" || b.status === "PARKED"
  );


  // ================= INIT =================
  // Load saved filters
  useEffect(() => {
    const savedDate = localStorage.getItem("selectedDate");
    const savedFrom = localStorage.getItem("fromTime");
    const savedTo = localStorage.getItem("toTime");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    if (savedDate) {
      setSelectedDate(savedDate);
      const fromDate = new Date(`${savedDate}T00:00:00`);
      setNormalFromDate(fromDate);
      // Default To date = same day
      setNormalToDate(fromDate);
    } else {
      const dateString = getToday();
      setSelectedDate(dateString);
      setNormalFromDate(today);
      setNormalToDate(today);
      localStorage.setItem("selectedDate", dateString);
    }
    if (savedFrom && savedTo) {
      setFromTime(savedFrom);
      setToTime(savedTo);
    } else {
      const now = new Date();
      const start = new Date(now);
      const minutes = Math.ceil(start.getMinutes() / 15) * 15;
      start.setMinutes(minutes, 0, 0);
      if (start <= now) {
        start.setMinutes(start.getMinutes() + 15);
      }
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 15);
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const formatLocalTime = (date: Date) => {
        return `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`;
      };
      const date = formatLocalDate(start);
      const from = formatLocalTime(start);
      const to = formatLocalTime(end);
      setSelectedDate(date);
      setNormalFromDate(start);
      setNormalToDate(start);
      setFromTime(from);
      setToTime(to);
      localStorage.setItem("selectedDate", date);
      localStorage.setItem("fromTime", from);
      localStorage.setItem("toTime", to);
    }
    setFiltersLoaded(true);
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Load bookings first
  useEffect(() => {
    checkUserBooking();
  }, []);

  /* ================= MAIN LOGIC ================= */
  useEffect(() => {
    if (!filtersLoaded || !bookingsLoaded) return;
    // ================================
    // BUSINESS TRIP
    // ================================
    if (isBusinessTrip) {
      if (
        !businessFromDate ||
        !businessToDate ||
        !businessFromTime ||
        !businessToTime
      ) {
        return;
      }
      const formatBusinessDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const bookingStart = new Date(
        `${formatBusinessDate(businessFromDate)}T${businessFromTime}:00`
      );
      const bookingEnd = new Date(
        `${formatBusinessDate(businessToDate)}T${businessToTime}:00`
      );
      const now = new Date();
      // Start cannot be in the past
      if (bookingStart < now) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Start Time",
          text: "Business Trip cannot start in the past.",
        });
        return;
      }
      // End must be after start
      if (bookingEnd <= bookingStart) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Time Range",
          text: "To date and time must be later than From date and time.",
        });
        return;
      }
      loadLayout();
      return;
    }
    // ================================
    // NORMAL BOOKING
    // ================================
    if (
      !normalFromDate ||
      !normalToDate ||
      !fromTime ||
      !toTime
    ) {
      return;
    }
    const bookingStart = new Date(
      `${formatDateObject(normalFromDate)}T${fromTime}:00`
    );
    const bookingEnd = new Date(
      `${formatDateObject(normalToDate)}T${toTime}:00`
    );
    const now = new Date();
    // Start cannot be in the past
    if (!hasActiveBooking && bookingStart < now) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Start Time",
        text: "You cannot select a time that has already passed.",
      });
      return;
    }
    // End must be after start
    if (bookingEnd <= bookingStart) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Time Range",
        text: "To date and time must be later than From date and time.",
      });
      return;
    }
    loadLayout();
  }, [
    // Normal booking
    selectedDate,
    normalFromDate,
    normalToDate,
    fromTime,
    toTime,
    // Parking area
    selectedArea,
    // Business Trip
    isBusinessTrip,
    businessFromDate,
    businessToDate,
    businessFromTime,
    businessToTime,
    // Loading states
    filtersLoaded,
    bookingsLoaded,
  ]);

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    if (!normalFromDate || !normalToDate || !fromTime || !toTime) return;

    const interval = setInterval(async () => {
      try {
        const updatedBookings = await loadMyBookings();
        await loadLayout(updatedBookings);
      } catch (err) {
        console.error("Auto refresh failed", err);
      }
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, [normalFromDate, normalToDate, fromTime, toTime, selectedArea]);

  /* ================= AUTO CHANGE TIME SLOT AT HOUR ================= */
  useEffect(() => {
    const updateTimeSlot = () => {
      const now = new Date();
      const start = new Date(now);
      start.setMinutes(0, 0, 0);
      start.setHours(start.getHours() + 1);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const formatLocalTime = (date: Date) => {
        return `${String(date.getHours()).padStart(2, "0")}:00`;
      };
      const newDate = formatLocalDate(start);
      const newFromTime = formatLocalTime(start);
      const newToTime = formatLocalTime(end);
      setSelectedDate(newDate);
      setFromTime(newFromTime);
      setToTime(newToTime);
      // IMPORTANT
      setNormalFromDate(new Date(`${newDate}T00:00:00`));
      setNormalToDate(new Date(`${newDate}T00:00:00`));
      localStorage.setItem("selectedDate", newDate);
      localStorage.setItem("fromTime", newFromTime);
      localStorage.setItem("toTime", newToTime);

      loadLayout();
    };

    const now = new Date();

    // Milliseconds until the next hour
    const msUntilNextHour =
      (60 - now.getMinutes()) * 60 * 1000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();

    // Fire exactly at the next hour
    const timeout = setTimeout(() => {
      updateTimeSlot();

      // Then repeat every hour
      const interval = setInterval(updateTimeSlot, 60 * 60 * 1000);

      return () => clearInterval(interval);
    }, msUntilNextHour);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!activeBooking?.booking_end) {
      setTimeLeft("");
      return;
    }

    const updateTimer = () => {
      // Treat booking_end as local Japan time
      const endTime = new Date(
        activeBooking.booking_end.replace("Z", "")
      ).getTime();

      const now = Date.now();

      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft("Time's up");
        return;
      }

      const totalMinutes = Math.floor(
        difference / (1000 * 60)
      );

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        setTimeLeft(
          `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""
          } left`
        );
      } else {
        setTimeLeft(
          `${minutes} minute${minutes !== 1 ? "s" : ""} left`
        );
      }
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [activeBooking]);

  /* ================= UI ACTIONS ================= */
  // handle Slot Click
  const handleSlotClick = (id: string) => {
    const hasActiveBooking = myBookings.some(
      b => b.status === "BOOKED" || b.status === "PARKED"
    );
    // Normal booking: don't allow another slot
    // Edit mode: allow changing the slot
    if (hasActiveBooking && !isEditMode) {
      alert(t("cancelExistingBookingFirst"));
      return;
    }
    const clicked = slots.find(s => s.id === id);
    if (!clicked) return;
    if (["reserved", "parked", "fixed"].includes(clicked.state)) {
      // In edit mode, allow the user's own currently booked slot
      const isOwnSlot =
        isEditMode &&
        selectedBooking &&
        String(selectedBooking.slot_id) === String(id);
      if (!isOwnSlot) {
        alert("Slot not available");
        return;
      }
    }
    setSelectedSlotId(prev => (prev === id ? null : id));
  };

  //handle Confirm
  const handleConfirm = async () => {
    const missingFields = [];
    if (!selectedSlotId) {
      missingFields.push(t("slot"));
    }
    // ============================
    // BUSINESS TRIP VALIDATION
    // ============================
    if (isBusinessTrip) {
      if (!businessFromDate) {
        missingFields.push("From date");
      }
      if (!businessFromTime) {
        missingFields.push("From time");
      }
      if (!businessToDate) {
        missingFields.push("To date");
      }
      if (!businessToTime) {
        missingFields.push("To time");
      }
    }

    // ============================
    // NORMAL BOOKING VALIDATION
    // ============================

    else {
      if (!normalFromDate) {
        missingFields.push("From date");
      }
      if (!fromTime) {
        missingFields.push("From time");
      }
      if (!normalToDate) {
        missingFields.push("To date");
      }
      if (!toTime) {
        missingFields.push("To time");
      }
    }

    if (missingFields.length > 0) {
      await Swal.fire({
        icon: "warning",
        title: t("missingFields"),
        text: `${t("pleaseSelect")} ${missingFields.join(", ")}.`,
        confirmButtonColor: "#095e6d",
      });
      return;
    }

    // ============================
    // BUSINESS TRIP REQUEST
    // ============================
    if (isBusinessTrip) {
      const formatBusinessDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const booking_start = `${formatBusinessDate(
        businessFromDate!
      )}T${businessFromTime}:00`;
      const booking_end = `${formatBusinessDate(
        businessToDate!
      )}T${businessToTime}:00`;
      const start = new Date(booking_start);
      const end = new Date(booking_end);
      // Safety validation
      if (end <= start) {
        await Swal.fire({
          icon: "warning",
          title: "Invalid Time Range",
          text: "The To date and time must be later than the From date and time.",
          confirmButtonColor: "#095e6d",
        });
        return;
      }
      // ============================
      // BUSINESS TRIP MESSAGE POPUP
      // ============================
      const request = await Swal.fire({
        title: t("reason_title"),
        html: `
    <div style="text-align:left; font-size:14px; margin-bottom:10px;">
      <div><strong>${t("slot")}:</strong> ${selectedSlotId}</div>
      <div><strong>${t("from")}:</strong> ${booking_start.replace("T", " ")}</div>
      <div><strong>${t("to")}:</strong> ${booking_end.replace("T", " ")}</div>
    </div>
  `,
        input: "textarea",
        inputPlaceholder: t("reason_placeholder"),
        inputAttributes: {
          "aria-label": t("reason_aria"),
          rows: "4",
        },
        showCancelButton: true,
        confirmButtonText: t("submit_request"),
        cancelButtonText: t("cancel"),
        confirmButtonColor: "#095e6d",
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return t("reason_error");
          }
          return null;
        },
      });

      if (!request.isConfirmed) return;
      const purpose = request.value.trim();
      // ============================
      // SEND BUSINESS TRIP REQUEST
      // ============================
      try {
        const businessTripPayload = {
          slotId: selectedSlotId,
          booking_start,
          booking_end,
          purpose,
        };
        console.log("TRIP REQUEST:", businessTripPayload);
        const data = await createBooking(businessTripPayload);
        console.log(
          "✅ Trip request response:",
          data
        );
        await Swal.fire({
          icon: "success",
          title: t("request_submitted_title"),
          text: t("request_submitted_text"),
          confirmButtonColor: "#095e6d",
        });

        setSelectedSlotId(null);
        const updatedBookings = await loadMyBookings();
        await loadLayout(updatedBookings);
      } catch (err: any) {
        console.error("❌ Request failed:", err);

        await Swal.fire(
          t("error"),
          err.message || t("request_failed_text"),
          "error"
        );
      }

      return;
    }
    // ============================
    // EDIT CONFIRMATION
    // ============================
    if (isEditMode && selectedBooking) {
      const confirm = await Swal.fire({
        title: t("editBooking"),
        text:
          `${t("slot")} ${selectedSlotId}\n` +
          `${formatDateOnly(normalFromDate)} ${fromTime} → ` +
          `${formatDateOnly(normalToDate)} ${toTime}`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#095e6d",
        confirmButtonText: t("update"),
        cancelButtonText: t("cancel"),
      });
      if (!confirm.isConfirmed) return;
      try {
        console.log("EDIT DATA:", {
          bookingId: selectedBooking?.booking_id,
          selectedSlotId,
          selectedDate,
          fromTime,
          toTime,
        });

        const booking_start =
          `${formatDateOnly(normalFromDate)}T${fromTime}:00`;
        const booking_end =
          `${formatDateOnly(normalToDate)}T${toTime}:00`;
        console.log("EDIT PAYLOAD:", {
          slotId: selectedSlotId,
          booking_start,
          booking_end,
        });
        await editBookingAPI(
          selectedBooking.booking_id,
          {
            slotId: selectedSlotId,
            booking_start,
            booking_end,
          }
        );
        await Swal.fire(
          t("success"),
          t("bookingUpdated"),
          "success"
        );
        // Exit edit mode
        setIsEditMode(false);
        setSelectedBooking(null);
        setSelectedSlotId(null);
        // Refresh bookings and layout
        const updatedBookings = await loadMyBookings();
        await loadLayout(updatedBookings);
        return;
      } catch (error: any) {
        console.error("❌ Edit booking failed:", error);
        await Swal.fire(
          t("error"),
          error.message || "Failed to update booking",
          "error"
        );
        return;
      }
    }
    // ============================
    // NORMAL BOOKING
    // ============================
    const confirm = await Swal.fire({
      title: t("confirmBooking"),
      text:
        `${t("slot")} ${selectedSlotId}\n` +
        `${formatDateOnly(normalFromDate)} ${fromTime} → ` +
        `${formatDateOnly(normalToDate)} ${toTime}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#095e6d",
    });
    if (!confirm.isConfirmed) return;
    try {
      const booking_start =
        `${formatDateOnly(normalFromDate)}T${fromTime}:00`;
      const booking_end =
        `${formatDateOnly(normalToDate)}T${toTime}:00`;
      const data = await createBooking({
        slotId: selectedSlotId,
        date: formatDateOnly(normalFromDate),
        fromTime,
        toTime,
        booking_start,
        booking_end,
        plateNumber: "TN09AB1234"
      });
      console.log(data);
      await Swal.fire(
        t("success"),
        t("slotBooked"),
        "success"
      );
      if (data.showFeedback) {
        navigate("/feedback");
      }
      setSelectedSlotId(null);
      setSlots(prev =>
        prev.map(slot =>
          slot.id === selectedSlotId
            ? { ...slot, state: "reserved" }
            : slot
        )
      );
      const updatedBookings = await loadMyBookings();
      await loadLayout(updatedBookings);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (booking: any) => {
    console.log("✏️ Editing booking:", booking);
    setSelectedBooking(booking);
    setIsEditMode(true);
    const bookingFromDate = new Date(
      booking.booking_start.replace("Z", "")
    );
    const bookingToDate = new Date(
      booking.booking_end.replace("Z", "")
    );
    const bookingFrom = formatTime(booking.booking_start);
    const bookingTo = formatTime(booking.booking_end);
    console.log("Edit Booking:", booking);
    console.log("Purpose:", booking.purpose);
    const isBusinessBooking = !!booking.purpose;
    if (isBusinessBooking) {
      // ✅ CHECK BUSINESS TRIP CHECKBOX
      setIsBusinessTrip(true);
      // ✅ Load Business Trip dates/times
      setBusinessFromDate(bookingFromDate);
      setBusinessToDate(bookingToDate);
      setBusinessFromTime(bookingFrom);
      setBusinessToTime(bookingTo);
    } else {
      // ✅ NORMAL BOOKING
      setIsBusinessTrip(false);
      setNormalFromDate(bookingFromDate);
      setNormalToDate(bookingToDate);
      setFromTime(bookingFrom);
      setToTime(bookingTo);
      setSelectedDate(formatDate(booking.booking_start));
    }
    setSelectedSlotId(String(booking.slot_id));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  // handle Cancel

  const handleCancel = async (bookingId: string) => {
    const result = await Swal.fire({
      title: t("cancelBooking"),
      text: t("cancelConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: t("confirmCancel"),
      cancelButtonText: t("cancel")
    });
    if (!result.isConfirmed) return;
    try {
      // Cancel in DB
      await cancelBookingAPI(bookingId);
      // IMPORTANT: immediately exit edit mode
      setIsEditMode(false);
      setSelectedBooking(null);
      setSelectedSlotId(null);
      // Get latest bookings
      const updatedBookings = await loadMyBookings();
      // Refresh layout using the NEW bookings
      await loadLayout(updatedBookings);
      await Swal.fire(
        t("cancelled"),
        t("bookingCancelled"),
        "success"
      );
    } catch (error: any) {
      console.error("Cancel failed:", error);
      await Swal.fire(
        t("error"),
        error?.message || "Cancel failed",
        "error"
      );
    }
  };

  /* ================= DERIVED ================= */

  const availableCount = slots.filter(
    (slot) => slot.state === "available" || slot.state === "selected"
  ).length;

  const parkedCount = slots.filter(
    (slot) => slot.state === "parked"
  ).length;

  /* ================= UI ================= */

  return (
    <div
      style={{
        width: "100%",
        padding: isMobile ? "12px 16px" : "30px 40px"
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        className="parking-header"
        style={{
          position: "relative",
          width: "100%",
          minHeight: isMobile ? 45 : 35,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* ================= CENTER TITLE ================= */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 18 : 20,
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {t("app_name")}
          </h1>

          {/* MOBILE WELCOME MESSAGE */}
          {isMobile && (
            <span
              className="booking-message"
              style={{
                marginTop: 4,
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {t("welcomeMessage", { name: username })}
            </span>
          )}
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div
          className="header-right"
          style={{
            position: isMobile ? "absolute" : "absolute",
            right: 0,
            top: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* DESKTOP WELCOME MESSAGE */}
          {!isMobile && (
            <span
              className="booking-message"
              style={{
                fontSize: 14,
                fontWeight: 700,
                whiteSpace: "nowrap",
                animation: "welcomeSlide 4s ease-out forwards",
              }}
            >
              {t("welcomeMessage", { name: username })}
            </span>
          )}


          {/* USER ICON */}
          <UserMenu />

          {/* LANGUAGE */}
          <div className="language-switch-headers">
            <button onClick={toggleLanguage}>
              {i18n.language === "en" ? "日本語" : "EN"}
            </button>
          </div>
        </div>
      </div>

      <FilterBar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        normalFromDate={normalFromDate}
        setNormalFromDate={setNormalFromDate}
        normalToDate={normalToDate}
        setNormalToDate={setNormalToDate}
        fromTime={fromTime}
        toTime={toTime}
        setFromTime={setFromTime}
        setToTime={setToTime}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        isMobile={isMobile}
        isEditMode={isEditMode}
        isBusinessTrip={isBusinessTrip}
        setIsBusinessTrip={setIsBusinessTrip}
        businessFromDate={businessFromDate}
        setBusinessFromDate={setBusinessFromDate}
        businessToDate={businessToDate}
        setBusinessToDate={setBusinessToDate}
        businessFromTime={businessFromTime}
        setBusinessFromTime={setBusinessFromTime}
        businessToTime={businessToTime}
        setBusinessToTime={setBusinessToTime}

      />

      {isMobile ? (
        // 📱 MOBILE LAYOUT
        <div style={{ display: "flex", gap: 10, marginBottom: 5 }}>

          {/* LEFT SIDE */}
          <div style={{ width: "35%", display: "flex", flexDirection: "column", gap: 8 }}>

            <div style={{
              background: "#fff",
              padding: "8px",
              borderRadius: 10,
              fontWeight: 400,
              fontSize: 10,
              whiteSpace: "nowrap"
            }}>
              {t("available_slots")}: {availableCount}
            </div>

            <div style={{
              background: "#fff",
              padding: "8px",
              borderRadius: 10,
              fontWeight: 400,
              fontSize: 10,
              whiteSpace: "nowrap"
            }}>
              {t("parked_slots")}: {parkedCount}
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div style={{ width: "65%" }}>
            <div
              style={{
                background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
                padding: "8px 10px",
                borderRadius: 14,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}
            >
              <h4 style={{ fontSize: 10, margin: "0 0 4px 0", marginBottom: -3, }}>{t("your_bookings")}</h4>

              {myBookings.length === 0 ? (
                <p style={{ fontSize: 8, color: "#777", margin: "6px 0 0 0" }}>
                  {t("no_bookings")}
                </p>
              ) : (
                myBookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginTop: 6
                    }}
                  >
                    {/* TOP ROW */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {/* SLOT BADGE */}
                      <span
                        style={{
                          padding: "3px 5px",
                          borderRadius: 5,
                          fontSize: 9,
                          fontWeight: 500,
                          background:
                            booking.status === "PARKED" ? "#126a9c" : "#4caf50",
                          color: "#fff",
                          marginTop: -15,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {booking.slot_id} • {t(booking.status.toLowerCase())}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          width: 62,
                        }}
                      >
                        <button
                          onClick={() => handleEdit(booking)}
                          style={{
                            background: "#1976d2",
                            border: "none",
                            color: "#fff",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 10,
                            cursor: "pointer"
                          }}
                        >
                          {t("edit")}
                        </button>
                        {/* ✅ CANCEL BUTTON */}
                        {booking.status === "BOOKED" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("CANCEL CLICKED:", booking.booking_id);
                              handleCancel(booking.booking_id);
                            }}
                            style={{
                              background: "#e53935",
                              border: "none",
                              color: "#fff",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 10,
                              cursor: "pointer",
                              position: "relative",
                              pointerEvents: "auto",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {t("cancel")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DATE + TIME */}
                    <div style={{ fontSize: isEditMode ? 6 : 10, color: "#555", marginTop: -17 }}>
                      {formatDate(booking.booking_start)} - {(formatDate(booking.booking_end))}<br></br>
                      ({formatTime(booking.booking_start)} - {formatTime(booking.booking_end)})
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            {(!hasActiveBooking || isEditMode) && (
              <button
                onClick={handleConfirm}
                disabled={!selectedSlotId}
                style={{
                  width: "100%",   // 🔥 full width mobile
                  background: selectedSlotId
                    ? "linear-gradient(135deg, #095e6d, #0b7f8e)"
                    : "#cfd8dc",
                  color: "#fff",
                  padding: "10px",
                  border: "none",
                  borderRadius: 12,
                  cursor: selectedSlotId ? "pointer" : "not-allowed",
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: selectedSlotId
                    ? "0 6px 18px rgba(0,0,0,0.12)"
                    : "none"
                }}
              >
                {isBusinessTrip ? t("Request") : isEditMode ? t("update") : t("confirm")}
              </button>)}
          </div>
        </div>
      ) : (

        // 💻 DESKTOP LAYOUT (YOUR ORIGINAL CODE)
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            gap: 10,
            justifyContent: "space-between",
            marginBottom: 20
          }}
        >
          {/* LEFT SIDE GROUP */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 15,
              width: "100%"
            }}
          >

            {/* Dashboard */}
            <div style={{ display: "flex", gap: 10 }}>
              <Dashboard
                isMobile={isMobile}
                availableCount={availableCount}
                parkedCount={parkedCount}
              />
            </div>

            {/* Your Bookings */}
            <div
              style={{
                background: "linear-gradient(145deg, #ffffff, #f3f6f9)",
                padding: "10px 20px",
                borderRadius: 14,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                width: 240
              }}
            >
              <h4 style={{ fontSize: 12, margin: "0 0 6px 0" }}> {t("your_bookings")}</h4>

              {myBookings.length === 0 ? (
                <p style={{ fontSize: 12, color: "#777", margin: 0 }}>
                  {t("no_bookings")}
                </p>
              ) : (
                myBookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginTop: 6
                    }}
                  >
                    {/* TOP ROW */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 6,
                        width: "100%",
                      }}
                    >
                      {/* SLOT BADGE */}
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 600,
                          background:
                            booking.status === "PARKED" ? "#126a9c" : "#2ecc71",
                          color: "#fff",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {booking.slot_id} • {t(booking.status.toLowerCase())}
                      </span>
                      {/* ✏️ EDIT BUTTON */}
                      <button
                        onClick={() => handleEdit(booking)}
                        style={{
                          background: "#1976d2",
                          border: "none",
                          color: "#fff",
                          padding: "4px 9px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 500,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t("edit")}
                      </button>
                      {/* ✅ CANCEL BUTTON */}
                      {booking.status === "BOOKED" && (
                        <button
                          onClick={() => handleCancel(booking.booking_id)}
                          style={{
                            background: "#e53935",
                            border: "none",
                            color: "#fff",
                            padding: "4px 9px",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}

                        >
                          {t("cancel")}
                        </button>
                      )}
                    </div>

                    {/* DATE + TIME */}
                    <div style={{ fontSize: 11, color: "#555" }}>
                      {formatDate(booking.booking_start)} - {(formatDate(booking.booking_end))} <br />
                      {formatTime(booking.booking_start)} - {formatTime(booking.booking_end)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Confirm Button */}
          {(!hasActiveBooking || isEditMode) && (
            <button
              onClick={handleConfirm}
              disabled={!selectedSlotId}
              style={{
                background: selectedSlotId
                  ? "linear-gradient(135deg, #095e6d, #0b7f8e)"
                  : "#cfd8dc",
                color: "#fff",
                padding: "12px 28px",   // 🔥 smaller padding
                border: "none",
                borderRadius: 10,       // 🔥 slightly tighter
                cursor: selectedSlotId ? "pointer" : "not-allowed",
                fontSize: 13,          // 🔥 smaller text
                fontWeight: 500,
                height: "fit-content", // 🔥 prevents stretching
                alignSelf: "center",   // 🔥 center vertically
                whiteSpace: "nowrap"   // 🔥 keep text in one line
              }}
            >
              {isBusinessTrip ? t("Request") : isEditMode ? t("update") : t("confirm")}
            </button>)}
        </div>
      )}
      <Legend />

      <div
        style={{
          width: "100%",
          overflowX: isMobile ? "auto" : "hidden",
          paddingBottom: isMobile ? 20 : 0
        }}
      >
        <div
          style={{
            background: "#f7f8f9",
            borderRadius: "24px",
            overflow: "visible",
            padding: "8px 20px 20px 20px",
            paddingBottom: isMobile ? "10px" : "30px",
            margin: "8px auto 10px auto",  // 👈 gives breathing space
            maxWidth: "1400px",
            position: "relative",
          }}
        >
          {/* Floor Label */}
          <div
            style={{
              position: "absolute",
              top: 15,
              left: 20,
              fontSize: isMobile ? 14 : 18,
              fontWeight: 700,
              color: "#444",
              zIndex: 10,
              overflow: "visible",
            }}
          >
            2F
          </div>
          <ParkingCanvas
            slots={slots}
            onSlotClick={handleSlotClick}
            isMobile={isMobile}
            myBookings={myBookings}
            selectedSlotId={selectedSlotId}
          />
          {/*{activeBooking && (
  <div
    style={{
      textAlign: "center",
      marginTop: 20,
      fontSize: isMobile ? 11 : 15,
      fontWeight: 500,
      color: "#444",
      lineHeight: 1.5,
    }}
  >
    Your parking slot is reserved on{" "}
    <strong>
      {new Date(activeBooking.booking_start).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
    </strong>{" "}
    from{" "}
    <strong>{formatTime(activeBooking.booking_start)}</strong>{" "}
    to{" "}
    <strong>{formatTime(activeBooking.booking_end)}</strong>
    . You have{" "}
    <strong>{timeLeft}</strong>.
  </div>
)}*/}
        </div>
      </div>
    </div>
  );
}
