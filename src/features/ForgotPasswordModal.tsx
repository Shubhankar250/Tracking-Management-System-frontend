import React, { useState } from "react";
import "../assets/css/ForgotPassword.css";
import { resetPassword } from "../api/auth.api";
interface Props {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await resetPassword({ username, email });
      setMessage(res.data); // "We have e-mailed your password reset link!"
      setUsername("");
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-backdrop">
      <div className="fp-modal">
        {/* Header */}
        <div className="fp-header">
          <h3>Forgot Password</h3>
          <span className="fp-close" onClick={onClose}>
            &times;
          </span>
        </div>

        {/* Body */}
        <div className="fp-body">
          <p className="fp-subtitle">
            Enter your username and registered email. We’ll send you a secure
            link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="fp-group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder=" "
              />
              <label>Username</label>
            </div>

            <div className="fp-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
              />
              <label>Email Address</label>
            </div>

            {/* Success Message */}
            {message && <div className="fp-success">{message}</div>}

            {/* Error Message */}
            {error && <div className="fp-error">{error}</div>}

            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
