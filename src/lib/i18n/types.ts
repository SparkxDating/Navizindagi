export type Language = "en" | "hi";

export const LANGUAGES: readonly Language[] = ["en", "hi"];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "nzf-language";

export type NestedMessages = {
  [key: string]: string | NestedMessages;
};

export type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type DotPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
    }[keyof T & string];
