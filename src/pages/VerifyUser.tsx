import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import  { verifyUserPassword,type VerifyUserRequest } from "../api/auth.api";
import "../assets/css/VerifyUser.css";

const VerifyUser: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<VerifyUserRequest>({
    token: "",
    new_password: "",
    confirm_password: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setForm((prev) => ({ ...prev, token: tokenFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyUserPassword(form);
      setMsg(res.data || "Password updated successfully!");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-card animate-fade-in">
        {msg ? (
          <div className="success-box">
            <h2>{msg}</h2>
            <p>
              You can now{" "}
              <span onClick={() => navigate("/login")} className="link">
                Sign in
              </span>
            </p>
          </div>
        ) : (
          <>
            <div className="header">
              <h1>Set New Password</h1>
              <p>Secure your account with a strong password</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="field-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    name="new_password"
                    value={form.new_password}
                    onChange={handleChange}
                    required
                  />
                  <span onClick={() => setShowNewPassword(!showNewPassword)}>
                    <i
                      className={`fas ${
                        showNewPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                    ></i>
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <i
                      className={`fas ${
                        showConfirmPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                    ></i>
                  </span>
                </div>
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" className="premium-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyUser;
