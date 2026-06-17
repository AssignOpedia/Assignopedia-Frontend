import {
  FaBook,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaEdit,
  FaExclamationCircle,
  FaLayerGroup,
  FaPenNib,
  FaSearch,
} from "react-icons/fa";
import ConstellationBackground from "../shared/ConstellationBackground";
import useBlogUpload from "./hooks/useBlogUpload";

function Blog() {
  const {
    selectedImage,
    previewUrl,
    uploadMessage,
    handleCoverImageChange,
  } = useBlogUpload();

  const categories = [
    "Academic Writing Tips",
    "Referencing Guides",
    "Dissertation Guidance",
    "Research Methodology",
  ];

  const posts = [
    {
      category: "Academic Writing Tips",
      title: "How to Structure an Assignment That Reads Clearly",
      desc: "Plan stronger introductions, paragraph flow, evidence, and conclusions before you begin writing.",
      readTime: "6 min read",
    },
    {
      category: "Referencing Guides",
      title: "APA, MLA, and Harvard Referencing Basics",
      desc: "A practical guide to choosing the right style and avoiding common citation mistakes.",
      readTime: "8 min read",
    },
    {
      category: "Dissertation Guidance",
      title: "Choosing a Dissertation Topic With Real Scope",
      desc: "Learn how to narrow a broad idea into a focused topic your research can actually answer.",
      readTime: "7 min read",
    },
  ];

  const relatedPosts = [
    "Building a research question",
    "Writing a literature review",
    "Proofreading before submission",
  ];

  return (
    <main className="page blog-page">
      <ConstellationBackground variant="blog" />
      <section className="page-hero">
        <span>Blog / Resources</span>
        <h1>Academic Resources for Better Writing</h1>
        <p>
          Explore guides, writing tips, dissertation support, and research
          methodology resources designed for students.
        </p>
      </section>

      <section className="blog-tools">
        <label className="search-box">
          <FaSearch />
          <input type="search" placeholder="Search academic resources..." />
        </label>

        <div className="category-row">
          {categories.map((category) => (
            <button type="button" key={category}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="blog-layout">
        <div className="blog-main">
          <article className="featured-post">
            <div className="feature-icon">
              <FaEdit />
            </div>
            <div>
              <span>Rich Text Blog</span>
              <h2>Writing With Evidence, Structure, and Academic Confidence</h2>
              <p>
                Strong academic writing is more than filling pages. It combines
                research, citation, analysis, and clean editing so your argument
                feels complete from start to finish.
              </p>
              <button type="button">Read Featured Guide</button>
            </div>
          </article>

          <div className="post-grid">
            {posts.map((post) => (
              <article className="post-card" key={post.title}>
                <span>{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.desc}</p>
                <div className="post-meta">
                  <FaBook />
                  {post.readTime}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="resource-sidebar">
          <div className="sidebar-panel">
            <h3>
              <FaLayerGroup />
              Related Posts
            </h3>
            {relatedPosts.map((post) => (
              <button type="button" key={post}>
                {post}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="blog-upload-panel">
        <div className="blog-upload-heading">
          <span className="blog-upload-icon">
            <FaPenNib />
          </span>
          <div>
            <h3>Upload Blog</h3>
            <p>Create and publish a new article</p>
          </div>
        </div>

        <form className="blog-upload-form">
          <div className="blog-upload-column">
            <label>
              Blog Title
              <input
                type="text"
                name="blogTitle"
                placeholder="Enter article title"
              />
            </label>

            <label>
              Category
              <select name="category" defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tags
              <input
                type="text"
                name="tags"
                placeholder="writing, research, tips"
              />
            </label>

            <label>
              Publish Date
              <input type="date" name="publishDate" />
            </label>
          </div>

          <div className="blog-upload-column">
            <div className="blog-upload-field">
              <span>Upload Cover Image</span>
              <label className="blog-cover-upload">
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
              {previewUrl && selectedImage && (
                <img
                  src={previewUrl}
                  alt={`Preview of ${selectedImage.name}`}
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "180px",
                    maxHeight: "140px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    boxShadow: "0 10px 24px rgba(11,34,85,.16)",
                    margin: "10px auto 0",
                    animation: "fadeIn .35s ease both",
                  }}
                />
              )}
              {uploadMessage && (
                <p
                  role={uploadMessage.type === "error" ? "alert" : "status"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    color:
                      uploadMessage.type === "success" ? "#18864b" : "#c0392b",
                    fontSize: "12px",
                    fontWeight: 700,
                    lineHeight: 1.5,
                    textAlign: "center",
                    margin: previewUrl ? "2px 0 0" : "8px 0 0",
                    animation: "fadeIn .35s ease both",
                  }}
                >
                  {uploadMessage.type === "success" ? (
                    <FaCheckCircle aria-hidden="true" />
                  ) : (
                    <FaExclamationCircle aria-hidden="true" />
                  )}
                  {uploadMessage.text}
                </p>
              )}
            </div>

            <label>
              Short Description
              <textarea
                name="shortDescription"
                placeholder="Write a brief article summary"
              />
            </label>
          </div>

          <label className="blog-content-field">
            Full Blog Content
            <textarea
              className="blog-content-editor"
              name="blogContent"
              placeholder="Write your full article content here..."
            />
          </label>

          <div className="blog-upload-actions">
            <button className="draft-blog-btn" type="button">
              Save Draft
            </button>
            <button className="publish-blog-btn" type="button">
              Publish Blog
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Blog;
