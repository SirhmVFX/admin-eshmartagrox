"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Card } from "@/components/ui/Card";
import { FormField, FormGrid } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { BlogContent, BlogPost } from "@/lib/types";

export default function BlogPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [data, setData] = useState<BlogContent | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      setData(JSON.parse(JSON.stringify(content.blog)));
      if (content.blog.posts[0]) setActiveId(content.blog.posts[0].id);
    }
  }, [content]);

  if (loading || !data) return <p className="text-gray-500">Loading...</p>;

  const post = data.posts.find((p) => p.id === activeId);

  const addPost = () => {
    const p: BlogPost = {
      id: `post-${Date.now()}`,
      title: "New Post",
      slug: `post-${Date.now()}`,
      excerpt: "",
      content: "",
      coverImage: "/hero.png",
      author: "Eshmart Team",
      publishedAt: null,
      isPublished: false,
      tags: [],
    };
    setData({ ...data, posts: [...data.posts, p] });
    setActiveId(p.id);
  };

  return (
    <>
      <AdminHeader
        title="Blog"
        description="Create and manage blog posts."
        actions={
          can("blog:write") && (
            <Button variant="secondary" onClick={addPost}>
              <Plus className="h-4 w-4" /> New post
            </Button>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-4">
        <Card title="Posts" className="lg:col-span-1">
          <ul className="space-y-1">
            {data.posts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={`w-full rounded px-2 py-1.5 text-left text-sm ${
                    activeId === p.id ? "bg-green-100" : "hover:bg-gray-50"
                  }`}
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        </Card>
        {post && (
          <Card title="Edit post" className="lg:col-span-3">
            <FormGrid>
              <FormField label="Title">
                <input
                  value={post.title}
                  onChange={(e) =>
                    setData({
                      ...data,
                      posts: data.posts.map((p) =>
                        p.id === post.id ? { ...p, title: e.target.value } : p
                      ),
                    })
                  }
                />
              </FormField>
              <FormField label="Slug">
                <input
                  value={post.slug}
                  onChange={(e) =>
                    setData({
                      ...data,
                      posts: data.posts.map((p) =>
                        p.id === post.id ? { ...p, slug: e.target.value } : p
                      ),
                    })
                  }
                />
              </FormField>
            </FormGrid>
            <FormField label="Excerpt">
              <textarea
                rows={2}
                value={post.excerpt}
                onChange={(e) =>
                  setData({
                    ...data,
                    posts: data.posts.map((p) =>
                      p.id === post.id ? { ...p, excerpt: e.target.value } : p
                    ),
                  })
                }
              />
            </FormField>
            <FormField label="Content">
              <textarea
                rows={8}
                value={post.content}
                onChange={(e) =>
                  setData({
                    ...data,
                    posts: data.posts.map((p) =>
                      p.id === post.id ? { ...p, content: e.target.value } : p
                    ),
                  })
                }
              />
            </FormField>
            <ImageUpload
              value={post.coverImage}
              onChange={(v) =>
                setData({
                  ...data,
                  posts: data.posts.map((p) =>
                    p.id === post.id ? { ...p, coverImage: v } : p
                  ),
                })
              }
            />
            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={post.isPublished}
                onChange={(e) =>
                  setData({
                    ...data,
                    posts: data.posts.map((p) =>
                      p.id === post.id
                        ? {
                            ...p,
                            isPublished: e.target.checked,
                            publishedAt: e.target.checked
                              ? new Date().toISOString()
                              : null,
                          }
                        : p
                    ),
                  })
                }
              />
              Published
            </label>
            {can("blog:write") && (
              <Button
                variant="danger"
                className="mt-4"
                onClick={() => {
                  setData({ ...data, posts: data.posts.filter((p) => p.id !== post.id) });
                  setActiveId(data.posts[0]?.id ?? null);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete post
              </Button>
            )}
          </Card>
        )}
      </div>
      <SaveBar
        saving={saving}
        message={message}
        canSave={can("blog:write")}
        onSave={() => saveSection("blog", data)}
      />
    </>
  );
}
