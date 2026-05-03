import Modal from "../components/common/Modal";
import Dashboard from "./dashboard";
import "../assets/css/dashboard.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DashboardModal: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Modal
      isOpen={open}
      title="Dashboard"
      onClose={onClose}
      size="fullscreen"
    >
      <Dashboard />
    </Modal>
  );
};

export default DashboardModal;
