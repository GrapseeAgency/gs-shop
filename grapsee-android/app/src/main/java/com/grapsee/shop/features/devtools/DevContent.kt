package com.grapsee.shop.features.devtools

// AUTO-GENERATED from website catalog pages. Do not hand-edit.

internal data class AiTool(val id: String, val name: String, val price: Int, val desc: String, val inputLabel: String)
internal val aiTools = listOf(
    AiTool("logo", "AI Logo Generator", 499, "Generate 10 logo options from your brand description", "Describe your brand"),
    AiTool("business", "Business Name Generator", 199, "AI-powered business name suggestions", "What does your business do?"),
    AiTool("tagline", "Tagline Generator", 199, "Catchy taglines for your brand", "Enter your brand name"),
    AiTool("palette", "Color Palette Generator", 99, "Beautiful color combinations", "Describe your brand mood"),
    AiTool("social", "Social Post Generator", 299, "AI-generated social media content", "What are you promoting?"),
)

internal data class AuditPack(val name: String, val price: Int, val desc: String)
internal val auditPacks = listOf(
    AuditPack("SEO Audit", 999, "Comprehensive SEO analysis with PDF report"),
    AuditPack("Performance Audit", 1499, "Lighthouse scores + custom performance checks"),
    AuditPack("Accessibility Audit", 999, "WCAG compliance check with recommendations"),
    AuditPack("Security Scan", 2499, "Vulnerability assessment + security report"),
    AuditPack("Brand Consistency", 799, "Check brand consistency across your site"),
)

internal data class Guide(val name: String, val price: Int, val pages: Int, val sales: Int, val rating: Double)
internal val guides = listOf(
    Guide("Next.js Deployment Guide", 499, 45, 567, 4.8),
    Guide("DevOps Pipeline Setup", 799, 78, 234, 4.9),
    Guide("UI/UX Principles for Devs", 599, 62, 445, 4.7),
    Guide("App Store Approval Checklist", 299, 25, 890, 4.6),
)

internal data class CicdTpl(val name: String, val price: Int, val platform: String, val desc: String, val yaml: String)
internal val cicdTpls = listOf(
    CicdTpl("Next.js CI/CD", 999, "github", "Build, test, deploy Next.js apps", "name: Next.js CI\n\non: [push]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Setup Node\n        uses: actions/setup-node@v3\n      - run: npm ci\n      - run: npm run build"),
    CicdTpl("Docker Deployment", 999, "github", "Build and push Docker images", "name: Docker Build\n\non: [push]\n\njobs:\n  docker:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Build Docker\n        run: docker build -t app ."),
    CicdTpl("AWS Deployment", 1499, "gitlab", "Deploy to AWS with GitLab CI", "stages:\n  - build\n  - deploy\n\ndeploy:\n  stage: deploy\n  script:\n    - aws deploy push"),
)

internal data class EnvSetup(val name: String, val price: Int, val desc: String, val command: String, val includes: List<String>)
internal val envSetups = listOf(
    EnvSetup("Full Stack Dev Environment", 499, "One command setup for complete development environment", "curl -fsSL https://grapsee.dev/setup | bash", listOf("Docker", "VS Code", "Git", "Node.js", "TypeScript", "PostgreSQL", "Redis")),
    EnvSetup("Frontend Dev Kit", 299, "React/Next.js development essentials", "curl -fsSL https://grapsee.dev/frontend | bash", listOf("Next.js 14", "Tailwind CSS", "shadcn/ui", "ESLint", "Prettier", "Husky")),
)

internal data class DbSchema(val key: String, val name: String, val price: Int, val desc: String, val code: String)
internal val dbSchemas = listOf(
    DbSchema("ecommerce", "E-commerce Schema", 499, "Products, orders, users, cart, reviews", "model Product {\n  id        String   @id @default(uuid())\n  name      String\n  price     Decimal\n  category  Category @relation(fields: [categoryId], references: [id])\n  orders    Order[]\n  reviews   Review[]\n}\n\nmodel Order {\n  id        String   @id @default(uuid())\n  user      User     @relation(fields: [userId], references: [id])\n  products  Product[]\n  total     Decimal\n  status    OrderStatus\n  createdAt DateTime @default(now())\n}"),
    DbSchema("saas", "SaaS Schema", 499, "Tenants, subscriptions, billing, teams", "model Tenant {\n  id        String   @id @default(uuid())\n  name      String\n  users     User[]\n  plan      Plan     @relation(fields: [planId], references: [id])\n  billing   Billing?\n  createdAt DateTime @default(now())\n}\n\nmodel Subscription {\n  id        String   @id @default(uuid())\n  tenant    Tenant   @relation(fields: [tenantId], references: [id])\n  status    SubscriptionStatus\n  period    SubscriptionPeriod\n  price     Decimal\n}"),
    DbSchema("blog", "Blog Schema", 499, "Posts, authors, categories, comments, tags", "model Post {\n  id        String   @id @default(uuid())\n  title     String\n  slug      String   @unique\n  content   String\n  author    Author   @relation(fields: [authorId], references: [id])\n  category  Category @relation(fields: [categoryId], references: [id])\n  tags      Tag[]\n  comments  Comment[]\n  published Boolean  @default(false)\n  createdAt DateTime @default(now())\n}"),
)

internal data class NotionTpl(val name: String, val price: Int, val sales: Int, val rating: Double, val pages: Int, val desc: String)
internal val notionTpls = listOf(
    NotionTpl("Project Management Hub", 499, 567, 4.8, 12, "Complete project tracking with timelines, tasks, and team collaboration"),
    NotionTpl("CRM Database", 499, 432, 4.7, 8, "Customer relationship management with deals, contacts, and interactions"),
    NotionTpl("Content Calendar", 299, 890, 4.9, 6, "Social media and blog content planning with publish schedule"),
    NotionTpl("Finance Tracker", 399, 345, 4.6, 10, "Personal or business finance tracking with budgets and reports"),
    NotionTpl("Habit Tracker", 199, 1234, 4.8, 4, "Daily habits, goals, and progress visualization"),
)

internal data class Tutorial(val title: String, val duration: String, val views: String, val price: Int, val rating: Double)
internal val tutorials = listOf(
    Tutorial("Deploy Next.js to Vercel", "5 min", "12K", 99, 4.8),
    Tutorial("Setup SSL Certificate", "8 min", "8.5K", 99, 4.7),
    Tutorial("Configure Environment Variables", "4 min", "15K", 99, 4.9),
    Tutorial("Fix Common React Errors", "10 min", "22K", 99, 4.8),
    Tutorial("Optimize Images for Web", "6 min", "9K", 99, 4.6),
    Tutorial("Setup Dark Mode", "7 min", "18K", 99, 4.9),
)
