import { useState, useCallback } from "react";
import { Box, Typography, Button, Slider } from "@mui/material";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DollarSign, Tags, Layers, Ruler, Calendar } from "lucide-react";

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

  const handleSliderChange = (_, v) => {
    if (!Array.isArray(v)) return;
    onPriceRangeChange?.(() => v);
  };

  return (
    <>
      <Box className="marketplace-filters-header">
        <Typography className="marketplace-filters-title">
          Filters
        </Typography>
        <Button
          variant="text"
          className="marketplace-clear-btn"
          onClick={onClearFilters}
          sx={{
            color: "#00ccad",
            "&:hover": {
              color: "#00ccad",
              backgroundColor: "rgba(0, 204, 173, 0.08)",
            },
          }}
        >
          Clear All
        </Button>
      </Box>

      <Box className="marketplace-filter-section">
        <Input
          prefix={
            <SearchOutlined style={{ color: "#20c997", fontSize: 14 }} />
          }
          placeholder="Bike Name"
          size="large"
          className="marketplace-search-input"
          value={searchName}
          onChange={(e) => onSearchNameChange?.(e.target.value)}
        />
      </Box>

      <Box className="marketplace-filter-section">
        <Typography className="marketplace-filter-label">
          <Tags size={14} className="marketplace-filter-label-icon" />
          Brand
        </Typography>
        <Select
          placeholder="All Brands"
          size="large"
          className="marketplace-bike-type-select"
          value={brandFilter}
          onChange={onBrandFilterChange}
          options={brandOptions}
          allowClear={false}
        />
      </Box>

      <Box className="marketplace-filter-section">
        <Typography className="marketplace-filter-label">
          <Layers size={14} className="marketplace-filter-label-icon" />
          Category
        </Typography>
        <Select
          placeholder="All Categories"
          size="large"
          className="marketplace-bike-type-select"
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          options={categoryOptions}
          allowClear={false}
        />
      </Box>

      <Box className="marketplace-filter-section">
        <Typography className="marketplace-filter-label">
          <Ruler size={14} className="marketplace-filter-label-icon" />
          Frame Size
        </Typography>
        <Select
          placeholder="All Sizes"
          size="large"
          className="marketplace-bike-type-select"
          value={frameSizeFilter}
          onChange={onFrameSizeFilterChange}
          options={frameSizeOptions}
          allowClear={false}
        />
      </Box>

      <Box className="marketplace-filter-section">
        <Typography className="marketplace-filter-label">
          <Calendar size={14} className="marketplace-filter-label-icon" />
          Model Year
        </Typography>
        <Select
          placeholder="All Years"
          size="large"
          className="marketplace-bike-type-select"
          value={modelYearFilter}
          onChange={onModelYearFilterChange}
          options={modelYearOptions}
          allowClear={false}
        />
      </Box>

      <Box className="marketplace-filter-section">
        <Typography className="marketplace-filter-label">
          <DollarSign size={14} className="marketplace-filter-label-icon" />
          Price Range
        </Typography>
        <Box className="marketplace-price-inputs">
          <Box className="marketplace-price-input-wrap">
            <span className="marketplace-price-prefix" aria-hidden="true">
              ₫
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={minPriceFocused ? minPriceStr : String(priceRange[0])}
              onChange={handleMinPriceChange}
              onFocus={onMinFocus}
              onBlur={commitMinPrice}
              placeholder={String(priceMin)}
              className="marketplace-price-input marketplace-price-input-min"
            />
          </Box>
          <Box className="marketplace-price-input-wrap">
            <span className="marketplace-price-prefix" aria-hidden="true">
              ₫
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={maxPriceFocused ? maxPriceStr : String(priceRange[1])}
              onChange={handleMaxPriceChange}
              onFocus={onMaxFocus}
              onBlur={commitMaxPrice}
              placeholder={String(priceMax)}
              className="marketplace-price-input marketplace-price-input-max"
            />
          </Box>
        </Box>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={priceMin}
          max={priceMax}
          sx={{ color: "#00ccad", mt: 1 }}
        />
      </Box>
    </>
  );
}

