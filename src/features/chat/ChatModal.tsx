import {useEffect} from "react";
import Modal from "../../components/common/Modal"; // adjust path if needed
import ChatUI from "./ChatUI";
import { resetUnread ,setChatOpen} from "../../slices/chatNotificationSlice";
import { useAppDispatch } from "../../redux/hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChatModal = ({ open, onClose }: Props) => {
const dispatch = useAppDispatch();
useEffect(() => {
  dispatch(setChatOpen(open));

  if (open) {
    dispatch(resetUnread());
  }
}, [open]);
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Chat"
      size="fullscreen"   
      draggable={false} 
      className="chat-modal-wrapper"
    >
      <ChatUI />
    </Modal>
  );
};

export default ChatModal;