import React, { useState } from "react";
import Modal from "../../components/common/Modal";
import type { SetupTemplateDTO } from "../../api/setupServices.api";

/* ---------- TYPES ---------- */

interface AddTemplateForm {
  title: string;
  adapted: string;
  message: string;
  subject: string;
  templateName: string;
}

type TemplateType = "SMS" | "GPRS" | "EMAIL";

/* ---------- PROPS ---------- */

interface AddSMSTemplateProps {
  onClose: () => void;
  onSave: (data: SetupTemplateDTO) => void;
  editData?: SetupTemplateDTO;
  templateType: TemplateType;
}

/* ---------- COMPONENT ---------- */

const AddSMSTemplate: React.FC<AddSMSTemplateProps> = ({
  onClose,
  onSave,
  editData,
  templateType,
}) => {
  const [form, setForm] = useState<AddTemplateForm>({
    title: editData?.title || "",
    adapted: editData?.adapted || "",
    message: editData?.message || "",
    subject: editData?.subject || "",
    templateName: editData?.templateName || "",
  });

  const [errors, setErrors] = useState<any>({});

  /* ---------- HANDLERS ---------- */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // Remove error immediately (like driver form)
    if (errors[name]) {
      setErrors((prev: any) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  /* ---------- VALIDATION ---------- */

  const validate = () => {
    let newErrors: any = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is mandatory";
    }

    if (templateType === "EMAIL" && !form.subject.trim()) {
      newErrors.subject = "Subject is mandatory";
    }

    if (!form.message.trim()) {
      newErrors.message =
        templateType === "EMAIL"
          ? "Message is mandatory"
          : "Protocol is mandatory";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ---------- SAVE ---------- */

  const handleSave = () => {
    if (!validate()) return;

    const payload: SetupTemplateDTO = {
      id: editData?.id,
      title: form.title,
      adapted: form.adapted || undefined,
      message: form.message,
      subject: templateType === "EMAIL" ? form.subject : undefined,
      templateName: templateType === "EMAIL" ? form.templateName : undefined,
      category: templateType,
    };

    onSave(payload);
  };

  /* ---------- UI ---------- */

  return (
    <Modal
      isOpen={true}
      title={
        editData
          ? `Update ${templateType} Template`
          : `Add ${templateType} Template`
      }
      onClose={onClose}
      size="medium"
    >
      <div className="st-modal-container">
        <div className="st-modal-body">

          <div className="st-form-group">
            <label>
              Title <span className="st-required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.title}
              </span>
            )}
          </div>

          {templateType === "EMAIL" && (
            <div className="st-form-group">
              <label>Template Name</label>
              <input
                type="text"
                name="templateName"
                value={form.templateName}
                onChange={handleChange}
              />
            </div>
          )}

          {templateType === "EMAIL" && (
            <div className="st-form-group">
              <label>
                Subject <span className="st-required">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
              {errors.subject && (
                <span style={{ color: "red", fontSize: "12px" }}>
                  {errors.subject}
                </span>
              )}
            </div>
          )}

          <div className="st-form-group">
            <label>Adapted</label>
            <input
              type="text"
              name="adapted"
              value={form.adapted}
              onChange={handleChange}
            />
          </div>

          <div className="st-form-group">
            <label>
              {templateType === "EMAIL" ? "Message" : "Protocol"}{" "}
              <span className="st-required">*</span>
            </label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
            />
            {errors.message && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.message}
              </span>
            )}
          </div>

        </div>

        <div className="st-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="st-btn-primary" onClick={handleSave}>
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddSMSTemplate;