import { createApiResourceStore } from "./apiResourceStore";

export const blogPostEvent = "assignopedia-blog-posts-updated";

const blogStore = createApiResourceStore({
  resource: "blogPosts",
  event: blogPostEvent,
  fallback: [],
});

export const getBlogPosts = () => blogStore.get();

export const saveBlogPost = (post) => {
  const posts = getBlogPosts();
  const nextPost = {
    ...post,
    id: post.id || `blog-${Date.now()}`,
    status: post.status || "published",
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const postExists = posts.some((savedPost) => savedPost.id === nextPost.id);
  const nextPosts = postExists
    ? posts.map((savedPost) => (savedPost.id === nextPost.id ? nextPost : savedPost))
    : [nextPost, ...posts];

  blogStore.save(nextPosts).catch(() => {});
  return nextPost;
};

export const deleteBlogPost = (postId) => {
  const nextPosts = getBlogPosts().filter((post) => post.id !== postId);

  blogStore.save(nextPosts).catch(() => {});
  return nextPosts;
};
