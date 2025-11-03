"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAxios } from "../hooks/useAxios";
import { User, Post } from "../types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useUser } from "../providers/UserProvider";
import Link from "next/link";
import { PostCard } from "../components/PostCard";

const ProfilePage = () => {
  const { username } = useParams();
  const axios = useAxios();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isNotFound, setIsNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { user: currentUser } = useUser();

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const userRes = await axios.get(`/users/${username}`);
        const userData = userRes.data;
        setUser(userData);

        const follows = userData.followers?.some(
          (f: any) => f.createdBy._id === currentUser?._id
        );

        setIsFollowing(follows);
        setFollowerCount(userData.followers?.length || 0);

        const postRes = await axios.get(`/posts/user/${username}`);
        setPosts(postRes.data);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 404) setIsNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser?._id]);

  const handleFollow = async () => {
    if (!user) return;

    const previousState = isFollowing;
    const prevCount = followerCount;

    setIsFollowing(!previousState);
    setFollowerCount(prevCount + (previousState ? -1 : 1));

    try {
      const response = await axios.post(`/users/${user.username}/follow`);
      setIsFollowing(response.data.isFollowing);

      if (typeof response.data.followerCount === "number") {
        setFollowerCount(response.data.followerCount);
      }
    } catch (err) {
      console.error(err);
      setIsFollowing(previousState);
      setFollowerCount(prevCount);
    }
  };

  if (loading)
    return (
      <div className="text-center text-2xl mt-8 text-white">Loading...</div>
    );

  if (isNotFound)
    return (
      <div className="text-center text-2xl mt-8 text-white">
        404 user not found
      </div>
    );

  const isOwnProfile = currentUser?.username === user?.username;

  return (
    <div className="min-h-screen bg-black text-white w-full cursor-default">
      <Navbar />

      <div className="w-full flex justify-center pt-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-10 mb-8">
          <div className="flex justify-center md:block mb-6 md:mb-0">
            <img
              src={user?.profilePicture || "/default-avatar.png"}
              className="w-40 h-40 rounded-full object-cover border border-gray-700"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <h1 className="text-2xl font-semibold">{user?.username}</h1>
              <Check />
              <button className="p-2 hover:bg-[#262626] rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center md:justify-start gap-8 mb-4 text-sm">
              <span>{posts.length} posts</span>
              <span>{followerCount} followers</span>
              <span>{user?.followings.length} following</span>
            </div>

            <div className="text-sm leading-snug mb-4 flex flex-col gap-y-4 cursor-default">
              <span className="font-semibold block">{user?.fullname}</span>
              <p className="text-stone-500">{user?.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {isOwnProfile ? (
          <Link
            href="/edit/profile"
            className="mt-2 px-4 py-2 rounded-xl bg-[#262626] text-white hover:bg-[#363636] transition"
          >
            Edit Profile
          </Link>
        ) : (
          <>
            <Button
              onClick={handleFollow}
              className={`text-sm font-semibold w-40 h-10 px-6 transition-transform active:scale-95 ${
                isFollowing
                  ? "bg-[#262626] text-white hover:bg-[#363636]"
                  : "bg-white text-black hover:bg-stone-200"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>

            <Button className="bg-[#262626] text-white text-sm font-semibold w-40 h-10 hover:bg-[#363636]">
              Message
            </Button>

            <Button className="bg-[#262626] text-white text-sm font-semibold px-4 h-10 hover:bg-[#363636]">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      <div className="border-t border-stone-800 mt-8 mb-8" />

      <div className="flex justify-center mt-8">
        <div className="posts grid grid-cols-3 gap-2">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                className="w-50 h-80 rounded-2xl overflow-hidden group border-2 border-stone-800 hover:border-2 hover:border-stone-600 cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 mt-10">
              No posts yet
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[90%] max-w-xl h-auto max-h-[80vh] overflow-auto rounded-2xl">
            <PostCard
              post={selectedPost}
              onDelete={(id) => {
                setPosts(posts.filter((p) => p._id !== id));
                setSelectedPost(null);
              }}
            />
          </div>
          <button
            className="absolute top-5 right-5 text-stone-400 hover:text-white cursor-pointer text-2xl"
            onClick={() => setSelectedPost(null)}
          >
            <X />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
