import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Filter, Sparkles } from "lucide-react";
import "./MarketplaceFilterBar.css";

export default function MarketplaceFilterBar({
  searchName,
  onSearchNameChange,
  brandFilter,
  onBrandFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  frameSizeFilter,
  onFrameSizeFilterChange,
  modelYearFilter,
  onModelYearFilterChange,
  priceRange,
  onPriceRangeChange,
  brandOptions,
  categoryOptions,
  frameSizeOptions,
  modelYearOptions,
  onClearFilters,
  priceMin,
  priceMax,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}) {
  const [activeKey, setActiveKey] = useState(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [minPriceStr, setMinPriceStr] = useState("");
  const [maxPriceStr, setMaxPriceStr] = useState("");
  const containerRef = useRef(null);

  const toggleKey = (key, ev) => {
    if (key === "panel") {
      setActiveKey(null);
      setMinPriceStr("");
      setMaxPriceStr("");
      setDraft({
        brandFilter,
        categoryFilter,
        frameSizeFilter,
        modelYearFilter,
        priceRange: Array.isArray(priceRange) ? [...priceRange] : [priceMin, priceMax],
      });
      setIsModalOpen(true);
      return;
    }
    if (containerRef.current && ev?.currentTarget) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const chipRect = ev.currentTarget.getBoundingClientRect();
      const nextLeft = Math.max(0, chipRect.left - containerRect.left);
      setDropdownLeft(nextLeft);
    } else {
      setDropdownLeft(0);
    }
    setActiveKey((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest?.(".mp-filter-modal-overlay")) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setActiveKey(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      typeof window !== "undefined"
        ? window.innerWidth - document.documentElement.clientWidth
        : 0;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      setDraft(null);
      setMinPriceStr("");
      setMaxPriceStr("");
    }
  }, [isModalOpen]);

  const resetDraft = () => {
    setDraft({
      brandFilter: "all",
      categoryFilter: "all",
      frameSizeFilter: "all",
      modelYearFilter: "all",
      priceRange: [priceMin, priceMax],
    });
    setMinPriceStr("");
    setMaxPriceStr("");
  };

  const applyDraft = () => {
    if (!draft) return;
    onBrandFilterChange(draft.brandFilter);
    onCategoryFilterChange(draft.categoryFilter);
    onFrameSizeFilterChange(draft.frameSizeFilter);
    onModelYearFilterChange(draft.modelYearFilter);
    onPriceRangeChange(draft.priceRange);
    setIsModalOpen(false);
  };

  /** Commit min/max price inputs inside modal — draft only (no parent / no search until View results) */
  const commitDraftMin = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const max = prev.priceRange?.[1] ?? priceMax;
      const num =
        minPriceStr === ""
          ? prev.priceRange?.[0] ?? priceMin
          : parseInt(minPriceStr, 10);
      const clamped = Number.isNaN(num)
        ? priceMin
        : Math.max(priceMin, Math.min(num, priceMax, max));
      return { ...prev, priceRange: [clamped, max] };
    });
    setMinPriceStr("");
  };

  const commitDraftMax = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const min = prev.priceRange?.[0] ?? priceMin;
      const num =
        maxPriceStr === ""
          ? prev.priceRange?.[1] ?? priceMax
          : parseInt(maxPriceStr, 10);
      const clamped = Number.isNaN(num)
        ? priceMax
        : Math.min(priceMax, Math.max(num, priceMin, min));
      return { ...prev, priceRange: [min, clamped] };
    });
    setMaxPriceStr("");
  };

  const handleMinChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMinPriceStr(raw);
    if (raw === "") {
      onPriceRangeChange(([_, max]) => [priceMin, max]);
      return;
    }
    const num = parseInt(raw, 10);
    if (!Number.isNaN(num)) {
      onPriceRangeChange(([_, max]) => [Math.min(num, max), max]);
    }
  };

  const handleMaxChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMaxPriceStr(raw);
    if (raw === "") {
      onPriceRangeChange(([min]) => [min, priceMax]);
      return;
    }
    const num = parseInt(raw, 10);
    if (!Number.isNaN(num)) {
      onPriceRangeChange(([min]) => [min, Math.max(num, min)]);
    }
  };

  const commitMin = () => {
    const num = minPriceStr === "" ? priceMin : parseInt(minPriceStr, 10);
    const clamped = Number.isNaN(num)
      ? priceMin
      : Math.max(priceMin, Math.min(num, priceMax, priceRange[1]));
    onPriceRangeChange(([_, max]) => [clamped, max]);
    setMinPriceStr("");
  };

  const commitMax = () => {
    const num = maxPriceStr === "" ? priceMax : parseInt(maxPriceStr, 10);
    const clamped = Number.isNaN(num)
      ? priceMax
      : Math.min(priceMax, Math.max(num, priceMin, priceRange[0]));
    onPriceRangeChange(([min]) => [min, clamped]);
    setMaxPriceStr("");
  };

  const handleMinRangeChange = (e) => {
    const val = Number(e.target.value);
    if (Number.isNaN(val)) return;
    onPriceRangeChange(([_, max]) => [Math.min(val, max), max]);
  };

  const handleMaxRangeChange = (e) => {
    const val = Number(e.target.value);
    if (Number.isNaN(val)) return;
    onPriceRangeChange(([min]) => [min, Math.max(val, min)]);
  };

  const formatVnd = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "";
    return `${num.toLocaleString("vi-VN")}đ`;
  };

  const getOptionLabel = (options, value) => {
    if (!Array.isArray(options)) return String(value ?? "");
    const found = options.find((o) => String(o?.value) === String(value));
    return String(found?.label ?? value ?? "");
  };

  const sortOptions = [
    {
      value: "newest",
      label: (
        <span className="mp-sort-option">
          <Sparkles size={12} />
          <span>Newest Listings</span>
        </span>
      ),
    },
    {
      value: "price-low",
      label: (
        <span className="mp-sort-option">
          <ArrowUpNarrowWide size={12} />
          <span>Price: Low to High</span>
        </span>
      ),
    },
    {
      value: "price-high",
      label: (
        <span className="mp-sort-option">
          <ArrowDownWideNarrow size={14} />
          <span>Price: High to Low</span>
        </span>
      ),
    },
  ];

  const criteriaSourceCommitted = {
    brandFilter,
    categoryFilter,
    frameSizeFilter,
    modelYearFilter,
    priceRange,
    isDraft: false,
  };

  const criteriaSourceModal =
    isModalOpen && draft
      ? {
        brandFilter: draft.brandFilter,
        categoryFilter: draft.categoryFilter,
        frameSizeFilter: draft.frameSizeFilter,
        modelYearFilter: draft.modelYearFilter,
        priceRange: draft.priceRange,
        isDraft: true,
      }
      : criteriaSourceCommitted;

  const buildSelectedCriteria = (src) => {
    const sourcePriceIsDefault =
      src.priceRange?.[0] === priceMin && src.priceRange?.[1] === priceMax;
    const hasBrand = src.brandFilter && src.brandFilter !== "all";
    const hasCategory = src.categoryFilter && src.categoryFilter !== "all";
    const hasFrame = src.frameSizeFilter && src.frameSizeFilter !== "all";
    const hasYear = src.modelYearFilter && src.modelYearFilter !== "all";
    const hasPrice =
      Array.isArray(src.priceRange) &&
      src.priceRange.length === 2 &&
      !sourcePriceIsDefault;

    return [
      hasPrice
        ? {
          key: "price",
          label: `Price: ${formatVnd(src.priceRange[0])} - ${formatVnd(src.priceRange[1])}`,
          onRemove: () => {
            if (src.isDraft) {
              setDraft((prev) =>
                prev ? { ...prev, priceRange: [priceMin, priceMax] } : prev,
              );
            } else {
              onPriceRangeChange([priceMin, priceMax]);
            }
          },
        }
        : null,
      hasBrand
        ? {
          key: "brand",
          label: `Brand: ${getOptionLabel(brandOptions, src.brandFilter)}`,
          onRemove: () => {
            if (src.isDraft) {
              setDraft((prev) =>
                prev ? { ...prev, brandFilter: "all" } : prev,
              );
            } else {
              onBrandFilterChange("all");
            }
          },
        }
        : null,
      hasCategory
        ? {
          key: "category",
          label: `Category: ${getOptionLabel(categoryOptions, src.categoryFilter)}`,
          onRemove: () => {
            if (src.isDraft) {
              setDraft((prev) =>
                prev ? { ...prev, categoryFilter: "all" } : prev,
              );
            } else {
              onCategoryFilterChange("all");
            }
          },
        }
        : null,
      hasFrame
        ? {
          key: "frame",
          label: `Frame size: ${getOptionLabel(frameSizeOptions, src.frameSizeFilter)}`,
          onRemove: () => {
            if (src.isDraft) {
              setDraft((prev) =>
                prev ? { ...prev, frameSizeFilter: "all" } : prev,
              );
            } else {
              onFrameSizeFilterChange("all");
            }
          },
        }
        : null,
      hasYear
        ? {
          key: "year",
          label: `Model year: ${getOptionLabel(modelYearOptions, src.modelYearFilter)}`,
          onRemove: () => {
            if (src.isDraft) {
              setDraft((prev) =>
                prev ? { ...prev, modelYearFilter: "all" } : prev,
              );
            } else {
              onModelYearFilterChange("all");
            }
          },
        }
        : null,
    ].filter(Boolean);
  };

  /** Inline row: always committed filters (search results) — not draft while modal is open */
  const selectedCriteriaInline = buildSelectedCriteria(criteriaSourceCommitted);
  /** Modal strip: draft while editing */
  const selectedCriteriaModal = buildSelectedCriteria(criteriaSourceModal);

  const isQuickHeaderCategory = (() => {
    const normalized = String(categoryFilter ?? "").trim().toLowerCase();
    return (
      normalized === "road bike" ||
      normalized === "mountain bike" ||
      normalized === "gravel bike"
    );
  })();

  const stripPrefixLabel = (text) => {
    if (typeof text !== "string") return "";
    const parts = text.split(":");
    if (parts.length <= 1) return text.trim();
    return parts.slice(1).join(":").trim();
  };

  const renderOptionsChips = (options, currentValue, onChange) => {
    if (!Array.isArray(options)) return null;
    const normalized =
      currentValue === "all" || currentValue == null
        ? ""
        : String(currentValue).toLowerCase();

    return (
      <div className="mp-filter-chip-options">
        {options
          .filter((opt) => opt.value !== "all")
          .map((opt) => {
            const value = String(opt.value ?? "").toLowerCase();
            const selected = normalized === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`mp-filter-chip-option ${selected ? "selected" : ""}`}
                onClick={() => onChange(selected ? "all" : opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
      </div>
    );
  };

  return (
    <div className="mp-filter-bar-wrapper" ref={containerRef}>
      <div className="mp-filter-bar-toprow">
        <span className="mp-filter-bar-toprow-label">Filter by criteria:</span>

        <div className="mp-filter-bar">
          <Select
            value={sortBy}
            onChange={(v) => onSortByChange?.(v)}
            className="mp-sort-select"
            dropdownClassName="mp-sort-dropdown"
            showArrow
            options={sortOptions}
          />

          <button
            type="button"
            className={`mp-filter-chip mp-filter-chip--select ${activeKey === "price" ? "mp-filter-chip--open" : ""}`}
            onClick={(e) => toggleKey("price", e)}
            aria-expanded={activeKey === "price"}
            aria-haspopup="dialog"
          >
            <span>Price</span>
            <span className="mp-filter-chip-arrow">▾</span>
          </button>

          <Select
            className="mp-inline-filter-select mp-inline-filter-select--frame"
            value={frameSizeFilter === "all" ? undefined : frameSizeFilter}
            placeholder="Frame size"
            allowClear
            onChange={(value) => onFrameSizeFilterChange(value ?? "all")}
            options={Array.isArray(frameSizeOptions) ? frameSizeOptions : []}
            dropdownClassName="mp-frame-dropdown"
            dropdownMatchSelectWidth={false}
          />

          <Select
            className="mp-inline-filter-select"
            value={
              categoryFilter === "all" || isQuickHeaderCategory
                ? undefined
                : categoryFilter
            }
            placeholder="Category"
            allowClear
            onChange={(value) => onCategoryFilterChange(value ?? "all")}
            options={Array.isArray(categoryOptions) ? categoryOptions : []}
          />

          <Select
            className="mp-inline-filter-select"
            value={brandFilter === "all" ? undefined : brandFilter}
            placeholder="Brand"
            allowClear
            onChange={(value) => onBrandFilterChange(value ?? "all")}
            options={Array.isArray(brandOptions) ? brandOptions : []}
          />

          <Select
            className="mp-inline-filter-select"
            value={modelYearFilter === "all" ? undefined : modelYearFilter}
            placeholder="Year"
            allowClear
            onChange={(value) => onModelYearFilterChange(value ?? "all")}
            options={Array.isArray(modelYearOptions) ? modelYearOptions : []}
          />

          <button
            type="button"
            className={`mp-filter-chip mp-filter-chip--select mp-filter-chip-primary ${isModalOpen ? "mp-filter-chip--open" : ""}`}
            onClick={(e) => toggleKey("panel", e)}
            aria-expanded={isModalOpen}
            aria-haspopup="dialog"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>

          <div className="marketplace-view-toggle">
            <button
              type="button"
              className={`marketplace-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => onViewModeChange?.("grid")}
            >
              <AppstoreOutlined style={{ fontSize: 18 }} />
            </button>
            <button
              type="button"
              className={`marketplace-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => onViewModeChange?.("list")}
            >
              <UnorderedListOutlined style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      {selectedCriteriaInline.length > 0 && (
        <div className="mp-filter-inline-selected">
          <span className="mp-filter-inline-selected-label">
          Filtered by:
          </span>
          <div className="mp-filter-inline-selected-items">
            {selectedCriteriaInline.map((c) => (
              <span key={c.key} className="mp-filter-inline-selected-chip">
                <span className="mp-filter-inline-selected-chip-text">
                  {stripPrefixLabel(c.label)}
                </span>
                <button
                  type="button"
                  className="mp-filter-inline-selected-chip-x"
                  onClick={c.onRemove}
                  aria-label={`Remove ${c.label}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            className="mp-filter-inline-selected-clear"
            onClick={onClearFilters}
          >
            CLEAR ALL
          </button>
        </div>
      )}

      {isModalOpen &&
        createPortal(
          <div
            className="mp-filter-modal-overlay"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="mp-filter-modal">
            <div className="mp-filter-modal-header">
              <div className="mp-filter-modal-title">Filters</div>
              <button
                type="button"
                className="mp-filter-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mp-filter-selected-bar">
              <div className="mp-filter-selected-left">
                <span className="mp-filter-selected-label">Selected criteria:</span>
                <div className="mp-filter-selected-items">
                  {selectedCriteriaModal.length === 0 ? (
                    <span className="mp-filter-selected-empty">None</span>
                  ) : (
                    selectedCriteriaModal.map((c) => (
                      <span key={c.key} className="mp-filter-selected-chip">
                        <span className="mp-filter-selected-chip-text">{c.label}</span>
                        <button
                          type="button"
                          className="mp-filter-selected-chip-x"
                          onClick={c.onRemove}
                          aria-label={`Remove ${c.label}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <button
                type="button"
                className="mp-filter-selected-clear"
                onClick={resetDraft}
              >
                Clear filters
              </button>
            </div>

            <div className="mp-filter-modal-body">
              <div className="mp-filter-modal-grid">
                <div className="mp-filter-modal-section mp-filter-modal-section--price">
                  <div className="mp-filter-modal-section-title">Price</div>
                  <div className="mp-filter-modal-price">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        minPriceStr !== ""
                          ? `${minPriceStr}đ`
                          : formatVnd(draft?.priceRange?.[0] ?? priceRange[0])
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setMinPriceStr(raw);
                        setDraft((prev) => {
                          if (!prev) return prev;
                          const max = prev.priceRange?.[1] ?? priceMax;
                          if (raw === "") return { ...prev, priceRange: [priceMin, max] };
                          const num = parseInt(raw, 10);
                          if (Number.isNaN(num)) return prev;
                          return { ...prev, priceRange: [Math.min(num, max), max] };
                        });
                      }}
                      onFocus={() =>
                        setMinPriceStr(
                          String(draft?.priceRange?.[0] ?? priceRange[0]),
                        )
                      }
                      onBlur={commitDraftMin}
                      placeholder={formatVnd(priceMin)}
                      className="mp-filter-modal-input"
                    />
                    <span className="mp-filter-modal-price-sep">-</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        maxPriceStr !== ""
                          ? `${maxPriceStr}đ`
                          : formatVnd(draft?.priceRange?.[1] ?? priceRange[1])
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setMaxPriceStr(raw);
                        setDraft((prev) => {
                          if (!prev) return prev;
                          const min = prev.priceRange?.[0] ?? priceMin;
                          if (raw === "") return { ...prev, priceRange: [min, priceMax] };
                          const num = parseInt(raw, 10);
                          if (Number.isNaN(num)) return prev;
                          return { ...prev, priceRange: [min, Math.max(num, min)] };
                        });
                      }}
                      onFocus={() =>
                        setMaxPriceStr(
                          String(draft?.priceRange?.[1] ?? priceRange[1]),
                        )
                      }
                      onBlur={commitDraftMax}
                      placeholder={formatVnd(priceMax)}
                      className="mp-filter-modal-input"
                    />
                  </div>

                  <div className="mp-range-wrap">
                    <div className="mp-range-track" />
                    <div
                      className="mp-range-fill"
                      style={{
                        left: `${(((draft?.priceRange?.[0] ?? priceRange[0]) - priceMin) / (priceMax - priceMin)) * 100}%`,
                        width: `${(((draft?.priceRange?.[1] ?? priceRange[1]) - (draft?.priceRange?.[0] ?? priceRange[0])) / (priceMax - priceMin)) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={priceMin}
                      max={priceMax}
                      value={draft?.priceRange?.[0] ?? priceRange[0]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (Number.isNaN(val)) return;
                        setDraft((prev) => {
                          if (!prev) return prev;
                          const max = prev.priceRange?.[1] ?? priceMax;
                          return { ...prev, priceRange: [Math.min(val, max), max] };
                        });
                      }}
                      className="mp-range-input mp-range-input-min"
                    />
                    <input
                      type="range"
                      min={priceMin}
                      max={priceMax}
                      value={draft?.priceRange?.[1] ?? priceRange[1]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (Number.isNaN(val)) return;
                        setDraft((prev) => {
                          if (!prev) return prev;
                          const min = prev.priceRange?.[0] ?? priceMin;
                          return { ...prev, priceRange: [min, Math.max(val, min)] };
                        });
                      }}
                      className="mp-range-input mp-range-input-max"
                    />
                  </div>
                </div>

                <div className="mp-filter-modal-section mp-filter-modal-section--frame">
                  <div className="mp-filter-modal-section-title">Frame size</div>
                  {renderOptionsChips(
                    frameSizeOptions,
                    draft?.frameSizeFilter ?? frameSizeFilter,
                    (next) =>
                      setDraft((prev) =>
                        prev ? { ...prev, frameSizeFilter: next } : prev,
                      ),
                  )}
                </div>

                <div className="mp-filter-modal-section mp-filter-modal-section--category">
                  <div className="mp-filter-modal-section-title">Category</div>
                  {renderOptionsChips(
                    categoryOptions,
                    draft?.categoryFilter ?? categoryFilter,
                    (next) =>
                      setDraft((prev) =>
                        prev ? { ...prev, categoryFilter: next } : prev,
                      ),
                  )}
                </div>

                <div className="mp-filter-modal-section mp-filter-modal-section--brand">
                  <div className="mp-filter-modal-section-title">Brand</div>
                  {renderOptionsChips(
                    brandOptions,
                    draft?.brandFilter ?? brandFilter,
                    (next) =>
                      setDraft((prev) =>
                        prev ? { ...prev, brandFilter: next } : prev,
                      ),
                  )}
                </div>

                <div className="mp-filter-modal-section mp-filter-modal-section--year">
                  <div className="mp-filter-modal-section-title">Model year</div>
                  <Select
                    className="mp-filter-year-select"
                    value={
                      (draft?.modelYearFilter ?? modelYearFilter) === "all"
                        ? undefined
                        : (draft?.modelYearFilter ?? modelYearFilter)
                    }
                    placeholder="Select year"
                    allowClear
                    onChange={(value) =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, modelYearFilter: value == null ? "all" : value }
                          : prev,
                      )
                    }
                    options={Array.isArray(modelYearOptions) ? modelYearOptions : []}
                    dropdownMatchSelectWidth={false}
                    popupClassName="mp-filter-year-dropdown"
                    dropdownStyle={{
                      maxHeight: 220,
                      overflowY: "auto",
                      width: 180,
                      zIndex: 1300,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mp-filter-modal-footer">
              <button
                type="button"
                className="mp-filter-modal-apply"
                onClick={applyDraft}
              >
                View results
              </button>
            </div>
          </div>
        </div>,
          document.body,
        )}

      {activeKey && (
        <div className="mp-filter-dropdown" style={{ left: dropdownLeft }}>
          {activeKey === "price" && (
            <div className="mp-filter-panel">
              <div className="mp-filter-panel-body">
                <div className="mp-filter-modal-price">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      minPriceStr !== ""
                        ? `${minPriceStr}đ`
                        : formatVnd(priceRange[0])
                    }
                    onChange={handleMinChange}
                    onFocus={() => setMinPriceStr(String(priceRange[0]))}
                    onBlur={commitMin}
                    placeholder={formatVnd(priceMin)}
                    className="mp-filter-modal-input"
                  />
                  <span className="mp-filter-modal-price-sep">-</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      maxPriceStr !== ""
                        ? `${maxPriceStr}đ`
                        : formatVnd(priceRange[1])
                    }
                    onChange={handleMaxChange}
                    onFocus={() => setMaxPriceStr(String(priceRange[1]))}
                    onBlur={commitMax}
                    placeholder={formatVnd(priceMax)}
                    className="mp-filter-modal-input"
                  />
                </div>

                <div className="mp-range-wrap" style={{ marginTop: 10 }}>
                  <div className="mp-range-track" />
                  <div
                    className="mp-range-fill"
                    style={{
                      left: `${((priceRange[0] - priceMin) / (priceMax - priceMin)) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / (priceMax - priceMin)) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    value={priceRange[0]}
                    onChange={handleMinRangeChange}
                    className="mp-range-input mp-range-input-min"
                  />
                  <input
                    type="range"
                    min={priceMin}
                    max={priceMax}
                    value={priceRange[1]}
                    onChange={handleMaxRangeChange}
                    className="mp-range-input mp-range-input-max"
                  />
                </div>
              </div>
              <div className="mp-filter-panel-footer">

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

