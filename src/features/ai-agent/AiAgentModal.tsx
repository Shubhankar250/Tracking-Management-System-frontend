import Modal from "../../components/common/Modal";
import AiAgentUI from "./AiAgentUI";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AiAgentModal = ({ open, onClose }: Props) => {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="AI Agent"
      size="fullscreen"
      draggable={false}
      className="ai-agent-modal-wrapper"
    >
      <AiAgentUI />
    </Modal>
  );
};

export default AiAgentModal;
