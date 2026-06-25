import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createNotice, deleteNotice, getNoticeEvent, getNotices, setNotices as setStoredNotices } from "../../utils/noticeStorage";
import { createNoticeRemote, deleteNoticeRemote, getNoticesRemote } from "../../utils/hrPortalApi";
import { itemMatchesSearch, setHrSearchQuery, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

function HRNoticeBoard({ activePage, onNavigate }) {
  const [notices, setNoticesState] = useState(() => getNotices());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchQuery = useHrSearchQuery();
  const filteredNotices = notices.filter((notice) => itemMatchesSearch(notice, searchQuery));

  useEffect(() => {
    const refreshNotices = () => {
      setNoticesState(getNotices());
    };

    getNoticesRemote()
      .then((remoteNotices) => {
        setStoredNotices(remoteNotices);
        setNoticesState(remoteNotices);
      })
      .catch(() => {});

    const event = getNoticeEvent();
    window.addEventListener(event, refreshNotices);
    window.addEventListener("storage", refreshNotices);

    return () => {
      window.removeEventListener(event, refreshNotices);
      window.removeEventListener("storage", refreshNotices);
    };
  }, []);

  const handleCreateNotice = async (event) => {
    event.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body");
      return;
    }

    const notice = createNotice(title.trim(), body.trim());
    const response = await createNoticeRemote(notice).catch(() => null);

    if (response?.items) {
      setStoredNotices(response.items);
    }

    setHrSearchQuery("");
    setTitle("");
    setBody("");
    setShowForm(false);
    setSuccessMessage("Notice created successfully.");
    setNoticesState(getNotices());

    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm("Delete this notice?")) {
      deleteNotice(id);
      const response = await deleteNoticeRemote(id).catch(() => null);

      if (response?.items) {
        setStoredNotices(response.items);
      }

      setNoticesState(getNotices());
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
