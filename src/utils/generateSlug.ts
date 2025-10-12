// Utility function to generate a clean unique slug
export const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-"); // replace spaces with dash

  const uniqueSuffix = Math.random().toString(36).substring(2, 7); // short random string
  return `${baseSlug}-${uniqueSuffix}`;
};