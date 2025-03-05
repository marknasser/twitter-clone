import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoing = () => {
    switch (feedType) {
      case "forYou": //home page
        return "/api/posts"; //all posts
      case "following": //home page
        return "/api/posts/following"; //for the users i follow
      case "posts":
        return `/api/posts/user/${username}`; // posts for a certain user

      case "likes":
        return `/api/posts/likes/${userId}`; // posts that a certain user likes
      default:
        return "/api/posts"; //all posts
    }
  };
  const POSTS_ENDPOINT = getPostEndpoing();
  console.log(POSTS_ENDPOINT, "POSTS_ENDPOINT");

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POSTS_ENDPOINT);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "something went wrong");

        console.log("posts", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });
  useEffect(() => {
    refetch();
  }, [feedType, refetch]);
  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!(isLoading && isRefetching) && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!(isLoading && isRefetching) && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
