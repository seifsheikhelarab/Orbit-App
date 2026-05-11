export type ResumeType = "RESUME" | "COVER_LETTER"

export interface ResumeSettings {
  template: "modern" | "professional" | "minimal"
  color: string
  fontSize: "small" | "medium" | "large"
  lineSpacing: "compact" | "normal" | "relaxed"
  margin: "narrow" | "normal" | "wide"
}

export interface CoverLetterContent {
  senderName: string
  recipientName: string
  recipientTitle: string
  company: string
  address: string
  email: string
  opening: string
  body: string
  closing: string
  signature: string
  jobPostingUrl?: string
}

export const defaultCoverLetterContent: CoverLetterContent = {
  senderName: "",
  recipientName: "",
  recipientTitle: "",
  company: "",
  address: "",
  email: "",
  opening: "I am writing to express my enthusiastic interest in the open position at your company.",
  body: "With my background in software development and passion for building great products, I believe I would be a strong addition to your team.",
  closing: "Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team's success.",
  signature: "Best regards,",
}

export interface ResumeData {
  settings: ResumeSettings
  basics: {
    name: string
    label: string
    email: string
    phone: string
    url: string
    summary: string
    location: string
    profiles: { network: string; username: string; url: string }[]
  }
  work: {
    company: string
    position: string
    website?: string
    startDate: string
    endDate: string
    summary?: string
    highlights: string
  }[]
  projects: {
    name: string
    description: string
    highlights: string
    url: string
    startDate: string
    endDate: string
  }[]
  volunteer: {
    organization: string
    position: string
    startDate: string
    endDate: string
    highlights: string
  }[]
  education: {
    institution: string
    area: string
    studyType: string
    startDate: string
    endDate: string
    score: string
  }[]
  skills: {
    name: string
    level: string
    keywords: string
  }[]
  languages: {
    name: string
    fluency: string
    highlights: string
    startDate: string
  }[]
  certifications: {
    name: string
    issuer: string
    startDate: string
    endDate: string
    url: string
    highlights: string
  }[]
}

export const defaultResumeData: ResumeData = {
  settings: {
    template: "modern",
    color: "#1e3a8a", // default fallback accent color
    fontSize: "medium",
    lineSpacing: "normal",
    margin: "normal",
  },
  basics: {
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    summary: "",
    location: "",
    profiles: [],
  },
  work: [],
  education: [],
  skills: [],
  projects: [],
  volunteer: [],
  languages: [],
  certifications: [],
}
