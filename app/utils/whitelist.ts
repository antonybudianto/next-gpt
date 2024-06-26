const WHITELIST_EMAIL = ["antonybudianto@gmail.com", "huangg.helen@gmail.com"];

export const isWhitelisted = (email: string) =>
  WHITELIST_EMAIL.some((em) => em === email);
