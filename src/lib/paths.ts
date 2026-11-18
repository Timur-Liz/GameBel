// Путь сайта (на GitHub Pages игра открывается по адресу /имя-репозитория/)
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Статическая версия (обычный сайт без сервера): без аккаунтов, рейтинга и классов */
export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC === "1";

/** Путь к файлу из папки public. В статической версии — относительный, чтобы сайт работал из любой папки. */
export const asset = (p: string) => (!p.startsWith("/") ? p : IS_STATIC ? p.slice(1) : BASE + p);
