import { FaExclamationTriangle } from "react-icons/fa";

function HRConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  message,
  onCancel,
  onConfirm,
  title = "Confirm delete",
}) {
  return (
    <div className="hr-confirm-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="hr-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hr-confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="hr-confirm-icon" aria-hidden="true">
          <FaExclamationTriangle />
        </div>
        <div className="hr-confirm-copy">
          <h2 id="hr-confirm-title">{title}</h2>
          <p>{message}</p>
        </div>
        <div className="hr-confirm-actions">
          <button className="outline" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default HRConfirmDialog;
