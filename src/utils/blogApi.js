const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Blog post request failed.");
  }

  return data;
};

export const saveBlogPostRemote = async (post, isEditing = false) => {
  const path = isEditing ? `/blog-posts/${post.id}` : "/blog-posts";
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: isEditing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });

  return parseResponse(response);
};

export const deleteBlogPostRemote = async (postId) => {
  const response = await fetch(`${apiBaseUrl}/blog-posts/${postId}`, {
    method: "DELETE",
  });

  return parseResponse(response);
};
