import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Form, Input, App } from "antd";
import bikeLogo from "../../assets/bike-logo.png";
import authService from "../../services/authService";
import "../Login/login.css";
import "../ForgotPassword/index.css";
import "./index.css";
import authVideo from "../../assets/Video 2.mp4";

export default function ResetPassword() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const onFinish = async (values) => {
    if (!token) {
      message.error("Invalid reset password link. Please request a new one.");
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      setDone(true);
      message.success("Password has been reset successfully!");
    } catch (err) {
      const msg =
        err?.message ??
        err?.data?.message ??
        err?.data?.msg ??
        "Password reset failed. The link may have expired.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--login auth-page--white auth-page--forgot auth-page--reset">
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

            <h1 className="auth-card__title">Reset password</h1>
            <p className="auth-card__subtitle">
              {done
                ? "Your password has been updated successfully."
                : "Enter your new password below."}
            </p>

            {done ? (
              <div className="auth-reset-success">
                <div className="auth-reset-success__icon">✓</div>
                <h2 className="auth-reset-success__title">Password updated</h2>
                <p className="auth-reset-success__subtitle">
                  You can sign in with your new password now.
                </p>
                <button
                  type="button"
                  className="auth-card__btn-outline auth-card__btn-outline--full"
                  onClick={() => navigate("/login")}
                  aria-label="Sign in"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <Form
                form={form}
                name="reset-password"
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
                className="auth-form"
              >
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your new password!",
                    },
                    {
                      min: 8,
                      message: "Password must be at least 8 characters!",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="••••••••"
                    className="auth-form__input"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="••••••••"
                    className="auth-form__input"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item className="auth-form__submit auth-form__submit--row">
                  <button
                    type="submit"
                    className="auth-card__btn-outline auth-card__btn-outline--full"
                    aria-label="Reset password"
                    disabled={loading || !token}
                  >
                    {loading ? "Resetting…" : "Reset password"}
                  </button>
                </Form.Item>

                {!token && (
                  <p className="auth-reset-invalid">
                    Invalid link.{" "}
                    <Link to="/forgot-password">Request new link</Link>
                  </p>
                )}
              </Form>
            )}

            {!done && (
              <div className="auth-card__links auth-card__links--forgot">
                <Link
                  to="/login"
                  className="auth-card__link auth-card__link--primary"
                >
                  Back to Sign in
                </Link>
              </div>
            )}
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
