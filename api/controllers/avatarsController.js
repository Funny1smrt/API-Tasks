import { supabase } from "../config/supabase.js";

export async function getAvatar(userId) {
  const { data, error } = await supabase.storage
    .from("avatars")
    .list(`${userId}/`); // Отримати список, щоб знайти файл

  if (error) throw error;

  // Якщо немає файлів або папка порожня, повертаємо null
  if (!data || data.length === 0) {
    return null;
  }

  // 🛑 КРИТИЧНА ЗМІНА: Оскільки uploadAvatar перезаписує,
  // в папці повинен бути лише один файл, або ми беремо перший знайдений.
  const avatarFile = data[0];

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(`${userId}/${avatarFile.name}`);
    console.log(urlData.publicUrl);

  return {
    name: avatarFile.name,
    url: urlData.publicUrl,
  };
}

export async function uploadAvatar(userId, file) {
  // 🛑 КРИТИЧНА ЗМІНА: Використовуємо ФІКСОВАНУ назву файлу (наприклад, 'avatar.jpeg')
  // Витягуємо розширення файлу для уникнення проблем з типом MIME
  const extension = file.originalname.split(".").pop();
  const fileName = `avatar.${extension}`;

  // Шлях до файлу завжди буде ОДНАКОВИЙ: [userId]/avatar.jpeg
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true, // Ця опція забезпечить перезапис старого файлу
    });

  if (error) throw error;

  // Отримуємо публічний URL для щойно завантаженого файлу
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);
    console.log(urlData.publicUrl);
  return {
    url: urlData.publicUrl,
    path: filePath,
    name: fileName,
  };
}