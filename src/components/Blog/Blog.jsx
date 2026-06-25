import { useEffect, useState } from "react";
import {
  FaBook,
  FaEdit,
  FaLayerGroup,
  FaSearch,
} from "react-icons/fa";
import ConstellationBackground from "../shared/ConstellationBackground";
import { blogPostEvent, getBlogPosts } from "../../utils/blogStorage";

function Blog() {
  const [publishedPosts, setPublishedPosts] = useState(() => getBlogPosts());

  useEffect(() => {
    const refreshPosts = () => setPublishedPosts(getBlogPosts());

    window.addEventListener(blogPostEvent, refreshPosts);
    window.addEventListener("storage", refreshPosts);
    return () => {
      window.removeEventListener(blogPostEvent, refreshPosts);
      window.removeEventListener("storage", refreshPosts);
    };
  }, []);

  const categories = [
    "Academic Writing Tips",
    "Referencing Guides",
    "Dissertation Guidance",
    "Research Methodology",
  ];

  const defaultPosts = [
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

  const posts = [...publishedPosts, ...defaultPosts];

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
              <article className="post-card" key={post.id || post.title}>
                {post.imageDataUrl && (
                  <img src={post.imageDataUrl} alt={post.imageName || post.title} />
                )}
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
    </main>
  );
}

export default Blog;
