import { Link } from "react-router-dom";
import bikeLogo from "../../assets/bike-logo.png";
import vnpayLogo from "../../assets/vnpay.svg";
import "./index.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        {/* Block 1: Logo + tagline + contact */}
        <div className="app-footer-main">
          <Link to="/" className="app-footer-logo">
            <img
              src={bikeLogo}
              alt="BASAUYCLE"
              className="app-footer-logo-icon"
            />
            <span className="app-footer-logo-text">BASAUYCLE</span>
          </Link>
          <p className="app-footer-tagline">
          Professional Bicycle Marketplace
          </p>
          <div className="app-footer-contact">
            <div><strong>Hotline:</strong> </div>
            <div><strong>Email:</strong> </div>
            <div><strong>Website:</strong></div>
          </div>
          <div className="app-footer-intro">
            <Link to="/about">Introducing BASAUYCLE</Link>
          </div>
        </div>

        {/* Block 2: Hệ thống cửa hàng */}
        <div className="app-footer-col">
          <h3 className="app-footer-title">Store System</h3>
          <div className="app-footer-stores">
            <div className="app-footer-store">
              <strong>BASAUYCLE 1</strong>
              <span></span>
              <span></span>
            </div>
            <div className="app-footer-store">
              <strong>BASAUYCLE 2</strong>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Block 3: Thông tin và chính sách */}
        <div className="app-footer-col">
          <h3 className="app-footer-title">Information & Policies</h3>
          <div className="app-footer-links">
            <Link to="/guide-buy">Shopping Guide</Link>
            <Link to="/guide-payment">Payment Guide</Link>
            <Link to="/shipping">Shipping Methods</Link>
            <Link to="/payment-policy">Payment Policy</Link>
            <Link to="/complaint">Complaint Handling Policy</Link>
            <Link to="/return">Return & Refund Policy</Link>
            <Link to="/privacy">Privacy Policy</Link>
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
