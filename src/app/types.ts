export type User = {
  _id: string;
  username: string;
  fullname: string;
  password: string;
  followers: string;
  followings: string;

  email: string | null;
  phone: string | null;
  profilePicture?: string;
  bio: string;
};

export type PostComment = {
  _id: string;
  text: string;
  createdAt: string;
  createdBy: User;
};

export type PostLike = {
  _id: string;
  createdAt: string;
  createdBy: User;
};

export type PostShare = {
  _id: string;
  createdAt: string;
  createdBy: User;
};

export type PostSave = {
  _id: string;
  createdAt: string;
  createdBy: User;
};

export type Post = {
  username: any;
  _id: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  createdBy: User;
  comments: PostComment[];
  likes: PostLike[];
  shares: PostShare[];
  saves: PostSave[];
};
