import Foundation

// AUTO-GENERATED from website catalog pages. Do not hand-edit.

struct AiTool: Identifiable { let id: String; let name: String; let price: Int; let desc: String; let inputLabel: String }
let aiTools: [AiTool] = [
    AiTool(id: "logo", name: "AI Logo Generator", price: 499, desc: "Generate 10 logo options from your brand description", inputLabel: "Describe your brand"),
    AiTool(id: "business", name: "Business Name Generator", price: 199, desc: "AI-powered business name suggestions", inputLabel: "What does your business do?"),
    AiTool(id: "tagline", name: "Tagline Generator", price: 199, desc: "Catchy taglines for your brand", inputLabel: "Enter your brand name"),
    AiTool(id: "palette", name: "Color Palette Generator", price: 99, desc: "Beautiful color combinations", inputLabel: "Describe your brand mood"),
    AiTool(id: "social", name: "Social Post Generator", price: 299, desc: "AI-generated social media content", inputLabel: "What are you promoting?"),
]
struct AuditPack: Identifiable { let name: String; let price: Int; let desc: String; var id: String { name } }
let auditPacks: [AuditPack] = [
    AuditPack(name: "SEO Audit", price: 999, desc: "Comprehensive SEO analysis with PDF report"),
    AuditPack(name: "Performance Audit", price: 1499, desc: "Lighthouse scores + custom performance checks"),
    AuditPack(name: "Accessibility Audit", price: 999, desc: "WCAG compliance check with recommendations"),
    AuditPack(name: "Security Scan", price: 2499, desc: "Vulnerability assessment + security report"),
    AuditPack(name: "Brand Consistency", price: 799, desc: "Check brand consistency across your site"),
]
struct Guide: Identifiable { let name: String; let price: Int; let pages: Int; let sales: Int; let rating: Double; var id: String { name } }
let guides: [Guide] = [
    Guide(name: "Next.js Deployment Guide", price: 499, pages: 45, sales: 567, rating: 4.8),
    Guide(name: "DevOps Pipeline Setup", price: 799, pages: 78, sales: 234, rating: 4.9),
    Guide(name: "UI/UX Principles for Devs", price: 599, pages: 62, sales: 445, rating: 4.7),
    Guide(name: "App Store Approval Checklist", price: 299, pages: 25, sales: 890, rating: 4.6),
]
struct CicdTpl: Identifiable { let name: String; let price: Int; let platform: String; let desc: String; let yaml: String; var id: String { name } }
let cicdTpls: [CicdTpl] = [
    CicdTpl(name: "Next.js CI/CD", price: 999, platform: "github", desc: "Build, test, deploy Next.js apps", yaml: "name: Next.js CI\n\non: [push]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Setup Node\n        uses: actions/setup-node@v3\n      - run: npm ci\n      - run: npm run build"),
    CicdTpl(name: "Docker Deployment", price: 999, platform: "github", desc: "Build and push Docker images", yaml: "name: Docker Build\n\non: [push]\n\njobs:\n  docker:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Build Docker\n        run: docker build -t app ."),
    CicdTpl(name: "AWS Deployment", price: 1499, platform: "gitlab", desc: "Deploy to AWS with GitLab CI", yaml: "stages:\n  - build\n  - deploy\n\ndeploy:\n  stage: deploy\n  script:\n    - aws deploy push"),
]
struct EnvSetup: Identifiable { let name: String; let price: Int; let desc: String; let command: String; let includes: [String]; var id: String { name } }
let envSetups: [EnvSetup] = [
    EnvSetup(name: "Full Stack Dev Environment", price: 499, desc: "One command setup for complete development environment", command: "curl -fsSL https://grapsee.dev/setup | bash", includes: ["Docker", "VS Code", "Git", "Node.js", "TypeScript", "PostgreSQL", "Redis"]),
    EnvSetup(name: "Frontend Dev Kit", price: 299, desc: "React/Next.js development essentials", command: "curl -fsSL https://grapsee.dev/frontend | bash", includes: ["Next.js 14", "Tailwind CSS", "shadcn/ui", "ESLint", "Prettier", "Husky"]),
]
struct DbSchema: Identifiable { let key: String; let name: String; let price: Int; let desc: String; let code: String; var id: String { key } }
let dbSchemas: [DbSchema] = [
    DbSchema(key: "ecommerce", name: "E-commerce Schema", price: 499, desc: "Products, orders, users, cart, reviews", code: "model Product {\n  id        String   @id @default(uuid())\n  name      String\n  price     Decimal\n  category  Category @relation(fields: [categoryId], references: [id])\n  orders    Order[]\n  reviews   Review[]\n}\n\nmodel Order {\n  id        String   @id @default(uuid())\n  user      User     @relation(fields: [userId], references: [id])\n  products  Product[]\n  total     Decimal\n  status    OrderStatus\n  createdAt DateTime @default(now())\n}"),
    DbSchema(key: "saas", name: "SaaS Schema", price: 499, desc: "Tenants, subscriptions, billing, teams", code: "model Tenant {\n  id        String   @id @default(uuid())\n  name      String\n  users     User[]\n  plan      Plan     @relation(fields: [planId], references: [id])\n  billing   Billing?\n  createdAt DateTime @default(now())\n}\n\nmodel Subscription {\n  id        String   @id @default(uuid())\n  tenant    Tenant   @relation(fields: [tenantId], references: [id])\n  status    SubscriptionStatus\n  period    SubscriptionPeriod\n  price     Decimal\n}"),
    DbSchema(key: "blog", name: "Blog Schema", price: 499, desc: "Posts, authors, categories, comments, tags", code: "model Post {\n  id        String   @id @default(uuid())\n  title     String\n  slug      String   @unique\n  content   String\n  author    Author   @relation(fields: [authorId], references: [id])\n  category  Category @relation(fields: [categoryId], references: [id])\n  tags      Tag[]\n  comments  Comment[]\n  published Boolean  @default(false)\n  createdAt DateTime @default(now())\n}"),
]
struct NotionTpl: Identifiable { let name: String; let price: Int; let sales: Int; let rating: Double; let pages: Int; let desc: String; var id: String { name } }
let notionTpls: [NotionTpl] = [
    NotionTpl(name: "Project Management Hub", price: 499, sales: 567, rating: 4.8, pages: 12, desc: "Complete project tracking with timelines, tasks, and team collaboration"),
    NotionTpl(name: "CRM Database", price: 499, sales: 432, rating: 4.7, pages: 8, desc: "Customer relationship management with deals, contacts, and interactions"),
    NotionTpl(name: "Content Calendar", price: 299, sales: 890, rating: 4.9, pages: 6, desc: "Social media and blog content planning with publish schedule"),
    NotionTpl(name: "Finance Tracker", price: 399, sales: 345, rating: 4.6, pages: 10, desc: "Personal or business finance tracking with budgets and reports"),
    NotionTpl(name: "Habit Tracker", price: 199, sales: 1234, rating: 4.8, pages: 4, desc: "Daily habits, goals, and progress visualization"),
]
struct Tutorial: Identifiable { let title: String; let duration: String; let views: String; let price: Int; let rating: Double; var id: String { title } }
let tutorials: [Tutorial] = [
    Tutorial(title: "Deploy Next.js to Vercel", duration: "5 min", views: "12K", price: 99, rating: 4.8),
    Tutorial(title: "Setup SSL Certificate", duration: "8 min", views: "8.5K", price: 99, rating: 4.7),
    Tutorial(title: "Configure Environment Variables", duration: "4 min", views: "15K", price: 99, rating: 4.9),
    Tutorial(title: "Fix Common React Errors", duration: "10 min", views: "22K", price: 99, rating: 4.8),
    Tutorial(title: "Optimize Images for Web", duration: "6 min", views: "9K", price: 99, rating: 4.6),
    Tutorial(title: "Setup Dark Mode", duration: "7 min", views: "18K", price: 99, rating: 4.9),
]
