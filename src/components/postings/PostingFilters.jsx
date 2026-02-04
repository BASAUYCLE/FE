import { Calendar, Tag } from "lucide-react";
import FilterBar from "../filters/FilterBar";

const DATE_OPTIONS = [
  { value: "30", label: "Last 30 Days" },
  { value: "14", label: "Last 14 Days" },
  { value: "7", label: "Last 7 Days" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "VERIFIED", label: "Verified" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SOLD", label: "Sold" },
  { value: "DRAFT", label: "Draft" },
  { value: "EXPIRED", label: "Expired" },
];

export default function PostingFilters({
  dateRange = "30",
  status = "all",
  onDateRangeChange,
  onStatusChange,
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
          key: "status",
          label: "Status",
          value: status,
          onChange: onStatusChange,
          options: STATUS_OPTIONS,
          icon: <Tag size={14} color="#94a3b8" />,
        },
      ]}
      onMoreFilters={onMoreFilters}
    />
  );
}
