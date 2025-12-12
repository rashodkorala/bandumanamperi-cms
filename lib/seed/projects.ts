"use server"

import { createClient } from "@/lib/supabase/server"
import type { ProjectInsert } from "@/lib/types/project"

const exampleProjects: ProjectInsert[] = [
  {
    slug: "aetherlabs",
    title: "AetherLabs",
    subtitle: "A modern SaaS platform for team collaboration",
    problem:
      "Teams struggle with fragmented communication tools and lack of centralized project management.",
    solution:
      "AetherLabs provides an all-in-one platform combining real-time chat, project management, and file sharing in a seamless interface.",
    roles: ["Full-stack development", "UI/UX design", "DevOps"],
    features: [
      "Real-time messaging with end-to-end encryption",
      "Kanban board for project management",
      "File sharing and collaboration",
      "Video conferencing integration",
      "Mobile apps for iOS and Android",
    ],
    tech: ["Next.js", "TypeScript", "Supabase", "TailwindCSS", "PostgreSQL"],
    liveUrl: "https://aetherlabs.example.com",
    githubUrl: "https://github.com/user/aetherlabs",
    caseStudyUrl: null,
    coverImageUrl: null,
    galleryImageUrls: [],
    category: "startup",
    status: "published",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "photos-by-rashod",
    title: "Photos by Rashod",
    subtitle: "A photography portfolio and gallery website",
    problem:
      "Photographers need a beautiful, fast, and easy-to-manage portfolio website to showcase their work.",
    solution:
      "A custom-built photography portfolio with advanced filtering, lightbox galleries, and seamless image optimization.",
    roles: ["Full-stack development", "UI/UX design"],
    features: [
      "Dynamic image galleries with lazy loading",
      "Advanced filtering by category, location, and tags",
      "Lightbox viewer for full-screen image viewing",
      "SEO optimized for better discoverability",
      "Responsive design for all devices",
    ],
    tech: ["Next.js", "TypeScript", "Supabase", "TailwindCSS", "Cloudinary"],
    liveUrl: "https://photos.rashodkorala.com",
    githubUrl: null,
    caseStudyUrl: null,
    coverImageUrl: null,
    galleryImageUrls: [],
    category: "personal",
    status: "published",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "claimmate",
    title: "ClaimMate",
    subtitle: "Insurance claim management system",
    problem:
      "Insurance companies need an efficient way to process and track claims while providing transparency to customers.",
    solution:
      "ClaimMate streamlines the entire claims process from submission to resolution with automated workflows and real-time updates.",
    roles: ["Backend development", "API design", "Database architecture"],
    features: [
      "Automated claim processing workflows",
      "Real-time status updates via email and SMS",
      "Document upload and management",
      "Analytics dashboard for claim metrics",
      "Integration with payment processing",
    ],
    tech: [
      "Node.js",
      "Express",
      "PostgreSQL",
      "Redis",
      "AWS S3",
      "Twilio",
    ],
    liveUrl: null,
    githubUrl: null,
    caseStudyUrl: "https://example.com/case-studies/claimmate",
    coverImageUrl: null,
    galleryImageUrls: [],
    category: "client",
    status: "published",
    featured: false,
    sortOrder: 3,
  },
  {
    slug: "metrobus-st-johns-transit",
    title: "MetroBus – St. John's Transit App",
    subtitle: "Real-time public transit tracking for St. John's, NL",
    problem:
      "Residents of St. John's lack a reliable way to track bus locations and arrival times in real-time.",
    solution:
      "A mobile-first web app that provides real-time bus tracking, route planning, and arrival predictions using GPS data.",
    roles: ["Full-stack development", "Mobile development"],
    features: [
      "Real-time bus location tracking",
      "Route planning and directions",
      "Arrival time predictions",
      "Favorite routes and stops",
      "Offline mode for saved routes",
    ],
    tech: [
      "React Native",
      "Next.js",
      "TypeScript",
      "Supabase",
      "Mapbox",
      "GraphQL",
    ],
    liveUrl: "https://metrobus.example.com",
    githubUrl: "https://github.com/user/metrobus",
    caseStudyUrl: null,
    coverImageUrl: null,
    galleryImageUrls: [],
    category: "school",
    status: "published",
    featured: true,
    sortOrder: 4,
  },
]

export async function seedProjects() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to seed projects")
  }

  const results = []

  for (const project of exampleProjects) {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        slug: project.slug,
        title: project.title,
        subtitle: project.subtitle,
        problem: project.problem,
        solution: project.solution,
        roles: project.roles || [],
        features: project.features || [],
        tech: project.tech || [],
        live_url: project.liveUrl,
        github_url: project.githubUrl,
        case_study_url: project.caseStudyUrl,
        cover_image_url: project.coverImageUrl,
        gallery_image_urls: project.galleryImageUrls || [],
        category: project.category,
        status: project.status,
        featured: project.featured,
        sort_order: project.sortOrder,
      })
      .select()
      .single()

    if (error) {
      console.error(`Error seeding project ${project.slug}:`, error)
      results.push({ slug: project.slug, success: false, error: error.message })
    } else {
      results.push({ slug: project.slug, success: true, id: data.id })
    }
  }

  return results
}




