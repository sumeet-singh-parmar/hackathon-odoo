type ClassValue = string | number | bigint | boolean | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter((c): c is string | number | bigint => Boolean(c) && typeof c !== "boolean").join(" ");
}
