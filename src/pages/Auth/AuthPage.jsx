import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Checkbox, Upload, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import bikeLogo from "../../assets/bike-logo.png";
import authBgVideo from "../../assets/Video 2.mp4";
import { useAuth } from "../../contexts/AuthContext";
import "../Login/login.css";
import "../Register/index.css";

/**
 * Full-viewport video background + centered card for login / register.
 * Route /login ↔ /register toggles form content.
 */
export default function AuthPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading } = useAuth();

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const isSignup = location.pathname === "/register";

  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [cccdFrontFile, setCccdFrontFile] = useState(null);
  const [cccdBackFile, setCccdBackFile] = useState(null);
  const [cccdFrontFileList, setCccdFrontFileList] = useState([]);
  const [cccdBackFileList, setCccdBackFileList] = useState([]);

  const goLogin = useCallback(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  const goRegister = useCallback(() => {
    navigate("/register", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!isSignup) {
      registerForm.resetFields();
      setCccdFrontFile(null);
      setCccdBackFile(null);
      setCccdFrontFileList([]);
      setCccdBackFileList([]);
    }
  }, [isSignup, registerForm]);

  const onLoginFinish = async (values) => {
    try {
      setLoginSubmitting(true);
      const result = await login({
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        message.success("Login successful!");
        const role = (
          result.user?.role ??
          result.user?.userRole ??
          result.user?.user_role ??
          "MEMBER"
        ).toUpperCase();
        const from = location.state?.from?.pathname;
        if (role === "ADMIN") {
          navigate("/admin-dashboard", { replace: true });
        } else if (role === "INSPECTOR") {
          navigate("/inspector", { replace: true });
        } else {
          navigate(from || "/", { replace: true });
        }
      } else {
        message.error(result.message || "Đăng nhập thất bại.");
      }
    } catch (error) {
      if (error.status === 401) {
        message.error("Sai mật khẩu hoặc email đăng nhập.");
      } else if (error.status === 403) {
        message.error("Account not activated. Please check your email!");
      } else {
        message.error(error.message || "An error occurred. Please try again!");
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  const beforeUpload = (file, type) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }

    if (type === "front") {
      setCccdFrontFile(file);
      setCccdFrontFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
        },
      ]);
    } else {
      setCccdBackFile(file);
      setCccdBackFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
        },
      ]);
    }
    return false;
  };

  const handleRemove = (type) => {
    if (type === "front") {
      setCccdFrontFile(null);
      setCccdFrontFileList([]);
    } else {
      setCccdBackFile(null);
      setCccdBackFileList([]);
    }
  };

  const onRegisterFinish = async (values) => {
    try {
      setRegisterSubmitting(true);
      if (!cccdFrontFile || !cccdBackFile) {
        message.error("Please upload both front and back of your ID card!");
        setRegisterSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("fullName", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("phoneNumber", values.phone || "");
      formData.append("cccdFront", cccdFrontFile);
      formData.append("cccdBack", cccdBackFile);

      const result = await register(formData);

      if (result.success) {
        message.success(
          "Registration successful! Your account is pending verification.",
          3,
        );
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        message.error(result.message || "Registration failed!");
      }
    } catch (error) {
      const errMsg = error?.message || "An error occurred. Please try again!";
      if (
        errMsg.includes("Network Error") ||
        errMsg.includes("ERR_CONNECTION_REFUSED")
      ) {
        message.error(
          "Cannot connect to server. Please check if the backend is running (e.g. http://localhost:8080).",
        );
      } else {
        message.error(errMsg);
      }
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const busy = loading || loginSubmitting || registerSubmitting;

  return (
    <div
      className={`auth-page auth-page--immersive${isSignup ? " auth-immersive--register" : ""}`}
    >
      <div className="auth-immersive__bg" aria-hidden="true">
        <video
          className="auth-immersive__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={authBgVideo} type="video/mp4" />
        </video>
        <div className="auth-immersive__scrim" />
      </div>

      <div className="auth-immersive__layout">
        <div className="auth-immersive__card">
          <Link
            to="/"
            className="auth-page__logo auth-page__logo--inline auth-immersive__logo"
          >
            <img
              src={bikeLogo}
              alt="BASAUYCLE"
              className="auth-page__logo-icon"
            />
            <span className="auth-page__logo-text">BASAUYCLE</span>
          </Link>

          {isSignup ? (
            <>
              <h1 className="auth-immersive__title">Create account</h1>
              <p className="auth-card__subtitle auth-immersive__lead">
                Join BASAUYCLE to list or shop bicycles.
              </p>

              <Form
                form={registerForm}
                name="register"
                onFinish={onRegisterFinish}
                layout="vertical"
                requiredMark={false}
                className="auth-form auth-form--immersive"
              >
                <Form.Item
                  name="username"
                  label="Full name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your name!",
                    },
                    {
                      min: 3,
                      message: "Name must have at least 3 characters!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Your name"
                    className="auth-form__input"
                    size="large"
                    disabled={busy}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your email!",
                    },
                    { type: "email", message: "Invalid email!" },
                  ]}
                >
                  <Input
                    placeholder="you@example.com"
                    className="auth-form__input"
                    size="large"
                    disabled={busy}
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your phone number!",
                    },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Invalid phone number!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Phone number"
                    className="auth-form__input"
                    size="large"
                    disabled={busy}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your password!",
                    },
                    {
                      min: 6,
                      message: "Password must have at least 6 characters!",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="Password"
                    className="auth-form__input"
                    size="large"
                    disabled={busy}
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm password"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match!"),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Confirm password"
                    className="auth-form__input"
                    size="large"
                    disabled={busy}
                    autoComplete="new-password"
                  />
                </Form.Item>

                <div className="cccd-upload-section">
                  <h3 className="cccd-upload-title">
                    National ID Card Verification
                  </h3>
                  <p className="cccd-upload-subtitle">
                    Upload front and back of your National ID Card.
                  </p>

                  <Form.Item label="Front side" required>
                    <Upload
                      name="cccdFront"
                      listType="picture-card"
                      fileList={cccdFrontFileList}
                      maxCount={1}
                      beforeUpload={(file) => beforeUpload(file, "front")}
                      onRemove={() => handleRemove("front")}
                      disabled={busy}
                      accept="image/*"
                      showUploadList={{
                        showPreviewIcon: true,
                        showRemoveIcon: true,
                      }}
                    >
                      {cccdFrontFileList.length === 0 && (
                        <div className="upload-content">
                          <UploadOutlined />
                          <div className="upload-text">Front side</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item label="Back side" required>
                    <Upload
                      name="cccdBack"
                      listType="picture-card"
                      fileList={cccdBackFileList}
                      maxCount={1}
                      beforeUpload={(file) => beforeUpload(file, "back")}
                      onRemove={() => handleRemove("back")}
                      disabled={busy}
                      accept="image/*"
                      showUploadList={{
                        showPreviewIcon: true,
                        showRemoveIcon: true,
                      }}
                    >
                      {cccdBackFileList.length === 0 && (
                        <div className="upload-content">
                          <UploadOutlined />
                          <div className="upload-text">Back side</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </div>

                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("You must agree to the terms!"),
                            ),
                    },
                  ]}
                  className="auth-form__remember"
                >
                  <Checkbox disabled={busy}>
                    I agree to the{" "}
                    <Link to="#" className="auth-card__link-inline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="#" className="auth-card__link-inline">
                      Privacy Policy
                    </Link>
                  </Checkbox>
                </Form.Item>

                <Form.Item className="auth-form__submit">
                  <button
                    type="submit"
                    className="auth-immersive__btn-primary"
                    disabled={busy}
                  >
                    {registerSubmitting || loading
                      ? "Loading…"
                      : "Create account"}
                  </button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <>
              <h1 className="auth-immersive__title">Sign in</h1>
              <p className="auth-card__subtitle auth-immersive__lead">
                Use your email and password to continue.
              </p>

              <Form
                form={loginForm}
                name="login"
                onFinish={onLoginFinish}
                layout="vertical"
                requiredMark={false}
                className="auth-form auth-form--immersive"
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
                    placeholder="you@example.com"
                    className="auth-form__input"
                    size="large"
                    disabled={busy}
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your password!",
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
                    disabled={busy}
                    autoComplete="current-password"
                  />
                </Form.Item>

                <div className="auth-form__row auth-form__row--forgot">
                  <Link
                    to="/forgot-password"
                    className="auth-card__link auth-card__link--forgot auth-immersive__forgot"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Form.Item className="auth-form__submit">
                  <button
                    type="submit"
                    className="auth-immersive__btn-primary"
                    disabled={busy}
                  >
                    {loginSubmitting || loading ? "Loading…" : "Sign in"}
                  </button>
                </Form.Item>
              </Form>

              <p className="auth-card__terms auth-immersive__terms">
                By signing in you agree to our <Link to="#">Terms</Link> and{" "}
                <Link to="#">Privacy</Link>.
              </p>
            </>
          )}

          <div className="auth-immersive__switch">
            {isSignup ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-immersive__switch-btn"
                  onClick={goLogin}
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New to BASAUYCLE?{" "}
                <button
                  type="button"
                  className="auth-immersive__switch-btn"
                  onClick={goRegister}
                >
                  Create account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <footer className="auth-page__footer auth-page__footer--immersive">
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
