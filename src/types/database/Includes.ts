export type IncludesType<Type extends Record<string, any>> = (keyof Type | "*")[]