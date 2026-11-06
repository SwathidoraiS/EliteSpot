import { useEffect, useState } from "react";
import { FiSearch, FiArrowLeft, FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getPendingBusinessTrips, downloadBusinessTripAttachment, approveBusinessTrip, rejectBusinessTrip } from "../../../services/parkingService";
import UserMenu from "./UserMenu";
import Swal from "sweetalert2";
import "../styles/BusinessTripApproval.css";
const BusinessTripApproval = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // Filters
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("ALL");
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    // Mobile
    const [isMobile, setIsMobile] = useState(false);
    // =========================
    // LANGUAGE
    // =========================
    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "ja" : "en";
        i18n.changeLanguage(newLang);
        localStorage.setItem("lang", newLang);
    };

    const handleViewPurpose = async (purpose: string) => {
        await Swal.fire({
            title: "Purpose",
            text: purpose,
            confirmButtonText: "Close",
            confirmButtonColor: "#095e6d",
            width: "500px",
        });
    };

    const handleDownloadAttachment = async (requestId: number) => {
        try {
            await downloadBusinessTripAttachment(requestId);
        } catch (error: any) {
            console.error("Failed to download attachment", error);

            await Swal.fire({
                icon: "error",
                title: "Download Failed",
                text: error.message || "Unable to download attachment.",
                confirmButtonColor: "#095e6d",
            });
        }
    };

    const handleApprove = async (requestId: number) => {
        const result = await Swal.fire({
            title: t("approve_title"),
            text: t("approve_text"),
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t("approve_button"),
            cancelButtonText: t("cancel"),
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
        });

        if (!result.isConfirmed) return;

        try {
            await approveBusinessTrip(requestId);

            await Swal.fire({
                icon: "success",
                title: t("approve_success_title"),
                text: t("approve_success_text"),
                confirmButtonColor: "#095e6d",
            });

            await loadRequests();
        } catch (error: any) {
            console.error("Failed to approve request", error);

            await Swal.fire({
                icon: "error",
                title: t("approve_failed_title"),
                text: error.message || t("approve_failed_text"),
                confirmButtonColor: "#095e6d",
            });
        }
    };

    const handleReject = async (requestId: number) => {
        const result = await Swal.fire({
            title: t("reject_title"),
            text: t("reject_text"),
            icon: "warning",
            input: "textarea",
            inputPlaceholder: t("reject_placeholder"),
            inputAttributes: {
                "aria-label": t("reject_aria"),
                rows: "4",
            },
            showCancelButton: true,
            confirmButtonText: t("reject_button"),
            cancelButtonText: t("cancel"),
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return t("reject_error");
                }
                return null;
            },
        });
        if (!result.isConfirmed) return;
        try {
            await rejectBusinessTrip(requestId, result.value.trim());

            await Swal.fire({
                icon: "success",
                title: t("reject_success_title"),
                text: t("reject_success_text"),
                confirmButtonColor: "#095e6d",
            });

            await loadRequests();
        } catch (error: any) {
            console.error("Failed to reject request", error);

            await Swal.fire({
                icon: "error",
                title: t("reject_failed_title"),
                text: error.message || t("reject_failed_text"),
                confirmButtonColor: "#095e6d",
            });
        }
    };
    // =========================
    // SCREEN SIZE
    // =========================
    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);
    // =========================
    // ITEMS PER PAGE
    // =========================
    useEffect(() => {
        const calculateItemsPerPage = () => {
            const screenHeight = window.innerHeight;
            if (isMobile) {
                const rows = Math.floor((screenHeight - 350) / 140);
                setItemsPerPage(rows > 2 ? rows : 2);
            } else {
                const rows = Math.floor((screenHeight - 350) / 60);
                setItemsPerPage(rows > 5 ? rows : 6);
            }
        };
        calculateItemsPerPage();
        window.addEventListener("resize", calculateItemsPerPage);
        return () =>
            window.removeEventListener("resize", calculateItemsPerPage);
    }, [isMobile]);
    // =========================
    // LOAD REQUESTS
    // =========================
    useEffect(() => {
        loadRequests();
    }, []);
    const loadRequests = async () => {
        try {
            const data = await getPendingBusinessTrips();
            setRequests(data.requests || []);
        } catch (error) {
            console.error(
                "Failed to load Multiple Day requests",
                error
            );
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };
    // =========================
    // FORMAT DATE/TIME
    // =========================
    const formatDateTime = (dateTime: string) => {
        if (!dateTime) return "";
        // Keep the date/time exactly as received from the database
        const match = dateTime.match(
            /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/
        );
        if (!match) return dateTime;
        const [, year, month, day, hours, minutes] = match;
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    // =========================
    // FILTER
    // =========================
    const filteredRequests = requests.filter((request) => {
        const employeeName = request.employee_name || "";
        const empId = request.emp_id || "";
        const slot = request.slot_id || "";
        const searchValue = search.toLowerCase();
        const matchesSearch =
            employeeName.toLowerCase().includes(searchValue) ||
            empId.toLowerCase().includes(searchValue) ||
            slot.toLowerCase().includes(searchValue);
        const requestDate = request.from_datetime
            ? new Date(request.from_datetime)
                .toLocaleDateString("en-CA")
            : "";
        const matchesDate =
            !date || requestDate === date;
        const matchesStatus =
            status === "ALL" ||
            request.status === status;
        return (
            matchesSearch &&
            matchesDate &&
            matchesStatus
        );
    });
    // =========================
    // PAGINATION
    // =========================
    const totalPages = Math.ceil(
        filteredRequests.length / itemsPerPage
    );
    const indexOfLast =
        currentPage * itemsPerPage;
    const indexOfFirst =
        indexOfLast - itemsPerPage;
    const currentRequests =
        filteredRequests.slice(
            indexOfFirst,
            indexOfLast
        );
    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, date, status]);
    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div
                style={{
                    padding: 20,
                    fontSize: 16,
                }}
            >
                Loading...
            </div>
        );
    }
    // =========================
    // PAGE
    // =========================
    return (
        <div
            style={{
                padding: 20,
            }}
        >
            {/* =====================================
         TOP RIGHT - LANGUAGE + USER
     ===================================== */}
            <div className="language-switch-login">
                <button
                    className="language-btn"
                    onClick={toggleLanguage}
                >
                    {i18n.language === "en"
                        ? "EN"
                        : "日本語"}
                </button>
                <UserMenu />
            </div>
            {/* =====================================
         HEADER
     ===================================== */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                }}
            >
                <FiArrowLeft
                    size={22}
                    style={{
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/")}
                />
                <h2
                    style={{
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 600,
                    }}
                >
                    {t("requestpage_title")}
                </h2>
            </div>
            {/* =====================================
         SEARCH + FILTER BAR
     ===================================== */}
            <div
                style={{
                    background: "#fff",
                    padding: 12,
                    borderRadius: 12,
                    boxShadow:
                        "0 6px 18px rgba(0,0,0,0.08)",
                    marginBottom: 15,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                {/* SEARCH */}
                <div
                    style={{
                        position: "relative",
                        width: 300,
                    }}
                >
                    <FiSearch
                        style={{
                            position: "absolute",
                            left: 10,
                            top: 12,
                            color: "#888",
                        }}
                    />
                    <input
                        type="text"
                        placeholder={t("search")}
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            height: 38,
                            width: "100%",
                            borderRadius: 8,
                            border:
                                "1px solid #d1d5db",
                            padding:
                                "0 12px 0 38px",
                            fontSize: 14,
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                {/* DATE */}
                <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                        setDate(e.target.value)
                    }
                    style={{
                        height: 38,
                        borderRadius: 8,
                        border:
                            "1px solid #d1d5db",
                        padding: "0 10px",
                        fontSize: 14,
                    }}
                />
                {/* STATUS */}
                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                    style={{
                        height: 38,
                        borderRadius: 8,
                        border:
                            "1px solid #d1d5db",
                        padding: "0 10px",
                        fontSize: 14,
                    }}
                >
                    <option value="ALL">
                        {t("allStatus")}
                    </option>
                    <option value="PENDING">
                        Pending
                    </option>
                    <option value="APPROVED">
                        Approved
                    </option>
                    <option value="REJECTED">
                        Rejected
                    </option>
                    <option value="SUPERSEDED">
                        Supreseded
                    </option>
                </select>
            </div>
            {/* =====================================
         TABLE
     ===================================== */}
            {currentRequests.length === 0 ? (
                <div
                    style={{
                        background: "#fff",
                        padding: 25,
                        textAlign: "center",
                        fontSize: 16,
                        boxShadow:
                            "0 8px 24px rgba(0,0,0,0.12)",
                    }}
                >
                    No Multiple Day Requests Found.
                </div>
            ) : isMobile ? (
                /* =================================
                   MOBILE VIEW
                ================================= */
                currentRequests.map((request) => {
                    const initials =
                        request.employee_name?.[0] || "U";
                    return (
                        <div
                            key={request.request_id}
                            style={mobileCard}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <div style={avatar}>
                                    {initials}
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 400,
                                        }}
                                    >
                                        {request.employee_name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#777",
                                        }}
                                    >
                                        {request.emp_id || "--"}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: 12,
                                    fontSize: 14,
                                }}
                            >
                                <div>
                                    <b>Slot:</b>{" "}
                                    {request.slot_id}
                                </div>
                                <div>
                                    <b>From:</b>{" "}
                                    {formatDateTime(
                                        request.from_datetime
                                    )}
                                </div>
                                <div>
                                    <b>To:</b>{" "}
                                    {formatDateTime(
                                        request.to_datetime
                                    )}
                                </div>
                                <div
                                    onClick={() => handleViewPurpose(request.purpose)}
                                    title="Click to view full purpose"
                                    style={{
                                        cursor: "pointer",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        lineHeight: "18px",
                                        maxHeight: "36px",
                                    }}
                                >
                                    <b>Purpose:</b>{" "}
                                    {request.purpose}
                                </div>
                                {/* Attachment */}
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-600">
                                        Attachment
                                    </p>

                                    {request.attachment_original_name ? (
                                        <button
                                            onClick={() =>
                                                handleDownloadAttachment(request.request_id)
                                            }
                                            className="mt-1 text-sm text-blue-600 hover:underline break-all"
                                        >
                                            <FiDownload className="inline mr-1" />
                                            {request.attachment_original_name}
                                        </button>
                                    ) : (
                                        <p className="text-sm text-gray-400">No attachment</p>
                                    )}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 12,
                                }}
                            >
                                {request.status === "PENDING" ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            marginTop: 12,
                                        }}
                                    >
                                        <button
                                            style={approveBtn}
                                            onClick={() => handleApprove(request.request_id)}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            style={rejectBtn}
                                            onClick={() => handleReject(request.request_id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: 12 }}>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                padding: "6px 12px",
                                                borderRadius: 20,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background:
                                                    request.status === "APPROVED"
                                                        ? "#dcfce7"
                                                        : "#fee2e2",
                                                color:
                                                    request.status === "APPROVED"
                                                        ? "#16a34a"
                                                        : "#dc2626",
                                            }}
                                        >
                                            {request.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                /* =================================
                   DESKTOP TABLE
                ================================= */
                <table style={tableStyle}>
                    <thead
                        style={{
                            background: "#f4f6f8",
                        }}
                    >
                        <tr>
                            <th style={thStyle}>
                                {t("user")}
                            </th>
                            <th style={thStyle}>
                                {t("empId")}
                            </th>
                            <th style={thStyle}>
                                {t("slot")}
                            </th>
                            <th style={thStyle}>
                                {t("from")}
                            </th>
                            <th style={thStyle}>
                                {t("to")}
                            </th>
                            <th style={thStyle}>
                                {t("purpose")}
                            </th>
                            <th style={thStyle}>
                                {t("attachment_label")}
                            </th>
                            <th style={thStyle}>
                                {t("actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRequests.map(
                            (request) => (
                                <tr
                                    key={request.request_id}
                                >
                                    {/* USER */}
                                    <td style={tdStyle}>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 10,
                                                alignItems:
                                                    "center",
                                            }}
                                        >
                                            <div style={avatar}>
                                                {request
                                                    .employee_name?.[0] ||
                                                    "U"}
                                            </div>
                                            <span>
                                                {
                                                    request.employee_name
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    {/* EMP ID */}
                                    <td style={tdStyle}>
                                        {request.emp_id ||
                                            "--"}
                                    </td>
                                    {/* SLOT */}
                                    <td style={tdStyle}>
                                        {request.slot_id}
                                    </td>
                                    {/* FROM */}
                                    <td style={tdStyle}>
                                        {formatDateTime(
                                            request.from_datetime
                                        )}
                                    </td>
                                    {/* TO */}
                                    <td style={tdStyle}>
                                        {formatDateTime(
                                            request.to_datetime
                                        )}
                                    </td>
                                    {/* PURPOSE */}
                                    <td
                                        style={{
                                            ...tdStyle,
                                            width: "220px",
                                            maxWidth: "220px",
                                        }}
                                    >
                                        <div
                                            onClick={() => handleViewPurpose(request.purpose)}
                                            title="Click to view full message"
                                            style={{
                                                width: "220px",
                                                maxWidth: "220px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                cursor: "pointer",
                                                color: "#095e6d",
                                            }}
                                        >
                                            {request.purpose}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {request.attachment_original_name ? (
                                            <button
                                                onClick={() =>
                                                    handleDownloadAttachment(request.request_id)
                                                }
                                                className="text-blue-600 hover:underline text-sm break-all"
                                            >
                                                <FiDownload className="inline mr-1" />
                                                {request.attachment_original_name}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">--</span>
                                        )}
                                    </td>
                                    {/* ACTION */}
                                    <td style={tdStyle}>
                                        {request.status === "PENDING" ? (
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button
                                                    style={approveBtn}
                                                    onClick={() => handleApprove(request.request_id)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    style={rejectBtn}
                                                    onClick={() => handleReject(request.request_id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: 20,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    background:
                                                        request.status === "APPROVED"
                                                            ? "#dcfce7"
                                                            : "#fee2e2",
                                                    color:
                                                        request.status === "APPROVED"
                                                            ? "#16a34a"
                                                            : "#dc2626",
                                                }}
                                            >
                                                {request.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            )}
            {/* =====================================
                PAGINATION
            ===================================== */}
            {totalPages > 0 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "center",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 15,
                    }}
                >
                    {/* PREVIOUS */}
                    <button
                        disabled={
                            currentPage === 1
                        }
                        onClick={() =>
                            setCurrentPage(
                                currentPage - 1
                            )
                        }
                        style={{
                            ...pageBtn,
                            opacity:
                                currentPage === 1
                                    ? 0.5
                                    : 1,
                        }}
                    >
                        {"<"}
                    </button>
                    {/* PAGE NUMBERS */}
                    {Array.from(
                        {
                            length: totalPages,
                        },
                        (_, i) => i + 1
                    )
                        .filter(
                            (page) =>
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(
                                    page - currentPage
                                ) <= 1
                        )
                        .map(
                            (
                                page,
                                index,
                                arr
                            ) => (
                                <span key={page}>
                                    {index > 0 &&
                                        page -
                                        arr[
                                        index - 1
                                        ] >
                                        1 && (
                                            <span
                                                style={{
                                                    margin:
                                                        "0 4px",
                                                }}
                                            >
                                                ...
                                            </span>
                                        )}
                                    <button
                                        onClick={() =>
                                            setCurrentPage(
                                                page
                                            )
                                        }
                                        style={{
                                            ...pageBtn,
                                            background:
                                                currentPage ===
                                                    page
                                                    ? "#d1d5db"
                                                    : "#fff",
                                        }}
                                    >
                                        {page}
                                    </button>
                                </span>
                            )
                        )}
                    {/* NEXT */}
                    <button
                        disabled={
                            currentPage ===
                            totalPages
                        }
                        onClick={() =>
                            setCurrentPage(
                                currentPage + 1
                            )
                        }
                        style={{
                            ...pageBtn,
                            opacity:
                                currentPage ===
                                    totalPages
                                    ? 0.5
                                    : 1,
                        }}
                    >
                        {">"}
                    </button>
                </div>
            )}
        </div>
    );
};
// =====================================
// STYLES
// =====================================
const tableStyle = {
    width: "100%",
    borderCollapse:
        "collapse" as const,
    background: "#fff",
    boxShadow:
        "0 8px 24px rgba(0,0,0,0.12)",
};
const thStyle = {
    padding: 12,
    borderBottom:
        "1px solid #ddd",
    textAlign:
        "left" as const,
    fontSize: 16,
    fontWeight: 600,
};
const tdStyle = {
    padding: 12,
    borderBottom:
        "1px solid #eee",
    fontSize: 16,
    fontWeight: 400,
    verticalAlign:
        "middle" as const,
};
const avatar = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#94a3b8",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 400,
};
const approveBtn = {
    padding: "6px 12px",
    border: "none",
    background: "#dcfce7",
    color: "#16a34a",
    cursor: "pointer",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
};
const rejectBtn = {
    padding: "6px 12px",
    border: "none",
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
};
const pageBtn = {
    padding: "6px 10px",
    border:
        "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    borderRadius: 4,
    fontSize: 14,
};
const mobileCard = {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow:
        "0 4px 12px rgba(0,0,0,0.08)",
};
export default BusinessTripApproval;