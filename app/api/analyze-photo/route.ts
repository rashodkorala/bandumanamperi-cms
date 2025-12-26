import { NextRequest, NextResponse } from "next/server"
import { verifyApiAuth } from "@/lib/auth/verify-auth"

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const { user, error: authError } = await verifyApiAuth(request)
        if (authError || !user) {
            return NextResponse.json(
                { error: authError || "Unauthorized" },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            )
        }

        // Check if OpenAI API key is configured
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            )
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString("base64")
        const mimeType = file.type

        // Call OpenAI Vision API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this image and provide metadata in JSON format. Return ONLY valid JSON with no markdown or code blocks. Use this exact structure:
{
  "title": "A descriptive title for the photo for eg if it is a photo of a sunset, the title should be 'Sunset over Mountains' if its a landmark the title should be the name of the landmark(max 60 characters)",
  "description": "A detailed description of what's in the image. should be in the point of photographer.  (2-3 sentences)",
  "category": "One of: architecture, nature, street, travel, wildlife, night, abstract, or interior_spaces",
  "location": "Location if visible/identifiable, or null",
  "tags": ["tag1", "tag2", "tag3"] (3-5 relevant tags),
  "alt_text": "Detailed alt text for accessibility (describes the image content)"
}

Focus on:
- What is the main subject?
- What is the mood/atmosphere?
- What category best fits this image?
- What are the key visual elements?
- Where might this be located (if identifiable)?`,
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("OpenAI API error:", errorData)
            return NextResponse.json(
                { error: "Failed to analyze image" },
                { status: response.status }
            )
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content

        if (!content) {
            return NextResponse.json(
                { error: "No analysis result" },
                { status: 500 }
            )
        }

        // Parse JSON response (handle if wrapped in markdown code blocks)
        let parsedData
        try {
            // Try to extract JSON from markdown code blocks if present
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/)
            const jsonString = jsonMatch ? jsonMatch[1] : content
            parsedData = JSON.parse(jsonString)
        } catch {
            console.error("Failed to parse AI response:", content)
            // Fallback: try to extract fields manually
            parsedData = {
                title: extractField(content, "title") || "Untitled Photo",
                description: extractField(content, "description") || "",
                category: extractField(content, "category") || "abstract",
                location: extractField(content, "location") || null,
                tags: extractArray(content, "tags") || [],
                alt_text: extractField(content, "alt_text") || "",
            }
        }

        // Validate and normalize category
        const validCategories = [
            "architecture",
            "nature",
            "street",
            "travel",
            "wildlife",
            "night",
            "abstract",
            "interior_spaces",
        ]
        if (!validCategories.includes(parsedData.category?.toLowerCase())) {
            parsedData.category = "abstract"
        } else {
            parsedData.category = parsedData.category.toLowerCase()
        }

        return NextResponse.json(parsedData)
    } catch (error) {
        console.error("Error analyzing photo:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}

// Helper function to extract field from text
function extractField(text: string, field: string): string | null {
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, "i")
    const match = text.match(regex)
    return match ? match[1] : null
}

// Helper function to extract array from text
function extractArray(text: string, field: string): string[] {
    const regex = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]+)\\]`, "i")
    const match = text.match(regex)
    if (!match) return []
    return match[1]
        .split(",")
        .map((tag) => tag.trim().replace(/^"|"$/g, ""))
        .filter(Boolean)
}

