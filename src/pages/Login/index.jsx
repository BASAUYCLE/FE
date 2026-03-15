import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { Form, Input, App } from "antd";
=======
import { Form, Input, Checkbox, App } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import "./login.css";

<<<<<<< HEAD
import authVideo from "../../assets/Video 2.mp4";

=======
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
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

<<<<<<< HEAD
      const result = await login({
        email: values.email,
        password: values.password,
=======
      // Call login API with email and password
      const result = await login({
        email: values.email,
        password: values.password
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      });

      if (result.success) {
        message.success("Login successful!");

<<<<<<< HEAD
        const role = (
          result.user?.role ??
          result.user?.userRole ??
          result.user?.user_role ??
          "MEMBER"
        ).toUpperCase();
=======
        // Chuyển theo role: ADMIN → trang quản trị, INSPECTOR → trang kiểm định, còn lại → from hoặc home
        const role = (result.user?.role ?? result.user?.userRole ?? result.user?.user_role ?? "MEMBER").toUpperCase();
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
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
<<<<<<< HEAD
=======
      // Show more specific error messages
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
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
<<<<<<< HEAD
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

            <h1 className="auth-card__title">Welcome Back!</h1>
            <p className="auth-card__subtitle auth-card__subtitle--login">
              Please log in to your account.
            </p>

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
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Invalid email!" },
                ]}
              >
                <Input
                  placeholder="tuhelrana@gmail.com"
                  className="auth-form__input"
                  size="large"
                  disabled={isSubmitting || loading}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter your password!" },
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
                  disabled={isSubmitting || loading}
                />
              </Form.Item>

              <div className="auth-form__row auth-form__row--forgot">
                <Link
                  to="/forgot-password"
                  className="auth-card__link auth-card__link--forgot"
                >
                  Forgot password?
                </Link>
              </div>

              <Form.Item className="auth-form__submit auth-form__submit--row">
                <button
                  type="submit"
                  className="auth-card__btn-outline auth-card__btn-outline--full"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? "Loading…" : "Login"}
                </button>
                <Link to="/register" className="auth-card__btn-outline">
                  Create account
                </Link>
              </Form.Item>
            </Form>

            <p className="auth-card__terms">
              By sign up you agree to our <Link to="#">term</Link> and that you
              have read our <Link to="#">data policy</Link>.
            </p>
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
=======
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
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
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
