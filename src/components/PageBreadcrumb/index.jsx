import { Link, useLocation } from "react-router-dom";
import { Breadcrumb } from "antd";
import { ChevronRight } from "lucide-react";
import { onSameRouteScrollToTop } from "../../utils/sameRouteScroll";

// Breadcrumb (Payment, Orders, Manage Listings...)
export default function PageBreadcrumb({ items = [] }) {
  const { pathname } = useLocation();

  return (
    <Breadcrumb
      separator={<ChevronRight size={14} color="#9ca3af" />}
      items={items.map((item, index) => ({
        key: item.key ?? item.path ?? `breadcrumb-${index}`,
        title:
          item.path && index < items.length - 1 ? (
            <Link
              to={item.path}
              onClick={(e) => onSameRouteScrollToTop(e, item.path, pathname)}
            >
              {item.label}
            </Link>
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
