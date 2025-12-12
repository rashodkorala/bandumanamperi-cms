"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconSparkles, IconLoader, IconArrowRight, IconArrowLeft } from "@tabler/icons-react"
import type { ProjectCategory } from "@/lib/types/project"

interface QuestionnaireAnswers {
  projectName: string
  category: ProjectCategory | null
  oneLineDescription: string
  problem: string
  targetAudience: string
  uniqueSolution: string
  mainFeatures: string
  userCapabilities: string
  technologies: string
  frameworks: string
  role: string
  liveUrl: string
  githubUrl: string
  caseStudyUrl: string
}

interface ProjectQuestionnaireProps {
  open: boolean
  onClose: () => void
  onGenerate: (answers: QuestionnaireAnswers) => Promise<void>
}

const STEPS = [
  { id: 1, title: "Basic Information" },
  { id: 2, title: "Problem & Solution" },
  { id: 3, title: "Features & Functionality" },
  { id: 4, title: "Technical Details" },
  { id: 5, title: "Links & Resources" },
]

export function ProjectQuestionnaire({ open, onClose, onGenerate }: ProjectQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    projectName: "",
    category: null,
    oneLineDescription: "",
    problem: "",
    targetAudience: "",
    uniqueSolution: "",
    mainFeatures: "",
    userCapabilities: "",
    technologies: "",
    frameworks: "",
    role: "",
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  })

  const updateAnswer = (field: keyof QuestionnaireAnswers, value: string | ProjectCategory | null) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    // Validate required fields
    if (!answers.projectName.trim()) {
      toast.error("Please enter a project name")
      return
    }
    if (!answers.oneLineDescription.trim()) {
      toast.error("Please describe what your project does")
      return
    }

    setIsGenerating(true)
    try {
      await onGenerate(answers)
      onClose()
      // Reset form
      setCurrentStep(1)
      setAnswers({
        projectName: "",
        category: null,
        oneLineDescription: "",
        problem: "",
        targetAudience: "",
        uniqueSolution: "",
        mainFeatures: "",
        userCapabilities: "",
        technologies: "",
        frameworks: "",
        role: "",
        liveUrl: "",
        githubUrl: "",
        caseStudyUrl: "",
      })
    } catch (error) {
      toast.error("Failed to generate project content")
    } finally {
      setIsGenerating(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">What is the name of your project? *</Label>
              <Input
                id="projectName"
                value={answers.projectName}
                onChange={(e) => updateAnswer("projectName", e.target.value)}
                placeholder="e.g., My Startup, Portfolio Website"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">What category is it? *</Label>
              <Select
                value={answers.category || ""}
                onValueChange={(value) => updateAnswer("category", value as ProjectCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="oneLineDescription">What does it do in one sentence? *</Label>
              <Textarea
                id="oneLineDescription"
                value={answers.oneLineDescription}
                onChange={(e) => updateAnswer("oneLineDescription", e.target.value)}
                placeholder="A brief description of what your project does..."
                rows={3}
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="problem">What problem does it solve?</Label>
              <Textarea
                id="problem"
                value={answers.problem}
                onChange={(e) => updateAnswer("problem", e.target.value)}
                placeholder="Describe the problem or challenge your project addresses..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="targetAudience">Who is your target audience?</Label>
              <Input
                id="targetAudience"
                value={answers.targetAudience}
                onChange={(e) => updateAnswer("targetAudience", e.target.value)}
                placeholder="e.g., Small businesses, Freelancers, Students"
              />
            </div>
            <div>
              <Label htmlFor="uniqueSolution">What makes your solution unique?</Label>
              <Textarea
                id="uniqueSolution"
                value={answers.uniqueSolution}
                onChange={(e) => updateAnswer("uniqueSolution", e.target.value)}
                placeholder="What sets your project apart from alternatives?"
                rows={3}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mainFeatures">What are the main features?</Label>
              <Textarea
                id="mainFeatures"
                value={answers.mainFeatures}
                onChange={(e) => updateAnswer("mainFeatures", e.target.value)}
                placeholder="List the key features or capabilities (one per line or comma-separated)..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="userCapabilities">What can users do with it?</Label>
              <Textarea
                id="userCapabilities"
                value={answers.userCapabilities}
                onChange={(e) => updateAnswer("userCapabilities", e.target.value)}
                placeholder="Describe what users can accomplish with your project..."
                rows={3}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="technologies">What technologies did you use?</Label>
              <Input
                id="technologies"
                value={answers.technologies}
                onChange={(e) => updateAnswer("technologies", e.target.value)}
                placeholder="e.g., React, Node.js, PostgreSQL, AWS"
              />
            </div>
            <div>
              <Label htmlFor="frameworks">Any specific frameworks or tools?</Label>
              <Input
                id="frameworks"
                value={answers.frameworks}
                onChange={(e) => updateAnswer("frameworks", e.target.value)}
                placeholder="e.g., Next.js, TailwindCSS, Supabase"
              />
            </div>
            <div>
              <Label htmlFor="role">What was your role?</Label>
              <Input
                id="role"
                value={answers.role}
                onChange={(e) => updateAnswer("role", e.target.value)}
                placeholder="e.g., Founder & Developer, Lead Designer, Full-stack Developer"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="liveUrl">Live Website URL (optional)</Label>
              <Input
                id="liveUrl"
                type="url"
                value={answers.liveUrl}
                onChange={(e) => updateAnswer("liveUrl", e.target.value)}
                placeholder="https://yourproject.com"
              />
            </div>
            <div>
              <Label htmlFor="githubUrl">GitHub Repository (optional)</Label>
              <Input
                id="githubUrl"
                type="url"
                value={answers.githubUrl}
                onChange={(e) => updateAnswer("githubUrl", e.target.value)}
                placeholder="https://github.com/username/project"
              />
            </div>
            <div>
              <Label htmlFor="caseStudyUrl">Case Study or Detailed Write-up (optional)</Label>
              <Input
                id="caseStudyUrl"
                type="url"
                value={answers.caseStudyUrl}
                onChange={(e) => updateAnswer("caseStudyUrl", e.target.value)}
                placeholder="https://yourblog.com/case-study"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tell us about your project</DialogTitle>
          <DialogDescription>
            Answer a few questions and we'll generate all the content for you using AI
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-muted"
                }`}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4">{STEPS[currentStep - 1].title}</h3>
          {renderStepContent()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <IconArrowLeft className="size-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <IconArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <IconLoader className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <IconSparkles className="size-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

