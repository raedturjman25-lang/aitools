import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const templatesDir = resolve(root, "templates");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractMatch(content, regex, fallback = "") {
  const match = content.match(regex);
  return match ? match[1].trim() : fallback;
}

function extractTitle(content, fallbackTitle) {
  return extractMatch(content, /<h1>([\s\S]*?)<\/h1>/, fallbackTitle);
}

function normalizeTemplateName(title) {
  return title
    .replace(/\s*[—|].*$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function eolFor(content) {
  return content.includes("\r\n") ? "\r\n" : "\n";
}

function joinLines(values, eol) {
  return values.join(eol);
}

function getTemplatePathParts(filePath) {
  const parts = filePath.split(/[\\/]/);
  const templatesIndex = parts.lastIndexOf("templates");

  if (templatesIndex === -1) {
    return { category: "general", slug: null };
  }

  const category = parts[templatesIndex + 1] || "general";
  const maybeSlug = parts[templatesIndex + 2] || null;
  const slug = maybeSlug && !maybeSlug.endsWith(".html") ? maybeSlug : null;

  return { category, slug };
}

const categoryProfiles = {
  business: {
    role: "business operations leader and strategy consultant",
    audience: "founders, operators, managers, and internal teams",
    tone: "clear, practical, and decision-ready"
  },
  marketing: {
    role: "performance marketer and direct-response copywriter",
    audience: "marketers, founders, and growth teams",
    tone: "persuasive, specific, and conversion-focused"
  },
  linkedin: {
    role: "LinkedIn growth strategist and personal branding copywriter",
    audience: "professionals, founders, and creators building authority",
    tone: "credible, sharp, and human"
  },
  youtube: {
    role: "YouTube strategist and retention-focused creator coach",
    audience: "video creators, channel owners, and content teams",
    tone: "engaging, structured, and audience-first"
  },
  students: {
    role: "academic writing coach and study-skills tutor",
    audience: "students and researchers",
    tone: "clear, supportive, and structured"
  },
  writing: {
    role: "editorial lead and content strategist",
    audience: "writers, marketers, and publishing teams",
    tone: "polished, concise, and publication-ready"
  }
};

const promptBlueprints = {
  business: {
    "budget-planning-template": {
      role: "CFO and FP&A lead",
      tone: "analytical, numbers-first, and practical",
      task: "Build a realistic budget plan that includes assumptions, allocations, tradeoffs, and a review cadence.",
      inputs: [
        "Business model: [B2B/B2C/SaaS/ecommerce/service/etc]",
        "Time period: [monthly/quarterly/annual]",
        "Revenue target or forecast: [number + currency]",
        "Current costs (fixed + variable): [list or totals]",
        "Planned initiatives (hiring, ads, tooling): [what and when]",
        "Constraints: [runway, cash limits, must-keep items]",
        "Risk tolerance: [low/medium/high]",
        "Notes / links: [optional context]"
      ],
      outputs: [
        "Assumptions (revenue drivers, seasonality, headcount, cost inflation) + 2 scenarios (base + downside)",
        "Budget table by category (with totals) and rationale for each allocation",
        "Cost controls and tradeoffs (what to cut first, what to protect)",
        "Cash-flow / runway view (key cash risks and triggers)",
        "Review cadence (weekly/monthly) with KPIs and decision rules"
      ],
      rules: [
        "Prefer ranges when data is uncertain.",
        "Flag any assumptions that materially change the plan.",
        "Keep categories practical (tools, payroll, marketing, ops, contractors, taxes, etc.)."
      ]
    },
    "business-email-template": {
      role: "executive communications coach",
      tone: "professional, concise, and easy to scan",
      task: "Draft a business email that is clear, action-ready, and respectful of the recipient's time.",
      inputs: [
        "Sender role: [your role]",
        "Recipient: [name + role]",
        "Relationship: [new contact / client / internal / manager]",
        "Purpose: [request / update / follow-up / intro / escalation]",
        "Key points to include: [bullets]",
        "Required action + deadline: [what + when]",
        "Tone: [neutral/friendly/firm]",
        "Constraints: [word limit, sensitivity, no attachments, etc.]"
      ],
      outputs: [
        "3 subject line options",
        "Email draft (short paragraphs + bullets where helpful)",
        "A more direct version (same content, tighter phrasing)",
        "Follow-up email (48–72h later)",
        "TL;DR line the recipient can act on"
      ],
      rules: [
        "Put the ask early, then the context.",
        "Avoid jargon and long intro paragraphs.",
        "If the request is sensitive, include a softening line without sounding vague."
      ]
    },
    "business-plan-template": {
      role: "venture strategist and market analyst",
      tone: "strategic, realistic, and execution-ready",
      task: "Create a complete business plan outline with clear assumptions and a 90-day action plan.",
      inputs: [
        "Business idea: [what you sell + to whom]",
        "Customer problem: [pain + why it matters]",
        "Solution: [product/service + key features]",
        "Target market: [ICP + geography]",
        "Competitors: [top 3]",
        "Pricing / revenue model: [one-time/subscription/etc]",
        "Traction (if any): [revenue/users/validation]",
        "Resources & constraints: [team, budget, timeline]"
      ],
      outputs: [
        "Executive summary (who, what, why now, why you)",
        "Market & customer analysis (ICP, JTBD, segments, willingness-to-pay)",
        "Positioning (differentiation, category narrative, key messages)",
        "Go-to-market plan (channels, offers, funnel, first 10 customers)",
        "Operations plan (team, tools, processes, delivery)",
        "Financial model assumptions (unit economics, CAC, margin, runway)",
        "Risks & mitigations + key unknowns to validate",
        "90-day plan (weekly milestones + success metrics)"
      ],
      rules: [
        "Be specific; avoid generic advice.",
        "Use bullets and tables where helpful.",
        "Label assumptions and propose how to validate them quickly."
      ]
    },
    "business-proposal-builder": {
      role: "consulting proposal writer and delivery lead",
      tone: "confident, client-ready, and specific",
      task: "Write a client-ready proposal with scope, deliverables, timeline, and pricing assumptions.",
      inputs: [
        "Client / stakeholder: [who]",
        "Problem to solve: [pain + impact]",
        "Desired outcome: [what success looks like]",
        "Scope (in + out): [bullets]",
        "Deliverables: [list]",
        "Timeline: [start/end + milestones]",
        "Pricing model: [fixed/retainer/hourly]",
        "Constraints & assumptions: [dependencies, access, approvals]"
      ],
      outputs: [
        "Executive summary (value + outcome)",
        "Approach (phases + what happens in each)",
        "Deliverables & acceptance criteria",
        "Timeline with milestones + client responsibilities",
        "Investment (pricing) + payment terms + assumptions",
        "Risks, exclusions, and change-control approach",
        "Next steps + approval CTA"
      ],
      rules: [
        "Write like a real proposal (no generic filler).",
        "Use measurable outcomes where possible.",
        "Make responsibilities explicit (you vs client)."
      ]
    },
    "client-onboarding-template": {
      role: "customer success manager and onboarding specialist",
      tone: "welcoming, clear, and process-driven",
      task: "Create an onboarding sequence that reduces confusion and sets expectations from day one.",
      inputs: [
        "Service/product: [what you deliver]",
        "Client type: [industry + size]",
        "Onboarding goal: [what the first 14–30 days should achieve]",
        "Key contacts: [roles + responsibilities]",
        "Access needed: [tools, accounts, permissions]",
        "Timeline: [kickoff date + key milestones]",
        "Communication channels: [email/Slack/calls]",
        "Constraints: [legal, security, deadlines]"
      ],
      outputs: [
        "Welcome message + what happens next",
        "Kickoff call agenda (45–60 min)",
        "Onboarding checklist (client vs your team)",
        "Timeline with milestones and deliverables",
        "Communication rules (response time, updates, escalation)",
        "Success criteria + handoff plan into delivery"
      ],
      rules: [
        "Make it easy to follow and copy into a project tool.",
        "Include owners for each step.",
        "Keep it friendly but firm on responsibilities."
      ]
    },
    "company-mission-statement-template": {
      role: "brand strategist and positioning expert",
      tone: "inspiring, specific, and not fluffy",
      task: "Craft mission statement options that are memorable, credible, and aligned with the business reality.",
      inputs: [
        "Company / project name: [name]",
        "What you do: [product/service]",
        "Who you serve: [primary audience]",
        "The change you create: [outcome/impact]",
        "Values: [3–5]",
        "Differentiators: [why you win]",
        "Tone: [bold/warm/technical/etc]",
        "Notes/examples you like: [optional]"
      ],
      outputs: [
        "One-sentence mission statement options (10)",
        "A short version (<= 12 words) + a longer version (2–3 sentences)",
        "A positioning statement (For… Who… Our… Unlike… We…)",
        "Proof points (what makes this believable)",
        "A 'we are not' statement to clarify focus"
      ],
      rules: [
        "Avoid vague words like 'innovative' without specifics.",
        "Keep language concrete and human.",
        "Make sure it matches the actual offering (no overpromising)."
      ]
    },
    "crisis-management-template": {
      role: "incident commander and crisis communications lead",
      tone: "calm, factual, and action-oriented",
      task: "Create a crisis response plan with clear roles, timelines, and communication drafts.",
      inputs: [
        "Incident summary: [what happened]",
        "Impact: [who/what is affected]",
        "Timeline so far: [key events]",
        "Known facts vs unknowns: [bullets]",
        "Stakeholders: [internal/external]",
        "Compliance/regulatory constraints: [if any]",
        "Communication channels: [status page, email, social]",
        "Current status: [contained/ongoing]"
      ],
      outputs: [
        "Situation report (what happened, impact, current status)",
        "Immediate actions (0–2h), short-term (24h), and recovery plan",
        "Roles & responsibilities (IC, comms, engineering, legal, support)",
        "Customer update template (first update + follow-up)",
        "Internal update template (exec + team)",
        "Post-mortem outline (root cause, lessons, prevention)"
      ],
      rules: [
        "Do not speculate; clearly separate facts from hypotheses.",
        "Include timestamps and owners where possible.",
        "Prioritize safety, customer impact, and clear next updates."
      ]
    },
    "employee-feedback-template": {
      role: "people manager and HR business partner",
      tone: "respectful, direct, and constructive",
      task: "Write actionable performance feedback with examples, expectations, and next steps.",
      inputs: [
        "Employee role + level: [role]",
        "Review period: [dates]",
        "Strengths/wins: [bullets + examples]",
        "Growth areas: [bullets + examples]",
        "Goals for next period: [what success looks like]",
        "Support available: [training, mentorship, tools]",
        "Tone: [supportive/firm]",
        "Constraints: [company values, rubric]"
      ],
      outputs: [
        "Summary (overall performance + theme)",
        "Strengths (3–5) with specific examples",
        "Growth areas (2–4) with coaching suggestions",
        "Expectations & success criteria for the next period",
        "SMART goals + check-in plan",
        "Closing paragraph (encouraging + clear)"
      ],
      rules: [
        "Use behavior + impact language.",
        "Avoid vague feedback; include concrete examples.",
        "Keep it fair, inclusive, and professional."
      ]
    },
    "hiring-job-description-template": {
      role: "recruiter and hiring manager",
      tone: "clear, inclusive, and realistic",
      task: "Create a job description that attracts qualified candidates and sets expectations accurately.",
      inputs: [
        "Company: [name + what you do]",
        "Role title: [title]",
        "Team & manager: [where it sits]",
        "Location / remote: [details]",
        "Seniority: [junior/mid/senior/lead]",
        "Key responsibilities: [bullets]",
        "Must-have requirements: [bullets]",
        "Nice-to-haves: [bullets]",
        "Compensation range (optional): [range]"
      ],
      outputs: [
        "Role summary (2–3 sentences)",
        "Responsibilities (6–10 bullets)",
        "Requirements (must-have) + nice-to-have",
        "What success looks like in 30/60/90 days",
        "How to apply + hiring process steps",
        "Equal opportunity / inclusion statement"
      ],
      rules: [
        "Avoid biased or discriminatory language.",
        "Be specific about tools/skills.",
        "Keep it readable and skimmable."
      ]
    },
    "internal-memo-template": {
      role: "operations communications lead",
      tone: "executive-ready, scannable, and decisive",
      task: "Write an internal memo that clarifies context, decision, rationale, and next steps.",
      inputs: [
        "Memo topic: [topic]",
        "Audience: [who will read it]",
        "Decision / request: [what you need]",
        "Background: [what led here]",
        "Key data: [metrics, constraints]",
        "Options considered: [A/B/C]",
        "Recommendation: [your recommendation]",
        "Owner + timeline: [who + when]"
      ],
      outputs: [
        "TL;DR (3 bullets)",
        "Context (what's happening + why now)",
        "Decision / recommendation + rationale",
        "Plan (steps, owners, dates)",
        "Risks and mitigations",
        "Open questions + what you need from the reader"
      ],
      rules: [
        "Lead with the decision.",
        "Keep paragraphs short; use bullets.",
        "Separate facts from opinions."
      ]
    },
    "kpi-report-template": {
      role: "analytics lead and business operator",
      tone: "data-driven and decision-ready",
      task: "Turn KPI data into a readable report with insights, root causes, and next actions.",
      inputs: [
        "Time period: [week/month/quarter]",
        "KPIs + targets: [list]",
        "Actual results: [numbers]",
        "Key initiatives during the period: [bullets]",
        "Notable anomalies: [spikes/drops]",
        "Context: [seasonality, launches]",
        "Audience: [exec/team/client]",
        "Constraints: [metrics definitions]"
      ],
      outputs: [
        "Executive summary (what changed + why it matters)",
        "KPI table (target vs actual vs delta) + short interpretation",
        "3–7 insights (root cause hypotheses + evidence)",
        "What's working / what's not (with next experiments)",
        "Risks + blockers + decisions needed",
        "Next-week/next-month priorities (owners + deadlines)"
      ],
      rules: [
        "Prefer actionable insight over data dumps.",
        "Flag any data quality issues.",
        "When you speculate, label it clearly."
      ]
    },
    "meeting-notes-synthesizer": {
      role: "executive assistant and meeting facilitator",
      tone: "concise, structured, and action-focused",
      task: "Convert raw meeting notes or transcripts into a decision-ready summary with owners and deadlines.",
      inputs: [
        "Raw notes / transcript: [paste here]",
        "Meeting title: [optional]",
        "Attendees: [optional list]",
        "Date: [optional]",
        "Context: [optional]"
      ],
      outputs: [
        "Summary (5–10 bullets)",
        "Decisions made (if any)",
        "Action items table (Action | Owner | Due date | Status/Notes)",
        "Risks / blockers",
        "Open questions",
        "Next meeting agenda + prep items"
      ],
      rules: [
        "If owners or dates are missing, list them as TBD and ask clarifying questions.",
        "Do not invent facts not present in the notes.",
        "Use crisp bullets and short sentences."
      ]
    },
    "meeting-summary-template": {
      role: "operations manager and meeting facilitator",
      tone: "clear and action-oriented",
      task: "Write a meeting summary that can be sent to stakeholders and includes actions and next steps.",
      inputs: [
        "Meeting topic: [topic]",
        "Participants: [optional]",
        "Goal of meeting: [goal]",
        "Key discussion points: [bullets]",
        "Decisions: [bullets]",
        "Action items: [bullets]",
        "Deadlines: [dates]",
        "Audience for summary: [exec/team/client]"
      ],
      outputs: [
        "1-paragraph recap",
        "Key takeaways (bullets)",
        "Decisions (bullets)",
        "Action items table (Action | Owner | Due date)",
        "Next steps + next meeting (if applicable)"
      ],
      rules: [
        "Keep it short enough for email.",
        "Make actions explicit.",
        "Use neutral, non-blaming language."
      ]
    },
    "partnership-proposal-template": {
      role: "partnerships lead and business development strategist",
      tone: "collaborative, specific, and credible",
      task: "Create a partnership proposal that explains mutual value and a clear next step.",
      inputs: [
        "Your company + what you offer: [summary]",
        "Potential partner: [company + audience]",
        "Why this partnership fits: [overlap + opportunity]",
        "Partnership idea: [bundle, co-marketing, integration, affiliate]",
        "Mutual benefits: [bullets]",
        "Proposed scope + timeline: [bullets]",
        "Resources needed: [who does what]",
        "CTA: [call/meeting/proposal review]"
      ],
      outputs: [
        "One-paragraph partnership pitch",
        "Partnership structure (what each side provides)",
        "Deliverables + timeline",
        "Success metrics (KPIs) + reporting cadence",
        "Risks / dependencies + mitigation",
        "Outreach email/DM draft + follow-up message"
      ],
      rules: [
        "Keep it partner-centric (lead with their upside).",
        "Avoid vague 'synergy' language; use concrete examples.",
        "Make the first step easy (low-friction CTA)."
      ]
    },
    "project-brief-template": {
      role: "project manager and delivery lead",
      tone: "structured and execution-ready",
      task: "Create a project brief that aligns stakeholders on scope, timeline, and success metrics.",
      inputs: [
        "Project name: [name]",
        "Business objective: [why this matters]",
        "Problem statement: [current pain]",
        "Scope (in/out): [bullets]",
        "Deliverables: [list]",
        "Stakeholders: [roles]",
        "Timeline constraints: [deadlines]",
        "Success metrics: [KPIs]",
        "Risks/dependencies: [bullets]"
      ],
      outputs: [
        "Project overview (objective + outcomes)",
        "Scope (in/out) + deliverables",
        "Milestones timeline (phases + dates)",
        "Stakeholders + RACI (who approves/executes)",
        "Success metrics + acceptance criteria",
        "Risks, dependencies, and mitigation plan"
      ],
      rules: [
        "Keep it one-page friendly.",
        "Make approvals explicit.",
        "Use concrete deliverables (not vague verbs)."
      ]
    },
    "proposal-template": {
      role: "proposal writer and account lead",
      tone: "client-ready and outcome-focused",
      task: "Write a general-purpose proposal that can be used for services, projects, or retainers.",
      inputs: [
        "Client: [name]",
        "Objective: [what they want]",
        "Background/context: [what happened]",
        "Deliverables: [list]",
        "Timeline: [dates]",
        "Pricing: [amount + structure]",
        "Assumptions: [access, approvals, limits]",
        "CTA: [how to accept]"
      ],
      outputs: [
        "Proposal summary (value + outcomes)",
        "Scope of work (deliverables + exclusions)",
        "Timeline & milestones",
        "Investment & terms",
        "Assumptions + change control",
        "Next steps + acceptance line"
      ],
      rules: [
        "Be specific about what is included and excluded.",
        "Avoid legal overreach; keep terms practical.",
        "Use scannable sections and bullets."
      ]
    },
    "quarterly-report-template": {
      role: "business analyst and executive communications lead",
      tone: "executive-ready, concise, and data-backed",
      task: "Summarize a quarter with results, insights, and next-quarter priorities.",
      inputs: [
        "Quarter: [Q# + year]",
        "Company/team: [name]",
        "Key KPIs: [metrics + numbers]",
        "Highlights/wins: [bullets]",
        "Challenges: [bullets]",
        "Initiatives shipped: [bullets]",
        "Customer feedback: [bullets]",
        "Next quarter goals: [bullets]"
      ],
      outputs: [
        "Executive summary (what happened + what it means)",
        "KPI snapshot (table) + interpretation",
        "Highlights (wins) + supporting evidence",
        "Challenges + root causes + fixes",
        "Top priorities for next quarter (owners + success metrics)",
        "Risks and asks (decisions needed)"
      ],
      rules: [
        "Tie every initiative to an outcome.",
        "Prefer a few strong insights over many weak ones.",
        "Call out what you would stop doing next quarter."
      ]
    },
    "sop-generator": {
      role: "process engineer and operations manager",
      tone: "step-by-step, unambiguous, and audit-friendly",
      task: "Generate a Standard Operating Procedure (SOP) teams can follow without extra context.",
      inputs: [
        "Process name: [process]",
        "Goal: [why this SOP exists]",
        "Trigger: [when to run it]",
        "Owner/role: [who runs it]",
        "Tools/systems: [list]",
        "Inputs required: [documents/data]",
        "Frequency: [daily/weekly/etc]",
        "Exceptions: [what to do when something goes wrong]",
        "Compliance notes: [optional]"
      ],
      outputs: [
        "Purpose + scope + definitions",
        "Prerequisites (access, tools, data) and safety/compliance notes",
        "Procedure steps (numbered) with expected time per step",
        "Quality checks + completion criteria",
        "Escalation path (when/how to escalate)",
        "Templates/checklists (copy-ready)"
      ],
      rules: [
        "Use numbered steps, one action per step.",
        "Include examples of inputs/outputs.",
        "Make handoffs explicit (who gets notified)."
      ]
    },
    "swot-analysis-template": {
      role: "strategy consultant",
      tone: "evidence-based and action-oriented",
      task: "Create a SWOT analysis that leads to prioritized actions, not just brainstorming.",
      inputs: [
        "Company/product: [what you're analyzing]",
        "Goal: [strategy decision, launch, positioning, etc]",
        "Target market: [customers + competitors]",
        "Current strengths: [facts]",
        "Known weaknesses: [facts]",
        "Opportunities: [market trends]",
        "Threats: [risks/competitors]",
        "Constraints: [budget, timeline]"
      ],
      outputs: [
        "SWOT table (4 quadrants) with specific, non-generic items",
        "Evidence/assumptions for each point",
        "Strategic implications (what each quadrant suggests)",
        "Top 5 priorities (actions) ranked by impact/effort",
        "Risks to monitor + leading indicators",
        "Next steps for validation (what data to collect)"
      ],
      rules: [
        "Avoid generic points like 'strong brand' unless supported.",
        "Keep each item short but specific.",
        "Always translate insights into actions."
      ]
    },
    "team-communication-template": {
      role: "team lead and internal communications coach",
      tone: "clear, respectful, and action-oriented",
      task: "Create a communication template for team updates, requests, or decisions across Slack/email.",
      inputs: [
        "Message type: [status update / request / decision / announcement]",
        "Audience: [team/exec/cross-functional]",
        "Context: [what happened + why it matters]",
        "What you need: [decision/help/info]",
        "Deadline: [date/time]",
        "Owners: [who does what]",
        "Blockers/risks: [bullets]",
        "Tone: [neutral/urgent/friendly]"
      ],
      outputs: [
        "Slack message version (short)",
        "Email version (more context)",
        "Meeting talking points (3–5 bullets)",
        "Clear ask + next steps",
        "Follow-up message template"
      ],
      rules: [
        "Put the ask in the first 2–3 lines.",
        "Use bullets for actions.",
        "Avoid blame; focus on solutions."
      ]
    }
  },
  marketing: {
    "ad-copy-angle-matrix": {
      role: "direct-response strategist",
      task: "Build an ad copy angle matrix (hooks + messages) to generate testable variations.",
      inputs: [
        "Product/offer: [what you're selling]",
        "Target audience (ICP): [who]",
        "Top pain points: [bullets]",
        "Top desired outcomes: [bullets]",
        "Proof (reviews, stats, guarantees): [bullets]",
        "Objections: [price, time, trust, etc]",
        "Platform: [Meta/Google/TikTok/etc]",
        "Constraints: [claims to avoid, compliance notes]"
      ],
      outputs: [
        "Angle matrix table (Angle | Hook | Core message | Proof | CTA)",
        "10–15 distinct angles (problem, transformation, social proof, urgency, objection-handling, feature-led, etc.)",
        "For the top 5 angles: 3 headline options + 2 primary text options",
        "Testing plan (what to test first and why)"
      ],
      rules: [
        "Make each angle meaningfully different (not synonyms).",
        "Avoid exaggerated or unverifiable claims.",
        "Keep copy aligned with the landing page promise."
      ]
    },
    "ad-creative-ideas-template": {
      role: "paid social creative strategist",
      task: "Generate ad creative concepts (visual + script + copy) designed for fast A/B testing.",
      inputs: [
        "Product/offer: [what it is]",
        "Audience: [who]",
        "Goal: [leads/purchases/signups]",
        "Platform: [Meta/TikTok/YouTube/etc]",
        "Key differentiators: [bullets]",
        "Assets available: [UGC, screenshots, testimonials]",
        "Brand voice: [adjectives]",
        "Constraints: [must-say/must-not-say, length]"
      ],
      outputs: [
        "12 creative concepts with: angle, hook, visual idea, script beats, on-screen text, CTA",
        "3 UGC-style concepts (creator POV) + 3 demo concepts + 3 proof concepts",
        "For each concept: suggested thumbnail/frame + first 2 seconds hook",
        "Testing notes (what metric to watch and what variable to change)"
      ],
      rules: [
        "Make concepts executable with minimal production.",
        "Keep hooks specific and audience-relevant.",
        "Avoid generic 'best product' claims."
      ]
    },
    "brand-voice-guide-template": {
      role: "brand voice director and senior copywriter",
      task: "Create a brand voice guide that writers and AI can follow consistently.",
      inputs: [
        "Brand: [name + what you sell]",
        "Audience: [who]",
        "Brand personality: [3–5 traits]",
        "Values: [3–5]",
        "Competitors to avoid sounding like: [list]",
        "Topics/claims to avoid: [list]",
        "Examples you like: [paste]",
        "Reading level: [simple/standard/technical]"
      ],
      outputs: [
        "Voice pillars (3–5) with do/don't examples",
        "Tone spectrum (when to sound energetic vs calm vs formal)",
        "Vocabulary rules (preferred words, banned words, formatting style)",
        "Sentence patterns + structure (short vs long, bullets, emojis/no emojis)",
        "10 example sentences (headline, CTA, support reply, ad line, landing page)",
        "Rewrite exercise: rewrite 3 generic lines into the brand voice"
      ],
      rules: [
        "Make it practical: examples over theory.",
        "Avoid contradictions (define tradeoffs clearly).",
        "Keep it short enough to paste into an AI system prompt."
      ]
    },
    "cold-email-outreach-template": {
      role: "B2B outbound copywriter",
      task: "Write a cold email sequence that is personalized, short, and reply-focused.",
      inputs: [
        "Offer: [what you do]",
        "Ideal customer (ICP): [role + industry + size]",
        "Prospect context: [company + trigger + personalization detail]",
        "Pain point to target: [pain]",
        "Proof: [case study / metric / credibility]",
        "CTA: [call/quick question/demo]",
        "Constraints: [word limit, no links, compliance]",
        "Tone: [friendly/direct]"
      ],
      outputs: [
        "5 subject lines",
        "Cold email (version A) <= ~120 words",
        "Cold email (version B) with a different angle",
        "3 follow-ups (value-add, reminder, breakup)",
        "Personalization tokens (what to swap per prospect)"
      ],
      rules: [
        "Optimize for replies, not pitching.",
        "Use one clear CTA per email.",
        "Avoid spammy phrases and excessive hype."
      ]
    },
    "content-brief-builder": {
      role: "SEO content strategist",
      task: "Create an SEO content brief that a writer can execute without extra research.",
      inputs: [
        "Topic: [topic]",
        "Primary keyword: [keyword]",
        "Search intent: [informational/commercial/etc]",
        "Target reader: [who]",
        "Competitors/SERP notes: [paste notes]",
        "Product tie-in: [what you want mentioned]",
        "Internal links to include: [URLs]",
        "Tone: [friendly/technical]",
        "Constraints: [word count, format]"
      ],
      outputs: [
        "3 title options + 1 recommended",
        "Meta title + meta description",
        "Outline (H1/H2/H3) with key points under each",
        "FAQ questions (5–8) + suggested short answers",
        "Examples, data points, or sources to cite",
        "Internal linking map + CTA placement"
      ],
      rules: [
        "Match the outline to the intent.",
        "Avoid keyword stuffing; write for humans.",
        "Keep sections scannable with bullets."
      ]
    },
    "content-pillars-template": {
      role: "content strategist",
      task: "Define content pillars that connect audience needs to your offers.",
      inputs: [
        "Brand/business: [what you do]",
        "Audience: [who]",
        "Primary offers: [products/services]",
        "Business goals: [growth/awareness/leads]",
        "Channels: [blog/IG/LinkedIn/YouTube]",
        "Expertise areas: [topics you can credibly cover]",
        "Constraints: [time, team size]"
      ],
      outputs: [
        "6 pillars with: audience problem, promise, and tie-in to offers",
        "For each pillar: 8 subtopics + 10 hook ideas",
        "Content formats per pillar (post, reel, email, blog, live)",
        "A simple weekly posting plan (7 days)"
      ],
      rules: [
        "Pillars must be distinct (not overlapping synonyms).",
        "Every pillar should map to a customer journey stage.",
        "Keep it realistic for the available resources."
      ]
    },
    "customer-feedback-request-template": {
      role: "customer success manager and UX researcher",
      task: "Write customer feedback request messages and a short survey that increases response rate.",
      inputs: [
        "Customer segment: [new users / power users / churned]",
        "Product: [what it is]",
        "Trigger: [post-purchase, after support ticket, etc]",
        "Channel: [email/in-app/SMS]",
        "Incentive (optional): [gift card, discount]",
        "Tone: [friendly/professional]",
        "Constraints: [length, compliance]"
      ],
      outputs: [
        "Email message (short) + subject lines (3)",
        "In-app message (very short)",
        "5 survey questions (mix of scale + open-ended)",
        "Interview invite script (optional) + scheduling CTA",
        "Follow-up reminder message"
      ],
      rules: [
        "Keep requests short and respectful.",
        "Avoid leading questions.",
        "Make the next step frictionless."
      ]
    },
    "customer-persona-template": {
      role: "market research strategist",
      task: "Create a customer persona using jobs-to-be-done, motivations, objections, and messaging.",
      inputs: [
        "Product/service: [what it is]",
        "Target segment: [role/industry/life stage]",
        "Price point: [range]",
        "Buying context: [why/when they buy]",
        "Top competitors/alternatives: [list]",
        "Known customer quotes (optional): [paste]",
        "Constraints: [region, compliance]"
      ],
      outputs: [
        "Persona snapshot (name, role, context) + summary",
        "Jobs-to-be-done (functional + emotional) and success criteria",
        "Pains, fears, and objections (ranked)",
        "Triggers (what makes them buy now)",
        "Messaging map (value props, proof, CTAs)",
        "Channel preferences + content ideas"
      ],
      rules: [
        "Keep it realistic and specific.",
        "Separate facts from assumptions.",
        "Tie messaging to pains and desired outcomes."
      ]
    },
    "email-marketing-template": {
      role: "lifecycle marketer and email copywriter",
      task: "Draft an email campaign with subject lines, body copy, and testing notes.",
      inputs: [
        "Campaign type: [welcome/nurture/promo/announcement]",
        "Audience segment: [who]",
        "Offer: [what you're promoting]",
        "Key benefits: [bullets]",
        "Proof: [reviews, stats]",
        "CTA: [what to do]",
        "Tone: [friendly/direct]",
        "Constraints: [length, compliance, brand voice]"
      ],
      outputs: [
        "5 subject lines + 3 preview text options",
        "Email body (scannable, benefit-led)",
        "Alternate version (shorter or different angle)",
        "Segmentation/personalization notes",
        "A/B test ideas (subject, offer framing, CTA)"
      ],
      rules: [
        "Use one primary CTA.",
        "Avoid hype; use proof.",
        "Keep paragraphs short; use bullets."
      ]
    },
    "facebook-ad-generator": {
      role: "Meta ads copywriter and performance marketer",
      task: "Generate Facebook ad variations (copy + creative direction) for fast testing.",
      inputs: [
        "Product/offer: [what you're selling]",
        "Objective: [sales/leads/traffic]",
        "Audience: [who]",
        "Key pain/desire: [main trigger]",
        "Proof: [reviews, stats, guarantee]",
        "Objections: [price, time, trust]",
        "Landing page message: [key bullets]",
        "Constraints: [claims/compliance/length]"
      ],
      outputs: [
        "5 ad angles (named) with: primary text (short + medium), headline, description, CTA",
        "Creative directions for each angle (visual, format, UGC/script idea)",
        "1 retargeting variant + 1 cold-audience variant",
        "Testing plan (budget split + what to measure)"
      ],
      rules: [
        "Align copy to the landing page promise.",
        "Avoid prohibited or unverifiable claims.",
        "Keep language simple and audience-native."
      ]
    },
    "google-ads-copy-template": {
      role: "Google Ads (PPC) specialist",
      task: "Create a Responsive Search Ad asset set aligned with target keywords and offer.",
      inputs: [
        "Business/offer: [what you sell]",
        "Target keywords: [list]",
        "Location (optional): [city/region]",
        "Unique selling points: [bullets]",
        "Offers/promos (optional): [details]",
        "Trust signals: [reviews, years, certifications]",
        "Compliance constraints: [claims to avoid]",
        "Landing page key messages: [paste]"
      ],
      outputs: [
        "Campaign snapshot (goal, ICP, keyword theme)",
        "15 headlines (mix: keyword, benefit, proof, urgency, location)",
        "4 descriptions (benefit-led + clear CTA)",
        "Path ideas (Path 1 + Path 2) + sitelink ideas (4)",
        "Callouts and structured snippet suggestions",
        "Testing notes (pinning suggestions + first experiments)"
      ],
      rules: [
        "Respect ad policy and avoid unverifiable claims.",
        "Use keywords naturally (no stuffing).",
        "Avoid repeating the same phrase across many assets."
      ]
    },
    "instagram-caption-generator": {
      role: "social media copywriter",
      task: "Generate Instagram captions that fit the post format and drive engagement.",
      inputs: [
        "Post topic: [topic]",
        "Format: [reel/carousel/static]",
        "Audience: [who]",
        "Goal: [save/share/comment/click]",
        "Tone: [playful/educational/bold]",
        "CTA: [what to do]",
        "Hashtag style: [none/light/heavy]",
        "Constraints: [brand voice, banned words]"
      ],
      outputs: [
        "10 caption options (short, story, educational, contrarian, question-led)",
        "For each: first-line hook + caption body + CTA",
        "Hashtag set (optional) + 3 comment prompts",
        "One 'pinned comment' option to extend the post"
      ],
      rules: [
        "Keep hooks punchy and specific.",
        "Avoid generic motivational quotes.",
        "Match tone to the format (reels = snappier)."
      ]
    },
    "landing-page-copy-template": {
      role: "conversion rate copywriter",
      task: "Write landing page copy that matches intent, removes objections, and drives the CTA.",
      inputs: [
        "Product/offer: [what it is]",
        "Target visitor: [who]",
        "Primary promise: [outcome]",
        "Key benefits: [bullets]",
        "Features (optional): [bullets]",
        "Proof: [testimonials, metrics, logos]",
        "Top objections: [bullets]",
        "CTA: [signup/buy/book]",
        "Tone: [friendly/professional]"
      ],
      outputs: [
        "Hero section (headline, subheadline, CTA, 3 bullets)",
        "Problem/agitation + solution section",
        "Benefits section + feature-to-benefit mapping",
        "Social proof section (testimonials + proof points placeholders)",
        "Objection handling + FAQ (6–10 Q&As)",
        "Final CTA section + risk reversal (guarantee wording if applicable)"
      ],
      rules: [
        "Keep copy consistent with the offer (no surprise claims).",
        "Use concrete benefits and proof.",
        "Write scannable sections with short paragraphs."
      ]
    },
    "lead-magnet-template": {
      role: "lead generation strategist",
      task: "Design a lead magnet that solves a specific pain quickly and leads into the next offer.",
      inputs: [
        "Audience: [who]",
        "Pain point: [what they struggle with]",
        "Lead magnet format: [checklist, guide, swipe file]",
        "Promise: [result]",
        "Delivery method: [email, download]",
        "Next offer: [upsell/tripwire/core offer]",
        "Tone: [friendly/direct]",
        "Constraints: [length, resources]"
      ],
      outputs: [
        "10 title options + 1 recommended",
        "Lead magnet outline (sections + what to include)",
        "Landing page hero copy (headline + bullets + CTA)",
        "Opt-in thank-you page copy + delivery email",
        "Follow-up email (bridge to next offer)"
      ],
      rules: [
        "Make the lead magnet narrowly focused.",
        "Deliver a quick win within 10–15 minutes.",
        "Keep the CTA aligned with the next step."
      ]
    },
    "marketing-funnel-template": {
      role: "funnel strategist",
      task: "Map a full marketing funnel with stages, assets, metrics, and testing plan.",
      inputs: [
        "Offer + price point: [details]",
        "Audience: [who]",
        "Primary channels: [ads, SEO, social, email]",
        "Sales motion: [self-serve/call/demo]",
        "Timeline: [launch date or timeframe]",
        "Budget/resources: [what's available]",
        "Constraints: [tools, team size]"
      ],
      outputs: [
        "Funnel overview (TOFU/MOFU/BOFU) with stage goals",
        "Assets per stage (ads, landing pages, emails, content)",
        "Messaging per stage (awareness vs consideration vs decision)",
        "Metrics to track + targets",
        "Automation/hand-offs (email sequences, sales follow-up)",
        "Testing roadmap (first 4 experiments)"
      ],
      rules: [
        "Keep the funnel simple enough to execute.",
        "Align assets to one core offer and one primary CTA.",
        "Make metrics measurable and stage-specific."
      ]
    },
    "marketing-strategy-outline": {
      role: "fractional CMO",
      task: "Produce a marketing strategy outline with positioning, channels, budget allocation, and KPIs.",
      inputs: [
        "Business goal: [revenue/leads/awareness]",
        "Target audience: [who]",
        "Positioning: [how you want to be perceived]",
        "Key differentiators: [bullets]",
        "Competitors: [list]",
        "Budget: [range]",
        "Timeline: [quarter/year]",
        "Constraints: [team/resources]"
      ],
      outputs: [
        "Strategy summary (where to play + how to win)",
        "ICP + messaging pillars",
        "Channel plan (owned/paid/earned) with rationale",
        "Budget allocation + expected outcomes",
        "Campaign roadmap (next 90 days)",
        "KPI dashboard + reporting cadence"
      ],
      rules: [
        "Prioritize 1–2 primary channels.",
        "Tie tactics to objectives.",
        "Make the plan measurable and time-bound."
      ]
    },
    "product-description-template": {
      role: "ecommerce copywriter",
      task: "Write a product description that sells benefits, answers objections, and supports SEO.",
      inputs: [
        "Product name + category: [name]",
        "Target buyer: [who]",
        "Key features: [bullets]",
        "Benefits/outcomes: [bullets]",
        "Materials/specs: [details]",
        "Use cases: [how it's used]",
        "Proof: [reviews/warranty]",
        "Tone: [premium/fun/minimal]",
        "SEO keywords (optional): [list]"
      ],
      outputs: [
        "Product title + one-line value proposition",
        "Short description (2–3 sentences)",
        "Benefit-led bullet list (6–10 bullets)",
        "Specs section (clean and scannable)",
        "FAQ (6 questions) addressing common objections",
        "Upsell/cross-sell suggestion + CTA"
      ],
      rules: [
        "Translate features into outcomes.",
        "Avoid exaggerated claims.",
        "Keep it skimmable for mobile."
      ]
    },
    "product-launch-email": {
      role: "product launch copywriter",
      task: "Write a launch email (or mini-sequence) that builds excitement and drives clicks.",
      inputs: [
        "Product: [what it is]",
        "Audience: [who]",
        "Launch date: [date]",
        "Offer: [price/discount/bonus]",
        "Key benefits: [bullets]",
        "Proof: [testimonials, waitlist, stats]",
        "Objections: [bullets]",
        "CTA link: [URL or placeholder]",
        "Tone: [friendly/urgent]"
      ],
      outputs: [
        "5 subject lines + 3 preview texts",
        "Launch email (announce + benefits + proof + CTA)",
        "Reminder email (24h later) with urgency",
        "Last-call email (final day)",
        "Post-launch follow-up (for non-buyers)"
      ],
      rules: [
        "Keep CTAs consistent across the sequence.",
        "Use proof and clarity over hype.",
        "Make urgency honest and specific."
      ]
    },
    "re-engagement-email-template": {
      role: "retention and lifecycle marketer",
      task: "Write re-engagement emails to win back inactive users/customers.",
      inputs: [
        "Segment: [inactive users / lapsed customers]",
        "Inactivity reason (guess): [price, time, forgot, not fit]",
        "Offer/incentive: [optional]",
        "Value reminder: [what they get]",
        "CTA: [come back action]",
        "Tone: [friendly/curious]",
        "Constraints: [compliance, unsubscribe]"
      ],
      outputs: [
        "3-email win-back sequence with subject lines",
        "Email 1: value reminder + easy next step",
        "Email 2: offer/incentive (if any) + objection handling",
        "Email 3: breakup email (polite, keeps door open)",
        "Optional SMS copy (short)"
      ],
      rules: [
        "Keep tone helpful, not guilt-trippy.",
        "Use one CTA per email.",
        "Avoid aggressive discounts unless provided."
      ]
    },
    "seo-blog-outline-template": {
      role: "SEO editor",
      task: "Create an SEO blog outline that matches search intent and includes FAQs.",
      inputs: [
        "Primary keyword: [keyword]",
        "Secondary keywords: [list]",
        "Audience: [who]",
        "Search intent: [informational/commercial]",
        "Angle: [what makes this different]",
        "Word count target: [number]",
        "Internal links: [URLs]",
        "Product mention (optional): [where to include]"
      ],
      outputs: [
        "Title options (5) + 1 recommended",
        "Meta description + intro hook paragraph",
        "Outline (H1/H2/H3) with key points under each section",
        "FAQ section (6–10 questions) + short answers",
        "Snippet-ready summary (40–60 words)",
        "CTA suggestions + internal linking placements"
      ],
      rules: [
        "Prioritize clarity and usefulness.",
        "Avoid fluff; focus on actionable info.",
        "Keep headings natural and not repetitive."
      ]
    },
    "social-media-calendar-template": {
      role: "social media manager",
      task: "Create a social media calendar with daily post ideas, hooks, formats, and CTAs.",
      inputs: [
        "Brand/business: [what you do]",
        "Platform(s): [IG/LinkedIn/TikTok/etc]",
        "Time period: [30 days / 2 weeks]",
        "Content pillars: [pillars]",
        "Offers to promote (optional): [list]",
        "Posting frequency: [e.g., 5x/week]",
        "Constraints: [time, team size, banned topics]"
      ],
      outputs: [
        "Calendar table (Date | Pillar | Format | Hook | Key points | CTA | Asset notes)",
        "A weekly theme pattern (education, proof, behind-the-scenes, promo)",
        "Repurposing plan (how to turn one idea into 3 formats)"
      ],
      rules: [
        "Balance value posts and promotional posts.",
        "Vary hooks and formats to prevent fatigue.",
        "Make each post idea specific, not generic."
      ]
    },
    "tiktok-script-template": {
      role: "short-form video scriptwriter",
      task: "Write TikTok scripts designed for retention, clarity, and a clean CTA.",
      inputs: [
        "Topic: [what the video is about]",
        "Target viewer: [who]",
        "Duration: [15/30/60 seconds]",
        "Style: [UGC, educational, storytime]",
        "Key point: [one main takeaway]",
        "CTA: [follow, comment, click, buy]",
        "Product tie-in (optional): [how to mention]",
        "Constraints: [no face, no voice, etc]"
      ],
      outputs: [
        "3 scripts with timecodes (0–2s hook, 2–8s build, 8–15s payoff, CTA)",
        "On-screen text suggestions + caption line",
        "Shot list / b-roll ideas",
        "1 alternate hook per script for testing"
      ],
      rules: [
        "Keep sentences short.",
        "One idea per video.",
        "Use pattern interrupts (questions, quick cuts) where appropriate."
      ]
    },
    "upsell-email-template": {
      role: "email conversion copywriter",
      task: "Write an upsell email that feels helpful and increases average order value.",
      inputs: [
        "Main purchase: [what they bought]",
        "Upsell offer: [what you're offering next]",
        "Timing: [immediately / day 2 / day 7]",
        "Value link between offers: [why it fits]",
        "Proof: [reviews, stats]",
        "Objections: [bullets]",
        "CTA: [upgrade/bundle/add]",
        "Tone: [friendly/direct]"
      ],
      outputs: [
        "3 subject lines + 2 preview texts",
        "Upsell email draft (benefit-led, low-friction)",
        "Alternate version (more direct or more story-based)",
        "Follow-up reminder (short)",
        "FAQ-style objection handling block (3 Q&As)"
      ],
      rules: [
        "Focus on helping them get a better outcome.",
        "Keep urgency honest.",
        "Use one clear CTA."
      ]
    }
  },
  linkedin: {
    "linkedin-about-section-template": {
      role: "LinkedIn profile copywriter",
      task: "Write a LinkedIn About section that communicates positioning, credibility, and a clear CTA.",
      inputs: [
        "Name + role: [who you are]",
        "Who you help: [audience]",
        "What you help them achieve: [outcome]",
        "Credibility: [experience, wins, proof]",
        "Services/offer: [what you sell]",
        "Keywords to include: [list]",
        "Tone: [friendly/direct]",
        "CTA: [DM me / book a call / link]"
      ],
      outputs: [
        "About section (long: ~200–400 words)",
        "About section (short: ~100–150 words)",
        "3 opening hook options",
        "A closing CTA block (3 options)",
        "Keyword checklist (where they appear naturally)"
      ],
      rules: [
        "Write in first person.",
        "Use short lines and whitespace for readability.",
        "Avoid clichés; be specific about outcomes."
      ]
    },
    "linkedin-carousel-outline": {
      role: "LinkedIn carousel content strategist",
      task: "Create a slide-by-slide LinkedIn carousel outline that educates and drives saves/shares.",
      inputs: [
        "Topic: [topic]",
        "Audience: [who]",
        "Core insight: [one big idea]",
        "Angle: [mistake, framework, checklist, case study]",
        "CTA: [follow/DM/comment]",
        "Tone: [credible/simple]",
        "Slide count: [7–10]"
      ],
      outputs: [
        "Carousel thesis (what the reader will learn)",
        "Slide-by-slide outline (headline + 2–4 bullets per slide)",
        "Cover slide options (3)",
        "A final CTA slide (2 options)",
        "Caption copy to post with the carousel"
      ],
      rules: [
        "One idea per slide.",
        "Keep slide headlines short and punchy.",
        "Make it skimmable and practical."
      ]
    },
    "linkedin-case-study-template": {
      role: "LinkedIn case study storyteller",
      task: "Write a LinkedIn case study post that builds trust and invites conversation.",
      inputs: [
        "Client (or anonymized): [who]",
        "Starting point/problem: [before]",
        "What you did: [steps]",
        "Results: [metrics]",
        "Timeline: [how long]",
        "Proof/quote (optional): [paste]",
        "Lesson: [key takeaway]",
        "CTA: [DM/comment/book]"
      ],
      outputs: [
        "5 hook options",
        "Case study post (story format)",
        "Case study post (bullet format)",
        "A comment prompt to increase engagement",
        "A short version (<= 800 characters)"
      ],
      rules: [
        "Be credible; don't exaggerate results.",
        "Explain the process, not just outcomes.",
        "Keep it readable with short lines."
      ]
    },
    "linkedin-comment-generator": {
      role: "LinkedIn community engagement strategist",
      task: "Generate thoughtful comment options that add value and spark replies.",
      inputs: [
        "Original post summary: [1–3 sentences]",
        "Your perspective: [agree/disagree/expand]",
        "Your expertise/niche: [context]",
        "Goal: [build relationships / drive profile visits]",
        "Tone: [friendly/curious/insightful]",
        "Constraints: [no links, short/medium]"
      ],
      outputs: [
        "10 short comments (1–2 sentences)",
        "10 medium comments (3–5 sentences)",
        "5 question-led comments",
        "3 contrarian-but-respectful comments"
      ],
      rules: [
        "Avoid generic praise ('Great post!').",
        "Add a specific insight, example, or question.",
        "Keep tone respectful and human."
      ]
    },
    "linkedin-dm-outreach": {
      role: "networking coach and outreach copywriter",
      task: "Write LinkedIn DM outreach that starts conversations without sounding spammy.",
      inputs: [
        "Who you're messaging: [role + context]",
        "Why them: [personalization detail]",
        "Your offer/value: [what you can help with]",
        "Goal: [call/chat/quick question]",
        "Relationship: [cold/warm]",
        "Tone: [friendly/professional]",
        "Constraints: [no links, no pitching, short]"
      ],
      outputs: [
        "Message 1 (opener) <= 300 characters",
        "Follow-up 1 (2–3 days later)",
        "Follow-up 2 (value-add)",
        "Breakup message (polite)",
        "3 personalization line options"
      ],
      rules: [
        "Ask one simple question.",
        "Keep it short and specific.",
        "Avoid salesy language."
      ]
    },
    "linkedin-event-promotion-template": {
      role: "event marketer and LinkedIn copywriter",
      task: "Promote an event on LinkedIn with posts and DM invites that drive registrations.",
      inputs: [
        "Event name: [name]",
        "Date/time: [details]",
        "Audience: [who]",
        "Main value: [what they learn/get]",
        "Speakers/credibility: [names/credentials]",
        "CTA link: [URL or placeholder]",
        "Tone: [excited/professional]",
        "Constraints: [length]"
      ],
      outputs: [
        "3 promotional posts (different angles)",
        "1 DM invite message + 1 reminder DM",
        "A last-call post (24h before)",
        "FAQ snippet (3 questions) for comments"
      ],
      rules: [
        "Lead with the outcome, not logistics.",
        "Keep CTAs clear.",
        "Avoid overpromising; keep it credible."
      ]
    },
    "linkedin-hook-generator": {
      role: "LinkedIn ghostwriter",
      task: "Generate high-performing LinkedIn hooks for different post styles.",
      inputs: [
        "Topic: [topic]",
        "Audience: [who]",
        "Post type: [story/framework/opinion/how-to]",
        "Emotion: [curiosity/urgency/relief]",
        "Tone: [bold/neutral]",
        "Constraints: [no clickbait]"
      ],
      outputs: [
        "30 hook lines grouped by type (question, contrarian, data, story, mistake)",
        "5 opening paragraphs (2–4 lines) using your best hooks",
        "5 'pattern interrupt' first lines (short)"
      ],
      rules: [
        "Hooks must be specific and audience-relevant.",
        "Avoid vague promises.",
        "Keep lines short for mobile."
      ]
    },
    "linkedin-lead-magnet-template": {
      role: "LinkedIn lead generation copywriter",
      task: "Create a LinkedIn lead magnet promotion flow (post + comments + DMs).",
      inputs: [
        "Lead magnet: [what it is]",
        "Audience: [who]",
        "Promise: [result]",
        "Proof: [credibility]",
        "Delivery method: [DM/link]",
        "CTA: [comment keyword/DM me]",
        "Tone: [friendly/direct]",
        "Constraints: [no links in post, etc]"
      ],
      outputs: [
        "Lead magnet post copy (with clear comment CTA)",
        "Pinned comment text",
        "DM delivery message (when they request it)",
        "Follow-up DM (next day) to start a conversation",
        "Objection-handling snippet (3 short lines)"
      ],
      rules: [
        "Keep it value-first, not salesy.",
        "Make the CTA explicit and easy.",
        "Use short lines and whitespace."
      ]
    },
    "linkedin-newsletter-template": {
      role: "LinkedIn newsletter editor",
      task: "Draft a LinkedIn newsletter issue with a clear structure and a strong opening.",
      inputs: [
        "Newsletter name: [name]",
        "Issue topic: [topic]",
        "Audience: [who]",
        "Key points: [bullets]",
        "Stories/examples: [optional]",
        "Links/resources: [optional]",
        "CTA: [follow/subscribe/DM]",
        "Tone: [friendly/authoritative]"
      ],
      outputs: [
        "Title options (5)",
        "Opening (hook + promise)",
        "Main sections (3–5) with headings and bullets",
        "Key takeaway summary",
        "CTA block + closing paragraph",
        "Short version (for reposting)"
      ],
      rules: [
        "Write for skimming (short paragraphs).",
        "Make takeaways practical.",
        "Avoid filler; add examples."
      ]
    },
    "linkedin-outreach-follow-up-template": {
      role: "sales follow-up copywriter",
      task: "Write follow-up messages for LinkedIn outreach that feel human and get replies.",
      inputs: [
        "Previous message/context: [paste]",
        "Prospect role + company: [who]",
        "Value proposition: [why they should care]",
        "CTA: [question/call]",
        "Tone: [friendly/direct]",
        "Constraints: [no links, short]"
      ],
      outputs: [
        "Follow-up 1 (gentle nudge)",
        "Follow-up 2 (value-add: resource or insight)",
        "Follow-up 3 (breakup message)",
        "A version after a meeting/event",
        "3 subject-style openers (first line options)"
      ],
      rules: [
        "Keep each follow-up short.",
        "Ask one clear question.",
        "Avoid guilt or pressure language."
      ]
    },
    "linkedin-personal-branding-template": {
      role: "personal brand strategist",
      task: "Create a personal branding plan for LinkedIn (positioning + content + profile updates).",
      inputs: [
        "Your role/niche: [who you are]",
        "Audience: [who you want to attract]",
        "Goals: [leads, job offers, authority]",
        "Differentiators: [why you]",
        "Credibility: [proof points]",
        "Topics you can own: [list]",
        "Time available: [hours/week]",
        "Tone: [friendly/direct]"
      ],
      outputs: [
        "Positioning statement (one-liner) + messaging pillars",
        "Profile checklist (headline, about, featured, experience)",
        "Content pillars (4–6) + example post ideas",
        "Weekly content plan (7 days) with formats",
        "Engagement plan (who to comment on + routine)",
        "Metrics to track and adjust"
      ],
      rules: [
        "Keep it realistic and repeatable.",
        "Focus on a narrow niche.",
        "Use proof and specificity."
      ]
    },
    "linkedin-poll-ideas-template": {
      role: "LinkedIn engagement strategist",
      task: "Generate poll ideas that start conversations in your niche.",
      inputs: [
        "Niche/topic: [topic]",
        "Audience: [who]",
        "Goal: [engagement/insights/leads]",
        "Controversy level: [low/medium/high]",
        "Tone: [curious/bold]",
        "Constraints: [avoid topics]"
      ],
      outputs: [
        "10 poll questions with 4 answer options each",
        "A short intro caption for each poll",
        "A follow-up post idea for the winning answer",
        "Comment engagement plan (3 prompts)"
      ],
      rules: [
        "Make options mutually exclusive.",
        "Avoid leading or biased wording.",
        "Keep questions simple and specific."
      ]
    },
    "linkedin-post-generator": {
      role: "LinkedIn ghostwriter",
      task: "Write LinkedIn posts that build authority and drive engagement.",
      inputs: [
        "Topic: [topic]",
        "Audience: [who]",
        "Angle: [contrarian/story/framework/how-to]",
        "Credibility proof: [experience/results]",
        "CTA: [comment/DM/follow]",
        "Tone: [friendly/direct]",
        "Length: [short/medium/long]",
        "Constraints: [no links, etc]"
      ],
      outputs: [
        "3 post variations (different angles)",
        "Each post must include: hook, body, takeaway, CTA",
        "A short version (<= 500 characters)",
        "Hashtag suggestions (5–10) + optional emoji guidance",
        "2 comment prompts for each post"
      ],
      rules: [
        "Write with short lines and whitespace.",
        "Avoid generic advice; include examples.",
        "Keep CTAs simple and specific."
      ]
    },
    "linkedin-resume-summary-template": {
      role: "career coach and resume writer",
      task: "Create a resume/LinkedIn professional summary that is keyword-rich but human.",
      inputs: [
        "Target role: [job title]",
        "Years of experience: [number]",
        "Industries: [list]",
        "Top achievements: [metrics + wins]",
        "Core skills: [list]",
        "Tools/tech: [list]",
        "Keywords from job description: [paste]",
        "Tone: [confident/humble]"
      ],
      outputs: [
        "Professional summary (3 versions: short/medium/long)",
        "LinkedIn headline options (10)",
        "Top skills list (15) + keyword bank",
        "One 'value proposition' paragraph for cover letters"
      ],
      rules: [
        "Use measurable achievements.",
        "Avoid buzzword-only lines.",
        "Keep it role-specific."
      ]
    },
    "linkedin-thought-leadership-template": {
      role: "thought leadership editor",
      task: "Write thought-leadership posts that combine opinion, evidence, and a useful framework.",
      inputs: [
        "Topic: [topic]",
        "Your point of view: [opinion]",
        "Audience: [who]",
        "Evidence: [data, experience, examples]",
        "Framework (optional): [steps, checklist]",
        "Tone: [bold/neutral]",
        "CTA: [question, DM, follow]"
      ],
      outputs: [
        "2 thought leadership posts (different angles)",
        "Each includes: hook, POV, evidence, framework, CTA",
        "A 'contrarian' version (respectful)",
        "3 discussion questions to use in comments"
      ],
      rules: [
        "Be specific and credible.",
        "Avoid hot takes without evidence.",
        "End with a question that invites thoughtful replies."
      ]
    }
  },
  youtube: {
    "youtube-call-to-action-template": {
      role: "YouTube conversion strategist",
      task: "Create call-to-action (CTA) scripts for YouTube that feel natural and increase clicks/subscribers.",
      inputs: [
        "Video topic: [topic]",
        "Target viewer: [who]",
        "Primary CTA: [subscribe / comment / link / product]",
        "Offer details (if any): [what + link placeholder]",
        "Funnel stage: [awareness/consideration/decision]",
        "Tone: [casual/serious]",
        "Constraints: [no hard sell, time limits]"
      ],
      outputs: [
        "CTA lines for: intro, mid-roll, outro (3 options each)",
        "Pinned comment CTA (3 options)",
        "Description CTA block (copy-ready)",
        "End-screen and card text suggestions",
        "A 'soft CTA' version (relationship-building)"
      ],
      rules: [
        "CTAs must match the video's promise.",
        "Keep CTAs short and specific.",
        "Avoid repeating the same CTA wording."
      ]
    },
    "youtube-channel-branding-template": {
      role: "YouTube channel strategist and brand positioning coach",
      task: "Define a channel brand: positioning, messaging, content pillars, and channel description.",
      inputs: [
        "Channel niche: [topic]",
        "Target viewer: [who]",
        "Unique angle: [why you]",
        "Viewer problems: [bullets]",
        "Content style: [educational/entertainment/documentary]",
        "Competitors/benchmarks: [channels]",
        "Posting frequency: [weekly]",
        "Goals: [subs, revenue, leads]"
      ],
      outputs: [
        "Channel positioning statement (one-liner) + tagline options (10)",
        "Channel 'About' section draft (2 versions)",
        "Content pillars (4–6) + series ideas (3)",
        "Tone/voice guidelines for scripts",
        "90-day content plan (12 video ideas)"
      ],
      rules: [
        "Keep the positioning narrow and memorable.",
        "Make content pillars distinct.",
        "Tie every pillar to viewer outcomes."
      ]
    },
    "youtube-collaboration-pitch-template": {
      role: "YouTube collaborations manager",
      task: "Write a collaboration pitch that highlights mutual value and proposes a clear format.",
      inputs: [
        "Your channel: [niche + audience size]",
        "Partner channel: [name + niche]",
        "Why it's a fit: [overlap + benefit]",
        "Collab idea: [video format + topic]",
        "Production effort: [low/medium/high]",
        "CTA: [reply, call, choose a date]",
        "Tone: [friendly/professional]"
      ],
      outputs: [
        "Email pitch (short) + subject lines (3)",
        "DM version (very short)",
        "Follow-up message",
        "Collab outline (what happens in the video) + why viewers will care",
        "Logistics checklist (assets, dates, promotion plan)"
      ],
      rules: [
        "Lead with what's in it for them.",
        "Make the idea concrete and easy.",
        "Keep outreach short and respectful."
      ]
    },
    "youtube-community-post-template": {
      role: "YouTube community manager",
      task: "Generate community posts that drive comments and keep viewers engaged between uploads.",
      inputs: [
        "Channel niche: [topic]",
        "Post goal: [engagement/tease/poll/value]",
        "Audience: [who]",
        "Upcoming video (optional): [topic]",
        "Tone: [casual/educational]",
        "Constraints: [no links]"
      ],
      outputs: [
        "10 community post drafts (mix: question, poll, teaser, behind-the-scenes)",
        "3 poll questions with 4 options each",
        "Pinned comment follow-up (3 options)",
        "Weekly cadence suggestion (what to post on which days)"
      ],
      rules: [
        "Make prompts easy to answer.",
        "Keep posts short.",
        "Tie posts to your content pillars."
      ]
    },
    "youtube-description-template": {
      role: "YouTube SEO copywriter",
      task: "Write a YouTube video description that improves clarity, retention, and discoverability.",
      inputs: [
        "Video title: [title]",
        "Main keyword: [keyword]",
        "Video summary: [what happens]",
        "Chapters (optional): [timestamps]",
        "Links (optional): [resources]",
        "CTA: [subscribe/link]",
        "Disclosure needs (optional): [affiliate/sponsor]",
        "Tone: [casual/professional]"
      ],
      outputs: [
        "First 2 lines hook (keyword included naturally)",
        "Full description with sections (summary, value bullets, resources, CTA)",
        "Chapters section (if timestamps provided)",
        "Hashtags (3) + pinned comment suggestion",
        "Disclosure text (if needed)"
      ],
      rules: [
        "Keep the first 2 lines compelling and clear.",
        "Avoid keyword stuffing.",
        "Make links scannable."
      ]
    },
    "youtube-hook-generator": {
      role: "retention-focused YouTube script editor",
      task: "Generate high-retention hooks (0–15 seconds) for a YouTube video.",
      inputs: [
        "Video topic: [topic]",
        "Target viewer: [who]",
        "Promise: [what they'll get]",
        "Format: [tutorial/story/reaction/etc]",
        "Tone: [high energy/calm]",
        "Constraints: [no clickbait]"
      ],
      outputs: [
        "25 hook lines (one-liners)",
        "10 hook scripts (0–8 seconds) with spoken words + on-screen text",
        "5 longer openings (0–15 seconds) with pattern interrupts",
        "A/B test notes (which hooks to test first)"
      ],
      rules: [
        "Hooks must match the content payoff.",
        "Avoid vague promises.",
        "Keep language simple and viewer-focused."
      ]
    },
    "youtube-monetization-strategy-template": {
      role: "YouTube monetization strategist",
      task: "Create a monetization roadmap that fits the channel size, niche, and audience.",
      inputs: [
        "Channel niche: [topic]",
        "Audience profile: [who watches]",
        "Current size: [subs/views]",
        "Content types: [list]",
        "Goals: [income target + timeframe]",
        "Strengths/assets: [email list, product, network]",
        "Constraints: [time, budget, comfort on camera]"
      ],
      outputs: [
        "Monetization options ranked (ads, affiliates, sponsorships, products, memberships)",
        "For each option: requirements, best-fit content, setup steps",
        "90-day action plan + weekly milestones",
        "KPIs to track (RPM, CTR, conversion, sponsor outreach)",
        "Risks and common mistakes to avoid"
      ],
      rules: [
        "Recommend 1 primary and 1 secondary path first.",
        "Focus on audience trust and long-term value.",
        "Keep the plan realistic for the channel stage."
      ]
    },
    "youtube-retention-script-template": {
      role: "YouTube retention scriptwriter",
      task: "Write a YouTube script designed to keep viewers watching (open loops + pacing).",
      inputs: [
        "Video topic: [topic]",
        "Target viewer: [who]",
        "Video length: [minutes]",
        "Main promise: [what they get]",
        "Key points: [bullets]",
        "Style: [fast-paced/calm/story]",
        "CTA: [subscribe/link/product]",
        "Constraints: [no fluff, no filler]"
      ],
      outputs: [
        "Hook (0–15s) + intro promise",
        "Script with beats (sections) and pattern interrupts",
        "Open loops (what you tease and where you pay it off)",
        "B-roll / on-screen text suggestions per section",
        "Outro + CTA (2 versions)"
      ],
      rules: [
        "No long intros; get to value fast.",
        "Keep sentences short.",
        "Every section must move the story/teaching forward."
      ]
    },
    "youtube-script-outline": {
      role: "YouTube script strategist",
      task: "Create a script outline that is easy to film and keeps a strong structure.",
      inputs: [
        "Video topic: [topic]",
        "Target viewer: [who]",
        "Promise: [outcome]",
        "Video length: [minutes]",
        "Format: [tutorial/story/list]",
        "Key points: [bullets]",
        "CTA: [what to do]"
      ],
      outputs: [
        "Outline with time stamps (intro, sections, outro)",
        "Key talking points per section",
        "B-roll / visual notes",
        "Retention moments (where to add pattern interrupts)",
        "CTA placement plan"
      ],
      rules: [
        "Make each section earn its time.",
        "Avoid repeating points.",
        "Keep it filmable (simple visuals)."
      ]
    },
    "youtube-seo-checklist-template": {
      role: "YouTube SEO specialist",
      task: "Create a pre-publish SEO checklist for a YouTube video.",
      inputs: [
        "Video topic: [topic]",
        "Main keyword: [keyword]",
        "Audience: [who]",
        "Competitor videos (optional): [links/titles]",
        "Constraints: [niche terms]"
      ],
      outputs: [
        "Keyword + intent snapshot",
        "Title checklist (with 5 title options)",
        "Description checklist (with template)",
        "Tags/chapters/end screens/cards checklist",
        "Thumbnail checklist + A/B test ideas",
        "Pinned comment and community post plan"
      ],
      rules: [
        "Keep suggestions realistic for the niche.",
        "Focus on click + watch time (not tags only).",
        "Avoid misleading titles/thumbnails."
      ]
    },
    "youtube-series-planning-template": {
      role: "YouTube series producer",
      task: "Plan a YouTube series that builds momentum across episodes.",
      inputs: [
        "Series theme: [topic]",
        "Audience: [who]",
        "Goal: [subs, leads, monetization]",
        "Episode count: [e.g., 8]",
        "Publishing frequency: [weekly]",
        "Style: [tutorial/story/documentary]",
        "Constraints: [time, budget]"
      ],
      outputs: [
        "Series concept + why viewers will binge it",
        "Season arc (start → middle → finale payoff)",
        "Episode list (titles + 1–2 sentence summary each)",
        "Retention strategy (cliffhangers, next-episode teasers)",
        "Production checklist + timeline",
        "Metrics to track per episode"
      ],
      rules: [
        "Episodes should build on each other.",
        "Each episode needs a unique promise.",
        "Keep production realistic."
      ]
    },
    "youtube-shorts-script-template": {
      role: "YouTube Shorts scriptwriter",
      task: "Write Shorts scripts designed for watch-through and shares.",
      inputs: [
        "Topic: [topic]",
        "Target viewer: [who]",
        "Duration: [15–60s]",
        "Style: [educational/entertainment]",
        "Key point: [one takeaway]",
        "CTA: [follow/comment/link]",
        "Constraints: [no face/no voice]"
      ],
      outputs: [
        "5 Shorts scripts with timecodes",
        "On-screen text for each beat",
        "Shot list / b-roll ideas",
        "Caption line + 3 hashtag suggestions",
        "Alternate hook per script"
      ],
      rules: [
        "One idea per Short.",
        "Hook in the first 1–2 seconds.",
        "Keep language simple and punchy."
      ]
    },
    "youtube-thumbnail-brief": {
      role: "YouTube thumbnail strategist",
      task: "Generate thumbnail text overlays and thumbnail concepts to improve click-through rate.",
      inputs: [
        "Video topic: [topic]",
        "Target viewer: [who]",
        "Emotion to trigger: [curiosity/shock/relief/etc]",
        "Curiosity gap: [what's the contrast]",
        "Brand style (optional): [clean/bold/minimal]",
        "Words to avoid: [list]",
        "Max words on thumbnail: [e.g., 3–4]",
        "Constraints: [no clickbait]"
      ],
      outputs: [
        "20 thumbnail text options (grouped by angle)",
        "Top 5 recommended overlays + why they work",
        "5 thumbnail concepts (composition, imagery, focal point, background)",
        "A/B test plan (what to change first)",
        "Title + thumbnail pairing suggestions (5 pairs)"
      ],
      rules: [
        "Keep overlays short (few words).",
        "Avoid misleading text.",
        "Make the text and concept instantly readable at small sizes."
      ]
    },
    "youtube-title-pack": {
      role: "YouTube titles and SEO strategist",
      task: "Generate a pack of titles that balance curiosity and SEO.",
      inputs: [
        "Video topic: [topic]",
        "Main keyword: [keyword]",
        "Target viewer: [who]",
        "Format: [how-to/list/story]",
        "Angle: [mistakes, secrets, step-by-step]",
        "Tone: [bold/neutral]",
        "Constraints: [avoid words, length]"
      ],
      outputs: [
        "30 title options grouped by type (SEO, curiosity, contrarian, list)",
        "Top 5 recommended titles + rationale",
        "5 'safe SEO' variations (keyword near start)",
        "5 'high curiosity' variations (still honest)",
        "Thumbnail text suggestions for the top 5 titles"
      ],
      rules: [
        "Do not use misleading clickbait.",
        "Avoid repeating the same structure.",
        "Keep titles easy to read aloud."
      ]
    },
    "youtube-video-outline-template": {
      role: "YouTube content strategist",
      task: "Create a video outline that is easy to film and optimized for retention.",
      inputs: [
        "Video topic: [topic]",
        "Target viewer: [who]",
        "Promise: [what they'll get]",
        "Length: [minutes]",
        "Key points: [bullets]",
        "Examples/stories: [optional]",
        "CTA: [subscribe/link]",
        "Constraints: [no fluff]"
      ],
      outputs: [
        "Hook ideas (5)",
        "Full outline with beats and timestamps",
        "Retention plan (open loops, pattern interrupts)",
        "B-roll / visual notes per beat",
        "Outro + CTA placement"
      ],
      rules: [
        "Deliver value early.",
        "Keep each beat purposeful.",
        "Make it audience-first and specific."
      ]
    }
  },
  students: {
    "academic-email-template": {
      role: "academic advisor",
      task: "Draft a polite academic email to a professor/TA with clear context and a simple ask.",
      inputs: [
        "Recipient: [professor/TA name]",
        "Course + section: [details]",
        "Purpose: [extension/question/meeting/grade inquiry]",
        "Context: [what happened]",
        "What you already tried: [bullets]",
        "Your request: [what you need]",
        "Deadline (if any): [date]",
        "Tone: [respectful/urgent]"
      ],
      outputs: [
        "3 subject line options",
        "Email draft (polite, concise)",
        "A shorter version (<= 120 words)",
        "Follow-up email (if no reply)"
      ],
      rules: [
        "Use a respectful greeting and sign-off.",
        "Make the ask explicit.",
        "Avoid oversharing; keep it relevant."
      ]
    },
    "assignment-helper-template": {
      role: "academic coach",
      task: "Turn an assignment brief into a clear plan, outline, and checklist.",
      inputs: [
        "Assignment prompt/brief: [paste]",
        "Rubric (optional): [paste]",
        "Format: [essay/report/presentation]",
        "Word count / length: [number]",
        "Deadline: [date]",
        "Citation style: [APA/MLA/Chicago]",
        "Constraints: [sources allowed, AI rules]"
      ],
      outputs: [
        "Requirement breakdown (what you must include)",
        "Clarifying questions to ask your instructor (if needed)",
        "Outline (sections + what goes in each)",
        "Research plan (what sources to find)",
        "Timeline (backward plan to the deadline)",
        "Final checklist (submission-ready)"
      ],
      rules: [
        "Follow the rubric strictly.",
        "Do not invent sources.",
        "Keep the plan realistic for the time left."
      ]
    },
    "case-study-summary-template": {
      role: "case study analyst and tutor",
      task: "Summarize a case study and extract key insights and recommendations.",
      inputs: [
        "Case study text: [paste]",
        "Course/context: [topic]",
        "Framework required (optional): [SWOT/5 forces/etc]",
        "Length: [short/medium/long]",
        "Constraints: [what to focus on]"
      ],
      outputs: [
        "Case summary (key facts + situation)",
        "Problem statement (what decision must be made)",
        "Analysis (using the framework if provided)",
        "Recommendations (prioritized) + risks",
        "Discussion questions (3–5)"
      ],
      rules: [
        "Do not add facts not in the case.",
        "Separate facts from interpretation.",
        "Make recommendations specific and actionable."
      ]
    },
    "essay-outline-builder": {
      role: "essay writing tutor",
      task: "Create a strong essay outline with thesis, arguments, evidence, and counterargument.",
      inputs: [
        "Essay prompt: [paste]",
        "Academic level: [high school/undergrad/grad]",
        "Word count: [number]",
        "Thesis idea (optional): [draft]",
        "Key arguments (optional): [bullets]",
        "Required sources: [count/type]",
        "Citation style: [APA/MLA/etc]",
        "Tone: [formal]"
      ],
      outputs: [
        "3 thesis statement options",
        "Outline (intro, body sections, conclusion)",
        "Evidence plan (what to cite in each section)",
        "Counterargument + rebuttal section",
        "Writing tips for clarity and structure"
      ],
      rules: [
        "Keep arguments logically ordered.",
        "Avoid vague claims; suggest what evidence is needed.",
        "Match the outline to the word count."
      ]
    },
    "exam-revision-template": {
      role: "study planner",
      task: "Create an exam revision plan with weekly goals, daily sessions, and practice strategy.",
      inputs: [
        "Exam date: [date]",
        "Subjects/topics: [list]",
        "Your strengths/weaknesses: [bullets]",
        "Hours available per week: [number]",
        "Study methods you prefer: [flashcards/practice tests/etc]",
        "Materials: [notes/book/past papers]",
        "Constraints: [work schedule]"
      ],
      outputs: [
        "Weekly plan (from now to exam) with topic allocation",
        "Daily session template (warm-up, deep work, review)",
        "Practice plan (past papers, quizzes) + when to start",
        "Spaced repetition schedule",
        "Checkpoints (mock exams) + adjustment rules"
      ],
      rules: [
        "Balance learning and practice.",
        "Prioritize weak areas without neglecting strong ones.",
        "Include rest/recovery blocks."
      ]
    },
    "flashcards-generator-template": {
      role: "learning science tutor",
      task: "Generate high-quality flashcards from notes or a topic with spaced repetition tips.",
      inputs: [
        "Topic: [topic]",
        "Source notes/text: [paste]",
        "Academic level: [level]",
        "Exam style: [multiple choice/essay/etc]",
        "Number of cards: [e.g., 30]",
        "Constraints: [focus areas]"
      ],
      outputs: [
        "Flashcards grouped by theme (Q → A)",
        "A few 'application' cards (not just definitions)",
        "Common mistakes to watch for",
        "Spaced repetition schedule suggestion"
      ],
      rules: [
        "Keep questions atomic (one idea per card).",
        "Prefer active recall questions.",
        "Avoid trick questions."
      ]
    },
    "group-project-planner-template": {
      role: "student project manager",
      task: "Plan a group project with roles, timeline, and communication rules.",
      inputs: [
        "Project topic: [topic]",
        "Deliverables: [slides/report/demo]",
        "Deadline: [date]",
        "Team members: [names/roles]",
        "Tools: [Google Docs/Trello/etc]",
        "Constraints: [availability, time zones]"
      ],
      outputs: [
        "Project plan overview + success criteria",
        "Role assignment (RACI-lite) + responsibilities",
        "Timeline with milestones (weekly)",
        "Meeting cadence + agendas",
        "Risk plan (common group issues + prevention)",
        "Final week checklist"
      ],
      rules: [
        "Make tasks small and assign owners.",
        "Include buffer time.",
        "Define how decisions are made."
      ]
    },
    "lecture-notes-summarizer": {
      role: "note-taking assistant",
      task: "Summarize lecture notes into a study-friendly structure with definitions and questions.",
      inputs: [
        "Lecture notes/transcript: [paste]",
        "Course/topic: [optional]",
        "Exam focus (optional): [what matters]",
        "Preferred format: [Cornell/bullets]"
      ],
      outputs: [
        "Structured summary (headings + bullets)",
        "Key terms + definitions",
        "Examples/analogies (if present) + simplified explanations",
        "Likely exam questions (5–10)",
        "Gaps/unclear points to ask about"
      ],
      rules: [
        "Do not invent facts.",
        "Keep explanations simple.",
        "Highlight what seems most testable."
      ]
    },
    "note-taking-template": {
      role: "study skills tutor",
      task: "Create a note-taking template that helps you capture and review information effectively.",
      inputs: [
        "Subject/topic: [topic]",
        "Source type: [lecture/book/video]",
        "Learning goal: [what you want to understand]",
        "Preferred system: [Cornell/outline/mind map]",
        "Constraints: [time, exam date]"
      ],
      outputs: [
        "A fill-in note template (headings + prompts)",
        "A review section (summary + questions + next steps)",
        "A weekly review plan (10–20 minutes)",
        "Tips to keep notes concise and useful"
      ],
      rules: [
        "Use prompts that force active thinking.",
        "Keep it fast to fill during class.",
        "Include a space for confusion/questions."
      ]
    },
    "presentation-script-template": {
      role: "presentation coach",
      task: "Write a presentation script/talk track that fits the time and keeps the audience engaged.",
      inputs: [
        "Topic: [topic]",
        "Audience: [who]",
        "Duration: [minutes]",
        "Key points: [bullets]",
        "Slide outline (optional): [titles]",
        "Tone: [formal/casual]",
        "CTA: [what you want them to do]"
      ],
      outputs: [
        "Opening hook + agenda",
        "Slide-by-slide talk track (with timing guidance)",
        "Transition lines between sections",
        "Closing summary + CTA",
        "Q&A prep (5 likely questions + answers)"
      ],
      rules: [
        "Fit the time limit.",
        "Use spoken-language (not essay language).",
        "Keep sentences short and clear."
      ]
    },
    "research-paper-template": {
      role: "research writing coach",
      task: "Create a research paper structure and writing plan that matches academic expectations.",
      inputs: [
        "Topic: [topic]",
        "Research question: [question]",
        "Thesis/argument: [draft]",
        "Methodology: [qualitative/quantitative/lit review]",
        "Word count: [number]",
        "Citation style: [APA/MLA/etc]",
        "Required sections: [if specified]",
        "Constraints: [sources, deadline]"
      ],
      outputs: [
        "Paper outline (abstract, intro, lit review, methods, discussion, conclusion)",
        "Writing prompts for each section (what to include)",
        "Source plan (what types of sources to find)",
        "Argument map (claims → evidence → implications)",
        "Revision checklist (clarity, citations, structure)"
      ],
      rules: [
        "Do not fabricate citations.",
        "Keep argument logically consistent.",
        "Align structure to the methodology."
      ]
    },
    "scholarship-application-template": {
      role: "scholarship essay coach",
      task: "Draft a scholarship application narrative that matches criteria and highlights impact.",
      inputs: [
        "Scholarship name + criteria: [paste]",
        "Your background story: [bullets]",
        "Achievements: [metrics + wins]",
        "Financial need (optional): [context]",
        "Goals: [academic/career]",
        "Word limit: [number]",
        "Tone: [humble/confident]",
        "Constraints: [must answer questions]"
      ],
      outputs: [
        "Story outline (hook → challenge → action → impact → future)",
        "Full draft within the word limit",
        "A shorter version (if needed)",
        "Bullet list of achievements to include",
        "Tailoring notes (how it matches the criteria)"
      ],
      rules: [
        "Be specific and evidence-based.",
        "Avoid generic motivational language.",
        "Keep it authentic and coherent."
      ]
    },
    "study-notes-organizer-template": {
      role: "study notes organizer",
      task: "Organize messy notes into a clean, exam-ready format.",
      inputs: [
        "Raw notes: [paste]",
        "Course/topic: [optional]",
        "Exam date (optional): [date]",
        "Preferred format: [headings/bullets/Cornell]",
        "Constraints: [what to focus on]"
      ],
      outputs: [
        "Organized notes by theme with headings",
        "Key terms + definitions",
        "Summary (one page style)",
        "Practice questions (10) + answers (short)",
        "Flashcard suggestions (10 Q/A pairs)"
      ],
      rules: [
        "Do not invent content.",
        "Keep it scannable.",
        "Prioritize the most testable information."
      ]
    },
    "study-plan-generator": {
      role: "study planner",
      task: "Generate a personalized study plan with realistic daily tasks and checkpoints.",
      inputs: [
        "Goal: [exam/assignment/skill]",
        "Deadline: [date]",
        "Topics to cover: [list]",
        "Current level: [beginner/intermediate]",
        "Hours per week: [number]",
        "Preferred methods: [practice/flashcards/reading]",
        "Constraints: [work/school schedule]"
      ],
      outputs: [
        "Weekly plan with topic allocation",
        "Daily checklist template",
        "Practice strategy (when/how to test yourself)",
        "Review checkpoints and adjustment rules",
        "Motivation and consistency tips (practical)"
      ],
      rules: [
        "Keep tasks small and achievable.",
        "Include review and practice, not just reading.",
        "Add buffer days."
      ]
    },
    "thesis-outline-template": {
      role: "thesis supervisor and research coach",
      task: "Create a thesis outline with chapter structure, research aims, and methods.",
      inputs: [
        "Discipline: [field]",
        "Topic: [topic]",
        "Research question(s): [questions]",
        "Thesis/argument (optional): [draft]",
        "Methodology: [qual/quant/mixed]",
        "Required chapters: [if any]",
        "Length: [pages/words]",
        "Deadline: [date]"
      ],
      outputs: [
        "Research aims + contribution (what's new)",
        "Chapter-by-chapter outline (headings + bullet points)",
        "Methods section plan (data, sampling, analysis)",
        "Literature review plan (themes + search strategy)",
        "Timeline (milestones to deadline) + risk plan"
      ],
      rules: [
        "Keep chapters logically connected.",
        "Match methods to research questions.",
        "Label assumptions and missing requirements."
      ]
    }
  },
  writing: {
    "blog-post-outline": {
      role: "SEO editor and content strategist",
      task: "Create a blog post outline that matches intent and is easy to write.",
      inputs: [
        "Topic: [topic]",
        "Primary keyword: [keyword]",
        "Audience: [who]",
        "Goal: [rank/leads/education]",
        "Tone: [friendly/technical]",
        "Word count: [number]",
        "Internal links: [URLs]",
        "CTA: [what to do]"
      ],
      outputs: [
        "5 title options + 1 recommended",
        "Intro hook paragraph",
        "Outline (H1/H2/H3) with key points under each heading",
        "FAQ section (6–10 Q&As)",
        "Meta description + snippet-ready summary",
        "CTA placements + internal linking notes"
      ],
      rules: [
        "Write for humans first.",
        "Avoid fluff; include examples.",
        "Keep headings varied and non-repetitive."
      ]
    },
    "case-study-writer": {
      role: "case study writer and editorial lead",
      task: "Turn project outcomes into a persuasive case study that builds trust.",
      inputs: [
        "Client (or anonymized): [who]",
        "Industry: [optional]",
        "Starting point/problem: [before]",
        "Goals: [what success meant]",
        "What you did: [steps/process]",
        "Results: [metrics + proof]",
        "Quote (optional): [paste]",
        "CTA: [book a call/read more]",
        "Tone: [credible, humble, confident]"
      ],
      outputs: [
        "Headline + subheadline",
        "Client background + challenge",
        "Approach (step-by-step) + rationale",
        "Results section (metrics, proof points, quote placeholders)",
        "Key takeaways + who this is for",
        "CTA section + short summary version"
      ],
      rules: [
        "Be specific and measurable.",
        "Avoid inflated claims.",
        "Make the story easy to skim (headings + bullets)."
      ]
    },
    "newsletter-draft": {
      role: "newsletter editor",
      task: "Draft a newsletter issue that is readable, valuable, and drives one clear action.",
      inputs: [
        "Newsletter topic: [topic]",
        "Audience: [who]",
        "Key points: [bullets]",
        "Story/example (optional): [paste]",
        "Links/resources (optional): [list]",
        "CTA: [reply/click/buy]",
        "Length: [short/medium/long]",
        "Tone: [friendly/authoritative]"
      ],
      outputs: [
        "5 subject lines + 3 preview texts",
        "Opening hook + promise",
        "Main sections (2–4) with headings and bullets",
        "Quick takeaway summary",
        "CTA block + P.S.",
        "A shorter version (for social reposting)"
      ],
      rules: [
        "One primary CTA.",
        "Write for skimming.",
        "Add practical examples, not fluff."
      ]
    }
  }
};

function getFallbackBlueprint(templateName, category) {
  const profile = categoryProfiles[category] || {
    role: "expert AI assistant",
    audience: "a specific audience",
    tone: "clear and helpful"
  };

  return {
    role: profile.role,
    tone: profile.tone,
    task: `Create a detailed ${templateName} that is ready to copy and use.`,
    inputs: [
      "Context: [background details]",
      "Audience: [who it's for]",
      "Goal: [what you want to achieve]",
      "Constraints: [limits, format, rules]",
      "Examples (optional): [paste]"
    ],
    outputs: [
      "A structured draft with clear headings",
      "Variations (2–3) if helpful",
      "A short checklist for next steps"
    ],
    rules: [
      "Avoid generic filler.",
      "Ask clarifying questions when needed.",
      "Keep the output practical and copy-ready."
    ],
    audience: profile.audience
  };
}

function buildPrompt({ templateName, category, slug }) {
  const profile = categoryProfiles[category] || {
    role: "expert AI assistant",
    audience: "a specific audience",
    tone: "clear and helpful"
  };

  const blueprint = promptBlueprints?.[category]?.[slug] || getFallbackBlueprint(templateName, category);
  const role = blueprint.role || profile.role;
  const tone = blueprint.tone || profile.tone;
  const audience = blueprint.audience || profile.audience;
  const task = blueprint.task || `Create a detailed ${templateName} that is ready to copy and use.`;
  const inputs = blueprint.inputs || [];
  const outputs = blueprint.outputs || [];
  const rules = blueprint.rules || [];
  const eol = "\n";

  return joinLines(
    [
      `You are a ${role}.`,
      `Task: ${task}`,
      `Write for: ${audience}.`,
      `Tone: ${tone}.`,
      ``,
      `Inputs (fill in the brackets):`,
      ...inputs.map((inputLine) => `- ${inputLine}`),
      ``,
      `Output (use this exact structure):`,
      ...outputs.map((section, index) => `${index + 1}) ${section}`),
      ``,
      `Rules:`,
      ...rules.map((rule) => `- ${rule}`),
      ``,
      `If any critical information is missing, ask up to 5 clarifying questions before writing.`,
      `If details are optional, make reasonable assumptions and label them clearly.`
    ],
    eol
  );
}

function collectTemplatePages(directory) {
  const pages = [];
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      pages.push(...collectTemplatePages(absolutePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) {
      continue;
    }

    pages.push(absolutePath);
  }

  return pages;
}

function rewritePage(filePath) {
  const existing = readFileSync(filePath, "utf8");
  const promptMatch = existing.match(/<textarea class="template-prompt-box" id="prompt-box">([\s\S]*?)<\/textarea>/);

  if (!promptMatch) {
    return false;
  }

  const { category, slug } = getTemplatePathParts(filePath);
  const templateName = normalizeTemplateName(extractTitle(existing, "AI Prompt Template"));
  const prompt = buildPrompt({ templateName, category, slug });
  const escapedPrompt = escapeHtml(prompt).replace(/\n/g, eolFor(existing));
  const next = existing.replace(promptMatch[1], escapedPrompt);

  if (next === existing) {
    return false;
  }

  writeFileSync(filePath, next, "utf8");
  return true;
}

let updatedCount = 0;
for (const filePath of collectTemplatePages(templatesDir)) {
  if (rewritePage(filePath)) {
    updatedCount += 1;
  }
}

console.log(`[prompts] Updated prompt boxes in ${updatedCount} template pages.`);