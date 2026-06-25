'use client';
// ConfirmModal.jsx - Hop thoai xac nhan (thay cho window.confirm).
// Dung: <ConfirmModal open title message onConfirm onClose danger busy />
import Modal from './Modal';
import Spinner from './Spinner';

export default function ConfirmModal({
  open, title = 'Xác nhận', message, onConfirm, onClose,
  confirmText = 'Xác nhận', cancelText = 'Hủy', danger = false, busy = false,
}) {
  return (
    <Modal
      open={open} title={title} width={440} onClose={busy ? () => {} : onClose}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>{cancelText}</button>
          <button type="button" className={`btn ${danger ? 'danger' : ''}`} onClick={onConfirm} disabled={busy}>
            {busy && <Spinner />}{confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}
