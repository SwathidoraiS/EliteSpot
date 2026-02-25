import { useParking } from '../context/useParking';

/**
 * Filter Tabs Component
 * Controls which slots are displayed.
 */
export default function Filters() {
  const { filter, setFilter } = useParking();

  return (
    <div className="filter-container">
      <button
        className={filter === 'all' ? 'active' : ''}
        onClick={() => setFilter('all')}
      >
        All
      </button>

      <button
        className={filter === 'available' ? 'active' : ''}
        onClick={() => setFilter('available')}
      >
        Available
      </button>

      <button
        className={filter === 'reserved' ? 'active' : ''}
        onClick={() => setFilter('reserved')}
      >
        Reserved
      </button>
    </div>
  );
}