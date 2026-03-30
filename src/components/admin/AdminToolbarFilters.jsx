import { useState, useEffect, useRef } from "react";
import { Search, Filter, ChevronDown, Check } from "lucide-react";
import "./AdminToolbarFilters.css";

const LUCIDE_SEARCH = { size: 18, strokeWidth: 2 };
const LUCIDE_CATEGORY = { size: 16, strokeWidth: 2 };
const LUCIDE_CATEGORY_CHEVRON = { size: 16, strokeWidth: 2 };
const LUCIDE_CATEGORY_CHECK = { size: 16, strokeWidth: 2.5 };

/**
 * Search bar + filter dropdown (shared admin pattern).
 * @param {{ value: string, label: string }[]} filterOptions
 */
export default function AdminToolbarFilters({
  searchValue,
  onSearchChange,
  /** Search input keydown — e.g. exact email lookup */
  onSearchKeyDown,
  searchPlaceholder = "Search…",
  filterValue,
  onFilterChange,
  filterOptions = [],
  idPrefix = "admin-toolbar-filter",
  filterAriaLabel = "Filter",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabel =
    filterOptions.find((o) => o.value === filterValue)?.label ??
    String(filterValue ?? "");

  useEffect(() => {
    if (!menuOpen) return;
    // Use "click" instead of "mousedown" so the menu does not close before the option receives the click.
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const triggerId = `${idPrefix}-trigger`;
  const listboxId = `${idPrefix}-listbox`;

  return (
    <div className="admin-toolbar-filters">
      <div className="admin-search-wrap">
        <Search className="admin-search-icon" aria-hidden {...LUCIDE_SEARCH} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
          className="admin-search-input"
        />
      </div>
      <div className="admin-filter-wrap">
        <div className="admin-toolbar-dropdown" ref={dropdownRef}>
          <button
            type="button"
            id={triggerId}
            className={`admin-toolbar-dropdown__trigger${
              menuOpen ? " admin-toolbar-dropdown__trigger--open" : ""
            }`}
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Filter
              className="admin-toolbar-dropdown__trigger-icon"
              aria-hidden
              {...LUCIDE_CATEGORY}
            />
            <span className="admin-toolbar-dropdown__trigger-label">
              {selectedLabel}
            </span>
            <ChevronDown
              className="admin-toolbar-dropdown__trigger-chevron"
              aria-hidden
              {...LUCIDE_CATEGORY_CHEVRON}
            />
          </button>
          {menuOpen ? (
            <ul
              className="admin-toolbar-dropdown__menu"
              id={listboxId}
              role="listbox"
              aria-labelledby={triggerId}
              aria-label={filterAriaLabel}
            >
              {filterOptions.map((opt) => {
                const selected = filterValue === opt.value;
                return (
                  <li key={String(opt.value)} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={
                        selected
                          ? "admin-toolbar-dropdown__option admin-toolbar-dropdown__option--active"
                          : "admin-toolbar-dropdown__option"
                      }
                      onClick={() => {
                        onFilterChange?.(opt.value);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="admin-toolbar-dropdown__option-text">
                        {opt.label}
                      </span>
                      {selected ? (
                        <Check
                          className="admin-toolbar-dropdown__option-check"
                          aria-hidden
                          {...LUCIDE_CATEGORY_CHECK}
                        />
                      ) : (
                        <span className="admin-toolbar-dropdown__option-check-placeholder" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
