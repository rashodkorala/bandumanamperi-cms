# AI Photo Analysis Setup

This guide explains how to set up AI-powered photo analysis that automatically fills in photo metadata fields.

## Overview

The AI photo analysis feature uses OpenAI's GPT-4 Vision API to analyze uploaded images and automatically populate:
- **Title**: Descriptive title for the photo
- **Description**: Detailed description of the image content
- **Category**: One of the supported categories (architecture, nature, street, travel, wildlife, night, abstract, interior_spaces)
- **Location**: Location if identifiable in the image
- **Tags**: 3-5 relevant tags
- **Alt Text**: Accessibility-friendly alt text

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the API key (you won't be able to see it again)

### 2. Add API Key to Environment Variables

Add the following to your `.env.local` file (create it if it doesn't exist):

```env
OPENAI_API_KEY=sk-your-api-key-here
```

**Important**: Never commit your `.env.local` file to version control. It should already be in `.gitignore`.

### 3. Restart Development Server

After adding the environment variable, restart your Next.js development server:

```bash
pnpm dev
```

## Usage

1. **Upload a Photo**: Click "New Photo" and select an image file
2. **Click "AI Analyze"**: The button appears next to the image file input after you select a file
3. **Wait for Analysis**: The AI will analyze the image (usually takes 2-5 seconds)
4. **Review & Edit**: The form fields will be automatically populated. Review and adjust as needed
5. **Save**: Submit the form to save the photo with AI-generated metadata

## How It Works

1. When you click "AI Analyze", the selected image is sent to the `/api/analyze-photo` endpoint
2. The API route converts the image to base64 and sends it to OpenAI's GPT-4 Vision API
3. The AI analyzes the image and returns structured JSON with metadata
4. The form fields are automatically populated with the AI-generated data
5. You can review and edit any fields before saving

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WEBP (.webp)
- GIF (.gif)

Maximum file size: 10MB

## Cost Considerations

OpenAI's GPT-4 Vision API charges per image analyzed:
- **Input**: ~$0.01-0.03 per image (depending on image size)
- **Output**: ~$0.01-0.02 per analysis

For example, analyzing 100 photos would cost approximately $2-5.

**Tips to reduce costs**:
- Only use AI analysis when needed
- Review and edit AI-generated content before saving
- Consider using GPT-4o-mini for lower costs (modify the API route)

## Troubleshooting

### "OpenAI API key not configured" Error

- Make sure `OPENAI_API_KEY` is set in your `.env.local` file
- Restart your development server after adding the key
- Check that the key starts with `sk-`

### "Failed to analyze image" Error

- Check your OpenAI account has available credits
- Verify the API key is valid and has proper permissions
- Check the browser console for detailed error messages
- Ensure the image file is valid and not corrupted

### Analysis Takes Too Long

- Large images take longer to process
- Network latency can affect response time
- OpenAI API may be experiencing high load

### Poor Quality Results

- The AI works best with clear, well-lit images
- Complex or abstract images may need manual adjustment
- You can always edit the AI-generated fields before saving

## Customization

### Change AI Model

To use a different OpenAI model (e.g., `gpt-4o-mini` for lower costs), edit `app/api/analyze-photo/route.ts`:

```typescript
model: "gpt-4o-mini", // Change from "gpt-4o"
```

### Adjust Analysis Prompt

Edit the prompt in `app/api/analyze-photo/route.ts` to customize what information the AI extracts:

```typescript
text: `Your custom prompt here...`,
```

### Add More Fields

To extract additional metadata, modify both:
1. The prompt in the API route
2. The form field population in `components/photos/photo-form.tsx`

## Security Notes

- API keys are stored server-side only (in environment variables)
- Images are sent directly to OpenAI and not stored by our API
- The API route validates file types and sizes before processing
- Consider rate limiting in production to prevent abuse

## Alternative AI Services

If you prefer a different AI service, you can modify the API route to use:
- Google Cloud Vision API
- AWS Rekognition
- Azure Computer Vision
- Anthropic Claude (with vision support)

Each service has different pricing and capabilities.

