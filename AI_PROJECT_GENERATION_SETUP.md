# AI Project Content Generation Setup

This guide explains how to use the AI-powered project content generation feature in your CMS.

## Overview

The AI Project Generation feature uses OpenAI's GPT-4o-mini to automatically generate comprehensive project content based on your answers to a simple questionnaire. This saves time and ensures professional, portfolio-ready descriptions.

## Prerequisites

- OpenAI API account
- OpenAI API key with GPT-4o-mini access
- Credits in your OpenAI account

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Copy the API key (starts with `sk-`)

### 2. Add to Environment Variables

Add your API key to `.env.local`:

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

### AI Questionnaire Flow

1. **Navigate to Projects**
   - Go to `/protected/projects` in your CMS
   - Click **New Project**

2. **Start Questionnaire**
   - Click **"Use AI Questionnaire (Optional)"** button in the form header
   - A multi-step questionnaire dialog will open

3. **Answer Questions**
   
   **Step 1: Basic Information**
   - Project name (required)
   - Category: startup, client, personal, or school (required)
   - One-line description (required)
   
   **Step 2: Problem & Solution**
   - What problem does it solve?
   - Who is your target audience?
   - What makes your solution unique?
   
   **Step 3: Features & Functionality**
   - What are the main features?
   - What can users do with it?
   
   **Step 4: Technical Details**
   - What technologies did you use?
   - Any specific frameworks or tools?
   - What was your role?
   
   **Step 5: Links & Resources**
   - Live website URL (optional)
   - GitHub repository (optional)
   - Case study URL (optional)

4. **Generate Content**
   - Click **"Generate with AI"** button
   - Wait for AI processing (usually 2-5 seconds)
   - All form fields will be automatically populated

5. **Review & Refine**
   - Review the generated content
   - Edit any fields as needed
   - Upload images
   - Add any missing information

6. **Save Project**
   - Click **Create Project** to save

### Individual Field Generation

You can also generate individual fields without using the questionnaire:

1. Open the project form
2. Fill in the project title
3. Click the **AI Generate** button next to any field:
   - Subtitle
   - Problem statement
   - Solution description
   - Features list
   - Tech stack
4. Review and adjust the generated content

## What Gets Generated

The AI generates the following fields:

- **Title**: Refined project title (based on your input)
- **Subtitle**: Compelling one-line description (max 80 characters)
- **Problem**: 2-3 sentence problem statement
- **Solution**: 2-3 sentence solution description
- **Features**: Array of 5-7 key features
- **Tech**: Array of technologies (frontend, backend, database, tools)
- **Roles**: Array of your roles in the project

## Tips for Best Results

1. **Be Specific**: Provide detailed answers in the questionnaire
2. **Include Context**: Mention your target audience and unique value proposition
3. **List Technologies**: Include all technologies, frameworks, and tools you used
4. **Review Generated Content**: Always review and refine AI-generated content
5. **Combine Methods**: Use questionnaire for initial generation, then refine manually

## Cost Considerations

- **GPT-4o-mini** pricing: ~$0.001-0.002 per generation
- Questionnaire generates all fields in one API call (cost-effective)
- Individual field generation makes separate API calls
- Consider using questionnaire for better value

## Troubleshooting

### API Key Not Working

- Verify the key is correct in `.env.local`
- Check that the key has GPT-4o-mini access
- Ensure you have credits in your OpenAI account
- Restart the development server after adding the key

### Generation Fails

- Check browser console for errors
- Verify OpenAI API is accessible
- Check your OpenAI account for rate limits
- Ensure you have sufficient credits

### Generated Content Not Good

- Provide more detailed answers in the questionnaire
- Try regenerating specific fields individually
- Manually edit the generated content
- The AI provides a starting point - always refine it

## How It Works

1. **Question Collection**: Your answers are collected through the 5-step questionnaire
2. **Prompt Building**: A comprehensive prompt is built with all your answers
3. **AI Processing**: GPT-4o-mini analyzes your answers and generates content
4. **Response Parsing**: The JSON response is parsed and validated
5. **Form Population**: All fields are automatically filled in the form

## API Endpoint

The feature uses the `/api/generate-project-from-questions` endpoint:

- **Method**: POST
- **Body**: JSON with questionnaire answers
- **Response**: Complete project data (all fields)

## Best Practices

1. **Use Questionnaire for New Projects**: Fastest way to get started
2. **Review Before Saving**: Always review AI-generated content
3. **Refine as Needed**: Edit generated content to match your style
4. **Combine with Manual Entry**: Use AI for initial content, then add details manually
5. **Save Time**: Use questionnaire when creating multiple projects

## Examples

### Example Questionnaire Answers

**Step 1:**
- Name: "TaskFlow"
- Category: "startup"
- Description: "A project management tool for remote teams"

**Step 2:**
- Problem: "Remote teams struggle with task coordination"
- Audience: "Remote teams and freelancers"
- Unique: "AI-powered task prioritization"

**Result**: AI generates professional problem/solution statements, feature list, tech stack, and more!

---

For more information, see the [Projects Management documentation](/protected/docs/features/projects).

