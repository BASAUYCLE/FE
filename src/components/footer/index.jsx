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
            Hệ thống Cửa Hàng Bán Lẻ Xe Đạp Chuyên Nghiệp Hàng Đầu Việt Nam
          </p>
          <div className="app-footer-contact">
            <div><strong>Hotline:</strong> </div>
            <div><strong>Email:</strong> </div>
            <div><strong>Website:</strong></div>
          </div>
          <div className="app-footer-intro">
            <Link to="/about">Giới thiệu về BASAUYCLE</Link>
          </div>
        </div>

        {/* Block 2: Hệ thống cửa hàng */}
        <div className="app-footer-col">
          <h3 className="app-footer-title">Hệ Thống Cửa Hàng</h3>
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
          <h3 className="app-footer-title">Thông tin và chính sách</h3>
          <div className="app-footer-links">
            <Link to="/guide-buy">Hướng dẫn mua hàng</Link>
            <Link to="/guide-payment">Hướng dẫn thanh toán</Link>
            <Link to="/shipping">Phương thức vận chuyển</Link>
            <Link to="/payment-policy">Chính sách thanh toán</Link>
            <Link to="/complaint">Chính sách xử lý khiếu nại</Link>
            <Link to="/return">Chính sách đổi trả và hoàn tiền</Link>
            <Link to="/privacy">Chính sách bảo mật thông tin</Link>
          </div>
        </div>

        {/* Block 4: Phương thức thanh toán (đặt cạnh cột Chính sách) */}
        <div className="app-footer-col app-footer-payment-col">
          <h3 className="app-footer-title app-footer-title--nowrap">
            Phương thức thanh toán
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
            © 2026 BASAUYCLE. All rights reserved. Sử dụng nội dung và dịch vụ tại BASAUYCLE có nghĩa là bạn đồng ý với{" "}
            <strong>Thỏa thuận sử dụng</strong> và{" "}
            <strong>Chính sách bảo mật</strong> của chúng tôi.
          </div>
        </div>
      </div>
    </footer>
  );
}
