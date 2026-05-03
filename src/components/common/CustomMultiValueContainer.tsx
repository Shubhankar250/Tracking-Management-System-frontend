import React from "react";
import { components } from "react-select";
import type { ValueContainerProps, OptionProps } from "react-select";
const badgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "#e5e7eb",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const countStyle: React.CSSProperties = {
  background: "#d1d5db",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "12px",
};

/* ================= VALUE CONTAINER ================= */
const CustomMultiValueContainer = (props: ValueContainerProps<any>) => {
  const { children, getValue } = props;
  const values = getValue();

  const childArray = React.Children.toArray(children);

  if (!values.length) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }

  const first = values[0];
  const extra = values.length - 1;

  return (
    <components.ValueContainer {...props}>
      <div style={badgeStyle}>
        {first.label}
        {extra > 0 && <span style={countStyle}>+{extra}</span>}
      </div>

      {childArray[1]}
    </components.ValueContainer>
  );
};
/* ================= OPTION WITH TICK ================= */
  export const CustomOption = (props: OptionProps<any>) => {
  const { isSelected, isFocused, label } = props;

  return (
    <components.Option
      {...props}
      innerProps={{
        ...props.innerProps,
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 12px",
          fontSize: "14px",
          backgroundColor: isFocused
            ? "#e0ecff"   // 🔵 hover only
            : "#fff",     // ❌ no bg when selected
          color: isSelected
            ? "#2563eb"   // 🔵 selected text blue
            : "#000",     // default black
          cursor: "pointer",
        },
      }}
    >
      <span>{label}</span>

      {isSelected && (
        <span style={{ color: "#2563eb" }}>
          <i className="bi bi-check"></i>
        </span>
      )}
    </components.Option>
  );
};
/* ================= EXPORT ================= */
export default CustomMultiValueContainer;