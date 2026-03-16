import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Checkbox, App } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import "./login.css";

export default function Login() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values) => {
    try {
      setIsSubmitting(true);

      // Call login API with email and password
      const result = await login({
        email: values.email,
        password: values.password
      });

      if (result.success) {
        message.success("Login successful!");

        // Chuyển theo role: ADMIN → trang quản trị, INSPECTOR → trang kiểm định, còn lại → from hoặc home
        const role = (result.user?.role ?? result.user?.userRole ?? result.user?.user_role ?? "MEMBER").toUpperCase();
        const from = location.state?.from?.pathname;
        if (role === "ADMIN") {
          navigate("/admin-dashboard", { replace: true });
        } else if (role === "INSPECTOR") {
          navigate("/inspector", { replace: true });
        } else {
          navigate(from || "/", { replace: true });
        }
      } else {
        message.error(result.message || "Login failed!");
      }
    } catch (error) {
      // Show more specific error messages
      if (error.status === 401) {
        message.error("Invalid email or password!");
      } else if (error.status === 403) {
        message.error("Account not activated. Please check your email!");
      } else {
        message.error(error.message || "An error occurred. Please try again!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--login auth-page--white">
      <Link to="/" className="auth-page__logo">
        <img src={bikeLogo} alt="BASAUYCLE" className="auth-page__logo-icon" />
        <span className="auth-page__logo-text">BASAUYCLE</span>
      </Link>

      <div className="auth-page__form-wrap">
        <div className="auth-card">
          <h1 className="auth-card__title">Sign In</h1>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="auth-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Invalid email!" }
              ]}
            >
              <Input
                placeholder="EMAIL"
                className="auth-form__input"
                size="large"
                disabled={isSubmitting || loading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
                { min: 8, message: "Password must be at least 8 characters!" }
              ]}
            >
              <Input.Password
                placeholder="PASSWORD"
                className="auth-form__input"
                size="large"
                disabled={isSubmitting || loading}
              />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              className="auth-form__remember"
            >
              <Checkbox disabled={isSubmitting || loading}>Remember me</Checkbox>
            </Form.Item>

            <Form.Item className="auth-form__submit">
              <button
                type="submit"
                className="auth-card__btn-submit"
                aria-label="Sign In"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <span>⏳</span>
                ) : (
                  <ArrowRightOutlined className="auth-card__btn-icon" />
                )}
              </button>
            </Form.Item>
          </Form>

          <div className="auth-card__links">
            <Link to="/forgot-password" className="auth-card__link">
              CAN'T SIGN IN?
            </Link>
            <Link
              to="/register"
              className="auth-card__link auth-card__link--primary"
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>
      </div>

      <footer className="auth-page__footer">
        <Link to="#">Support</Link>
        <span className="auth-page__footer-sep">·</span>
        <Link to="#">Privacy Policy</Link>
        <span className="auth-page__footer-sep">·</span>
        <Link to="#">Terms of Service</Link>
        <span className="auth-page__footer-sep">·</span>
        <Link to="#">Cookie Settings</Link>
        <span className="auth-page__footer-sep">·</span>
        <span className="auth-page__footer-lang">VN</span>
      </footer>
    </div>
  );
}
