import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export const POST = async (req: NextRequest) => {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const blob = await put(`${nanoid()}/${file.name}`, file, { access: "public" });
  return NextResponse.json(blob);
};
