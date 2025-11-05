"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./providers/UserProvider";
import { redirect } from "next/navigation";
import { Navbar } from "./components/Navbar";
import { Post } from "./types";
import { PostCard } from "./components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user, loading } = useContext(UserContext);

  useEffect(() => {
    fetch("http://localhost:5500/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
      });
  }, []);

  if (loading) {
    return <>Loading....</>;
  }

  if (!user) {
    return redirect("/signin");
  }

  return (
    <div>
      <Navbar />

      <div className="w-[600px] flex flex-col gap-4 mx-auto">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
