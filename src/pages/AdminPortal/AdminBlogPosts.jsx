import { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaEdit,
  FaExclamationCircle,
  FaRegTrashAlt,
  FaPenNib,
  FaRegFileAlt,
  FaSave,
} from "react-icons/fa";
import useBlogUpload from "../../components/Blog/hooks/useBlogUpload";
import { blogPostEvent, deleteBlogPost, getBlogPosts, saveBlogPost } from "../../utils/blogStorage";
import AdminPortalLayout from "./AdminPortalLayout";

const categories = [
  "Academic Writing Tips",
  "Referencing Guides",
  "Dissertation Guidance",
  "Research Methodology",
];

function AdminBlogPosts({ activePage, onNavigate }) {
  const [statusMessage, setStatusMessage] = useState("");
  const [blogPosts, setBlogPosts] = useState(() => getBlogPosts());
  const [editingPost, setEditingPost] = useState(null);
  const formRef = useRef(null);
  const {
    selectedImage,
    previewUrl,
    imageDataUrl,
    uploadMessage,
    handleCoverImageChange,
    resetBlogUpload,
  } = useBlogUpload();

  useEffect(() => {
    const refreshPosts = () => setBlogPosts(getBlogPosts());

    window.addEventListener(blogPostEvent, refreshPosts);
    window.addEventListener("storage", refreshPosts);
    return () => {
      window.removeEventListener(blogPostEvent, refreshPosts);
      window.removeEventListener("storage", refreshPosts);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = formData.get("blogTitle")?.toString().trim();
    const category = formData.get("category")?.toString();
    const shortDescription = formData.get("shortDescription")?.toString().trim();
    const content = formData.get("blogContent")?.toString().trim();

    if (!title || !category || !shortDescription || !content) {
      setStatusMessage("Please complete title, category, description, and full content before publishing.");
      return;
    }

    if (selectedImage && !imageDataUrl) {
      setStatusMessage("Please wait for the cover image to finish loading before publishing.");
      return;
    }

    const savedPost = saveBlogPost({
      id: editingPost?.id,
      createdAt: editingPost?.createdAt,
      title,
      category,
      desc: shortDescription,
      content,
      tags: formData.get("tags")?.toString().trim() || "",
      publishDate: formData.get("publishDate")?.toString() || new Date().toISOString().slice(0, 10),
      imageDataUrl: imageDataUrl || editingPost?.imageDataUrl || "",
      imageName: selectedImage?.name || editingPost?.imageName || "",
      readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 180))} min read`,
    });

    event.currentTarget.reset();
    resetBlogUpload();
    setEditingPost(null);
    setStatusMessage(
      editingPost
        ? `"${savedPost.title}" updated successfully.`
        : "Blog post published successfully. It is now visible on the Blog page."
    );
  };

  const handleEdit = (post) => {
    const form = formRef.current;

    setEditingPost(post);
    resetBlogUpload();
    setStatusMessage(`Editing "${post.title}".`);

    if (form) {
      form.elements.blogTitle.value = post.title || "";
      form.elements.category.value = post.category || "";
      form.elements.publishDate.value = post.publishDate || "";
      form.elements.tags.value = post.tags || "";
      form.elements.shortDescription.value = post.desc || "";
      form.elements.blogContent.value = post.content || "";
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDelete = (postId) => {
    deleteBlogPost(postId);

    if (editingPost?.id === postId) {
      handleCancelEdit();
    }

    setStatusMessage("Blog post deleted successfully.");
  };

  const handleCancelEdit = () => {
    formRef.current?.reset();
    resetBlogUpload();
    setEditingPost(null);
    setStatusMessage("");
  };

  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Content Management"
      title="Blog Post"
      description="Create drafts, upload cover images, and prepare academic resource articles for publishing."
      onNavigate={onNavigate}
      action={<button type="submit" form="admin-blog-post-form"><FaSave /> Publish Blog</button>}
    >
      <section className="admin-content-grid">
        <article className="admin-panel admin-blog-editor">
          <div className="admin-panel-heading">
            <div><span>Editor</span><h2>Create Blog Post</h2></div>
            <FaPenNib />
          </div>

          <form
            className="settings-form admin-blog-form"
            id="admin-blog-post-form"
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <label>
              <span>Blog Title</span>
              <input type="text" name="blogTitle" placeholder="Enter article title" />
            </label>

            <div className="admin-blog-form-row">
              <label>
                <span>Category</span>
                <select name="category" defaultValue="">
                  <option value="" disabled>Select category</option>
                  {categories.map((category) => (
                    <option value={category} key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Publish Date</span>
                <input type="date" name="publishDate" />
              </label>
            </div>

            <label>
              <span>Tags</span>
              <input type="text" name="tags" placeholder="writing, research, tips" />
            </label>

            <label>
              <span>Short Description</span>
              <textarea name="shortDescription" placeholder="Write a brief article summary" />
            </label>

            <label>
              <span>Full Blog Content</span>
              <textarea
                className="admin-blog-content"
                name="blogContent"
                placeholder="Write your full article content here..."
              />
            </label>

            <div className="admin-blog-actions">
              {editingPost && (
                <button className="secondary-action" type="button" onClick={handleCancelEdit}>
                  Cancel Edit
                </button>
              )}
              <button className="secondary-action" type="button"><FaRegFileAlt /> Save Draft</button>
              <button type="submit"><FaSave /> {editingPost ? "Update Blog" : "Publish Blog"}</button>
            </div>

            {statusMessage && <p className="request-success" role="status">{statusMessage}</p>}
          </form>
        </article>

        <article className="admin-panel admin-blog-media">
          <div className="admin-panel-heading">
            <div><span>Media</span><h2>Cover Image</h2></div>
            <FaCloudUploadAlt />
          </div>

          <label className="admin-blog-cover-upload">
            <input
              type="file"
              name="coverImage"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={handleCoverImageChange}
            />
            <FaCloudUploadAlt />
            <strong>Choose cover image</strong>
            <small>PNG, JPG or WEBP</small>
          </label>

          {(previewUrl || editingPost?.imageDataUrl) && (
            <img
              className="admin-blog-preview"
              src={previewUrl || editingPost.imageDataUrl}
              alt={`Preview of ${selectedImage?.name || editingPost?.imageName || editingPost?.title}`}
            />
          )}

          {uploadMessage && (
            <p
              className={`admin-blog-message ${uploadMessage.type}`}
              role={uploadMessage.type === "error" ? "alert" : "status"}
            >
              {uploadMessage.type === "success" ? (
                <FaCheckCircle aria-hidden="true" />
              ) : (
                <FaExclamationCircle aria-hidden="true" />
              )}
              {uploadMessage.text}
            </p>
          )}
        </article>

        <article className="admin-panel admin-blog-list-panel">
          <div className="admin-panel-heading">
            <div><span>Published</span><h2>Blog Posts</h2></div>
            <FaRegFileAlt />
          </div>

          <div className="admin-blog-list">
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div className="admin-blog-list-item" key={post.id}>
                  {post.imageDataUrl && (
                    <img src={post.imageDataUrl} alt={post.imageName || post.title} />
                  )}
                  <div>
                    <span>{post.category}</span>
                    <h3>{post.title}</h3>
                    <p>{post.desc}</p>
                    <small>{post.publishDate || "Unscheduled"} · {post.readTime}</small>
                  </div>
                  <div className="admin-blog-list-actions">
                    <button type="button" onClick={() => handleEdit(post)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="delete-action" type="button" onClick={() => handleDelete(post.id)}>
                      <FaRegTrashAlt /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-empty-state">No blog posts published yet.</p>
            )}
          </div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminBlogPosts;
