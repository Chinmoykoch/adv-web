// The API speaks camelCase (imageAlt); the database uses snake_case (image_alt).
const toSnake = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toCamel = (key: string) => key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

export const snakeKeys = (input: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined).map(([key, value]) => [toSnake(key), value]));

export const camelKeys = <T = Record<string, unknown>>(row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([key, value]) => [toCamel(key), value])) as T;

// Column lists for select(), written in camelCase like the rest of the API.
export const columns = (keys: readonly string[]) => keys.map(toSnake).join(",");
