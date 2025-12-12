import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, subtitle, context } = body

    if (!type) {
      return NextResponse.json(
        { error: "Type is required" },
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

    // Build prompt based on type
    let prompt = ""
    const systemPrompt = "You are a professional portfolio content writer. Generate concise, engaging content for project portfolios."

    switch (type) {
      case "problem":
        prompt = `Write a compelling problem statement for a project portfolio. 

Project Title: ${title || "A software project"}
${subtitle ? `Subtitle: ${subtitle}` : ""}
${context ? `Context: ${context}` : ""}

Write 2-3 sentences describing the problem this project solves. Be specific and engaging. Focus on the pain points and challenges.`
        break

      case "solution":
        prompt = `Write a solution description for a project portfolio.

Project Title: ${title || "A software project"}
${subtitle ? `Subtitle: ${subtitle}` : ""}
${context ? `Context: ${context}` : ""}
${body.problem ? `Problem: ${body.problem}` : ""}

Write 2-3 sentences describing how this project solves the problem. Be specific about the approach and key features.`
        break

      case "features":
        prompt = `Generate a list of 5-7 key features for a project portfolio.

Project Title: ${title || "A software project"}
${subtitle ? `Subtitle: ${subtitle}` : ""}
${context ? `Context: ${context}` : ""}
${body.problem ? `Problem: ${body.problem}` : ""}
${body.solution ? `Solution: ${body.solution}` : ""}

Return ONLY a JSON array of feature strings, each feature should be a concise bullet point (max 15 words). Example: ["Real-time collaboration", "End-to-end encryption", "Mobile app support"]`
        break

      case "tech":
        prompt = `Suggest a tech stack for a project based on the description.

Project Title: ${title || "A software project"}
${subtitle ? `Subtitle: ${subtitle}` : ""}
${context ? `Context: ${context}` : ""}
${body.problem ? `Problem: ${body.problem}` : ""}
${body.solution ? `Solution: ${body.solution}` : ""}

Return ONLY a JSON array of technology names. Include frontend, backend, database, and any relevant tools. Example: ["Next.js", "TypeScript", "Supabase", "TailwindCSS"]`
        break

      case "subtitle":
        prompt = `Write a compelling one-line subtitle for a project portfolio.

Project Title: ${title || "A software project"}
${context ? `Context: ${context}` : ""}

Write a single, engaging sentence (max 80 characters) that summarizes what this project does.`
        break

      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        )
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using mini for cost efficiency
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: type === "features" || type === "tech" ? 200 : 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenAI API error:", errorData)
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      )
    }

    // Parse response based on type
    let result: string | string[]

    if (type === "features" || type === "tech") {
      // Try to parse as JSON array
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
        } else {
          // Fallback: split by lines or commas
          result = content
            .split(/[,\n]/)
            .map((item: string) => item.trim().replace(/^[-•*]\s*/, "").replace(/^["']|["']$/g, ""))
            .filter((item: string) => item.length > 0)
            .slice(0, type === "features" ? 7 : 10)
        }
      } catch {
        // Fallback parsing
        result = content
          .split(/[,\n]/)
          .map((item: string) => item.trim().replace(/^[-•*]\s*/, "").replace(/^["']|["']$/g, ""))
          .filter((item: string) => item.length > 0)
          .slice(0, type === "features" ? 7 : 10)
      }
    } else {
      // For text content, clean up the response
      result = content.trim().replace(/^["']|["']$/g, "")
    }

    return NextResponse.json({ content: result })
  } catch (error) {
    console.error("Error generating project content:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}



