import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-24 h-24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        
        <h1 className="unauthorized-title">Truy cập bị từ chối</h1>
        
        <p className="unauthorized-message">
          Bạn không có quyền truy cập vào trang này.
          Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
        </p>
        
        <div className="unauthorized-actions">
          <Link to="/" className="btn-primary">
            Về trang chủ
          </Link>
          <Link to="/login" className="btn-secondary">
            Đăng nhập lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
