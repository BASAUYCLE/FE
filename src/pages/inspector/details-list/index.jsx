import { useLocation } from "react-router-dom";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import InspectionQueueTable from "../../../components/inspector/InspectionQueueTable";
import {
  INSPECTOR_NAV_LINKS,
  getInspectorActiveLink,
} from "../../../config/inspectorNav";
import { mockInspections } from "../../../data/inspections";
import "./index.css";

export default function InspectorDetailsList() {
  const { pathname } = useLocation();

  return (
    <div className="inspector-page">
      <Header
        navLinks={INSPECTOR_NAV_LINKS}
        activeLink={getInspectorActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />
      <div className="inspector-dashboard">
        <div className="inspector-content">
          <InspectionQueueTable inspections={mockInspections} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
