import { Link } from "react-router-dom";
import { Form, Input } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import bikeLogo from "../../assets/bike-logo.png";
import "../Login/login.css";
import "./index.css";

export default function ForgotPassword() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Forgot password:", values);
    // TODO: call API to send password reset link
  };

  return (
    <div className="auth-page auth-page--login auth-page--white auth-page--forgot">
      <Link to="/" className="auth-page__logo">
        <img src={bikeLogo} alt="BASAUYCLE" className="auth-page__logo-icon" />
        <span className="auth-page__logo-text">BASAUYCLE</span>
      </Link>

      <div className="auth-page__form-wrap">
        <div className="auth-card">
          <h1 className="auth-card__title">Forgot Password</h1>
          <p className="auth-card__subtitle">
            Enter your registered email to receive a password reset link
          </p>

          <Form
            form={form}
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="auth-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                placeholder="EMAIL"
                className="auth-form__input"
                size="large"
              />
            </Form.Item>

            <Form.Item className="auth-form__submit">
              <button
                type="submit"
                className="auth-card__btn-submit"
                aria-label="Send reset link"
              >
                <ArrowRightOutlined className="auth-card__btn-icon" />
              </button>
            </Form.Item>
          </Form>

          <div className="auth-card__links">
            <Link
              to="/login"
              className="auth-card__link auth-card__link--primary"
            >
              Back to Sign In
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
