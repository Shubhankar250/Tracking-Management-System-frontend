import React from "react";

const RangeInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick }, ref) => (
    <input
      ref={ref}
      onClick={onClick}  
      value={value}
      readOnly
      className="date-input"
    />
  )
);

export default RangeInput;
