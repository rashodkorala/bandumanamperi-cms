# Enhanced Error Handling Implementation Guide

## Overview

This CMS now has comprehensive error handling across all data operations (create, update, delete) with user-friendly error messages. The implementation includes:

1. **Standardized Error Utility Library** - Centralized error types and messages
2. **Enhanced Server Actions** - Better error handling in all CRUD operations
3. **User-Friendly Error Messages** - Clear, actionable messages for users
4. **Error Logging** - Structured error logging for debugging

## What Was Added

### 1. Error Utility Library (`lib/utils/error-handler.ts`)

A comprehensive error handling system that provides:

#### Error Types
- **Authentication Errors**: `UNAUTHORIZED`, `FORBIDDEN`, `SESSION_EXPIRED`
- **Validation Errors**: `VALIDATION_ERROR`, `REQUIRED_FIELD`, `INVALID_FORMAT`, `DUPLICATE_ENTRY`
- **Database Errors**: `NOT_FOUND`, `DATABASE_ERROR`, `CONSTRAINT_VIOLATION`
- **Storage Errors**: `UPLOAD_FAILED`, `FILE_TOO_LARGE`, `INVALID_FILE_TYPE`
- **Network Errors**: `NETWORK_ERROR`, `TIMEOUT`
- **Operation Errors**: `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_FAILED`

#### Key Functions

**`AppError` Class**
```typescript
// Custom error class with user-friendly messages
throw new AppError(
  ErrorType.REQUIRED_FIELD,
  "Artwork title is required.", // User-facing message
  "Missing required field: title", // Technical message
  { context: "additional data" } // Optional context
)
```

**`parseSupabaseError()`**
Automatically converts Supabase database errors into user-friendly messages:
- Detects duplicate entries (unique constraint violations)
- Identifies missing records (404 errors)
- Recognizes permission issues
- Handles foreign key constraints

**`parseStorageError()`**
Converts storage errors into clear messages:
- File size limits
- Invalid file types
- Storage quota issues

**`formatErrorForUser()`**
Ensures error messages are always user-friendly, never technical jargon.

**`logError()`**
Structured error logging with context for debugging.

### 2. Enhanced Server Actions

All CRUD operations in the following files now have comprehensive error handling:

#### Artworks (`lib/actions/artworks.ts`)
- ✅ Validates required fields (title)
- ✅ Validates slug format
- ✅ Checks for duplicate slugs
- ✅ Verifies artwork exists before deletion
- ✅ Checks for foreign key constraints
- ✅ Better collection management errors

#### Pages (`lib/actions/pages.ts`)
- ✅ Validates required fields (title, content)
- ✅ Validates slug format
- ✅ Checks for duplicate slugs
- ✅ Handles storage upload errors
- ✅ Checks for child pages before deletion
- ✅ Cleans up storage files on deletion

#### Blogs (`lib/actions/blogs.ts`)
- ✅ Validates required fields (title, content)
- ✅ Validates slug format
- ✅ Checks for duplicate slugs
- ✅ Verifies blog exists before operations

#### Media (`lib/actions/media.ts`)
- ✅ Validates required fields (title, fileUrl, fileType)
- ✅ Checks if media is in use before deletion
- ✅ Better file upload error messages

#### Performances (`lib/actions/performances.ts`)
- ✅ Validates required fields (title)
- ✅ Handles media file deletion errors gracefully
- ✅ Better storage error messages
- ✅ Validates performance exists before operations

#### Exhibitions (`lib/actions/exhibitions.ts`)
- ✅ Validates required fields (name, venue, dates)
- ✅ Provides batch operation error reporting
- ✅ Counts successes and failures
- ✅ Continues processing on individual failures

## Error Messages Users Will See

### Before (Generic)
```
❌ Failed to create artwork
❌ Failed to delete page
❌ Failed to update blog
```

### After (Specific and Actionable)
```
❌ Artwork title is required.
❌ An artwork with this slug already exists. Please use a different slug.
❌ Cannot delete page because it has child pages. Please delete or reassign the child pages first.
❌ Blog post not found. It may have been deleted.
❌ File is too large. Maximum size is 50MB.
❌ Slug must contain only lowercase letters, numbers, and hyphens.
```

## How Forms Handle Errors

All forms already use toast notifications and will automatically display the new user-friendly error messages:

```typescript
try {
  await createArtwork(artworkData)
  toast.success("Artwork created successfully")
} catch (error) {
  // Now shows detailed, user-friendly messages
  toast.error(
    error instanceof Error ? error.message : "Failed to save artwork"
  )
}
```

## Common Error Scenarios

### 1. Duplicate Slugs
**What happens**: User tries to create/update with an existing slug
**Error shown**: "An artwork with this slug already exists. Please use a different slug."
**User action**: Change the slug to a unique value

### 2. Missing Required Fields
**What happens**: User submits form without required data
**Error shown**: "Artwork title is required."
**User action**: Fill in the required field

### 3. Invalid Formats
**What happens**: User enters invalid slug format
**Error shown**: "Slug must contain only lowercase letters, numbers, and hyphens."
**User action**: Fix the slug format (e.g., "my-artwork-2024")

### 4. Referenced Data
**What happens**: User tries to delete data that's referenced elsewhere
**Error shown**: "Cannot delete page because it has child pages. Please delete or reassign the child pages first."
**User action**: Remove references before deleting

### 5. File Upload Issues
**What happens**: File is too large or wrong type
**Error shown**: "File is too large. Maximum size is 50MB."
**User action**: Reduce file size or choose different file

### 6. Network Issues
**What happens**: Network request fails
**Error shown**: "Network error. Please check your connection and try again."
**User action**: Check internet connection and retry

## Validation Added

### Artwork Operations
- Title must not be empty
- Slug must match pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Artwork must exist for update/delete operations

### Page Operations
- Title must not be empty
- Content must not be empty
- Slug must match pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Cannot delete pages with child pages

### Blog Operations
- Title must not be empty
- Content must not be empty
- Slug must match pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`

### Media Operations
- Title must not be empty
- File URL must not be empty
- File type must not be empty

### Exhibition Operations
- Name must not be empty
- Venue must not be empty
- Dates must be provided
- At least one artwork must be selected

## Error Logging

All errors are now logged with context for debugging:

```typescript
{
  timestamp: "2024-01-01T12:00:00.000Z",
  error: {
    name: "AppError",
    message: "Failed to create artwork",
    stack: "..."
  },
  context: {
    operation: "createArtwork",
    resource: "artwork",
    userId: "...",
    additionalInfo: {}
  }
}
```

## Testing the Error Handling

### Test Scenarios to Try:

1. **Create with missing title**: Leave title empty and submit
2. **Create with duplicate slug**: Use an existing slug
3. **Create with invalid slug**: Use uppercase letters or spaces
4. **Update non-existent item**: Try to update a deleted item
5. **Delete item with dependencies**: Try to delete a page with child pages
6. **Upload oversized file**: Try uploading a file > 50MB
7. **Network failure**: Disconnect internet and try an operation

## Benefits

### For Users
- ✅ Clear understanding of what went wrong
- ✅ Actionable guidance on how to fix issues
- ✅ No technical jargon or cryptic error codes
- ✅ Immediate feedback on validation issues

### For Developers
- ✅ Consistent error handling across all operations
- ✅ Structured error logging for debugging
- ✅ Easy to add new error types
- ✅ Centralized error messages (easy to update)
- ✅ Type-safe error handling with TypeScript

### For Debugging
- ✅ Every error is logged with context
- ✅ Technical details preserved for logs
- ✅ User-friendly messages shown to users
- ✅ Easy to track down issues in production

## Future Enhancements

Consider adding:
1. **Error tracking service integration** (e.g., Sentry)
2. **User error reporting** (let users report bugs)
3. **Retry mechanisms** for network errors
4. **Offline support** with queue for failed operations
5. **Error analytics** to identify common issues

## Maintenance

When adding new operations:
1. Import error handling utilities
2. Wrap operations in try-catch blocks
3. Validate inputs before database operations
4. Use `parseSupabaseError()` for database errors
5. Use `parseStorageError()` for storage errors
6. Log errors with context
7. Throw `AppError` with user-friendly messages

Example:
```typescript
export async function createNewThing(data: ThingInsert): Promise<Thing> {
  try {
    await requireAuth()
    
    // Validate inputs
    if (!data.title?.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Thing title is required.",
        "Missing required field: title"
      )
    }

    const supabase = await createClient()
    const { data: result, error } = await supabase
      .from("things")
      .insert(data)
      .select()
      .single()

    if (error) {
      const appError = parseSupabaseError(error, "create", "Thing")
      logError(appError, { operation: "createThing", data })
      throw appError
    }

    revalidatePath("/protected/things")
    return result
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "createThing", data })
    throw new AppError(
      ErrorType.CREATE_FAILED,
      "Failed to create thing. Please try again.",
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}
```

## Summary

Your CMS now has enterprise-grade error handling that:
- ✅ Provides clear, actionable error messages to users
- ✅ Validates data before operations
- ✅ Handles edge cases gracefully
- ✅ Logs errors for debugging
- ✅ Maintains data integrity
- ✅ Improves user experience significantly

Users will now know exactly what went wrong and how to fix it, rather than seeing generic error messages!

