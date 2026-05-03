import { useRef, useState } from "react";
import "../../assets/css/modal.css";
import ReactDOM from "react-dom";

interface Props {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  showAddButton?: boolean;
  onAddClick?: () => void;
  size?: "auto" | "small" | "medium" | "large" | "fullscreen";
  className?: string;
  draggable?: boolean; // 👈 NEW
}

const Modal = ({
  isOpen,
  title,
  children,
  className,
  onClose,
  showAddButton,
  onAddClick,
  size = "auto",
  draggable = false, // 👈 NEW
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 }); // 👈 NEW
  const dragStart = useRef({ x: 0, y: 0 });       // 👈 NEW

  if (!isOpen) return null;

  // 👇 ONLY used if draggable=true
  const onMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;

    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };


return ReactDOM.createPortal(
  <div className="modal-overlay">
    <div
      ref={modalRef}
      className={`modal-box ${size} ${className ?? ""}`}
      style={{
        transform: draggable
          ? `translate(${pos.x}px, ${pos.y}px)`
          : undefined,
      }}
    >
      <div
        className={`modal-header ${draggable ? "draggable" : ""}`}
        onMouseDown={onMouseDown}
      >
        <h3>{title}</h3>
        <div className="modal-actions">
          <button className="btn-close" onClick={onClose}>
            ✖
          </button>
        </div>
      </div>

      <div className="modal-body">
        {showAddButton && (
          <button className="btn-add body-add-btn" onClick={onAddClick}>
            <i className="fas fa-plus"></i>
          </button>
        )}
        {children}
      </div>
    </div>
  </div>,
  document.body   // 🔥 THIS IS THE MAGIC
);

};

export default Modal;
