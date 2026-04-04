import { Link, useLocation } from "react-router-dom";
import bikeLogo from "../../assets/bike-logo.png";
import vnpayLogo from "../../assets/vnpay.svg";
import { onSameRouteScrollToTop } from "../../utils/sameRouteScroll";
import "./index.css";

export default function Footer() {
  const { pathname } = useLocation();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        {/* Block 1: Logo + tagline + contact */}
        <div className="app-footer-main">
          <Link
            to="/"
            className="app-footer-logo"
            onClick={(e) => onSameRouteScrollToTop(e, "/", pathname)}
          >
            <img
              src={bikeLogo}
              alt="BASAUYCLE"
              className="app-footer-logo-icon"
            />
            <span className="app-footer-logo-text">BASAUYCLE</span>
          </Link>
          <p className="app-footer-tagline">
          REPUTABLE BICYCLE MARKETPLACE

          </p>
          <div className="app-footer-contact">
            <div><strong>Hotline:</strong> 0387.687.323</div>
            <div><strong>Email:</strong>contact.basaucycle2026@gmail.com
            </div>
          </div>
          <div className="app-footer-intro">
            <Link
              to="/about"
              onClick={(e) => onSameRouteScrollToTop(e, "/about", pathname)}
            >
              Introducing BASAUYCLE
            </Link>
          </div>
        </div>

        {/* Block 2: Hệ thống cửa hàng */}
        <div className="app-footer-col">
          <h3 className="app-footer-title">Store System</h3>
          <div className="app-footer-stores">
            <div className="app-footer-store">
              <strong>BASAUYCLE </strong>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Block 3: Thông tin và chính sách */}
        <div className="app-footer-col">
          <h3 className="app-footer-title">Information & Policies</h3>
          <div className="app-footer-links">
            <Link
              to="/guide-buy"
              onClick={(e) => onSameRouteScrollToTop(e, "/guide-buy", pathname)}
            >
              Shopping Guide
            </Link>
            <Link
              to="/guide-payment"
              onClick={(e) =>
                onSameRouteScrollToTop(e, "/guide-payment", pathname)
              }
            >
              Payment Guide
            </Link>
            <Link
              to="/guide-bike-photos"
              aria-label="Bike photo guide — listing image standards"
              onClick={(e) =>
                onSameRouteScrollToTop(e, "/guide-bike-photos", pathname)
              }
            >
              Bike photo guide
            </Link>
            <Link
              to="/shipping"
              onClick={(e) => onSameRouteScrollToTop(e, "/shipping", pathname)}
            >
              Shipping Methods
            </Link>
            <Link
              to="/payment-policy"
              onClick={(e) =>
                onSameRouteScrollToTop(e, "/payment-policy", pathname)
              }
            >
              Payment Policy
            </Link>
            <Link
              to="/complaint"
              onClick={(e) => onSameRouteScrollToTop(e, "/complaint", pathname)}
            >
              Complaint Handling Policy
            </Link>
            <Link
              to="/return"
              onClick={(e) => onSameRouteScrollToTop(e, "/return", pathname)}
            >
              Return & Refund Policy
            </Link>
            <Link
              to="/privacy"
              onClick={(e) => onSameRouteScrollToTop(e, "/privacy", pathname)}
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Block 4: Phương thức thanh toán (đặt cạnh cột Chính sách) */}
        <div className="app-footer-col app-footer-payment-col">
          <h3 className="app-footer-title app-footer-title--nowrap">
          Payment Methods
          </h3>
          <div className="app-footer-payment-methods app-footer-payment-methods--inline">
            <div className="app-footer-payment-item">
              <img src={vnpayLogo} alt="VNPay" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Copyright & legal */}
      <div className="app-footer-bottom-wrap">
        <div className="app-footer-inner app-footer-bottom-inner">
          <div className="app-footer-bottom-text">
            © 2026 BASAUYCLE. All rights reserved. By accessing and using BASAUYCLE’s content and services, you agree to be bound by our{" "}
            <strong>Terms of Use</strong> and{" "}
            <strong>Privacy Policy.</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
