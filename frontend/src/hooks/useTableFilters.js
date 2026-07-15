import { useState, useMemo } from 'react';
import useDebounce from './useDebounce';

/**
 * Generalizes the search + dropdown-filter(s) + optional date-range pattern
 * repeated across Appointments/Prescriptions/Inventory/Billing.
 *
 * @param {Array} items
 * @param {Object} config
 * @param {Array<(item:any)=>string>} config.searchFields - text fields checked against the search box
 * @param {Object<string,(item:any)=>string>} [config.filters] - filterKey -> getter, compared against an exact-match dropdown value
 * @param {(item:any)=>string} [config.dateField] - getter returning a 'YYYY-MM-DD' string, enables date-range filtering
 */
const useTableFilters = (items, { searchFields = [], filters = {}, dateField = null } = {}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(Object.keys(filters).map((k) => [k, '']))
  );
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const setFilter = (key, value) => setFilterValues((f) => ({ ...f, [key]: value }));

  const clearAll = () => {
    setSearch('');
    setFilterValues(Object.fromEntries(Object.keys(filters).map((k) => [k, ''])));
    setDateFrom('');
    setDateTo('');
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return items.filter((item) => {
      const matchesSearch = !q || searchFields.some((getField) => String(getField(item) ?? '').toLowerCase().includes(q));
      const matchesFilters = Object.entries(filterValues).every(([key, val]) => !val || filters[key](item) === val);
      const itemDate = dateField ? dateField(item) : null;
      const matchesDate = !dateField || (
        (!dateFrom || itemDate >= dateFrom) &&
        (!dateTo || itemDate <= dateTo)
      );
      return matchesSearch && matchesFilters && matchesDate;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, debouncedSearch, filterValues, dateFrom, dateTo]);

  return { filtered, search, setSearch, filterValues, setFilter, dateFrom, setDateFrom, dateTo, setDateTo, clearAll };
};

export default useTableFilters;
