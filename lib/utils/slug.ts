/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): boolean {
  // Slug should be lowercase, alphanumeric with hyphens, no spaces
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 255
}

/**
 * Ensure slug is unique by appending a number if needed
 * This is a client-side helper - actual uniqueness should be checked server-side
 */
export function ensureUniqueSlug(
  slug: string,
  existingSlugs: string[]
): string {
  let uniqueSlug = slug
  let counter = 1

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  return uniqueSlug
}




