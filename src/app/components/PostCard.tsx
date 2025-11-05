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
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [totalComments, setTotalComments] = useState(0);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [shareCount, setShareCount] = useState(post.shares.length);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(post.saves.length);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] =
    useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const axios = useAxios();
  const { user } = useUser();

  const [text, setText] = useState("");
  const [comments, setComments] = useState(post.comments);

  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showAllComments) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showAllComments]);

  useEffect(() => {
    if (user) {
      const userId = user._id;
      setIsLiked(post.likes.some((like) => like.createdBy._id === userId));
      setIsShared(post.shares.some((share) => share.createdBy._id === userId));
      setIsSaved(post.saves.some((save) => save.createdBy._id === userId));
    }
  }, [user]);

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
    }
    setShowDeleteConfirm(false);
    setShowOptions(false);
  };

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

  return (
    <div
      key={post._id}
      className="  text-white bg-black rounded overflow-hidden w-[460] items-center mt-3"
    >
      <div className="flex items-center justify-between text-sm text-stone-300 px-4 py-3 ">
        <div className="flex items-center gap-2">
          <Image
            src={post.createdBy.profilePicture || "/default-avatar.png"}
            alt=""
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
              className="text-stone-400 hover:text-white cursor-pointer transition"
            >
              <MoreHorizontal size={20} />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-6 bg-[#1c1c1c] border border-stone-700 rounded-md shadow-md w-36 z-50">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 w-full text-left text-stone-400 hover:text-white cursor-pointer px-3 py-2 text-sm"
                >
                  <Trash2 size={20} /> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className=" bg-black flex justify-center items-center  h-[600] border border-stone-700 rounded ">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="max-h-[600px] object-contain  "
          />
        ) : (
          <div className="text-stone-500 p-4">No image available</div>
        )}
      </div>

      <div className="flex items-center px-4 py-2">
        <div
          className="hover:opacity-70 cursor-pointer transition-transform active:scale-90"
          onClick={async () => {
            const response = await axios.post(`/posts/${post._id}/like`);
            setIsLiked(response.data.isLiked);
            setLikeCount(likeCount + (response.data.isLiked ? 1 : -1));
          }}
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
          onClick={async () => {
            const response = await axios.post(`/posts/${post._id}/share`);
            setIsShared(response.data.isShared);
            setShareCount(shareCount + (response.data.isShared ? 1 : -1));
          }}
        >
          {isShared ? (
            <Send fill="yellow" stroke="yellow" />
          ) : (
            <Send stroke="white" />
          )}
        </div>

        <div
          className="ml-auto hover:opacity-70 cursor-pointer transition-transform active:scale-90"
          onClick={async () => {
            const response = await axios.post(`/posts/${post._id}/save`);
            setIsSaved(response.data.isSaved);
            setSaveCount(saveCount + (response.data.isSaved ? 1 : -1));
          }}
        >
          {isSaved ? (
            <Bookmark fill="white" stroke="white" />
          ) : (
            <Bookmark stroke="white" />
          )}
        </div>
      </div>

      <div className="px-4 text-sm text-stone-300 flex justify-between">
        <div className="flex gap-4 font-medium">
          <span>{likeCount} likes</span>
        </div>
        <div className="flex gap-4 font-medium">
          <span>{saveCount} saves</span>
        </div>
      </div>

      <div className="px-4 text-sm mt-1 text-stone-300">
        <Link href={`/${post.createdBy.username}`}>
          <b>{post.createdBy.username}</b>
        </Link>{" "}
        {post.description || "No description"}
      </div>

      <div className="px-4 mt-2 text-sm text-stone-300">
        <div className="overflow-y-auto space-y-2">
          {comments.slice(0, totalComments).map((comment) => (
            <div key={comment._id} className="flex gap-2 items-start ">
              <div className="flex-shrink-0">
                <Image
                  src={
                    comment.createdBy.profilePicture || "/default-avatar.png"
                  }
                  alt={comment.createdBy.username}
                  width={25}
                  height={25}
                  className="rounded-full object-cover"
                />
              </div>
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

        {comments.length > totalComments && !showAllComments && (
          <div
            onClick={() => setShowAllComments(true)}
            className="text-stone-500 text-sm hover:underline cursor-pointer mt-1"
          >
            View all {comments.length} comments
          </div>
        )}
      </div>

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

      {showAllComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#161616] max-w-3xl max-h-[50vh] overflow-hidden rounded-lg p-4 flex flex-col md:flex-row gap-x-3">
            <div className=" flex justify-center items-center">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="max-h-[70vh] m-auto object-contain rounded-lg"
                />
              ) : (
                <div className="text-stone-500 p-4">nothing to show you</div>
              )}
            </div>

            <div className="md:w-1/2 w-full flex flex-col">
              <div className="flex items-center gap-2 text-sm text-stone-300 mb-3 px-2 py-1 border-b border-stone-700">
                <Image
                  src={post.createdBy.profilePicture || "/default-avatar.png"}
                  alt={post.createdBy.username}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <Link href={`/${post.createdBy.username}`}>
                    <span className="font-semibold hover:underline">
                      {post.createdBy.username}
                    </span>
                  </Link>
                  <div className="text-stone-500 text-xs">
                    {dayjs(post.createdAt).fromNow()}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none px-2 py-2 space-y-3 max-h-[60vh]">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2 items-start">
                    <div className="flex-shrink-0">
                      <Image
                        src={
                          comment.createdBy.profilePicture ||
                          "/default-avatar.png"
                        }
                        alt={comment.createdBy.username}
                        width={32}
                        height={32}
                        className="rounded-full object-cover mt-1"
                      />
                    </div>
                    <div className="flex-1 text-stone-300 text-sm break-words">
                      <div className="flex gap-2 items-center">
                        <b>{comment.createdBy.username}</b>
                        <span className="text-stone-500 text-xs">
                          {dayjs(comment.createdAt).fromNow()}
                        </span>
                      </div>
                      <div>{comment.text}</div>
                    </div>

                    {user && user._id === comment.createdBy._id && (
                      <Trash2
                        className="w-4 h-4 text-stone-500 hover:text-white cursor-pointer mt-1"
                        onClick={() => {
                          setCommentToDelete(comment._id);
                          setShowDeleteCommentConfirm(true);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="px-2 py-2 border-t border-stone-700 flex justify-between">
                <div className="flex items-center border-stone-800 px-4 py-3">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 resize-none text-sm text-white placeholder-stone-500 focus:outline-none"
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
                <button
                  className="text-stone-400 flex flex-col justify-center hover:text-white font-medium cursor-pointer"
                  onClick={() => setShowAllComments(false)}
                >
                  <X />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#161616] rounded-lg p-6 w-80 flex flex-col gap-4">
            <div className="text-stone-300 text-center text-sm">
              Delete this post?
            </div>
            <div className="flex justify-between gap-4">
              <button
                onClick={handleDeletePost}
                className="flex-1 bg-white hover:bg-stone-300 text-black py-2 rounded font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-white py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteCommentConfirm && commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#161616] rounded-lg p-6 w-80 flex flex-col gap-4">
            <div className="text-stone-300 text-sm border-b border-stone-700 pb-2">
              {comments
                .filter((e) => e._id === commentToDelete)
                .map((comment) => (
                  <div key={comment._id} className="flex gap-2 items-start">
                    <div className="flex-shrink-0">
                      <Image
                        src={
                          comment.createdBy.profilePicture ||
                          "/default-avatar.png"
                        }
                        alt={comment.createdBy.username}
                        width={32}
                        height={32}
                        className="rounded-full object-cover mt-1"
                      />
                    </div>
                    <div className="flex-1 text-stone-300 text-sm break-words">
                      <div className="flex gap-2 items-center">
                        <b>{comment.createdBy.username}</b>
                        <span className="text-stone-500 text-xs">
                          {dayjs(comment.createdAt).fromNow()}
                        </span>
                      </div>
                      <div>{comment.text}</div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={handleDeleteComment}
                className="flex-1 bg-white hover:bg-stone-300 text-black py-2 rounded font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteCommentConfirm(false)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-white py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
