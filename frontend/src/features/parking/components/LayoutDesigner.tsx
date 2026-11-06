import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiMoreHorizontal, FiSearch, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserMenu from "./UserMenu";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type LayoutSlot = {
    slot_id: string;
    slot_number: string;
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
    rotate: number | null;
    is_fixed: boolean;
    status: string;
};

type ParkingArea = {
    area_id: number;
    Area_name: string;
};

const colors = {
    background: "#f5f7fb",
    card: "#ffffff",
    text: "#172033",
    muted: "#64748b",
    border: "#e2e8f0",
    primary: "#2563eb",
    success: "#15803d",
    danger: "#dc2626",
    fixed: "#e57373",
    available: "#81c784",
};

const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: colors.muted,
};

const fieldLabelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
};

const buttonStyle = (
    background: string,
    disabled = false
): React.CSSProperties => ({
    padding: "7px 12px",
    background: disabled ? "#94a3b8" : background,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
});

const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "7px 9px",
    marginTop: 4,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    background: "#fff",
    color: colors.text,
    fontSize: 12,
};

export default function LayoutDesigner() {
    const [selectedArea, setSelectedArea] = useState("2");
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "ja" : "en";
        i18n.changeLanguage(newLang);

        // optional: persist language
        localStorage.setItem("lang", newLang);
    };
    const [copiedSlots, setCopiedSlots] = useState<LayoutSlot[]>([]);
    const [savingSlotFixedStatus, setSavingSlotFixedStatus] = useState(false);
    const [slots, setSlots] = useState<LayoutSlot[]>([]);
    const [draftSlot, setDraftSlot] = useState<LayoutSlot | null>(null);
    const [draftSlots, setDraftSlots] = useState<Record<string, Partial<LayoutSlot>>>({});
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
    const selectedSlot = slots.find((slot) => slot.slot_id === selectedSlotId);
    const previewSlot = selectedSlot && draftSlot?.slot_id === selectedSlot.slot_id ? draftSlot : selectedSlot;
    useEffect(() => {
        if (selectedSlot) {
            setPropertyWidth(selectedSlot.width ?? 35);
            setPropertyHeight(selectedSlot.height ?? 55);
            setPropertyX(selectedSlot.x ?? 0);
            setPropertyY(selectedSlot.y ?? 0);
            setPropertyIsFixed(selectedSlot.is_fixed);
            setEditingSlotNumber(selectedSlot.slot_number);
            setPropertyRotation(selectedSlot.rotate ?? 0);
        }
        setDraftSlot(null);
    }, [selectedSlot]);
    const selectedSlotIdsRef = useRef<string[]>([]);
    useEffect(() => {
        selectedSlotIdsRef.current = selectedSlotIds;
    }, [selectedSlotIds]);
    const [undoStack, setUndoStack] = useState<LayoutSlot[][]>([]);
    const [redoStack, setRedoStack] = useState<LayoutSlot[][]>([]);
    const [editingSlotId, setEditingSlotId] = useState<String | null>(null);
    const [editingSlotNumber, setEditingSlotNumber] = useState("");
    const [savingSlotNumber, setSavingSlotNumber] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
    const [dragStartLayout, setDragStartLayout] = useState<LayoutSlot[] | null>(null);
    const [dragStartPointer, setDragStartPointer] = useState<{ x: number; y: number; } | null>(null);
    const [propertyIsFixed, setPropertyIsFixed] = useState(false);
    const [propertyWidth, setPropertyWidth] = useState(35);
    const [propertyHeight, setPropertyHeight] = useState(55);
    const [propertyX, setPropertyX] = useState(0);
    const [propertyY, setPropertyY] = useState(0);
    const [propertyRotation, setPropertyRotation] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [resizingSlotId, setResizingSlotId] = useState<string | null>(null);
    const [resizeStart, setResizeStart] = useState<{
        slotId: string;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
    } | null>(null);

    const [slotPrefix, setSlotPrefix] = useState("");
    const [slotCount, setSlotCount] = useState(10);
    const [generating, setGenerating] = useState(false);

    const [showCreateArea, setShowCreateArea] = useState(false);
    const [newAreaName, setNewAreaName] = useState("");
    const [newAreaLocation, setNewAreaLocation] = useState("");
    const [creatingArea, setCreatingArea] = useState(false);

    const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>([]);
    const [canvasSize, setCanvasSize] = useState({
        width: 950,
        height: 400,
    });

    const [layoutWidth, setLayoutWidth] = useState(950);
    const [layoutHeight, setLayoutHeight] = useState(400);
    const [showSlotProperties, setShowSlotProperties] = useState(false);
    const [canvasElement, setCanvasElement] =
        useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!canvasElement) return;

        const updateCanvasSize = () => {
            const width = canvasElement.clientWidth;
            const height = canvasElement.clientHeight;

            if (width > 0 && height > 0) {
                setCanvasSize({ width, height });
            }
        };

        updateCanvasSize();

        const observer = new ResizeObserver(updateCanvasSize);
        observer.observe(canvasElement);

        return () => observer.disconnect();
    }, [canvasElement]);

    const getDateParams = () => {
        const now = new Date(Date.now() + 60 * 1000);
        const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const formatDateTime = (date: Date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`;

        return new URLSearchParams({
            startTime: formatDateTime(now),
            endTime: formatDateTime(end),
        });
    };

    const loadSlots = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}/parking/${selectedArea}/layout?${getDateParams()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to load parking layout");
            }

            setLayoutWidth(result.data.layoutWidth ?? 950);
            setLayoutHeight(result.data.layoutHeight ?? 400);

            setSlots(result.data.slots);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load layout");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSlots();
        // Reload when the selected parking area changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedArea]);

    useEffect(() => {
        const fetchParkingAreas = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(`${BASE_URL}/parking-areas`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to fetch parking areas");
                }

                setParkingAreas(result.data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to fetch parking areas"
                );
            }
        };

        fetchParkingAreas();
    }, []);

    const updateSelectedDraftSlots = (changes: Partial<LayoutSlot>) => {
        const ids =
            selectedSlotIds.length > 0
                ? selectedSlotIds
                : selectedSlot
                    ? [selectedSlot.slot_id]
                    : [];

        setDraftSlots((prev) => {
            const next = { ...prev };

            ids.forEach((id) => {
                next[id] = {
                    ...next[id],
                    ...changes,
                };
            });

            return next;
        });
    };

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement>,
        slotId: string
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const rect = canvasElement?.getBoundingClientRect();
        if (!rect) return;

        const pointerX = (event.clientX - rect.left) / scaleX;
        const pointerY = (event.clientY - rect.top) / scaleY;

        setDragStartPointer({ x: pointerX, y: pointerY });

        setResizingSlotId(null);
        setResizeStart(null);
        setDragStartLayout(slots.map((slot) => ({ ...slot })));
        const isPartOfSelection = selectedSlotIds.includes(slotId) || selectedSlotId === slotId;
        if (isPartOfSelection) {
            setDraggingSlotId(slotId);
        } else {
            setSelectedSlotIds([]);
            setSelectedSlotId(slotId);
            setDraggingSlotId(slotId);
        }
    };

    const handleResizeMouseDown = (
        event: React.MouseEvent<HTMLDivElement>,
        slot: LayoutSlot
    ) => {
        event.preventDefault();
        event.stopPropagation();

        if (!canvasElement) return;

        const rect = canvasElement.getBoundingClientRect();
        setDragStartLayout(slots.map((slot) => ({ ...slot })));
        setDragStartPointer(null);
        setDraggingSlotId(null);
        setResizingSlotId(slot.slot_id);

        setResizeStart({
            slotId: slot.slot_id,
            startX: (event.clientX - rect.left) / scaleX,
            startY: (event.clientY - rect.top) / scaleY,
            startWidth: slot.width ?? 35,
            startHeight: slot.height ?? 70,
        });
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = canvasElement?.getBoundingClientRect();
        if (!rect) return;

        const pointerX = (event.clientX - rect.left) / scaleX;
        const pointerY = (event.clientY - rect.top) / scaleY;

        // Resize selected slot
        if (resizeStart && resizingSlotId) {
            const deltaX = pointerX - resizeStart.startX;
            const deltaY = pointerY - resizeStart.startY;

            setSlots((prev) =>
                prev.map((slot) =>
                    slot.slot_id === resizeStart.slotId
                        ? {
                            ...slot,
                            width: Math.max(
                                20,
                                Math.min(150, Math.round(resizeStart.startWidth + deltaX))
                            ),
                            height: Math.max(
                                30,
                                Math.min(180, Math.round(resizeStart.startHeight + deltaY))
                            ),
                        }
                        : slot
                )
            );

            return;
        }

        // Move selected slot or group
        if (
            !draggingSlotId ||
            !dragStartLayout ||
            !dragStartPointer
        ) return;

        const currentSelectedIds = selectedSlotIdsRef.current;

        const movingIds = currentSelectedIds.includes(draggingSlotId)
            ? currentSelectedIds
            : [draggingSlotId];

        const originalDraggedSlot = dragStartLayout.find(
            (slot) => slot.slot_id === draggingSlotId
        );

        if (!originalDraggedSlot) return;

        // Calculate movement from the initial mouse position
        let deltaX = Math.round(pointerX - dragStartPointer.x);
        let deltaY = Math.round(pointerY - dragStartPointer.y);

        // Find the boundaries of the selected group
        const movingSlots = dragStartLayout.filter((slot) =>
            movingIds.includes(slot.slot_id)
        );

        const minX = Math.min(...movingSlots.map((slot) => slot.x ?? 0));
        const minY = Math.min(...movingSlots.map((slot) => slot.y ?? 0));

        const maxX = Math.max(
            ...movingSlots.map(
                (slot) => (slot.x ?? 0) + (slot.width ?? 35)
            )
        );

        const maxY = Math.max(
            ...movingSlots.map(
                (slot) => (slot.y ?? 0) + (slot.height ?? 70)
            )
        );

        // Keep the entire group inside the canvas
        deltaX = Math.max(
            -minX,
            Math.min(layoutWidth - maxX, deltaX)
        );

        deltaY = Math.max(
            -minY,
            Math.min(layoutHeight - maxY, deltaY)
        );

        setSlots((prev) =>
            prev.map((slot) => {
                if (!movingIds.includes(slot.slot_id)) return slot;

                const originalSlot = dragStartLayout.find(
                    (item) => item.slot_id === slot.slot_id
                );

                if (!originalSlot) return slot;

                return {
                    ...slot,
                    x: (originalSlot.x ?? 0) + deltaX,
                    y: (originalSlot.y ?? 0) + deltaY,
                };
            })
        );
    };
    const handleMouseUp = () => {
        if (dragStartLayout && (draggingSlotId || resizingSlotId)) {
            setUndoStack((prev) => [...prev, dragStartLayout]);
            setRedoStack([]);
        }

        setDraggingSlotId(null);
        setDragStartPointer(null);
        setResizingSlotId(null);
        setResizeStart(null);
        setDragStartLayout(null);
    };
    const handleUpdateSlotFixedStatus = async (isFixed: boolean) => {
        if (!selectedSlot || !selectedArea) return;

        try {
            setSavingSlotFixedStatus(true);
            setError("");
            setSaveMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}/parking/${selectedArea}/slots/${selectedSlot.slot_id}/fixed-status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isFixed }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to update slot type"
                );
            }

            setSlots((prev) =>
                prev.map((slot) =>
                    slot.slot_id === selectedSlot.slot_id
                        ? { ...slot, is_fixed: isFixed }
                        : slot
                )
            );

            setSaveMessage(
                `Slot ${selectedSlot.slot_number} updated to ${isFixed ? "Fixed" : "Non-Fixed"
                } successfully.`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update slot type"
            );
        } finally {
            setSavingSlotFixedStatus(false);
        }
    };
    const handleApplySlotProperties = async () => {
        if (!selectedSlot || !selectedArea) return;

        // Get all selected slots. Fall back to the active slot for single selection.
        const targetIds =
            selectedSlotIds.length > 0
                ? selectedSlotIds
                : [selectedSlot.slot_id];

        const targetSlots = slots.filter((slot) =>
            targetIds.includes(slot.slot_id)
        );

        if (targetSlots.length === 0) return;

        const isSingleSelection = targetSlots.length === 1;
        const newNumber = editingSlotNumber.trim();

        // Slot number can only be edited for one slot at a time.
        if (
            isSingleSelection &&
            !/^[A-Za-z0-9-]{1,10}$/.test(newNumber)
        ) {
            setError("Use 1–10 letters, numbers, or hyphens for the slot number.");
            return;
        }

        if (
            !Number.isInteger(propertyWidth) ||
            propertyWidth < 20 ||
            propertyWidth > 150 ||
            !Number.isInteger(propertyHeight) ||
            propertyHeight < 30 ||
            propertyHeight > 180 ||
            !Number.isInteger(propertyRotation) ||
            propertyRotation < 0 ||
            propertyRotation > 360 ||
            propertyRotation % 15 !== 0
        ) {
            setError("Check the width, height, and rotation values.");
            return;
        }

        // Calculate movement relative to the active slot.
        const deltaX = propertyX - (selectedSlot.x ?? 0);
        const deltaY = propertyY - (selectedSlot.y ?? 0);

        try {
            setSavingSlotNumber(true);
            setSavingSlotFixedStatus(true);
            setError("");
            setSaveMessage("");

            const token = localStorage.getItem("token");
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            // Update slot number only when one slot is selected.
            if (
                isSingleSelection &&
                newNumber !== targetSlots[0].slot_number
            ) {
                const response = await fetch(
                    `${BASE_URL}/parking/${selectedArea}/slots/${targetSlots[0].slot_id}/number`,
                    {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({ slotNumber: newNumber }),
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to update slot number");
                }
            }

            // Update Fixed / Non-Fixed status for every selected slot.
            for (const slot of targetSlots) {
                if (propertyIsFixed !== slot.is_fixed) {
                    const response = await fetch(
                        `${BASE_URL}/parking/${selectedArea}/slots/${slot.slot_id}/fixed-status`,
                        {
                            method: "PATCH",
                            headers,
                            body: JSON.stringify({ isFixed: propertyIsFixed }),
                        }
                    );

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(
                            result.message || `Failed to update ${slot.slot_number}`
                        );
                    }
                }
            }

            // Apply geometry changes to all selected slots.
            const updatedSlots = slots.map((slot) => {
                if (!targetIds.includes(slot.slot_id)) return slot;

                const originalX = slot.x ?? 0;
                const originalY = slot.y ?? 0;

                return {
                    ...slot,
                    ...(isSingleSelection
                        ? { slot_number: newNumber }
                        : {}),
                    is_fixed: propertyIsFixed,
                    x: Math.max(
                        0,
                        Math.min(
                            layoutWidth - propertyWidth,
                            originalX + deltaX
                        )
                    ),
                    y: Math.max(
                        0,
                        Math.min(
                            layoutHeight - propertyHeight,
                            originalY + deltaY
                        )
                    ),
                    width: propertyWidth,
                    height: propertyHeight,
                    rotate: propertyRotation,
                };
            });

            // Save the updated layout.
            const layoutResponse = await fetch(
                `${BASE_URL}/parking/${selectedArea}/layout`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({
                        slots: updatedSlots.map((slot) => ({
                            slot_id: slot.slot_id,
                            x: Math.round(slot.x ?? 0),
                            y: Math.round(slot.y ?? 0),
                            width: Math.round(slot.width ?? 35),
                            height: Math.round(slot.height ?? 55),
                            rotate: Math.round(slot.rotate ?? 0),
                        })),
                    }),
                }
            );

            const layoutResult = await layoutResponse.json();

            if (!layoutResponse.ok || !layoutResult.success) {
                throw new Error(
                    layoutResult.message || "Failed to save slot dimensions"
                );
            }

            setUndoStack((prev) => [
                ...prev,
                slots.map((slot) => ({ ...slot })),
            ]);

            setRedoStack([]);
            setSlots(updatedSlots);
            setDraftSlot({});
            setDraftSlot(null);

            if (isSingleSelection) {
                setEditingSlotNumber(newNumber);
            }

            setSaveMessage(
                `Properties updated successfully for ${targetSlots.length} slot(s).`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save slot properties"
            );
        } finally {
            setSavingSlotNumber(false);
            setSavingSlotFixedStatus(false);
        }
    };
    const handleSaveLayout = async () => {
        try {
            setSaving(true);
            setSaveMessage("");
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}/parking/${selectedArea}/layout`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        slots: slots.map((slot) => ({
                            slot_id: slot.slot_id,
                            x: Math.round(slot.x ?? 0),
                            y: Math.round(slot.y ?? 0),
                            width: Math.round(slot.width ?? 35),
                            height: Math.round(slot.height ?? 55),
                            rotate: Math.round(slot.rotate ?? 0),
                        })),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to save layout");
            }

            setSaveMessage("Layout saved successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save layout");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDimensions = async () => {
        if (
            !Number.isInteger(layoutWidth) ||
            !Number.isInteger(layoutHeight) ||
            layoutWidth < 400 ||
            layoutWidth > 3000 ||
            layoutHeight < 300 ||
            layoutHeight > 2000
        ) {
            setError("Width must be 400–3000 and height must be 300–2000.");
            return;
        }

        if (!selectedArea) {
            setError("Please select a parking area.");
            return;
        }

        try {
            setError("");
            setSaveMessage("");

            const response = await fetch(
                `${BASE_URL}/parking/${selectedArea}/layout-dimensions`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        width: layoutWidth,
                        height: layoutHeight,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to save canvas dimensions"
                );
            }

            setSaveMessage("Canvas dimensions saved successfully!");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to save canvas dimensions"
            );
        }
    };

    const handleDeleteParkingArea = async () => {
        if (!selectedArea) {
            setError("Please select a parking area.");
            return;
        }

        const selectedParkingArea = parkingAreas.find(
            (area) => String(area.area_id) === String(selectedArea)
        );

        const areaName = selectedParkingArea?.Area_name || selectedArea;

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${areaName}"?\n\n` +
            "This will delete the parking area's slots, bookings, and related records. " +
            "This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setError("");
            setSaveMessage("");

            const response = await fetch(
                `${BASE_URL}/parking/${selectedArea}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to delete parking area"
                );
            }

            const remainingAreas = parkingAreas.filter(
                (area) => String(area.area_id) !== String(selectedArea)
            );

            setParkingAreas(remainingAreas);

            if (remainingAreas.length > 0) {
                setSelectedArea(String(remainingAreas[0].area_id));
            } else {
                setSelectedArea("");
            }

            setSaveMessage(`Parking area "${areaName}" deleted successfully.`);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete parking area"
            );
        }
    };

    const handleGenerateSlots = async () => {
        const prefix = slotPrefix.trim().toUpperCase();

        if (!/^[A-Z0-9]{1,4}$/.test(prefix)) {
            setError("Prefix must contain 1–4 letters or numbers.");
            return;
        }

        if (!Number.isInteger(slotCount) || slotCount < 1 || slotCount > 200) {
            setError("Slot count must be between 1 and 200.");
            return;
        }

        if (
            !window.confirm(
                `Generate ${slotCount} slots with prefix "${prefix}" for the selected parking area?`
            )
        ) {
            return;
        }

        try {
            setGenerating(true);
            setError("");
            setSaveMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}/parking/${selectedArea}/slots/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ prefix, count: slotCount }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to generate slots.");
            }

            setSlotPrefix("");
            setSaveMessage(
                `Successfully generated ${result.data.generatedCount} slots.`
            );

            await loadSlots();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to generate slots."
            );
        } finally {
            setGenerating(false);
        }
    };

    const recordLayoutChange = () => {
        setUndoStack((prev) => [...prev, slots.map((slot) => ({ ...slot }))]);
        setRedoStack([]);
    };

    const handleUndo = async () => {
        if (undoStack.length === 0) return;

        const previousLayout = undoStack[undoStack.length - 1];

        // Identify slots missing from the current layout.
        const currentIds = new Set(slots.map((slot) => slot.slot_id));
        const missingSlots = previousLayout.filter(
            (slot) => !currentIds.has(slot.slot_id)
        );

        try {
            const token = localStorage.getItem("token");

            // Restore deleted slots in the database.
            for (const slot of missingSlots) {
                const response = await fetch(
                    `${BASE_URL}/parking/${selectedArea}/slots/${slot.slot_id}/restore`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || `Failed to restore ${slot.slot_id}`);
                }
            }

            setRedoStack((prev) => [...prev, slots.map((slot) => ({ ...slot }))]);
            setSlots(previousLayout);
            setUndoStack((prev) => prev.slice(0, -1));
            setError("");
            setSaveMessage(
                missingSlots.length > 0
                    ? "Deleted slot restored successfully"
                    : "Layout change undone"
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to undo layout change"
            );
        }
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;

        const nextLayout = redoStack[redoStack.length - 1];

        setUndoStack((prev) => [...prev, slots]);
        setSlots(nextLayout);
        setRedoStack((prev) => prev.slice(0, -1));
    };

    const handleCreateArea = async () => {
        const areaName = newAreaName.trim();
        const location = newAreaLocation.trim();

        if (!areaName || !location) {
            setError("Enter the parking area name and location.");
            return;
        }

        try {
            setCreatingArea(true);
            setError("");
            setSaveMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(`${BASE_URL}/parking-areas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ areaName, location }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to create parking area.");
            }

            const createdArea: ParkingArea = result.data;

            setParkingAreas((previous) => [
                ...previous.filter((area) => area.area_id !== createdArea.area_id),
                createdArea,
            ]);

            setSelectedArea(String(createdArea.area_id));
            setSaveMessage(`Parking area "${createdArea.Area_name}" created.`);
            setNewAreaName("");
            setNewAreaLocation("");
            setShowCreateArea(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create parking area."
            );
        } finally {
            setCreatingArea(false);
        }
    };

    const scaleX = canvasSize.width / layoutWidth;
    const scaleY = canvasSize.height / layoutHeight;

    return (
        <div
            style={{
                display: "flex",
                height: "100dvh",
                width: "100%",
                padding: 20,
                boxSizing: "border-box",
                overflow: "hidden",
                background: colors.background,
                color: colors.text,
                fontFamily: "Arial, sans-serif",
                minHeight: 0,
                position: isFullScreen ? "fixed" : "relative",
                inset: isFullScreen ? 0 : "auto",
                zIndex: isFullScreen ? 9999 : "auto",
                flexDirection: "column",
                gap: 8,
            }}
        >
                <div className="language-switch-login">
                    <button className="language-btn" onClick={toggleLanguage}>
                        {i18n.language === "en" ? "EN" : "日本語"}
                    </button>

                    <UserMenu />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                    <FiArrowLeft
                        size={22}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    />
                    <h2 style={{ margin: 0 }}>{t("layoutDesigner")}</h2>
                </div>
            

            {/* Parking Area + Slot Generation Toolbar */}
            <section
                style={{
                    ...cardStyle,
                    marginBottom: -3,
                    padding: 16,
                    display: isFullScreen ? "none" : "block",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    {/* Parking Area */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 10,
                            flex: "1 1 280px",
                        }}
                    >
                        <label
                            style={{
                                ...fieldLabelStyle,
                                flex: "1 1 160px",
                            }}
                        >
                            Parking Area
                            <select
                                id="parking-area"
                                value={selectedArea}
                                onChange={(event) => {
                                    setSelectedArea(event.target.value);
                                    setError("");
                                    setSaveMessage("");
                                }}
                                style={inputStyle}
                            >
                                {parkingAreas.map((area) => (
                                    <option
                                        key={area.area_id}
                                        value={String(area.area_id)}
                                    >
                                        {area.Area_name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={() =>
                                setShowCreateArea((previous) => !previous)
                            }
                            style={{
                                ...buttonStyle(colors.primary),
                                whiteSpace: "nowrap",
                            }}
                        >
                            {showCreateArea ? "Close Form" : "+ Create Area"}
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteParkingArea}
                            disabled={!selectedArea || parkingAreas.length <= 1}
                            style={{
                                ...buttonStyle("#dc2626", !selectedArea || parkingAreas.length <= 1),
                                whiteSpace: "nowrap",
                            }}
                        >
                            Delete Area
                        </button>
                    </div>
                    {/* Generate Slots */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 10,
                            flex: "1 1 400px",
                        }}
                    >
                        <label
                            style={{
                                ...fieldLabelStyle,
                                flex: "1 1 110px",
                            }}
                        >
                            Slot Prefix
                            <input
                                type="text"
                                value={slotPrefix}
                                onChange={(event) =>
                                    setSlotPrefix(event.target.value.toUpperCase())
                                }
                                placeholder="e.g. A"
                                maxLength={4}
                                style={inputStyle}
                            />
                        </label>

                        <label
                            style={{
                                ...fieldLabelStyle,
                                flex: "0 1 130px",
                            }}
                        >
                            Number of Slots
                            <input
                                type="number"
                                min={1}
                                max={200}
                                value={slotCount}
                                onChange={(event) =>
                                    setSlotCount(Number(event.target.value))
                                }
                                style={inputStyle}
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleGenerateSlots}
                            disabled={
                                generating ||
                                !slotPrefix.trim() ||
                                slotCount < 1 ||
                                slotCount > 200
                            }
                            style={{
                                ...buttonStyle(
                                    colors.primary,
                                    generating ||
                                    !slotPrefix.trim() ||
                                    slotCount < 1 ||
                                    slotCount > 200
                                ),
                                whiteSpace: "nowrap",
                            }}
                        >
                            {generating ? "Generating..." : "Generate Slots"}
                        </button>
                    </div>
                    {/* Canvas Dimensions */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 10,
                            flex: "1 1 280px",
                        }}
                    >
                        <label style={{ ...fieldLabelStyle, flex: "1 1 100px" }}>
                            Canvas Width
                            <input
                                type="number"
                                min={400}
                                max={3000}
                                value={layoutWidth}
                                onChange={(event) =>
                                    setLayoutWidth(Number(event.target.value))
                                }
                                style={inputStyle}
                            />
                        </label>

                        <label style={{ ...fieldLabelStyle, flex: "1 1 100px" }}>
                            Canvas Height
                            <input
                                type="number"
                                min={300}
                                max={2000}
                                value={layoutHeight}
                                onChange={(event) =>
                                    setLayoutHeight(Number(event.target.value))
                                }
                                style={inputStyle}
                            />
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveDimensions}
                        style={{
                            ...buttonStyle(colors.primary),
                            whiteSpace: "nowrap",
                        }}
                    >
                        Save Dimensions
                    </button>
                </div>

                {/* Slot Preview */}
                <p
                    style={{
                        margin: "10px 0 0",
                        fontSize: 12,
                        color: colors.muted,
                    }}
                >
                    Preview:{" "}
                    {slotPrefix.trim() && slotCount >= 1
                        ? `${slotPrefix.trim()}-01 … ${slotPrefix.trim()}-${String(
                            slotCount
                        ).padStart(2, "0")}`
                        : "Enter a prefix and slot count"}
                </p>

                {/* Create Area Form */}
                {showCreateArea && (
                    <div
                        style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: `1px solid ${colors.border}`,
                        }}
                    >
                        <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>
                            Create a New Parking Area
                        </h3>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: 12,
                                maxWidth: 650,
                            }}
                        >
                            <label style={fieldLabelStyle}>
                                Parking Area Name
                                <input
                                    type="text"
                                    value={newAreaName}
                                    onChange={(event) =>
                                        setNewAreaName(event.target.value)
                                    }
                                    placeholder="e.g. North Parking"
                                    maxLength={255}
                                    style={inputStyle}
                                />
                            </label>

                            <label style={fieldLabelStyle}>
                                Location
                                <input
                                    type="text"
                                    value={newAreaLocation}
                                    onChange={(event) =>
                                        setNewAreaLocation(event.target.value)
                                    }
                                    placeholder="e.g. K plant"
                                    maxLength={255}
                                    style={inputStyle}
                                />
                            </label>
                        </div>

                        <button
                            type="button"
                            disabled={
                                creatingArea ||
                                !newAreaName.trim() ||
                                !newAreaLocation.trim()
                            }
                            onClick={handleCreateArea}
                            style={{
                                ...buttonStyle(
                                    colors.success,
                                    creatingArea ||
                                    !newAreaName.trim() ||
                                    !newAreaLocation.trim()
                                ),
                                marginTop: 12,
                            }}
                        >
                            {creatingArea ? "Creating..." : "Create Area"}
                        </button>
                    </div>
                )}
            </section>

            {/* Short feedback banners */}
            {(error || saveMessage) && (
                <div
                    role={error ? "alert" : "status"}
                    style={{
                        flexShrink: 0,
                        padding: "6px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        color: error ? colors.danger : colors.success,
                        background: error ? "#fef2f2" : "#f0fdf4",
                        border: `1px solid ${error ? "#fecaca" : "#bbf7d0"}`,
                    }}
                >
                    {error || saveMessage}
                </div>
            )}

            {/* Layout occupies remaining screen space */}
            <section
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    padding: 10,
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    width: "100%",
                    height: isFullScreen ? "100%" : "auto",
                    overflow: "auto",
                    minWidth: 0
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        flexWrap: "wrap",
                        flexShrink: 0,
                        marginBottom: 6,
                    }}
                >
                    <div>
                        <strong style={{ fontSize: 13 }}>Parking Layout</strong>
                        <span
                            style={{
                                marginLeft: 10,
                                fontSize: 11,
                                color: colors.muted,
                            }}
                        >
                            Drag slots to reposition them
                        </span>
                    </div>
                    <div
                        style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto", }}>

                        <button
                            type="button"
                            onClick={() => {
                                const idsToCopy = selectedSlotIds.length > 0
                                    ? selectedSlotIds
                                    : selectedSlotId
                                        ? [selectedSlotId]
                                        : [];

                                const slotsToCopy = slots
                                    .filter((slot) => idsToCopy.includes(slot.slot_id))
                                    .map((slot) => ({ ...slot }));

                                if (slotsToCopy.length === 0) return;

                                setCopiedSlots(slotsToCopy);
                                setSaveMessage(`${slotsToCopy.length} slot(s) copied`);
                                setError("");
                            }}
                            disabled={selectedSlotIds.length === 0 && !selectedSlotId}
                            style={{
                                padding: "7px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                background: selectedSlotId ? "#ffffff" : "#e5e7eb",
                                color: selectedSlotId ? "#111827" : "#9ca3af",
                                cursor: selectedSlotId ? "pointer" : "not-allowed",
                                fontSize: 13,
                            }}
                        >
                            Copy
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                if (copiedSlots.length === 0 || !selectedArea) return;

                                try {
                                    setError("");
                                    setSaveMessage("");

                                    const token = localStorage.getItem("token");
                                    const headers = {
                                        Authorization: `Bearer ${token}`,
                                    };

                                    // Preserve the copied group's relative positions.
                                    const minX = Math.min(...copiedSlots.map((slot) => slot.x ?? 0));
                                    const minY = Math.min(...copiedSlots.map((slot) => slot.y ?? 0));

                                    const createdSlots: LayoutSlot[] = [];

                                    for (const copiedSlot of copiedSlots) {
                                        const response = await fetch(
                                            `${BASE_URL}/parking/${selectedArea}/slots/${copiedSlot.slot_id}/copy`,
                                            {
                                                method: "POST",
                                                headers,
                                            }
                                        );

                                        const result = await response.json();

                                        if (!response.ok || !result.success) {
                                            throw new Error(
                                                result.message || `Failed to copy ${copiedSlot.slot_number}`
                                            );
                                        }

                                        const createdSlot = result.data;

                                        const newSlot: LayoutSlot = {
                                            ...copiedSlot,
                                            ...createdSlot,
                                            slot_id: createdSlot.slot_id,
                                            slot_number: createdSlot.slot_number,
                                            x: Math.max(
                                                0,
                                                Math.min(
                                                    layoutWidth - (copiedSlot.width ?? 35),
                                                    (copiedSlot.x ?? 0) - minX + 40
                                                )
                                            ),
                                            y: Math.max(
                                                0,
                                                Math.min(
                                                    layoutHeight - (copiedSlot.height ?? 55),
                                                    (copiedSlot.y ?? 0) - minY + 40
                                                )
                                            ),
                                            width: copiedSlot.width ?? 35,
                                            height: copiedSlot.height ?? 55,
                                            rotate: copiedSlot.rotate ?? 0,
                                            status: "available",
                                        };

                                        createdSlots.push(newSlot);
                                    }

                                    setUndoStack((prev) => [
                                        ...prev,
                                        slots.map((slot) => ({ ...slot })),
                                    ]);
                                    setRedoStack([]);
                                    setSlots((prev) => [...prev, ...createdSlots]);

                                    const newIds = createdSlots.map((slot) => slot.slot_id);
                                    setSelectedSlotIds(newIds);
                                    selectedSlotIdsRef.current = newIds;

                                    if (createdSlots.length > 0) {
                                        setSelectedSlotId(createdSlots[createdSlots.length - 1].slot_id);
                                    }

                                    setSaveMessage(`${createdSlots.length} slot(s) pasted successfully`);
                                } catch (err) {
                                    setError(
                                        err instanceof Error ? err.message : "Failed to paste slots"
                                    );
                                }
                            }}
                            disabled={copiedSlots.length === 0}
                            style={{
                                padding: "7px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                background: copiedSlots ? "#ffffff" : "#e5e7eb",
                                color: copiedSlots ? "#111827" : "#9ca3af",
                                cursor: copiedSlots ? "pointer" : "not-allowed",
                                fontSize: 13,
                            }}
                        >
                            Paste
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                const idsToDelete = selectedSlotIds.length > 0
                                    ? selectedSlotIds
                                    : selectedSlotId
                                        ? [selectedSlotId]
                                        : [];

                                if (idsToDelete.length === 0 || !selectedArea) return;

                                const confirmed = window.confirm(
                                    `Are you sure you want to delete ${idsToDelete.length} selected slot(s)?`
                                );

                                if (!confirmed) return;

                                try {
                                    setError("");
                                    setSaveMessage("");

                                    const token = localStorage.getItem("token");

                                    // Preserve the original layout for Undo.
                                    const originalLayout = slots.map((slot) => ({ ...slot }));

                                    for (const slotId of idsToDelete) {
                                        const response = await fetch(
                                            `${BASE_URL}/parking/${selectedArea}/slots/${slotId}`,
                                            {
                                                method: "DELETE",
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            }
                                        );

                                        const result = await response.json();

                                        if (!response.ok || !result.success) {
                                            throw new Error(
                                                result.message || `Failed to delete slot ${slotId}`
                                            );
                                        }
                                    }

                                    setUndoStack((prev) => [...prev, originalLayout]);
                                    setRedoStack([]);

                                    setSlots((prev) =>
                                        prev.filter((slot) => !idsToDelete.includes(slot.slot_id))
                                    );

                                    setSelectedSlotIds([]);
                                    selectedSlotIdsRef.current = [];
                                    setSelectedSlotId(null);
                                    setDraftSlot(null);

                                    setSaveMessage(`${idsToDelete.length} slot(s) deleted successfully`);
                                } catch (err) {
                                    setError(
                                        err instanceof Error ? err.message : "Failed to delete selected slots"
                                    );

                                    // Reload to reflect any deletions completed before an error occurred.
                                    await loadSlots();
                                }
                            }}
                            disabled={selectedSlotIds.length === 0 && !selectedSlotId}
                            style={{
                                padding: "7px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                background: copiedSlots ? "#ffffff" : "#e5e7eb",
                                color: copiedSlots ? "#111827" : "#9ca3af",
                                cursor: copiedSlots ? "pointer" : "not-allowed",
                                fontSize: 13,
                            }}
                        >
                            🗑 Delete
                        </button>
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={undoStack.length === 0}
                            style={{
                                padding: "7px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                background: undoStack.length === 0 ? "#e5e7eb" : "#ffffff",
                                color: "#111827",
                                cursor: undoStack.length === 0 ? "not-allowed" : "pointer",
                                fontSize: 13,
                            }}
                        >
                            ↶ Undo
                        </button>

                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            style={{
                                padding: "7px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                background: redoStack.length === 0 ? "#e5e7eb" : "#ffffff",
                                color: "#111827",
                                cursor: redoStack.length === 0 ? "not-allowed" : "pointer",
                                fontSize: 13,
                            }}
                        >
                            ↷ Redo
                        </button>
                        <span style={{ fontSize: 11, color: colors.muted }}>
                            Total slots: <strong>{slots.length}</strong>
                            {loading ? " · Loading..." : ""}
                        </span>
                        <button
                            type="button"
                            onClick={handleSaveLayout}
                            disabled={saving || loading || slots.length === 0}
                            style={buttonStyle(
                                colors.primary,
                                saving || loading || slots.length === 0
                            )}
                        >
                            {saving ? "Saving..." : "Save Layout"}
                        </button>
                        <button
                            onClick={() => setIsFullScreen((prev) => !prev)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                background: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            {isFullScreen ? "⛶ Exit Full Screen" : "⛶ Full Screen"}
                        </button>
                    </div>

                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        flexShrink: 0,
                        marginBottom: 6,
                        fontSize: 10,
                        color: colors.muted,
                    }}
                >
                    <span>
                        <span
                            style={{
                                display: "inline-block",
                                width: 9,
                                height: 9,
                                marginRight: 4,
                                borderRadius: 2,
                                background: colors.fixed,
                            }}
                        />
                        Fixed slots
                    </span>
                    <span>
                        <span
                            style={{
                                display: "inline-block",
                                width: 9,
                                height: 9,
                                marginRight: 4,
                                borderRadius: 2,
                                background: colors.available,
                            }}
                        />
                        Non-fixed slots
                    </span>
                </div>

                <div
                    ref={setCanvasElement}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        position: "relative",
                        width: "100%",
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                        border: `1px solid ${colors.border}`,
                        borderRadius: 6,
                        backgroundColor: "#f8fafc",
                        backgroundImage:
                            "linear-gradient(#e9eef5 1px, transparent 1px), linear-gradient(90deg, #e9eef5 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                        touchAction: "none",
                    }}
                >
                    {/* Scale the display without changing the stored 950 × 400 coordinates. */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: layoutWidth,
                            height: layoutHeight,
                            transform: `scale(${scaleX}, ${scaleY})`,
                            transformOrigin: "top left",
                        }}
                    >
                        {slots.map((slot) => (
                            <div
                                key={slot.slot_id}

                                onMouseDown={(event) => {
                                    setShowSlotProperties(true);
                                    const multiSelect = event.ctrlKey || event.metaKey;
                                    if (multiSelect) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        console.log("Ctrl-Clicked slot:", slot.slot_id);
                                        setSelectedSlotIds((prev) => {
                                            const next = prev.includes(slot.slot_id)
                                                ? prev.filter((id) => id !== slot.slot_id)
                                                : [...prev, slot.slot_id];
                                            console.log("Updated selection:", next);
                                            return next;
                                        });
                                        console.log("Selection update requested");
                                        setSelectedSlotId(slot.slot_id);
                                        setDraggingSlotId(null);
                                        setResizingSlotId(null);
                                        setResizeStart(null);
                                        setDragStartLayout(null);
                                        return;
                                    }

                                    // Normal click: preserve an existing group when dragging one of its slots
                                    setShowSlotProperties(true);
                                    const isAlreadySelected = selectedSlotIds.includes(slot.slot_id);

                                    if (!isAlreadySelected) {
                                        setSelectedSlotId(slot.slot_id);
                                        setSelectedSlotIds([slot.slot_id]);
                                    }

                                    setEditingSlotNumber(slot.slot_number);
                                    handleMouseDown(event, slot.slot_id);
                                }}
                                title={`${slot.slot_id} • ${slot.status}`}
                                style={{
                                    position: "absolute",

                                    left:
                                        draftSlots[slot.slot_id]?.x ??
                                        (slot.slot_id === draftSlot?.slot_id
                                            ? draftSlot.x
                                            : slot.x) ??
                                        0,

                                    top:
                                        draftSlots[slot.slot_id]?.y ??
                                        (slot.slot_id === draftSlot?.slot_id
                                            ? draftSlot.y
                                            : slot.y) ??
                                        0,

                                    width:
                                        draftSlots[slot.slot_id]?.width ??
                                        (slot.slot_id === draftSlot?.slot_id
                                            ? draftSlot.width
                                            : slot.width) ??
                                        35,

                                    height:
                                        draftSlots[slot.slot_id]?.height ??
                                        (slot.slot_id === draftSlot?.slot_id
                                            ? draftSlot.height
                                            : slot.height) ??
                                        55,

                                    transform: `rotate(${draftSlots[slot.slot_id]?.rotate ??
                                        (slot.slot_id === draftSlot?.slot_id
                                            ? draftSlot.rotate
                                            : slot.rotate) ??
                                        0
                                        }deg)`,

                                    border: selectedSlotId === slot.slot_id || selectedSlotIds.includes(slot.slot_id) ? "2px solid #2563eb" : "1px solid rgba(15, 23, 42, 0.45)",
                                    borderRadius: 4,
                                    background: (draftSlots[slot.slot_id]?.is_fixed ?? slot.is_fixed)
                                        ? colors.fixed
                                        : colors.available,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 9,
                                    fontWeight: 600,
                                    color: "#172033",
                                    overflow: "hidden",
                                    cursor:
                                        draggingSlotId === slot.slot_id ? "grabbing" : "grab",
                                    userSelect: "none",
                                    boxShadow:
                                        selectedSlotId === slot.slot_id ?
                                            " 0 0 0 2px rgba(37,99,235,0.2), 0 3px 8px rgba(15,23,42,0.18)" :
                                            draggingSlotId === slot.slot_id
                                                ? "0 3px 8px rgba(15, 23, 42, 0.25)"
                                                : "0 1px 2px rgba(15, 23, 42, 0.08)",
                                    zIndex: draggingSlotId === slot.slot_id ? 10 : 1,
                                }}
                            >
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setEditingSlotId(slot.slot_id);
                                        setEditingSlotNumber(slot.slot_number);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "inherit",
                                        font: "inherit",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        padding: 0,
                                    }}
                                    title="Click to edit slot number"
                                >
                                    {slot.slot_number}
                                </button>
                                {/* Resize handle */}
                                <div
                                    onMouseDown={(event) => handleResizeMouseDown(event, slot)}
                                    style={{
                                        position: "absolute",
                                        right: -5,
                                        bottom: -5,
                                        width: 12,
                                        height: 12,
                                        background: "#2563eb",
                                        border: "2px solid white",
                                        borderRadius: 3,
                                        cursor: "nwse-resize",
                                        zIndex: 10,
                                    }}
                                />

                                {/* Rotate button */}
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                        event.stopPropagation();

                                        recordLayoutChange();

                                        setSlots((prev) =>
                                            prev.map((item) =>
                                                item.slot_id === slot.slot_id
                                                    ? { ...item, rotate: ((item.rotate ?? 0) + 15) % 360 }
                                                    : item
                                            )
                                        );
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        width: 20,
                                        height: 20,
                                        padding: 0,
                                        border: "1px solid #2563eb",
                                        borderRadius: "50%",
                                        background: "white",
                                        color: "#2563eb",
                                        cursor: "pointer",
                                        fontSize: 14,
                                        lineHeight: "18px",
                                        zIndex: 10,
                                    }}
                                    title="Rotate slot by 15 degrees"
                                >
                                    ↻
                                </button>

                            </div>
                        ))}
                    </div>
                </div>
                {showSlotProperties && (
                    <div
                        style={{
                            marginTop: 10,
                            padding: 12,
                            border: `1px solid ${selectedSlot ? "#bfdbfe" : colors.border
                                }`,
                            borderRadius: 8,
                            background: selectedSlot ? "#eff6ff" : "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            gap: 20,
                            flexWrap: "wrap",
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                marginBottom: -20,
                            }}
                        >
                            <strong style={{ fontSize: 13, color: colors.text }}>
                                Slot Properties
                            </strong>

                            {selectedSlot && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSlotProperties(false)
                                    }}
                                    title="Close Slot Properties"
                                    aria-label="Close Slot Properties"
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: colors.muted,
                                        fontSize: 20,
                                        cursor: "pointer",
                                        padding: "2px 6px",
                                        lineHeight: 1,
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>



                        {selectedSlot ? (
                            <>
                                <label
                                    style={{
                                        fontSize: 12,
                                        color: colors.muted,
                                        fontWeight: 600,
                                    }}
                                >
                                    Slot Number
                                    <input
                                        type="text"
                                        value={editingSlotNumber}
                                        maxLength={10}
                                        disabled={selectedSlotIds.length > 1}
                                        title={
                                            selectedSlotIds.length > 1
                                                ? "Select only one slot to change its number"
                                                : ""
                                        }
                                        onChange={(event) =>
                                            setEditingSlotNumber(event.target.value)
                                        }
                                        placeholder="e.g. 17-C2"
                                        style={{
                                            ...inputStyle,
                                            width: 100,
                                            marginTop: 4,
                                        }}
                                    />
                                </label>

                                <label
                                    style={{
                                        fontSize: 12,
                                        color: colors.muted,
                                        fontWeight: 600,
                                    }}
                                >
                                    Slot Type
                                    <select
                                        value={propertyIsFixed ? "fixed" : "non-fixed"}
                                        onChange={(event) => {
                                            const isFixed = event.target.value === "fixed";
                                            setPropertyIsFixed(isFixed);
                                            updateSelectedDraftSlots({
                                                is_fixed: isFixed,
                                            });
                                        }}
                                        style={{
                                            ...inputStyle,
                                            width: 120,
                                            marginTop: 4,
                                        }}
                                    >
                                        <option value="fixed">Fixed</option>
                                        <option value="non-fixed">Non-Fixed</option>
                                    </select>
                                </label>

                                <label
                                    style={{
                                        fontSize: 12,
                                        color: colors.muted,
                                        fontWeight: 600,
                                    }}
                                >
                                    Rotation (°)
                                    <input
                                        type="number"
                                        min={0}
                                        max={360}
                                        step={15}
                                        value={propertyRotation}
                                        onChange={(event) => {
                                            const value = Number(event.target.value);

                                            if (
                                                !Number.isFinite(value) ||
                                                value < 0 ||
                                                value > 360 ||
                                                value % 15 !== 0
                                            ) {
                                                return;
                                            }

                                            setPropertyRotation(value);

                                            updateSelectedDraftSlots({
                                                rotate: value,
                                            });
                                        }}
                                        style={{
                                            ...inputStyle,
                                            width: 85,
                                            marginTop: 4,
                                        }}
                                    />
                                </label>
                                <label
                                    style={{
                                        fontSize: 12,
                                        color: colors.muted,
                                        fontWeight: 600,
                                    }}
                                >
                                    Width (px)
                                    <input
                                        type="number"
                                        min={20}
                                        max={150}
                                        value={propertyWidth}
                                        onChange={(event) => {
                                            const value = Number(event.target.value);
                                            if (!Number.isFinite(value) || value < 20 || value > 150) {
                                                return;
                                            }
                                            setPropertyWidth(value);

                                            setDraftSlots((prev) => {
                                                const next = { ...prev };

                                                const ids = selectedSlotIds.length > 0
                                                    ? selectedSlotIds
                                                    : selectedSlot
                                                        ? [selectedSlot.slot_id]
                                                        : [];

                                                ids.forEach((id) => {
                                                    next[id] = {
                                                        ...next[id],
                                                        width: value,
                                                    };
                                                });

                                                return next;
                                            });
                                        }}
                                        style={{
                                            ...inputStyle,
                                            width: 85,
                                            marginTop: 4,
                                        }}
                                    />
                                </label>

                                <label
                                    style={{
                                        fontSize: 12,
                                        color: colors.muted,
                                        fontWeight: 600,
                                    }}
                                >
                                    Height (px)
                                    <input
                                        type="number"
                                        min={30}
                                        max={180}
                                        value={propertyHeight}
                                        onChange={(event) => {
                                            const value = Number(event.target.value);

                                            if (!Number.isFinite(value) || value < 30 || value > 180) {
                                                return;
                                            }

                                            setPropertyHeight(value);

                                            updateSelectedDraftSlots({
                                                height: value,
                                            });
                                        }}
                                        style={{
                                            ...inputStyle,
                                            width: 85,
                                            marginTop: 4,
                                        }}
                                    />
                                </label>
                                <label style={{ fontSize: 12, color: colors.muted, fontWeight: 600 }}>
                                    Position X
                                    <input
                                        type="number"
                                        min={0}
                                        max={layoutWidth}
                                        value={propertyX}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            if (value === "") return;

                                            const x = Math.max(
                                                0,
                                                Math.min(
                                                    layoutWidth - propertyWidth,
                                                    Number(value)
                                                )
                                            );

                                            setPropertyX(x);

                                            const deltaX = x - (selectedSlot?.x ?? 0);

                                            const ids = selectedSlotIds.length > 0
                                                ? selectedSlotIds
                                                : selectedSlot
                                                    ? [selectedSlot.slot_id]
                                                    : [];

                                            setDraftSlots((prev) => {
                                                const next = { ...prev };

                                                ids.forEach((id) => {
                                                    const original = slots.find(
                                                        (slot) => slot.slot_id === id
                                                    );

                                                    if (!original) return;

                                                    next[id] = {
                                                        ...next[id],
                                                        x: Math.max(
                                                            0,
                                                            Math.min(
                                                                layoutWidth - propertyWidth,
                                                                (original.x ?? 0) + deltaX
                                                            )
                                                        ),
                                                    };
                                                });

                                                return next;
                                            });
                                        }}
                                        style={{ ...inputStyle, width: 100, marginTop: 4 }}
                                    />
                                </label>

                                <label style={{ fontSize: 12, color: colors.muted, fontWeight: 600 }}>
                                    Position Y
                                    <input
                                        type="number"
                                        min={0}
                                        max={layoutHeight}
                                        value={propertyY}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            if (value === "") return;

                                            const y = Math.max(
                                                0,
                                                Math.min(
                                                    layoutHeight - propertyHeight,
                                                    Number(value)
                                                )
                                            );

                                            setPropertyY(y);

                                            const deltaY = y - (selectedSlot?.y ?? 0);

                                            const ids = selectedSlotIds.length > 0
                                                ? selectedSlotIds
                                                : selectedSlot
                                                    ? [selectedSlot.slot_id]
                                                    : [];

                                            setDraftSlots((prev) => {
                                                const next = { ...prev };

                                                ids.forEach((id) => {
                                                    const original = slots.find(
                                                        (slot) => slot.slot_id === id
                                                    );

                                                    if (!original) return;

                                                    next[id] = {
                                                        ...next[id],
                                                        y: Math.max(
                                                            0,
                                                            Math.min(
                                                                layoutHeight - propertyHeight,
                                                                (original.y ?? 0) + deltaY
                                                            )
                                                        ),
                                                    };
                                                });

                                                return next;
                                            });
                                        }}
                                        style={{ ...inputStyle, width: 100, marginTop: 4 }}
                                    />
                                </label>
                                <button
                                    type="button"
                                    disabled={
                                        savingSlotNumber ||
                                        savingSlotFixedStatus ||
                                        !editingSlotNumber.trim() ||
                                        !selectedSlot
                                    }
                                    onClick={handleApplySlotProperties}
                                    style={{
                                        ...buttonStyle(
                                            colors.primary,
                                            savingSlotNumber ||
                                            savingSlotFixedStatus ||
                                            !editingSlotNumber.trim() ||
                                            !selectedSlot
                                        ),
                                        alignSelf: "flex-end",
                                        padding: "9px 16px",
                                    }}
                                >
                                    {savingSlotNumber || savingSlotFixedStatus
                                        ? "Saving..."
                                        : "Apply Changes"}
                                </button>
                            </>
                        ) : (

                            <span style={{ fontSize: 12, color: colors.muted }}>
                                Select a parking slot to view its properties.
                            </span>
                        )}
                    </div>
                )}
                {!loading && slots.length === 0 && (
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: colors.muted }}>
                        No slots found. Generate slots to get started.
                    </p>
                )}
            </section>
            {editingSlotId && (
                <div
                    onClick={() => {
                        if (!savingSlotNumber) {
                            setEditingSlotId(null);
                            setEditingSlotNumber("");
                        }
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: 320,
                            maxWidth: "90vw",
                            padding: 24,
                            borderRadius: 12,
                            background: "#ffffff",
                            boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                            Edit Slot Number
                        </h3>

                        <p style={{ fontSize: 13, color: "#6b7280" }}>
                            Enter a new number for this parking slot.
                        </p>

                        <input
                            autoFocus
                            value={editingSlotNumber}
                            maxLength={10}
                            onChange={(event) =>
                                setEditingSlotNumber(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Escape" && !savingSlotNumber) {
                                    setEditingSlotId(null);
                                }
                            }}
                            placeholder="e.g. 17-C2"
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: 10,
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                fontSize: 14,
                                marginBottom: 20,
                            }}
                        />

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                            }}
                        >
                            <button
                                type="button"
                                disabled={savingSlotNumber}
                                onClick={() => {
                                    setEditingSlotId(null);
                                    setEditingSlotNumber("");
                                }}
                                style={{
                                    padding: "8px 14px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: 6,
                                    background: "#ffffff",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={savingSlotNumber || !editingSlotNumber.trim()}
                                onClick={async () => {
                                    if (!editingSlotId || !selectedArea) return;

                                    const newNumber = editingSlotNumber.trim();

                                    if (!/^[A-Za-z0-9-]{1,10}$/.test(newNumber)) {
                                        setError(
                                            "Use 1–10 letters, numbers, or hyphens for the slot number."
                                        );
                                        return;
                                    }

                                    try {
                                        setSavingSlotNumber(true);
                                        setError("");

                                        const token = localStorage.getItem("token");

                                        const response = await fetch(
                                            `${BASE_URL}/parking/${selectedArea}/slots/${editingSlotId}/number`,
                                            {
                                                method: "PATCH",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: `Bearer ${token}`,
                                                },
                                                body: JSON.stringify({
                                                    slotNumber: newNumber,
                                                }),
                                            }
                                        );

                                        const result = await response.json();

                                        if (!response.ok) {
                                            throw new Error(
                                                result.message || "Failed to update slot number"
                                            );
                                        }

                                        setSlots((prev) =>
                                            prev.map((slot) =>
                                                slot.slot_id === editingSlotId
                                                    ? { ...slot, slot_number: newNumber }
                                                    : slot
                                            )
                                        );

                                        setSaveMessage("Slot number updated successfully");
                                        setEditingSlotId(null);
                                        setEditingSlotNumber("");
                                    } catch (err) {
                                        setError(
                                            err instanceof Error
                                                ? err.message
                                                : "Failed to update slot number"
                                        );
                                    } finally {
                                        setSavingSlotNumber(false);
                                    }
                                }}
                                style={{
                                    padding: "8px 14px",
                                    border: "none",
                                    borderRadius: 6,
                                    background: "#2563eb",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                }}
                            >
                                {savingSlotNumber ? "Saving..." : "Done"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}