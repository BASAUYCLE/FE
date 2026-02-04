import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Checkbox, Upload, App } from "antd";
import { ArrowRightOutlined, UploadOutlined } from "@ant-design/icons";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import "../Login/login.css";
import "./index.css";

export default function Register() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cccdFrontFile, setCccdFrontFile] = useState(null);
  const [cccdBackFile, setCccdBackFile] = useState(null);
  const [cccdFrontFileList, setCccdFrontFileList] = useState([]);
  const [cccdBackFileList, setCccdBackFileList] = useState([]);

  const onFinish = async (values) => {
    try {
      setIsSubmitting(true);

      // Validate files
      if (!cccdFrontFile || !cccdBackFile) {
        message.error("Please upload both front and back of your ID card!");
        setIsSubmitting(false);
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("fullName", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("phoneNumber", values.phone || "");
      formData.append("cccdFront", cccdFrontFile);
      formData.append("cccdBack", cccdBackFile);

      // Call register API
      const result = await register(formData);

      if (result.success) {
        message.success("Registration successful! Your account is pending verification.");

        // Redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        message.error(result.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Register error:", error);

      // Handle connection errors
      if (error.message && error.message.includes('Network Error')) {
        message.error('Cannot connect to server. Please check if the backend is running!');
      } else if (error.message && error.message.includes('ERR_CONNECTION_REFUSED')) {
        message.error('Backend server is not running! Please start backend at http://localhost:8080');
      } else {
        message.error(error.message || "An error occurred. Please try again!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const beforeUpload = (file, type) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Only image files are allowed!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    // Set file to state
    if (type === 'front') {
      setCccdFrontFile(file);
      setCccdFrontFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]);
    } else {
      setCccdBackFile(file);
      setCccdBackFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]);
    }

    // Prevent auto upload
    return false;
  };

  const handleRemove = (type) => {
    if (type === 'front') {
      setCccdFrontFile(null);
      setCccdFrontFileList([]);
    } else {
      setCccdBackFile(null);
      setCccdBackFileList([]);
    }
  };

  return (
    <div className="auth-page auth-page--register auth-page--white">
      <Link to="/" className="auth-page__logo">
        <img src={bikeLogo} alt="BASAUYCLE" className="auth-page__logo-icon" />
        <span className="auth-page__logo-text">BASAUYCLE</span>
      </Link>

      <div className="auth-page__form-wrap">
        <div className="auth-card auth-card--register">
          <h1 className="auth-card__title">Register</h1>
          <p className="auth-card__subtitle">Create an account to buy and sell bicycles</p>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="auth-form"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter your name!" },
                { min: 3, message: "Name must have at least 3 characters!" }
              ]}
            >
              <Input
                placeholder="USERNAME"
                className="auth-form__input"
                size="large"
                disabled={isSubmitting || loading}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Invalid email!" },
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
              name="phone"
              rules={[
                { required: true, message: "Please enter your phone number!" },
                { pattern: /^[0-9]{10,11}$/, message: "Invalid phone number!" }
              ]}
            >
              <Input
                placeholder="PHONE NUMBER"
                className="auth-form__input"
                size="large"
                disabled={isSubmitting || loading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
                { min: 6, message: "Password must have at least 6 characters!" },
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
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="CONFIRM PASSWORD"
                className="auth-form__input"
                size="large"
                disabled={isSubmitting || loading}
              />
            </Form.Item>

            {/* National ID Card Verification Upload Section */}
            <div className="cccd-upload-section">
              <h3 className="cccd-upload-title">National ID Card Verification</h3>
              <p className="cccd-upload-subtitle">Please upload images of your National ID Card to verify your account</p>

              <Form.Item
                label="Front side"
                required
              >
                <Upload
                  name="cccdFront"
                  listType="picture-card"
                  fileList={cccdFrontFileList}
                  maxCount={1}
                  beforeUpload={(file) => beforeUpload(file, 'front')}
                  onRemove={() => handleRemove('front')}
                  disabled={isSubmitting || loading}
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

              <Form.Item
                label="Back side"
                required
              >
                <Upload
                  name="cccdBack"
                  listType="picture-card"
                  fileList={cccdBackFileList}
                  maxCount={1}
                  beforeUpload={(file) => beforeUpload(file, 'back')}
                  onRemove={() => handleRemove('back')}
                  disabled={isSubmitting || loading}
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
                      : Promise.reject(new Error("You must agree to the terms!")),
                },
              ]}
              className="auth-form__remember"
            >
              <Checkbox disabled={isSubmitting || loading}>
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
                className="auth-card__btn-submit"
                aria-label="Register"
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
            <span className="auth-card__links-text">
              Already have an account?{" "}
              <Link
                to="/login"
                className="auth-card__link auth-card__link--primary"
              >
                Sign In
              </Link>
            </span>
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
