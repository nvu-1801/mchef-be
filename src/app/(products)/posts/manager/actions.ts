"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/libs/supabase/supabase-server";

const BUCKET = "dishes";
const BUCKET_VIDEOS = "dishes_videos";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function requireUser() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return { sb, user };
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    // đôi khi Supabase/Fetch ném object có 'message'
    if (e && typeof e === "object" && "message" in e) {
      const m = (e as { message?: unknown }).message;
      if (typeof m === "string") return m;
    }
  } catch {}
  return "Unexpected error";
}

function makeUUID() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // fallback Node crypto nếu có (đỡ lệ thuộc build target)
  try {
    // @ts-ignore
    return require("crypto").randomUUID();
  } catch {
    // fallback cuối
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }
}

/** Upload ẢNH cover lên Storage và trả về public URL */
async function uploadCoverAndGetUrl(
  sb: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string,
  file: File
) {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `covers/${userId}/${Date.now()}-${makeUUID()}.${ext}`;

  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (upErr) throw new Error("Upload ảnh thất bại: " + upErr.message);

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl ?? null;
}

/** Upload VIDEO lên Storage và trả về public URL */
async function uploadVideoAndGetUrl(
  sb: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string,
  file: File
) {
  if (!file || file.size === 0) return null;
  if (!file.type?.startsWith("video/")) {
    throw new Error("File video không hợp lệ");
  }
  // cố gắng giữ lại phần mở rộng gốc
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "mp4";
  const path = `videos/${userId}/${Date.now()}-${makeUUID()}.${ext}`;

  const { error: upErr } = await sb.storage
    .from(BUCKET_VIDEOS)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || "video/mp4",
      upsert: false,
    });

  if (upErr) throw new Error("Upload video thất bại: " + upErr.message);

  const { data: pub } = sb.storage.from(BUCKET_VIDEOS).getPublicUrl(path);
  return pub.publicUrl ?? null;
}

export async function createDish(formData: FormData) {
  const { sb, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Tiêu đề bắt buộc");

  // ẢNH
  const imageSource = (formData.get("image_source") as string) || "url";
  let cover_image_url: string | null = null;
  if (imageSource === "upload") {
    const file = formData.get("cover_file") as File | null;
    if (file && file.size > 0) {
      cover_image_url = await uploadCoverAndGetUrl(sb, user.id, file);
    }
  } else {
    const url = String(formData.get("cover_image_url") || "").trim();
    cover_image_url = url || null;
  }

  // VIDEO
  const videoSource = (formData.get("video_source") as string) || "url";
  let video_url: string | null = null;
  if (videoSource === "upload") {
    const vfile = formData.get("video_file") as File | null;
    if (vfile && vfile.size > 0) {
      video_url = await uploadVideoAndGetUrl(sb, user.id, vfile);
    }
  } else {
    const url = String(formData.get("video_url") || "").trim();
    video_url = url || null;
  }

  const payload = {
    title,
    slug: slugify(title),
    category_id: (formData.get("category_id") as string) || null,
    cover_image_url,
    video_url, // ⬅️ LƯU VIDEO
    diet: (formData.get("diet") as string) || null,
    time_minutes: Number(formData.get("time_minutes") ?? 0) || 0,
    servings: Number(formData.get("servings") ?? 0) || 0,
    tips: (formData.get("tips") as string) || null,
    published: formData.get("published") === "on",
    created_by: user.id,
  };

  const { error } = await sb.from("dishes").insert(payload);
  if (error) throw error;

  revalidatePath("/posts/manager");
  redirect("/posts/manager");
}

export async function updateDish(id: string, formData: FormData) {
  const { sb, user } = await requireUser();

  const { data: owned, error: owErr } = await sb
    .from("dishes")
    .select("id, created_by")
    .eq("id", id)
    .single();
  if (owErr || !owned || owned.created_by !== user.id)
    throw new Error("FORBIDDEN");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Tiêu đề bắt buộc");

  // ẢNH
  const imageSource = (formData.get("image_source") as string) || "url";
  let cover_image_url: string | null =
    (formData.get("cover_image_url") as string) || null;
  if (imageSource === "upload") {
    const file = formData.get("cover_file") as File | null;
    if (file && file.size > 0) {
      cover_image_url = await uploadCoverAndGetUrl(sb, user.id, file);
    }
  }

  // VIDEO
  const videoSource = (formData.get("video_source") as string) || "url";
  let video_url: string | null =
    ((formData.get("video_url") as string) || "").trim() || null;
  if (videoSource === "upload") {
    const vfile = formData.get("video_file") as File | null;
    if (vfile && vfile.size > 0) {
      video_url = await uploadVideoAndGetUrl(sb, user.id, vfile);
    }
  }

  const patch = {
    title,
    slug: slugify(title),
    category_id: (formData.get("category_id") as string) || null,
    cover_image_url,
    video_url, // ⬅️ CẬP NHẬT VIDEO
    diet: (formData.get("diet") as string) || null,
    time_minutes: Number(formData.get("time_minutes") ?? 0) || 0,
    servings: Number(formData.get("servings") ?? 0) || 0,
    tips: (formData.get("tips") as string) || null,
    published: formData.get("published") === "on",
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from("dishes").update(patch).eq("id", id);
  if (error) throw error;

  revalidatePath("/posts/manager");
  redirect("/posts/manager");
}

export async function deleteDish(id: string) {
  const { sb, user } = await requireUser();

  const { data: owned } = await sb
    .from("dishes")
    .select("id, created_by")
    .eq("id", id)
    .single();
  if (!owned || owned.created_by !== user.id) throw new Error("FORBIDDEN");

  const { error } = await sb.from("dishes").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/posts/manager");
  redirect("/posts/manager");
}
