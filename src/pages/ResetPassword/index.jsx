import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Form, Input, message } from "antd";
import { ArrowRightOutlined, LockOutlined } from "@ant-design/icons";
import bikeLogo from "../../assets/bike-logo.png";
import authService from "../../services/authService";
import "../Login/login.css";
import "../ForgotPassword/index.css";

export default function ResetPassword() {
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
            await authService.resetPassword({ token, newPassword: values.newPassword });
            setDone(true);
            message.success("Password has been reset successfully!");
        } catch (err) {
            const msg =
                err?.message ??
                err?.data?.message ??
                err?.data?.msg ??
                err?.message ??
                "Password reset failed. The link may have expired.";
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page--login auth-page--white auth-page--forgot">
            <Link to="/" className="auth-page__logo">
                <img src={bikeLogo} alt="BASAUYCLE" className="auth-page__logo-icon" />
                <span className="auth-page__logo-text">BASAUYCLE</span>
            </Link>

            <div className="auth-page__form-wrap">
                <div className="auth-card">
                    <h1 className="auth-card__title">Reset password</h1>
                    <p className="auth-card__subtitle">
                        {done
                            ? "Your password has been updated successfully."
                            : "Enter your new password below"}
                    </p>

                    {done ? (
                        <div className="auth-reset-success">
                            <div className="auth-reset-success__icon">
                                <LockOutlined />
                            </div>
                            <h2 className="auth-reset-success__title">
                                Password updated
                            </h2>
                            <p className="auth-reset-success__subtitle">
                                You can sign in with your new password now.
                            </p>
                            <button
                                className="auth-card__btn-submit auth-card__btn-submit--primary"
                                onClick={() => navigate("/login")}
                                aria-label="Sign in"
                            >
                                <ArrowRightOutlined className="auth-card__btn-icon" />
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
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                                    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                                ]}
                            >
                                <Input.Password
                                    placeholder="NEW PASSWORD"
                                    className="auth-form__input"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                rules={[
                                    { required: true, message: "Please confirm your password!" },
                                ]}
                            >
                                <Input.Password
                                    placeholder="CONFIRM PASSWORD"
                                    className="auth-form__input"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item className="auth-form__submit">
                                <button
                                    type="submit"
                                    className="auth-card__btn-submit"
                                    aria-label="Reset password"
                                    disabled={loading || !token}
                                >
                                    <ArrowRightOutlined className="auth-card__btn-icon" />
                                </button>
                            </Form.Item>

                            {!token && (
                                <p style={{ color: "#dc2626", textAlign: "center", fontSize: 13 }}>
                                    ⚠️ Invalid link.{" "}
                                    <Link to="/forgot-password">Request new link</Link>
                                </p>
                            )}
                        </Form>
                    )}

                    <div className="auth-card__links">
                        <Link to="/login" className="auth-card__link auth-card__link--primary">
                            Back to Sign in
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
            </footer>
        </div>
    );
}
