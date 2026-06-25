export const blogPostEvent = "assignopedia-blog-posts-updated";

const blogPostStorageKey = "assignopediaBlogPosts";

export const getBlogPosts = () => {
  try {
    return JSON.parse(localStorage.getItem(blogPostStorageKey)) || [];
  } catch {
    return [];
  }
};

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

  localStorage.setItem(blogPostStorageKey, JSON.stringify(nextPosts));
  window.dispatchEvent(new CustomEvent(blogPostEvent, { detail: nextPosts }));

  return nextPost;
};

export const deleteBlogPost = (postId) => {
  const nextPosts = getBlogPosts().filter((post) => post.id !== postId);

  localStorage.setItem(blogPostStorageKey, JSON.stringify(nextPosts));
  window.dispatchEvent(new CustomEvent(blogPostEvent, { detail: nextPosts }));

  return nextPosts;
};
