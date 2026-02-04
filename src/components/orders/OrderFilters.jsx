import { Calendar, DollarSign } from "lucide-react";
import FilterBar from "../filters/FilterBar";

const DATE_OPTIONS = [
  { value: "30", label: "Last 30 Days" },
  { value: "14", label: "Last 14 Days" },
  { value: "7", label: "Last 7 Days" },
];

const AMOUNT_OPTIONS = [
  { value: "all", label: "All Prices" },
  { value: "0-1m", label: "Under 1M" },
  { value: "1m-5m", label: "1M - 5M" },
  { value: "5m+", label: "5M+" },
];

export default function OrderFilters({
  dateRange = "30",
  amount = "all",
  onDateRangeChange,
  onAmountChange,
  onMoreFilters,
}) {
  return (
    <FilterBar
      items={[
        {
          key: "date",
          label: "Date Range",
          value: dateRange,
          onChange: onDateRangeChange,
          options: DATE_OPTIONS,
          icon: <Calendar size={14} color="#94a3b8" />,
        },
        {
          key: "amount",
          label: "Amount",
          value: amount,
          onChange: onAmountChange,
          options: AMOUNT_OPTIONS,
          icon: <DollarSign size={14} color="#94a3b8" />,
        },
      ]}
      onMoreFilters={onMoreFilters}
    />
  );
}
