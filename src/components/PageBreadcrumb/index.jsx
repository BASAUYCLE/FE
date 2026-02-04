import { Link } from "react-router-dom";
import { Breadcrumb } from "antd";
import { ChevronRight } from "lucide-react";

/**
 * Reusable breadcrumb. Used by Payment, Orders, etc.
 * @param {{ items: Array<{ label: string, path?: string }> }} props
 */
export default function PageBreadcrumb({ items = [] }) {
  return (
    <Breadcrumb
      separator={<ChevronRight size={14} color="#9ca3af" />}
      items={items.map((item, index) => ({
        title:
          item.path && index < items.length - 1 ? (
            <Link to={item.path}>{item.label}</Link>
          ) : (
            <span
              style={{
                color: index === items.length - 1 ? "#0f172a" : undefined,
                fontWeight: index === items.length - 1 ? 600 : undefined,
              }}
            >
              {item.label}
            </span>
          ),
      }))}
    />
  );
}
