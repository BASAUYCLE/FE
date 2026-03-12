import { useState, useCallback } from "react";
import { Box, Typography, Button, Checkbox } from "@mui/material";

/**
 * Sidebar filter dùng chung cho Marketplace & Wishlist.
 * UI giống hệt filter của Marketplace.
 */
export default function BikeFilterSidebar({
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
  priceMin = 0,
  priceMax = 50000000,
}) {
  const [minPriceStr, setMinPriceStr] = useState("");
  const [maxPriceStr, setMaxPriceStr] = useState("");
  const [minPriceFocused, setMinPriceFocused] = useState(false);
  const [maxPriceFocused, setMaxPriceFocused] = useState(false);

  const [openSections, setOpenSections] = useState({
    brand: false,
    category: false,
    frame: false,
    year: false,
    price: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMinPriceChange = useCallback(
    (e) => {
      const raw = e.target.value.replace(/\D/g, "");
      setMinPriceStr(raw);
      if (raw === "") {
        onPriceRangeChange?.(([_, max]) => [priceMin, max]);
        return;
      }
      const num = parseInt(raw, 10);
      if (!Number.isNaN(num)) {
        onPriceRangeChange?.(([_, max]) => [
          Math.min(num, max),
          max,
        ]);
      }
    },
    [onPriceRangeChange, priceMin],
  );

  const handleMaxPriceChange = useCallback(
    (e) => {
      const raw = e.target.value.replace(/\D/g, "");
      setMaxPriceStr(raw);
      if (raw === "") {
        onPriceRangeChange?.(([min]) => [min, priceMax]);
        return;
      }
      const num = parseInt(raw, 10);
      if (!Number.isNaN(num)) {
        onPriceRangeChange?.(([min]) => [
          min,
          Math.max(num, min),
        ]);
      }
    },
    [onPriceRangeChange, priceMax],
  );

  const onMinFocus = () => {
    setMinPriceFocused(true);
    setMinPriceStr(String(priceRange[0]));
  };

  const onMaxFocus = () => {
    setMaxPriceFocused(true);
    setMaxPriceStr(String(priceRange[1]));
  };

  const commitMinPrice = () => {
    setMinPriceFocused(false);
    const num = minPriceStr === "" ? priceMin : parseInt(minPriceStr, 10);
    const clamped = Number.isNaN(num)
      ? priceMin
      : Math.max(priceMin, Math.min(num, priceMax, priceRange[1]));
    onPriceRangeChange?.(([_, max]) => [clamped, max]);
    setMinPriceStr("");
  };

  const commitMaxPrice = () => {
    setMaxPriceFocused(false);
    const num = maxPriceStr === "" ? priceMax : parseInt(maxPriceStr, 10);
    const clamped = Number.isNaN(num)
      ? priceMax
      : Math.min(priceMax, Math.max(num, priceMin, priceRange[0]));
    onPriceRangeChange?.(([min]) => [min, clamped]);
    setMaxPriceStr("");
  };

  const renderSingleSelectCheckboxList = (
    options,
    currentValue,
    onChange,
  ) => {
    if (!Array.isArray(options)) return null;
    const normalizedCurrent =
      currentValue === "all" || currentValue == null
        ? ""
        : String(currentValue).toLowerCase();

    return options
      .filter((opt) => opt.value !== "all")
      .map((opt) => {
        const value = String(opt.value ?? "").toLowerCase();
        const checked = normalizedCurrent === value;
        return (
          <Box
            key={opt.value}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2.5,
              py: 0,
              mb: 0.1,
              gap: 1,
              borderRadius: 0.75,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={() => {
              const next = checked ? "all" : opt.value;
              onChange?.(next);
            }}
          >
            <Checkbox
              size="small"
              checked={checked}
              onChange={() => {
                const next = checked ? "all" : opt.value;
                onChange?.(next);
              }}
              sx={{ mr: 1 }}
            />
            <Typography
              sx={{ fontSize: 13, color: "#4b5563", fontWeight: 600 }}
            >
              {opt.label}
            </Typography>
          </Box>
        );
      });
  };

  const renderModelYearCheckboxList = (
    options,
    currentValue,
    onChange,
  ) => {
    if (!Array.isArray(options)) return null;
    const normalizedCurrent =
      currentValue === "all" || currentValue == null
        ? ""
        : String(currentValue).toLowerCase();

    return options
      .filter((opt) => opt.value !== "all")
      .map((opt) => {
        const value = String(opt.value ?? "").toLowerCase();
        const checked = normalizedCurrent === value;
        const rawCount =
          opt.count ??
          opt.total ??
          opt.quantity ??
          opt.items ??
          opt.metaCount ??
          null;
        const count =
          rawCount != null && !Number.isNaN(Number(rawCount))
            ? Number(rawCount)
            : null;

        return (
          <Box
            key={opt.value}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 0,
              mb: 0.15,
              gap: 0.75,
              cursor: "pointer",
              borderRadius: 0.75,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={() => {
              const next = checked ? "all" : opt.value;
              onChange?.(next);
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Checkbox
                size="small"
                checked={checked}
                onChange={() => {
                  const next = checked ? "all" : opt.value;
                  onChange?.(next);
                }}
              />
              <Typography
                sx={{ fontSize: 13, color: "#4b5563", fontWeight: 600 }}
              >
                {opt.label}
              </Typography>
            </Box>
            {count != null && (
              <Box
                sx={{
                  minWidth: 30,
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  backgroundColor: "#f0f0f0",
                  fontSize: 11,
                  color: "#4b5563",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                {count}
              </Box>
            )}
          </Box>
        );
      });
  };

  return (
    <>
      {/* Brand */}
      <Box
        className="marketplace-filter-section"
        sx={{ borderBottom: "1px solid #eeeeee" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            py: 1.5,
            px: 2,
            gap: 1.25,
            fontFamily:
              '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
          onClick={() => toggleSection("brand")}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 600,
              color: "#4b5563",
              flexShrink: 0,
            }}
          >
            {openSections.brand ? "−" : "+"}
          </Box>
          <Typography
            className="marketplace-filter-label"
            sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}
          >
            Brand
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: openSections.brand ? 600 : 0,
            overflow: "hidden",
            transition:
              "max-height 0.2s ease, opacity 0.2s ease, transform 0.2s ease",
            opacity: openSections.brand ? 1 : 0,
            transform: openSections.brand ? "translateY(0)" : "translateY(-4px)",
          }}
        >
          <Box sx={{ pt: openSections.brand ? 0.5 : 0, pb: openSections.brand ? 1 : 0 }}>
            {renderSingleSelectCheckboxList(
              brandOptions,
              brandFilter,
              onBrandFilterChange,
            )}
          </Box>
        </Box>
      </Box>

      {/* Category */}
      <Box
        className="marketplace-filter-section"
        sx={{ borderBottom: "1px solid #eeeeee" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            py: 1.5,
            px: 2,
            gap: 1.25,
            fontFamily:
              '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
          onClick={() => toggleSection("category")}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 600,
              color: "#4b5563",
              flexShrink: 0,
            }}
          >
            {openSections.category ? "−" : "+"}
          </Box>
          <Typography
            className="marketplace-filter-label"
            sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}
          >
            Category
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: openSections.category ? 600 : 0,
            overflow: "hidden",
            transition:
              "max-height 0.2s ease, opacity 0.2s ease, transform 0.2s ease",
            opacity: openSections.category ? 1 : 0,
            transform: openSections.category
              ? "translateY(0)"
              : "translateY(-4px)",
          }}
        >
          <Box sx={{ pt: openSections.category ? 0.5 : 0, pb: openSections.category ? 1 : 0 }}>
            {renderSingleSelectCheckboxList(
              categoryOptions,
              categoryFilter,
              onCategoryFilterChange,
            )}
          </Box>
        </Box>
      </Box>

      {/* Frame Size */}
      <Box
        className="marketplace-filter-section"
        sx={{ borderBottom: "1px solid #eeeeee" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            py: 1.5,
            px: 2,
            gap: 1.25,
            fontFamily:
              '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
          onClick={() => toggleSection("frame")}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 600,
              color: "#4b5563",
              flexShrink: 0,
            }}
          >
            {openSections.frame ? "−" : "+"}
          </Box>
          <Typography
            className="marketplace-filter-label"
            sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}
          >
            Frame Size
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: openSections.frame ? 600 : 0,
            overflow: "hidden",
            transition:
              "max-height 0.2s ease, opacity 0.2s ease, transform 0.2s ease",
            opacity: openSections.frame ? 1 : 0,
            transform: openSections.frame ? "translateY(0)" : "translateY(-4px)",
          }}
        >
          <Box sx={{ pt: openSections.frame ? 0.5 : 0, pb: openSections.frame ? 1 : 0 }}>
            {renderSingleSelectCheckboxList(
              frameSizeOptions,
              frameSizeFilter,
              onFrameSizeFilterChange,
            )}
          </Box>
        </Box>
      </Box>

      {/* Model Year */}
      <Box
        className="marketplace-filter-section"
        sx={{ borderBottom: "1px solid #eeeeee" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            py: 1.5,
            px: 2,
            gap: 1.25,
            fontFamily:
              '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
          onClick={() => toggleSection("year")}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 600,
              color: "#4b5563",
              flexShrink: 0,
            }}
          >
            {openSections.year ? "−" : "+"}
          </Box>
          <Typography
            className="marketplace-filter-label"
            sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}
          >
            Model Year
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: openSections.year ? 600 : 0,
            overflow: "hidden",
            transition: "max-height 0.2s ease, opacity 0.2s ease, transform 0.2s ease",
            opacity: openSections.year ? 1 : 0,
            transform: openSections.year ? "translateY(0)" : "translateY(-4px)",
          }}
        >
          <Box sx={{ pt: openSections.year ? 0.5 : 0, pb: openSections.year ? 1 : 0 }}>
            {renderModelYearCheckboxList(
              modelYearOptions,
              modelYearFilter,
              onModelYearFilterChange,
            )}
          </Box>
        </Box>
      </Box>

      {/* Price Range */}
      <Box
        className="marketplace-filter-section"
        sx={{ borderBottom: "1px solid #eeeeee" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            py: 1.5,
            px: 2,
            gap: 1.25,
            fontFamily:
              '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
          onClick={() => toggleSection("price")}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 600,
              color: "#4b5563",
              flexShrink: 0,
            }}
          >
            {openSections.price ? "−" : "+"}
          </Box>
          <Typography
            className="marketplace-filter-label"
            sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}
          >
            Price Range
          </Typography>
        </Box>
        <Box
          sx={{
            maxHeight: openSections.price ? 200 : 0,
            overflow: "hidden",
            transition: "max-height 0.2s ease, opacity 0.2s ease, transform 0.2s ease",
            opacity: openSections.price ? 1 : 0,
            transform: openSections.price ? "translateY(0)" : "translateY(-4px)",
          }}
        >
          <Box
            sx={{
              pt: openSections.price ? 0.75 : 0,
              pb: openSections.price ? 1 : 0,
              px: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 1.5,
                  border: "1px solid #e5e7eb",
                  px: 1.25,
                  py: 0.5,
                  backgroundColor: "#ffffff",
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={minPriceFocused ? minPriceStr : String(priceRange[0])}
                  onChange={handleMinPriceChange}
                  onFocus={onMinFocus}
                  onBlur={commitMinPrice}
                  placeholder={String(priceMin)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: 13,
                    color: "#0ea5e9",
                    textAlign: "center",
                    background: "transparent",
                  }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 1.5,
                  border: "1px solid #e5e7eb",
                  px: 1.25,
                  py: 0.5,
                  backgroundColor: "#ffffff",
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxPriceFocused ? maxPriceStr : String(priceRange[1])}
                  onChange={handleMaxPriceChange}
                  onFocus={onMaxFocus}
                  onBlur={commitMaxPrice}
                  placeholder={String(priceMax)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: 13,
                    color: "#0ea5e9",
                    textAlign: "center",
                    background: "transparent",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

