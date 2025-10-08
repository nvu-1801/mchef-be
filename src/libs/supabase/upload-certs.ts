// libs/storage/upload-certs.ts (client)
import { supabaseBrowser } from "./supabase-client";

export async function uploadCertificateFiles(files: File[]) {
  const sb = supabaseBrowser();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Bạn cần đăng nhập");

  const paths: string[] = [];

  for (const f of files) {
    if (f.size > 10 * 1024 * 1024) throw new Error(`${f.name} > 10MB`);
    if (!["application/pdf", "image/png", "image/jpeg"].includes(f.type))
      throw new Error(`${f.name} không đúng định dạng`);

    const ext = f.name.split(".").pop() || "bin";
    const path = `${user.id}/cert_${crypto.randomUUID()}.${ext}`;

    const { error } = await sb.storage
      .from("certificates")
      .upload(path, f, { upsert: false, contentType: f.type });

    if (error) throw error;
    paths.push(path);
  }

  return paths; // <— trả về các STORAGE PATH
}
