import Modal from "../components/common/Modal";
import LogContent from "./LogContent ";
import "../assets/css/log.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LogModal: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Modal
      isOpen={open}
      title="Activity Logs"
      onClose={onClose}
      size="fullscreen"
    >
      <LogContent />
    </Modal>
  );
};

export default LogModal;
