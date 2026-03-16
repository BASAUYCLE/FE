import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, App } from "antd";
import bikeLogo from "../../assets/bike-logo.png";
import authService from "../../services/authService";
import "../Login/login.css";
import "./index.css";

import authVideo from "../../assets/Video 2.mp4";

export default function ForgotPassword() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setSubmitted(true);
      message.success(
        "If that email is registered, you will receive a password reset link.",
      );
    } catch (err) {
      const msg =
        err?.message ??
        err?.data?.message ??
        err?.data?.msg ??
        "Request failed. Please try again.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--login auth-page--white auth-page--forgot">
      <div className="auth-page__form-wrap">
        <div className="auth-card auth-card--split">
          <div className="auth-card__left">
            <Link to="/" className="auth-page__logo auth-page__logo--inline">
              <img
                src={bikeLogo}
                alt="BASAUYCLE"
                className="auth-page__logo-icon"
              />
              <span className="auth-page__logo-text">BASAUYCLE</span>
            </Link>

            <h1 className="auth-card__title">Forgot Password</h1>
            <p className="auth-card__subtitle">
              {submitted
                ? "If that email is registered, you will receive a password reset link."
                : "Enter your registered email to receive a password reset link."}
            </p>

            {!submitted && (
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
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input
                    placeholder="tuhelrana@gmail.com"
                    className="auth-form__input"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item className="auth-form__submit auth-form__submit--row">
                  <button
                    type="submit"
                    className="auth-card__btn-outline auth-card__btn-outline--full"
                    aria-label="Send reset link"
                    disabled={loading}
                  >
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                </Form.Item>
              </Form>
            )}

            <div className="auth-card__links auth-card__links--forgot">
              <Link
                to="/login"
                className="auth-card__link auth-card__link--primary"
              >
                Back to Sign In
              </Link>
            </div>
          </div>

          <div className="auth-card__right">
            <div className="auth-card__video-wrap">
              <video
                className="auth-card__video"
                src={authVideo}
                muted
                loop
                playsInline
                autoPlay
                controlsList="nodownload nofullscreen noremoteplayback"
              />
            </div>
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
