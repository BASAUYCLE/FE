import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCcw,
  Eye,
  Check,
  X,
  ClipboardList,
  MessageSquare,
  FileText,
} from "lucide-react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import bikeTarmac from "../../../assets/bike-tarmac-sl7.png";
import canyonGrizl from "../../../assets/CanyonGrizlCFSL.jpg";
import santaCruz from "../../../assets/SantaCruzNomaCC.png";
import "./index.css";

const stats = [
  {
    label: "PENDING REVIEW",
    value: "128",
    note: "+5% from yesterday",
    tone: "green",
    icon: <ClipboardList />,
  },
  {
    label: "APPROVED TODAY",
    value: "45",
    note: "+10% target",
    tone: "green",
    icon: <CheckCircle2 />,
  },
  {
    label: "REJECTION RATE",
    value: "12%",
    note: "-2% improvement",
    tone: "red",
    icon: <AlertTriangle />,
  },
];

const listings = [
  {
    id: "#BK-9021",
    title: "Specialized Tarmac SL7",
    seller: "John Doe",
    category: "ROAD BIKE",
    price: "$4,200",
    submission: "Oct 24, 2023",
    inspection: "Verified",
    image: bikeTarmac,
  },
  {
    id: "#BK-7742",
    title: "Canyon Grizl CF SL",
    seller: "Jane Smith",
    category: "GRAVEL BIKE",
    price: "$3,100",
    submission: "Oct 24, 2023",
    inspection: "Unverified",
    image: canyonGrizl,
  },
  {
    id: "#BK-8831",
    title: "Trek Madone SLR 9",
    seller: "Mike Ross",
    category: "ROAD BIKE",
    price: "$8,500",
    submission: "Oct 23, 2023",
    inspection: "Verified",
    image: santaCruz,
  },
];

const flaggedItems = [
  { title: "Santa Cruz Bronson V4", issue: "Issue: Blurry main photo" },
  { title: "Giant TCR Advanced", issue: "Issue: Missing frame size" },
];

const moderationHistory = [
  {
    name: "Admin Mike",
    action: "approved",
    item: "S-Works Epic",
    time: "2 mins ago",
  },
  {
    name: "Sarah J.",
    action: "rejected",
    item: "Generic BMX",
    time: "15 mins ago",
  },
  {
    name: "Admin Mike",
    action: "approved",
    item: "Bianchi Oltre",
    time: "42 mins ago",
  },
];

const guidelines = [
  "Min. 5 high-res photos required (Side, Drivetrain, Cockpit, Serial, Flaws).",
  "Verify frame serial number against global theft databases.",
  "Price must be within +/- 20% of Bluebook estimated market value.",
  "Description must include: Model Year, Component Group, & Tire Condition.",
];

export default function ListingApproval() {
  const [search, setSearch] = useState("");
  const { pathname } = useLocation();

  return (
    <div className="admin-listings-page">
      <Header
        navLinks={ADMIN_NAV_LINKS}
        activeLink={getAdminActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />

      <div className="admin-listings-shell">
        <div className="admin-listings-stats">
          {stats.map((stat) => (
            <div className="admin-listings-stat" key={stat.label}>
              <div className="stat-header">
                <span className="stat-label">{stat.label}</span>
                <span className={`stat-icon ${stat.tone}`}>{stat.icon}</span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-note ${stat.tone}`}>{stat.note}</div>
            </div>
          ))}
        </div>

        <div className="admin-listings-queue">
          <div className="queue-header">
            <div>
              <h2>Listing Approval Queue</h2>
            </div>
            <div className="queue-actions">
              <button type="button" className="queue-filter">
                <Filter />
                Filter
              </button>
              <button type="button" className="queue-refresh">
                <RefreshCcw />
                Refresh Queue
              </button>
            </div>
          </div>

          <div className="queue-table">
            <div className="queue-row queue-header-row">
              <div>BIKE INFO</div>
              <div>SELLER</div>
              <div>CATEGORY</div>
              <div>PRICE</div>
              <div>SUBMISSION</div>
              <div>INSPECTION</div>
              <div>ACTIONS</div>
            </div>
            {listings.map((row) => (
              <div className="queue-row" key={row.id}>
                <div className="queue-bike">
                  <img src={row.image} alt={row.title} />
                  <div>
                    <div className="queue-bike-title">{row.title}</div>
                    <div className="queue-bike-id">ID: {row.id}</div>
                  </div>
                </div>
                <div>{row.seller}</div>
                <div>
                  <span className="queue-category">{row.category}</span>
                </div>
                <div className="queue-price">{row.price}</div>
                <div>{row.submission}</div>
                <div>
                  <span
                    className={`queue-inspection ${row.inspection.toLowerCase()}`}
                  >
                    <FileCheck2 />
                    {row.inspection}
                  </span>
                </div>
                <div className="queue-actions-cell">
                  <button type="button" className="queue-icon">
                    <Eye />
                  </button>
                  <button type="button" className="queue-approve">
                    Approve
                  </button>
                  <button type="button" className="queue-reject">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="queue-footer">
            <span>Showing 1-3 of 128 results</span>
            <div className="queue-pagination">
              <button type="button">Previous</button>
              <button type="button" className="active">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">Next</button>
            </div>
          </div>
        </div>

        <div className="admin-listings-bottom">
          <div className="bottom-card">
            <div className="bottom-card-title">
              <FileText />
              Flagged for Quality
            </div>
            {flaggedItems.map((item) => (
              <div key={item.title} className="flagged-item">
                <div className="flagged-icon" />
                <div>
                  <div className="flagged-title">{item.title}</div>
                  <div className="flagged-issue">{item.issue}</div>
                </div>
              </div>
            ))}
            <button type="button" className="bottom-link">
              View all flagged items (14)
            </button>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-title">
              <MessageSquare />
              Moderation History
            </div>
            {moderationHistory.map((item) => (
              <div key={`${item.name}-${item.item}`} className="history-item">
                <div className="history-avatar">
                  {item.name.split(" ")[0][0]}
                </div>
                <div>
                  <div className="history-title">
                    <strong>{item.name}</strong> {item.action}{" "}
                    <em>{item.item}</em>
                  </div>
                  <div className="history-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bottom-card">
            <div className="bottom-card-title">
              <Check />
              Admin Guidelines
            </div>
            <ul className="guidelines-list">
              {guidelines.map((rule) => (
                <li key={rule}>
                  <Check />
                  {rule}
                </li>
              ))}
            </ul>
            <button type="button" className="bottom-primary">
              Download Full Handbook (PDF)
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
