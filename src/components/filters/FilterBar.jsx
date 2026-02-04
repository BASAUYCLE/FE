import { Select, Button } from "antd";
import { Filter } from "lucide-react";
import "./FilterBar.css";

/**
 * Thanh filter dùng chung (Orders, Postings): nhiều Select + nút "More Filters".
 * @param {{ items: Array<{ key: string, label: string, value: string, onChange: (v: string) => void, options: Array<{ value: string, label: string }>, icon?: React.ReactNode }>, onMoreFilters?: () => void, moreLabel?: string }} props
 */
export default function FilterBar({
  items = [],
  onMoreFilters,
  moreLabel = "More Filters",
}) {
  return (
    <div className="filter-bar">
      {items.map(({ key, label, value, onChange, options, icon }) => (
        <div key={key} className="filter-bar-item">
          <label className="filter-bar-label">{label}</label>
          <Select
            value={value}
            onChange={onChange}
            options={options}
            suffixIcon={icon}
            className="filter-bar-select"
          />
        </div>
      ))}
      {onMoreFilters && (
        <div className="filter-bar-item filter-bar-more">
          <label className="filter-bar-label filter-bar-label-invisible">
            More
          </label>
          <Button
            type="default"
            size="middle"
            icon={<Filter size={14} />}
            onClick={onMoreFilters}
            className="filter-bar-more-btn"
          >
            {moreLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
