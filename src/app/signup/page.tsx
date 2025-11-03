"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

const SignUpPage = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");

  const handleSignup = async () => {
    const response = await fetch("http://localhost:5500/signup", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ credential, password, fullname, username }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-stone-900">
      <div className="flex flex-col items-center">
        <div className="flex flex-col border-stone-700 bg-black rounded-2xl justify-between p-5 w-80">
          <div className="flex justify-center w-full mb-6">
            <img
              className="h-24 w-32"
              src="https://image.similarpng.com/file/similarpng/original-picture/2020/06/Instagram-name-logo-transparent-PNG.png"
              alt="logo"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Input
              placeholder="Email or phone..."
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              className="border-2 border-stone-600"
            />
            <Input
              placeholder="Full name..."
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="border-2 border-stone-600"
            />
            <Input
              placeholder="Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-stone-600"
            />
            <div className="relative">
              <Input
                placeholder="Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={passwordShown ? "text" : "password"}
                className="border-2 border-stone-600"
              />
              <Button
                onClick={() => setPasswordShown(!passwordShown)}
                variant="ghost"
                className="absolute right-0 top-0 hover:bg-black/20 hover:text-white"
              >
                {passwordShown ? <Eye /> : <EyeClosed />}
              </Button>
            </div>

            <Button
              onClick={handleSignup}
              className="bg-stone-700 hover:bg-stone-600 mt-2"
            >
              Sign up
            </Button>

            <div className="border-b-2 border-stone-700 rounded-2xl my-4"></div>

            <div className="flex justify-center gap-x-1">
              <span className="text-[10px] text-stone-500">Already have an account?</span>
              <Link href="/" className="text-[10px] text-stone-300 hover:text-white hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
