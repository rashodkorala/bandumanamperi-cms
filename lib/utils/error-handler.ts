/**
 * Error handling utilities for the CMS
 * Provides standardized error types and user-friendly error messages
 */

// Error types that can occur in the application
export enum ErrorType {
  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  REQUIRED_FIELD = "REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  
  // Database errors
  NOT_FOUND = "NOT_FOUND",
  DATABASE_ERROR = "DATABASE_ERROR",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
  
  // Storage errors
  UPLOAD_FAILED = "UPLOAD_FAILED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  STORAGE_QUOTA_EXCEEDED = "STORAGE_QUOTA_EXCEEDED",
  
  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  
  // Operation errors
  CREATE_FAILED = "CREATE_FAILED",
  UPDATE_FAILED = "UPDATE_FAILED",
  DELETE_FAILED = "DELETE_FAILED",
  
  // Generic errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Custom error class with additional context
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly context?: Record<string, any>
  public readonly userMessage: string
  public readonly technicalMessage: string

  constructor(
    type: ErrorType,
    userMessage: string,
    technicalMessage?: string,
    context?: Record<string, any>
  ) {
    super(technicalMessage || userMessage)
    this.type = type
    this.userMessage = userMessage
    this.technicalMessage = technicalMessage || userMessage
    this.context = context
    this.name = "AppError"
  }
}

// Error message templates for different operations
export const ErrorMessages = {
  // Authentication
  UNAUTHORIZED: "You must be logged in to perform this action.",
  FORBIDDEN: "You don't have permission to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  
  // Artwork errors
  ARTWORK_NOT_FOUND: "Artwork not found. It may have been deleted.",
  ARTWORK_CREATE_FAILED: "Failed to create artwork. Please check your input and try again.",
  ARTWORK_UPDATE_FAILED: "Failed to update artwork. Please try again.",
  ARTWORK_DELETE_FAILED: "Failed to delete artwork. It may be referenced by other data.",
  ARTWORK_DUPLICATE_SLUG: "An artwork with this slug already exists. Please use a different slug.",
  
  // Page errors
  PAGE_NOT_FOUND: "Page not found. It may have been deleted.",
  PAGE_CREATE_FAILED: "Failed to create page. Please check your input and try again.",
  PAGE_UPDATE_FAILED: "Failed to update page. Please try again.",
  PAGE_DELETE_FAILED: "Failed to delete page. It may have child pages.",
  PAGE_DUPLICATE_SLUG: "A page with this slug already exists. Please use a different slug.",
  PAGE_STORAGE_FAILED: "Failed to save page files to storage. Please try again.",
  
  // Blog errors
  BLOG_NOT_FOUND: "Blog post not found. It may have been deleted.",
  BLOG_CREATE_FAILED: "Failed to create blog post. Please check your input and try again.",
  BLOG_UPDATE_FAILED: "Failed to update blog post. Please try again.",
  BLOG_DELETE_FAILED: "Failed to delete blog post. Please try again.",
  BLOG_DUPLICATE_SLUG: "A blog post with this slug already exists. Please use a different slug.",
  
  // Media errors
  MEDIA_NOT_FOUND: "Media file not found. It may have been deleted.",
  MEDIA_CREATE_FAILED: "Failed to upload media. Please check the file and try again.",
  MEDIA_UPDATE_FAILED: "Failed to update media. Please try again.",
  MEDIA_DELETE_FAILED: "Failed to delete media. It may be used by other content.",
  MEDIA_UPLOAD_FAILED: "Failed to upload file to storage. Please check your connection and try again.",
  MEDIA_FILE_TOO_LARGE: "File is too large. Please upload a smaller file.",
  MEDIA_INVALID_TYPE: "Invalid file type. Please upload a supported file format.",
  
  // Performance errors
  PERFORMANCE_NOT_FOUND: "Performance not found. It may have been deleted.",
  PERFORMANCE_CREATE_FAILED: "Failed to create performance. Please check your input and try again.",
  PERFORMANCE_UPDATE_FAILED: "Failed to update performance. Please try again.",
  PERFORMANCE_DELETE_FAILED: "Failed to delete performance. Please try again.",
  PERFORMANCE_MEDIA_DELETE_FAILED: "Failed to delete performance media. Please try again.",
  
  // Exhibition errors
  EXHIBITION_NOT_FOUND: "Exhibition not found.",
  EXHIBITION_UPDATE_FAILED: "Failed to update exhibition. Please try again.",
  EXHIBITION_DELETE_FAILED: "Failed to delete exhibition. It may be referenced by artworks.",
  
  // Collection errors
  COLLECTION_NOT_FOUND: "Collection not found.",
  COLLECTION_CREATE_FAILED: "Failed to create collection. Please try again.",
  COLLECTION_UPDATE_FAILED: "Failed to update collection. Please try again.",
  COLLECTION_DELETE_FAILED: "Failed to delete collection. Please try again.",
  COLLECTION_NAME_REQUIRED: "Collection name is required.",
  COLLECTION_NO_ARTWORKS: "Please select at least one artwork for the collection.",
  
  // Validation errors
  REQUIRED_FIELD: "This field is required.",
  INVALID_FORMAT: "Invalid format. Please check your input.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_URL: "Please enter a valid URL.",
  INVALID_DATE: "Please enter a valid date.",
  
  // Network errors
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  TIMEOUT: "Request timed out. Please try again.",
  
  // Generic errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  FETCH_FAILED: "Failed to load data. Please refresh the page.",
}

/**
 * Parse Supabase error and return a user-friendly error
 */
export function parseSupabaseError(
  error: any,
  operation: "create" | "update" | "delete" | "fetch",
  resource: string
): AppError {
  // Check for specific error codes
  if (error.code === "PGRST116") {
    return new AppError(
      ErrorType.NOT_FOUND,
      `${resource} not found. It may have been deleted.`,
      error.message,
      { code: error.code }
    )
  }

  if (error.code === "23505") {
    // Unique constraint violation
    return new AppError(
      ErrorType.DUPLICATE_ENTRY,
      `A ${resource.toLowerCase()} with this value already exists.`,
      error.message,
      { code: error.code }
    )
  }

  if (error.code === "23503") {
    // Foreign key constraint violation
    return new AppError(
      ErrorType.CONSTRAINT_VIOLATION,
      `Cannot ${operation} ${resource.toLowerCase()} because it is referenced by other data.`,
      error.message,
      { code: error.code }
    )
  }

  if (error.code === "42501") {
    // Insufficient privilege
    return new AppError(
      ErrorType.FORBIDDEN,
      `You don't have permission to ${operation} this ${resource.toLowerCase()}.`,
      error.message,
      { code: error.code }
    )
  }

  // Check for storage errors
  if (error.error === "Payload too large") {
    return new AppError(
      ErrorType.FILE_TOO_LARGE,
      ErrorMessages.MEDIA_FILE_TOO_LARGE,
      error.message
    )
  }

  if (error.statusCode === "413") {
    return new AppError(
      ErrorType.FILE_TOO_LARGE,
      ErrorMessages.MEDIA_FILE_TOO_LARGE,
      error.message
    )
  }

  // Check for network errors
  if (error.message?.includes("fetch") || error.message?.includes("network")) {
    return new AppError(
      ErrorType.NETWORK_ERROR,
      ErrorMessages.NETWORK_ERROR,
      error.message
    )
  }

  // Default to operation-specific error
  const operationMessages = {
    create: `Failed to create ${resource.toLowerCase()}. Please check your input and try again.`,
    update: `Failed to update ${resource.toLowerCase()}. Please try again.`,
    delete: `Failed to delete ${resource.toLowerCase()}. Please try again.`,
    fetch: `Failed to load ${resource.toLowerCase()}. Please refresh the page.`,
  }

  return new AppError(
    operation === "create"
      ? ErrorType.CREATE_FAILED
      : operation === "update"
      ? ErrorType.UPDATE_FAILED
      : operation === "delete"
      ? ErrorType.DELETE_FAILED
      : ErrorType.DATABASE_ERROR,
    operationMessages[operation],
    error.message || "Unknown database error",
    { originalError: error }
  )
}

/**
 * Parse storage upload error
 */
export function parseStorageError(error: any, fileName?: string): AppError {
  if (error.error === "Payload too large" || error.statusCode === "413") {
    return new AppError(
      ErrorType.FILE_TOO_LARGE,
      `File ${fileName ? `"${fileName}" ` : ""}is too large. Maximum size is 50MB.`,
      error.message
    )
  }

  if (error.statusCode === "415") {
    return new AppError(
      ErrorType.INVALID_FILE_TYPE,
      `File type not supported. Please upload a valid image or document.`,
      error.message
    )
  }

  if (error.message?.includes("not found")) {
    return new AppError(
      ErrorType.NOT_FOUND,
      `Storage bucket not found. Please contact support.`,
      error.message
    )
  }

  return new AppError(
    ErrorType.UPLOAD_FAILED,
    `Failed to upload ${fileName ? `"${fileName}"` : "file"}. Please try again.`,
    error.message || "Unknown storage error",
    { originalError: error }
  )
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): AppError | null {
  const missingFields = requiredFields.filter(
    (field) => !data[field] || (typeof data[field] === "string" && !data[field].trim())
  )

  if (missingFields.length > 0) {
    return new AppError(
      ErrorType.REQUIRED_FIELD,
      `Required fields are missing: ${missingFields.join(", ")}`,
      `Missing required fields: ${missingFields.join(", ")}`,
      { missingFields }
    )
  }

  return null
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage
  }

  if (error instanceof Error) {
    // Check if it's a network error
    if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
      return ErrorMessages.NETWORK_ERROR
    }

    // Return the error message if it looks user-friendly
    if (error.message.length < 200 && !error.message.includes("Error:")) {
      return error.message
    }
  }

  return ErrorMessages.UNKNOWN_ERROR
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: {
    operation?: string
    resource?: string
    userId?: string
    additionalInfo?: Record<string, any>
  }
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
  }

  console.error("[Error Handler]", JSON.stringify(errorInfo, null, 2))
  
  // TODO: In production, send to error tracking service (e.g., Sentry)
}

/**
 * Prepare error for user reporting
 */
export function prepareErrorReport(
  error: unknown,
  context?: Record<string, any>
): {
  message: string
  stack?: string
  type: string
  context: Record<string, any>
} {
  if (error instanceof AppError) {
    return {
      message: error.userMessage,
      stack: error.stack,
      type: error.type,
      context: {
        technicalMessage: error.technicalMessage,
        ...error.context,
        ...context,
      },
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      type: error.name || "Error",
      context: context || {},
    }
  }

  return {
    message: String(error),
    type: "UnknownError",
    context: context || {},
  }
}

