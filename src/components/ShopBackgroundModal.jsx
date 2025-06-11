import Modal from 'react-modal';

Modal.setAppElement('#root');

export function ShopBackgroundModal({ isOpen, onRequestClose, children }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Background"
      className={`transtion-all duration-75 scale-90 bg-white rounded-lg w-[50rem] mt-20 shadow-xl outline-none z-50`}
      overlayClassName="fixed inset-0 bg-black/50  flex items-center justify-center"
    >
      {children}
    </Modal>
  );
}