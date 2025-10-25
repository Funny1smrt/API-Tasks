import { supabase } from "../config/supabase.js";
const LIMIT_AVATARS = 2;
export async function getAvatar(userId) {
  const { data, error } = await supabase.storage
    .from("avatars")
    .list(`${userId}/`); // Отримати список, щоб знайти файл
  if (error) throw error;

  // Якщо немає файлів або папка порожня, повертаємо null
  if (!data || data.length === 0) {
    return null;
  }
  // 🔹 Сортуємо файли за created_at, щоб знайти найновіший
  const sortedFiles = data.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const avatarFile = sortedFiles[0]; // найновіший файл
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(`${userId}/${avatarFile.name}`);
  return {
    name: avatarFile.name,
    url: urlData.publicUrl,
  };
}

export async function uploadAvatar(userId, file) {
  const fileName = `avatar.${Date.now()}.${
    file.mimetype.split("/")[1]
  }`;
  // Шлях до файлу завжди буде ОДНАКОВИЙ: [userId]/avatar.{name}.{type}
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true, // Ця опція забезпечить перезапис старого файлу
    });

  if (error) throw error;
  // 2️⃣ Отримуємо список усіх файлів у папці користувача
  const { data: files, error: listError } = await supabase.storage
    .from("avatars")
    .list(`${userId}/`);

  if (listError) throw listError;
  if (!files || files.length === 0) return;

  // 3️⃣ Якщо файлів більше зазначеного ліміту — видаляємо найстаріший
  if (files.length > LIMIT_AVATARS) {
    // Сортуємо за created_at: від найстарішого до найновішого
    const sorted = files.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    // Беремо найстаріший файл
    const oldestFile = sorted[0];

    console.log(`Видаляю старий аватар: ${oldestFile.name}`);

    // 4️⃣ Видаляємо його
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([`${userId}/${oldestFile.name}`]);

    if (deleteError) console.error("Помилка при видаленні:", deleteError);
  }
  // Отримуємо публічний URL для щойно завантаженого файлу
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);
  console.log("Завантажено аватар", urlData, filePath);
  return {
    url: urlData.publicUrl,
    path: filePath,
    name: fileName,
  };
}

export async function deleteAvatar(userId, fileName) {
  const { error } = await supabase.storage
    .from("avatars")
    .remove([`${userId}/${fileName}`]);
  if (error) throw error;
}