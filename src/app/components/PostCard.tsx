"use client";

import { Post } from "../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Heart,
  Send,
  MessageCircle,
  Bookmark,
  X,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAxios } from "../hooks/useAxios";
import { useUser } from "../providers/UserProvider";
import Link from "next/link";
import Image from "next/image";

dayjs.extend(relativeTime);

export const PostCard = ({
  post,
  onDelete,
}: {
  post: Post;
  onDelete?: (id: string) => void;
}) => {
  const axios = useAxios();
  const { user } = useUser();

  // ✅ Default to safe fallback arrays
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [shareCount, setShareCount] = useState(post.shares?.length || 0);
  const [saveCount, setSaveCount] = useState(post.saves?.length || 0);
  const [comments, setComments] = useState(post.comments || []);

  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [text, setText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] =
    useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const optionsRef = useRef<HTMLDivElement>(null);

  // ✅ Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showAllComments ? "hidden" : "";
  }, [showAllComments]);

  // ✅ Detect if user liked/saved/shared
  useEffect(() => {
    if (!user) return;
    const userId = user._id;
    setIsLiked(
      post.likes?.some((like) => like.createdBy._id === userId) || false
    );
    setIsShared(
      post.shares?.some((share) => share.createdBy._id === userId) || false
    );
    setIsSaved(
      post.saves?.some((save) => save.createdBy._id === userId) || false
    );
  }, [user, post]);

  // ✅ Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(e.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle comment submission
  const handleSubmitComment = async () => {
    if (!text.trim()) return;
    try {
      const response = await axios.post(`/posts/${post._id}/comments`, {
        text,
      });
      if (response.status === 200) {
        setText("");
        setComments([...comments, response.data]);
      }
    } catch {
      toast.error("Error posting comment");
    }
  };

  // ✅ Handle post delete
  const handleDeletePost = async () => {
    try {
      const response = await axios.delete(`/posts/${post._id}`);
      if (response.status === 200) {
        toast.success("Post deleted successfully");
        if (onDelete) onDelete(post._id);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setShowDeleteConfirm(false);
      setShowOptions(false);
    }
  };

  // ✅ Handle comment delete
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      const response = await axios.delete(
        `/posts/${post._id}/comments/${commentToDelete}`
      );
      if (response.status === 200) {
        setComments(comments.filter((c) => c._id !== commentToDelete));
        toast.success("Comment deleted");
      }
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setShowDeleteCommentConfirm(false);
      setCommentToDelete(null);
    }
  };

  // ✅ Fix the “like count -1” bug
  const handleToggleLike = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/like`);
      const { isLiked: updatedLikeStatus } = response.data;

      // Instead of relying on current likeCount directly (which may be stale),
      // update based on new status:
      setLikeCount((prev) =>
        updatedLikeStatus ? prev + 1 : Math.max(prev - 1, 0)
      );
      setIsLiked(updatedLikeStatus);
    } catch {
      toast.error("Failed to like post");
    }
  };

  // ✅ Fix share toggle
  const handleToggleShare = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/share`);
      const { isShared: updatedShareStatus } = response.data;
      setShareCount((prev) =>
        updatedShareStatus ? prev + 1 : Math.max(prev - 1, 0)
      );
      setIsShared(updatedShareStatus);
    } catch {
      toast.error("Failed to share post");
    }
  };

  // ✅ Fix save toggle
  const handleToggleSave = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/save`);
      const { isSaved: updatedSaveStatus } = response.data;
      setSaveCount((prev) =>
        updatedSaveStatus ? prev + 1 : Math.max(prev - 1, 0)
      );
      setIsSaved(updatedSaveStatus);
    } catch {
      toast.error("Failed to save post");
    }
  };

  return (
    <div
      key={post._id}
      className="text-white bg-black rounded overflow-hidden w-[460] items-center mt-3"
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between text-sm text-stone-300 px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            src={post.createdBy.profilePicture || "/default-avatar.png"}
            alt={post.createdBy.username}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <Link href={`/${post.createdBy.username}`}>
            <div className="font-semibold hover:underline">
              {post.createdBy.username}
            </div>
          </Link>
          <div className="text-stone-500">•</div>
          <div className="text-stone-500">
            {dayjs(post.createdAt).fromNow()}
          </div>
        </div>

        {user && user._id === post.createdBy._id && (
          <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-stone-400 hover:text-white transition"
            >
              <MoreHorizontal size={20} />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-6 bg-[#1c1c1c] border border-stone-700 rounded-md shadow-md w-36 z-50">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 w-full text-stone-400 hover:text-white px-3 py-2 text-sm"
                >
                  <Trash2 size={20} /> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== IMAGE ===== */}
      <div className="bg-black flex justify-center items-center h-[600] border border-stone-700 rounded">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="max-h-[600px] object-contain"
          />
        ) : (
          <div className="text-stone-500 p-4">No image available</div>
        )}
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="flex items-center px-4 py-2">
        <div
          className="hover:opacity-70 cursor-pointer transition-transform active:scale-90"
          onClick={handleToggleLike}
        >
          {isLiked ? (
            <Heart fill="red" stroke="red" />
          ) : (
            <Heart stroke="white" />
          )}
        </div>

        <div
          className="ml-4 hover:opacity-70 cursor-pointer transition-transform active:scale-90"
          onClick={() => setShowAllComments(true)}
        >
          <MessageCircle stroke="white" />
        </div>

        <div
          className="ml-4 hover:opacity-70 cursor-pointer transition-transform active:scale-90"
          onClick={handleToggleShare}
        >
          {isShared ? (
            <Send fill="yellow" stroke="yellow" />
          ) : (
            <Send stroke="white" />
          )}
        </div>

        <div
          className="ml-auto hover:opacity-70 cursor-pointer transition-transform active:scale-90"
          onClick={handleToggleSave}
        >
          {isSaved ? (
            <Bookmark fill="white" stroke="white" />
          ) : (
            <Bookmark stroke="white" />
          )}
        </div>
      </div>

      {/* ===== LIKE/SAVE COUNTS ===== */}
      <div className="px-4 text-sm text-stone-300 flex justify-between">
        <span>{likeCount} likes</span>
        <span>{saveCount} saves</span>
      </div>

      {/* ===== DESCRIPTION ===== */}
      <div className="px-4 text-sm mt-1 text-stone-300">
        <Link href={`/${post.createdBy.username}`}>
          <b>{post.createdBy.username}</b>
        </Link>{" "}
        {post.description || "No description"}
      </div>

      {/* ===== COMMENTS (PREVIEW) ===== */}
      <div className="px-4 mt-2 text-sm text-stone-300">
        <div className="overflow-y-auto space-y-2">
          {comments.slice(0, 2).map((comment) => (
            <div key={comment._id} className="flex gap-2 items-start">
              <Image
                src={comment.createdBy.profilePicture || "/default-avatar.png"}
                alt={comment.createdBy.username}
                width={25}
                height={25}
                className="rounded-full object-cover"
              />
              <div className="flex-1 text-stone-300 text-sm break-words">
                <b>{comment.createdBy.username}: </b>
                {comment.text}
              </div>
              {user && user._id === comment.createdBy._id && (
                <Trash2
                  className="w-4 h-4 text-stone-500 hover:text-white cursor-pointer"
                  onClick={() => {
                    setCommentToDelete(comment._id);
                    setShowDeleteCommentConfirm(true);
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {comments.length > 2 && (
          <div
            onClick={() => setShowAllComments(true)}
            className="text-stone-500 text-sm hover:underline cursor-pointer mt-1"
          >
            View all {comments.length} comments
          </div>
        )}
      </div>

      {/* ===== ADD COMMENT INPUT ===== */}
      <div className="flex items-center border-stone-800 mt-3 px-4 py-3 border-b">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 resize-none text-sm bg-black text-white placeholder-stone-500 focus:outline-none"
          rows={1}
        />
        {text.length > 0 && (
          <div
            onClick={handleSubmitComment}
            className="text-stone-400 font-semibold text-sm cursor-pointer hover:text-white"
          >
            Post
          </div>
        )}
      </div>
    </div>
  );
};
