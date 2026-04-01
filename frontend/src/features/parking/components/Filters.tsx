import { useParking } from "../context/ParkingContext";

/**
 * 🎛 Filters Component
 * Controls which parking slots are displayed (All / Available / Reserved)
 */
export default function Filters() {
  const { filter, setFilter } = useParking();

  // 📌 Filter options (easier to scale later)
  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Available", value: "available" },
    { label: "Reserved", value: "reserved" },
  ] as const;

  return (
    <div className="filter-container">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          className={filter === option.value ? "active" : ""}
          onClick={() => setFilter(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}