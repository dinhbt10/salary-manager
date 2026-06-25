'use client';
// Modal.jsx - Hop thoai dung chung. Header + footer co dinh, chi modal-body cuon khi dai.
// footer: node chua cac nut hanh dong (vd Huy / Luu). De trong neu khong can.
export default function Modal({ open, title, onClose, children, footer, width }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
