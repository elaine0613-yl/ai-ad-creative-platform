export type TaskStatus = "queued" | "processing" | "completed" | "failed";
export type MaterialType = "image" | "video";
export type ComplianceStatus = "passed" | "warning" | "rejected";
export type UserRole = "admin" | "creator" | "viewer";

export interface Template {
  id: string;
  name: string;
  coverUrl: string;
  type: MaterialType;
  industry: string;
  scene: string;
  size: string;
  styleTags: string[];
  popularity: number;
  createdAt: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  slogan: string;
  logoUrl?: string;
  logoPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  logoSizePercent: number;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  isDefault: boolean;
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  thumbnailUrl: string;
  url: string;
  width: number;
  height: number;
  tags: string[];
  folderId?: string;
  version: number;
  complianceStatus?: ComplianceStatus;
  score?: MaterialScore;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialScore {
  total: number;
  quality: number;
  creativity: number;
  compliance: number;
  suggestions: string[];
}

export interface GenerationTask {
  id: string;
  name: string;
  type: MaterialType;
  mode: string;
  status: TaskStatus;
  progress: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface CreativeIdea {
  id: string;
  title: string;
  copywriting: string;
  visualStyle: string;
  composition?: string;
  storyboard?: string;
}

export interface ComplianceResult {
  status: ComplianceStatus;
  items: ComplianceItem[];
}

export interface ComplianceItem {
  id: string;
  type: "text" | "visual" | "copyright";
  severity: "warning" | "error";
  message: string;
  location?: string;
}

export interface ImageGenerateParams {
  industry: string;
  scene: string;
  productName: string;
  mainTitle?: string;
  subTitle?: string;
  sellingPoints?: string;
  promotion?: string;
  style: string;
  mainColor?: string;
  atmosphere?: string;
  width: number;
  height: number;
  count: number;
  brandLock: boolean;
  referenceImageUrl?: string;
}

export interface ImageEditMode {
  id: string;
  name: string;
  description: string;
}

export interface VideoGenerateParams {
  duration: 10 | 15 | 30 | 60;
  aspectRatio: "9:16" | "16:9" | "1:1";
  platform: string;
  productName: string;
  sellingPoints: string;
  marketingInfo?: string;
  style: string;
  withVoiceover: boolean;
  withSubtitle: boolean;
  musicStyle: string;
  useDigitalHuman: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "team";
  credits: number;
  totalCredits: number;
}

export interface PlatformPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  maxSizeMB?: number;
  format?: string;
}

export interface NavSubItem {
  label: string;
  href: string;
  badge?: string;
  /** 预留入口，仅展示占位页 */
  placeholder?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavSubItem[];
}

export type KnowledgeLibraryType = "image" | "video";

export interface KnowledgeCategory {
  id: string;
  library: KnowledgeLibraryType;
  label: string;
  description: string;
  terms: string[];
}

export interface KnowledgeAsset {
  id: string;
  library: KnowledgeLibraryType;
  categoryId: string;
  name: string;
  description: string;
  tags: string[];
  previewColor?: string;
  usageHint?: string;
}

export interface DashboardStats {
  todayGenerated: number;
  weekGenerated: number;
  totalMaterials: number;
  pendingTasks: number;
}
