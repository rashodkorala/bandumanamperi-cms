import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      projectName,
      category,
      oneLineDescription,
      problem,
      targetAudience,
      uniqueSolution,
      mainFeatures,
      userCapabilities,
      technologies,
      frameworks,
      role,
      liveUrl,
      githubUrl,
      caseStudyUrl,
    } = body

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Build comprehensive prompt
    const systemPrompt = `You are a professional portfolio content writer. Generate comprehensive, engaging content for project portfolios based on user-provided information.`

    const userPrompt = `Generate complete project portfolio content based on the following information:

PROJECT INFORMATION:
- Name: ${projectName}
- Category: ${category || "Not specified"}
- One-line description: ${oneLineDescription}
${problem ? `- Problem: ${problem}` : ""}
${targetAudience ? `- Target Audience: ${targetAudience}` : ""}
${uniqueSolution ? `- Unique Solution: ${uniqueSolution}` : ""}
${mainFeatures ? `- Main Features: ${mainFeatures}` : ""}
${userCapabilities ? `- User Capabilities: ${userCapabilities}` : ""}
${technologies ? `- Technologies: ${technologies}` : ""}
${frameworks ? `- Frameworks/Tools: ${frameworks}` : ""}
${role ? `- Role: ${role}` : ""}

Return a JSON object with the following structure:
{
  "title": "Refined project title (max 60 characters)",
  "subtitle": "Compelling one-line subtitle (max 80 characters) that summarizes what the project does",
  "problem": "2-3 sentences describing the problem this project solves. Be specific and engaging. Focus on pain points and challenges.",
  "solution": "2-3 sentences describing how this project solves the problem. Be specific about the approach and key features.",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6", "Feature 7"],
  "tech": ["Technology 1", "Technology 2", "Technology 3", "Technology 4", "Technology 5"],
  "roles": ["Role 1", "Role 2"]
}

Guidelines:
- Title should be professional and match the project name provided
- Subtitle should be engaging and summarize the project in one sentence
- Problem should be compelling and specific
- Solution should clearly explain how the project addresses the problem
- Features should be concise (max 15 words each), specific, and highlight key capabilities
- Tech stack should include frontend, backend, database, and relevant tools mentioned
- Roles should reflect the user's role and responsibilities
- All content should be professional, engaging, and suitable for a portfolio

Return ONLY valid JSON, no markdown or code blocks.`

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
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

    // Parse JSON response
    let parsedData
    try {
      parsedData = JSON.parse(content)
    } catch (error) {
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse generated content" },
        { status: 500 }
      )
    }

    // Process technologies and frameworks into tech array
    let techArray: string[] = []
    if (parsedData.tech && Array.isArray(parsedData.tech)) {
      techArray = parsedData.tech
    } else if (technologies || frameworks) {
      const techList = technologies ? technologies.split(",").map((t: string) => t.trim()) : []
      const frameworkList = frameworks ? frameworks.split(",").map((f: string) => f.trim()) : []
      techArray = [...techList, ...frameworkList].filter(Boolean)
    }

    // Process features
    let featuresArray: string[] = []
    if (parsedData.features && Array.isArray(parsedData.features)) {
      featuresArray = parsedData.features
    } else if (mainFeatures) {
      featuresArray = mainFeatures
        .split(/[,\n]/)
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0)
    }

    // Process roles
    let rolesArray: string[] = []
    if (parsedData.roles && Array.isArray(parsedData.roles)) {
      rolesArray = parsedData.roles
    } else if (role) {
      rolesArray = role.split(",").map((r: string) => r.trim()).filter(Boolean)
    }

    // Return complete project data with URLs
    return NextResponse.json({
      title: parsedData.title || projectName,
      subtitle: parsedData.subtitle || oneLineDescription,
      problem: parsedData.problem || problem || "",
      solution: parsedData.solution || uniqueSolution || "",
      features: featuresArray,
      tech: techArray,
      roles: rolesArray,
      category: category || null,
      liveUrl: liveUrl || "",
      githubUrl: githubUrl || "",
      caseStudyUrl: caseStudyUrl || "",
    })
  } catch (error) {
    console.error("Error generating project from questions:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

