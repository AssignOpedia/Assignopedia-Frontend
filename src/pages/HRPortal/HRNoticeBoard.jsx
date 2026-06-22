import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createNotice, deleteNotice, getNoticeEvent, getNotices } from "../../utils/noticeStorage";
import { itemMatchesSearch, setHrSearchQuery, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

function HRNoticeBoard({ activePage, onNavigate }) {
  const [notices, setNotices] = useState(() => getNotices());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchQuery = useHrSearchQuery();
  const filteredNotices = notices.filter((notice) => itemMatchesSearch(notice, searchQuery));

  useEffect(() => {
    const refreshNotices = () => {
      setNotices(getNotices());
    };

    const event = getNoticeEvent();
    window.addEventListener(event, refreshNotices);
    window.addEventListener("storage", refreshNotices);

    return () => {
      window.removeEventListener(event, refreshNotices);
      window.removeEventListener("storage", refreshNotices);
    };
  }, []);

  const handleCreateNotice = (event) => {
    event.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body");
      return;
    }

    createNotice(title.trim(), body.trim());
    setHrSearchQuery("");
    setTitle("");
    setBody("");
    setShowForm(false);
    setSuccessMessage("Notice created successfully.");
    setNotices(getNotices());

    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleDeleteNotice = (id) => {
    if (window.confirm("Delete this notice?")) {
      deleteNotice(id);
      setNotices(getNotices());
    }
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Notice Board" title="Notice Board" onNavigate={onNavigate}>
      {successMessage && (
        <div className="hr-success-banner" role="status">
          {successMessage}
        </div>
      )}

      <article className="hr-panel">
        <div className="hr-panel-heading">
          <div>
            <span>Announcements</span>
            <h2>Recent Notices</h2>
          </div>
          <button
            className="hr-primary-action"
            type="button"
            onClick={() => setShowForm((current) => !current)}
          >
            <FaPlus /> {showForm ? "Cancel" : "Create Notice"}
          </button>
        </div>

        {showForm && (
          <form className="hr-notice-form" onSubmit={handleCreateNotice}>
            <label>
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter notice title..."
              />
            </label>
            <label>
              <span>Message</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Enter notice message..."
                rows="4"
              />
            </label>
            <button type="submit">Post Notice</button>
          </form>
        )}

        <div className="hr-notice-list rich">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <article className="hr-notice-card" key={notice.id}>
                <p className="hr-dashboard-notice">
                  <strong>{notice.title}</strong>
                  <small>{notice.date}</small>
                  <span>{notice.body}</span>
                </p>
                <button className="hr-notice-delete" type="button" onClick={() => handleDeleteNotice(notice.id)}>
                  <FaTrash /> Delete
                </button>
              </article>
            ))
          ) : (
            <p className="hr-empty-state">
              {notices.length === 0 ? "No notices created yet." : "No notices match the current search."}
            </p>
          )}
        </div>
      </article>
    </HRPortalLayout>
  );
}

export default HRNoticeBoard;
