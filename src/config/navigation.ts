import {
  LayoutDashboard,
  Stethoscope,
  HeartPulse,
  CalendarCheck,
  UtensilsCrossed,
  ShoppingCart,
  ChefHat,
  Dumbbell,
  Droplets,
  Moon,
  Pill,
  ShieldCheck,
  FileText,
  Bot,
  Salad,
  BriefcaseMedical,
  AlertTriangle,
  Activity,
  Gauge,
  ClipboardCheck,
  BarChart3,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Full module map (24 modules) grouped for the sidebar. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Health Recovery",
    items: [
      { title: "MCU Management", href: "/mcu", icon: Stethoscope },
      { title: "Health Recovery", href: "/recovery", icon: HeartPulse },
      { title: "Weekly Monitoring", href: "/monitoring", icon: CalendarCheck },
      { title: "Health Index", href: "/health-index", icon: Gauge },
    ],
  },
  {
    label: "Nutrition",
    items: [
      { title: "Meal Planning", href: "/meals", icon: UtensilsCrossed },
      { title: "Grocery Planner", href: "/grocery", icon: ShoppingCart },
      { title: "Meal Prep", href: "/meal-prep", icon: ChefHat },
    ],
  },
  {
    label: "Lifestyle",
    items: [
      { title: "Exercise Planner", href: "/exercise", icon: Dumbbell },
      { title: "Water Tracker", href: "/water", icon: Droplets },
      { title: "Sleep Tracker", href: "/sleep", icon: Moon },
      { title: "Medication", href: "/medication", icon: Pill },
    ],
  },
  {
    label: "AI Agents",
    items: [
      { title: "AI Health Coach", href: "/ai/coach", icon: Bot },
      { title: "AI Nutritionist", href: "/ai/nutritionist", icon: Salad },
      { title: "AI Occ. Physician", href: "/ai/physician", icon: BriefcaseMedical },
      { title: "AI Risk Assessor", href: "/ai/risk", icon: AlertTriangle },
    ],
  },
  {
    label: "Occupational Health",
    items: [
      { title: "Fitness for Work", href: "/ffw", icon: ClipboardCheck },
      { title: "Health Surveillance", href: "/surveillance", icon: ShieldCheck },
      { title: "MAH Risk", href: "/mah-risk", icon: Activity },
      { title: "Medical Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    label: "Governance",
    items: [
      { title: "KPI Dashboard", href: "/kpi", icon: BarChart3 },
      { title: "Management Review", href: "/management-review", icon: ClipboardCheck },
      { title: "Reporting", href: "/reports", icon: FileSpreadsheet },
      { title: "Power BI Export", href: "/powerbi", icon: BarChart3 },
    ],
  },
];
