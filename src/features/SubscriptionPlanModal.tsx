import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchSubscriptions,
  updateUserSubscriptionPoints,
} from "../slices/subscriptionSlice";
import type { SubscriptionMasterDTO } from "../api/subscriptionService";
import toastr from "toastr";
import "../assets/css/subscriptionPlan.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SubscriptionPlanModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();

  const {
    list: subscriptions,
    loading,
    error,
  } = useAppSelector((state) => state.subscription);

  const [search] = useState("");

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const priceA =
      (a.totalAmount || 0) - ((a.totalAmount || 0) * (a.discount || 0)) / 100;
    const priceB =
      (b.totalAmount || 0) - ((b.totalAmount || 0) * (b.discount || 0)) / 100;
    return priceA - priceB;
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchSubscriptions({ page: 0, size: 10, search }));
    }
  }, [dispatch, open, search]);

  const handleSubscribe = (plan: SubscriptionMasterDTO) => {
    if (!plan.subPoints) return;

    dispatch(updateUserSubscriptionPoints(plan.subPoints))
      .unwrap()
      .then((msg) => {
        (toastr.options as any).zIndex = 99999;
        toastr.success(msg || "Subscription successful!");
      })
      .catch((err) => {
        (toastr.options as any).zIndex = 99999;
        toastr.error(err || "Subscription failed!");
      });
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-container subscription-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="modal-header">
          <h4 className="modal-title fw-bold">
            Choose Your Subscription Plan
          </h4>
        </div>

        <div className="modal-body">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-6">
              Simple & Powerful Pricing
            </h2>
            <p className="text-muted">
              Choose the plan that fits your fleet size
            </p>
          </div>

          {loading && <p>Loading plans...</p>}
          {error && <p className="text-danger">{error}</p>}

          <div className="row-pricing">
            {sortedSubscriptions.map((sub: SubscriptionMasterDTO, i: number) => {
              const price = sub.totalAmount || 0;
              const discount = sub.discount || 0;
              const finalAmount = price - (price * discount) / 100;

              return (
                <div key={sub.id || i}>
                  <div className={`pricing-card ${i === 1 ? "popular" : ""}`}>

                    {i === 1 && (
                      <div className="popular-badge">POPULAR</div>
                    )}

                    <div className="pricing-header">
                      <h4>{sub.subDetails}</h4>
                      <div className="price">
                        <strong>
                          ₹{finalAmount.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <div className="pricing-body">
                      <ul>
                        <li>
                          <i className="fa-solid fa-car"></i>
                          <strong> {sub.subPoints} Objects</strong>
                        </li>

                        {i <= 1 ? (
                          <>
                            <li>
                              <i className="fa-solid fa-check"></i>
                              New Activation / Renewal
                            </li>
                            <li>
                              <i className="fa-solid fa-envelope"></i>
                              Email Support
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              <i className="fa-solid fa-check"></i>
                              New Activation / Renewal
                            </li>
                            <li>
                              <i className="fa-solid fa-headset"></i>
                              24×7 Support
                            </li>
                            <li>
                              <i className="fa-solid fa-phone"></i>
                              Email / Call Support
                            </li>
                          </>
                        )}
                      </ul>

                      <button
                        className="btn btn-primary btn-plan"
                         style={{ display: 'none' }}
                        onClick={() => handleSubscribe(sub)}
                      >
                        Pay
                      </button>
                    </div>

                    <div className="pricing-footer">
                      No hidden charges
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SubscriptionPlanModal;