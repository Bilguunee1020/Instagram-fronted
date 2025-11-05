"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useUser } from "../../providers/UserProvider";
import { useAxios } from "../../hooks/useAxios";
import Link from "next/link";

const EditProfilePage = () => {
  const { user: currentUser, token } = useUser();
  const axios = useAxios();
  const router = useRouter();

  // State variables
  const [username, setUsername] = useState(currentUser?.username || "");
  const [fullname, setFullname] = useState(currentUser?.fullname || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    currentUser?.profilePicture || "/default-profile.png"
  );
  const [uploading, setUploading] = useState(false);

  // Handle file selection and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setUploading(true);

      let profilePictureUrl = previewUrl;

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/file", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload profile picture");

        const data = await uploadRes.json();
        profilePictureUrl = data.url;
      }

      // Update profile
      await axios.patch("/users/me", {
        fullname,
        bio,
        profilePicture: profilePictureUrl,
      });

      toast.success("Profile updated successfully!");
      router.push(`/${currentUser?.username}`);
    } catch (err: unknown) {
      console.error(err);
      const message = toast.error("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Edit Profile</h1>

      {/* Profile Picture Upload */}
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex justify-center mb-6"
      >
        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-700">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <Image
              src="/default-profile.png"
              alt="Default Profile"
              fill
              className="object-cover opacity-80"
            />
          )}
        </div>
        <Input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {/* Input Fields */}
      <div className="mb-4 flex flex-col gap-4">
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 border-stone-600"
        />
        <Input
          placeholder="Fullname"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className="border-2 border-stone-600"
        />
        <Input
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="border-2 border-stone-600"
        />
      </div>

      {/* Action Buttons */}
      <Button onClick={handleSubmit} disabled={uploading} className="w-full">
        {uploading ? "Updating..." : "Save Changes"}
      </Button>
      <Link href={`/${currentUser?.username}`}>
        <Button className="w-full mt-5">Go Back</Button>
      </Link>
    </div>
  );
};

export default EditProfilePage;
