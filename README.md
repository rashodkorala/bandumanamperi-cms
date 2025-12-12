# Personal CMS

A modern, full-featured personal content management system built with Next.js 15, Supabase, and shadcn/ui. Perfect for managing artwork portfolios, photography collections, personal projects, and content.

## 📸 Preview

![Dashboard](public/photo2.png)

![Dashboard](public/photo3.png)

![Dashboard](public/photo1.png)

## 🚀 Features

### Core Features

- **Authentication**: Secure password-based authentication with Supabase
- **Dashboard**: Overview of all your content and statistics
- **Artworks Management**: Comprehensive artwork portfolio management with:
  - Single artwork upload with rich metadata
  - **Bulk upload** for multiple artworks at once
  - **Collections/Series** organization
  - Dimensions, materials, and techniques tracking
  - Exhibition history
  - Pricing and availability management
  - Status tracking (draft, published, archived)
  - Featured artwork flagging
  - Media gallery with multiple images per artwork
  - Tags and categories for organization

- **Collections View**: Dedicated interface for viewing and managing artwork collections:
  - Browse all collections with artwork grids
  - Search collections and artworks
  - Collection statistics and overview
  - Quick preview and management actions

- **Projects Management**: Track and manage personal projects with:
  - AI-powered project content generation (optional questionnaire flow)
  - Multiple images per project
  - Status tracking (draft, published, archived)
  - Technology tags
  - Featured projects
  - Links (website, GitHub, case study)
  - Problem/solution descriptions
  - Features and roles tracking

- **Photography Management**: Organize your photo collection with:
  - Bulk upload support
  - AI-powered metadata generation (OpenAI integration)
  - Category organization
  - Camera settings tracking
  - Location and date information
  - Tags and featured photos
  - Image preview and optimization

- **Content Management**: Manage various content types
- **Media Library**: Centralized media management
- **Pages**: Create and manage custom pages
- **Analytics**: Track your content performance
- **Tags**: Organize content with tags

### Technical Features

- **Next.js 15** with App Router and Server Actions
- **Supabase** for database, authentication, and storage
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Row Level Security (RLS)** for data protection
- **Responsive Design** - works on all devices
- **Dark Mode** support
- **Image Optimization** with Next.js Image component

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **pnpm** package manager (recommended) or npm/yarn
- A **Supabase** account (free tier works)
- (Optional) An **OpenAI API key** for AI features (photo analysis and project content generation)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bandumanamperi-cms
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com/dashboard)
2. Go to **Settings** → **API** to get your credentials
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key_optional
ANALYTICS_API_KEY=your_analytics_secret_key_optional
ANALYTICS_USER_ID=your_supabase_user_id_optional
```

### 4. Set Up Database

Run the following SQL scripts in your Supabase SQL Editor (in order):

1. **Artworks Table**: `database-schema-artworks.sql`
2. **Projects Table**: `database-schema-projects.sql` (if using projects)
3. **Photos Table**: `database-schema-photos.sql` (if using photos)
4. **Analytics Table**: `database-schema-analytics.sql` (if using analytics)
5. **Pages Table**: `database-schema-pages.sql` (if using pages)
6. **Blogs Table**: `database-schema-blogs.sql` (if using blogs)

See the detailed setup guides:
- [Artworks Setup Guide](./app/docs/features/artworks)
- [Projects Setup Guide](./PROJECTS_SETUP.md)
- [Photos Setup Guide](./PHOTOS_SETUP.md)

### 5. Set Up Storage Buckets

Create storage buckets in Supabase Dashboard → Storage or run the SQL scripts:

1. **artworks** bucket (public, for artwork images)
   - Run: `database-storage-artworks-bucket.sql`
   - Or create manually: public bucket, 10MB limit, image MIME types

2. **photos** bucket (public, for photo uploads)
   - Set up policies as described in [Bulk Upload Setup](./BULK_UPLOAD_SETUP.md)

### 6. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

Complete documentation is available in the `/docs` section of the application. Access it at `/docs` after starting the server.

### Quick Links

- [Getting Started](/docs) - Installation and setup
- [Artworks Management](/docs/features/artworks) - Complete artworks guide
- [Collections](/docs/features/collections) - Collections management
- [Database Setup](/docs/database/artworks) - Database schema
- [Storage Setup](/docs/storage/artworks) - Storage bucket configuration

### Setup Guides

- [Projects Setup](./PROJECTS_SETUP.md) - Setting up the projects feature
- [Photos Setup](./PHOTOS_SETUP.md) - Setting up the photography feature
- [Bulk Upload Setup](./BULK_UPLOAD_SETUP.md) - Bulk artwork upload
- [AI Photo Analysis Setup](./AI_PHOTO_ANALYSIS_SETUP.md) - AI-powered metadata generation
- [AI Project Generation Setup](./AI_PROJECT_GENERATION_SETUP.md) - AI-powered project content generation
- [Analytics Setup](./ANALYTICS_SETUP.md) - Analytics tracking setup

## 🎯 Usage

### Artworks Management

#### Creating a Single Artwork

1. Navigate to **Artworks** in the sidebar
2. Click **New Artwork**
3. Fill in artwork details:
   - **Basic Information**: Title, year, description, link
   - **Categorization**: Category, medium, series/collection, tags
   - **Dimensions**: Width, height, depth, unit
   - **Additional Details**: Materials, technique, location, artist notes
   - **Status & Settings**: Status, availability, price, currency, sort order
   - **Media**: Upload thumbnail and additional gallery images
   - **Exhibition History**: Add exhibition entries
4. Click **Create Artwork**

#### Bulk Upload Artworks

1. Navigate to **Artworks** in the sidebar
2. Click **Bulk Upload** button
3. **Set Common Defaults** (optional):
   - Category, Collection/Series, Status, Availability, Currency
   - Click **Apply to All** to apply to all artworks
4. **Select Images**: Click upload area or drag and drop multiple images
5. **Customize Each Artwork**: Edit title, description, category, etc. for each artwork
6. **Review and Upload**: See previews and upload progress
7. Click **Upload X Artwork(s)** to process

#### Managing Collections

1. Navigate to **Collections** in the sidebar
2. View all collections with their artworks
3. **Search**: Use search bar to find collections or artworks
4. **Preview**: Click preview on any artwork to see details
5. **Manage**: Edit or delete artworks from collection view

Collections are automatically created when you assign a **Series** name to artworks. Use consistent naming for proper grouping.

### Projects Management

#### Option 1: AI Questionnaire (Recommended)

1. Navigate to **Projects** in the sidebar
2. Click **New Project**
3. Click **"Use AI Questionnaire (Optional)"** button
4. Answer 5 steps of questions about your project
5. Click **"Generate with AI"** - All fields will be automatically filled
6. Review and adjust the generated content
7. Upload images, add any missing details
8. Click **Create Project**

#### Option 2: Manual Entry

1. Navigate to **Projects** in the sidebar
2. Click **New Project**
3. Fill in project details manually
4. (Optional) Use individual AI generation buttons for specific fields
5. Click **Create Project**

### Photography Management

#### Single Photo Upload

1. Navigate to **Photos** in the sidebar
2. Click **New Photo**
3. Select an image file
4. (Optional) Click **AI Analyze** to auto-fill metadata
5. Review and edit the AI-generated fields
6. Fill in additional details (camera settings, location, etc.)
7. Click **Create Photo**

#### Bulk Upload

1. Navigate to **Photos** in the sidebar
2. Click **Bulk Upload**
3. Upload a metadata JSON file (see [Bulk Upload Setup](./BULK_UPLOAD_SETUP.md))
4. Select matching photo files
5. Review and edit metadata
6. Click **Upload** to process all photos

### AI Features

#### AI Photo Analysis

The CMS includes AI-powered photo analysis using OpenAI's GPT-4 Vision API:

1. Upload a photo
2. Click **AI Analyze**
3. The AI will automatically generate:
   - Title
   - Description
   - Category
   - Location (if identifiable)
   - Tags
   - Alt text

See [AI Photo Analysis Setup](./AI_PHOTO_ANALYSIS_SETUP.md) for configuration.

#### AI Project Content Generation

Generate complete project content using AI:

1. Click **"Use AI Questionnaire"** when creating a new project
2. Answer questions about your project
3. AI generates all content fields
4. Review and refine the generated content

The AI uses GPT-4o-mini for cost-effective content generation.

## 🏗️ Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── artworks/           # Artworks API endpoints
│   │   ├── analyze-photo/     # AI photo analysis
│   │   ├── generate-project-content/ # AI project field generation
│   │   └── analytics/          # Analytics endpoints
│   ├── auth/                   # Authentication pages
│   ├── protected/              # Protected routes (CMS)
│   │   ├── dashboard/         # Dashboard page
│   │   ├── artworks/          # Artworks management
│   │   ├── collections/       # Collections view
│   │   ├── projects/          # Projects management
│   │   ├── photos/            # Photography management
│   │   ├── content/           # Content management
│   │   ├── pages/             # Pages management
│   │   ├── media/             # Media library
│   │   ├── analytics/         # Analytics dashboard
│   │   └── settings/          # Settings page
│   ├── docs/                  # Documentation (MDX)
│   └── layout.tsx             # Root layout
├── components/
│   ├── artworks/              # Artwork-related components
│   │   ├── index.tsx          # Artworks list
│   │   ├── artwork-form.tsx   # Artwork form
│   │   ├── artwork-bulk-upload.tsx # Bulk upload component
│   │   ├── artwork-preview.tsx # Preview component
│   │   ├── artwork-detail.tsx  # Detail view
│   │   └── collections.tsx     # Collections view
│   ├── projects/               # Project-related components
│   ├── photos/                 # Photo-related components
│   ├── ui/                     # shadcn/ui components
│   └── docs/                   # Documentation components
├── lib/
│   ├── actions/                # Server actions
│   │   ├── artworks.ts         # Artwork actions
│   │   ├── projects.ts         # Project actions
│   │   └── ...
│   ├── supabase/               # Supabase client setup
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
├── database-schema*.sql        # Database migration files
└── README.md
```

## 🔒 Security

- **Row Level Security (RLS)**: All database tables have RLS enabled
- **User Isolation**: Users can only access their own data (where applicable)
- **Authentication Required**: All CMS routes are protected
- **Environment Variables**: Sensitive keys stored in `.env.local`
- **No Indexing**: Site is configured to not be indexed by search engines
- **Public/Private Access**: Published content is publicly accessible, drafts are private

## 🎨 Customization

### Styling

The project uses Tailwind CSS and shadcn/ui. To customize:

1. Edit `tailwind.config.ts` for theme customization
2. Modify `app/globals.css` for global styles
3. Update component styles in `components/`

### Adding New Features

1. Create database schema (SQL file)
2. Add TypeScript types in `lib/types/`
3. Create server actions in `lib/actions/`
4. Build UI components in `components/`
5. Add routes in `app/protected/`
6. Update documentation in `app/docs/`

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `OPENAI_API_KEY` (optional)
   - `ANALYTICS_API_KEY` (optional)
   - `ANALYTICS_USER_ID` (optional)
4. Deploy!

### Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Optional:**
- `OPENAI_API_KEY` (for AI photo analysis and project content generation)
- `ANALYTICS_API_KEY` (for analytics tracking)
- `ANALYTICS_USER_ID` (for analytics user identification)

## 📝 Scripts

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## 🔌 API Endpoints

### Artworks

- `GET /api/artworks` - Get all published artworks
- `GET /api/artworks?status=draft` - Filter by status
- `GET /api/artworks?category=Painting` - Filter by category
- `GET /api/artworks?series=Body%20Works` - Filter by collection
- `GET /api/artworks?featured=true` - Get featured artworks
- `GET /api/artworks/[slug]` - Get single artwork by slug

### Projects

- `GET /api/projects` - Get all published projects
- `GET /api/projects?category=startup` - Filter by category
- `GET /api/projects?featured=true` - Get featured projects

### Analytics

- `POST /api/analytics/track` - Track page views
- `GET /api/analytics/summary` - Get analytics summary

## 🤝 Contributing

This is a personal CMS template. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Database Errors

- Ensure RLS policies are set up correctly
- Check that table schemas match the SQL files
- Verify all required indexes are created
- Check Supabase project is active

### Storage Errors

- Verify storage buckets exist and are named correctly
- Check bucket policies allow uploads (authenticated users)
- Ensure bucket is set to public (for public access)
- Verify file size limits (default 10MB)
- Check MIME type restrictions

### Artworks Issues

- **Bulk Upload Fails**: Check storage bucket exists and policies are set
- **Collections Not Appearing**: Ensure artworks have Series names assigned
- **Images Not Loading**: Verify storage bucket is public and URLs are correct
- **Slug Conflicts**: Auto-generated slugs handle conflicts automatically

### AI Features Not Working

- Check OpenAI API key is set in `.env.local`
- Verify you have OpenAI credits
- Check browser console for errors
- For project generation: Ensure GPT-4o-mini access is enabled
- For photo analysis: Ensure GPT-4 Vision access is enabled

### Authentication Issues

- Verify Supabase credentials in `.env.local`
- Check Supabase project is active
- Ensure email confirmation is configured (if required)
- Verify RLS policies allow authenticated access

### Image Optimization Issues

- Ensure Next.js Image component is used (not `<img>`)
- Check `next.config.ts` for image domain configuration
- Verify external image URLs are allowed in Next.js config
- For blob/data URLs, use `unoptimized` prop

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Database and Auth by [Supabase](https://supabase.com)
- UI Components by [shadcn/ui](https://ui.shadcn.com)
- Icons by [Tabler Icons](https://tabler.io/icons)

## 📧 Support

For issues and questions:

1. Check the documentation in `/docs` section
2. Review the setup guides in the repository
3. Check existing GitHub issues
4. Open a new issue on GitHub

## 🎯 Key Features Summary

### Artworks
- ✅ Single and bulk upload
- ✅ Collections/Series organization
- ✅ Rich metadata (dimensions, materials, techniques)
- ✅ Exhibition history tracking
- ✅ Pricing and availability management
- ✅ Media gallery support
- ✅ Status management (draft/published/archived)

### Collections
- ✅ Dedicated collections view
- ✅ Search and filter
- ✅ Collection statistics
- ✅ Quick preview and management

### Projects
- ✅ AI-powered content generation
- ✅ Multiple images per project
- ✅ Technology stack tracking
- ✅ Featured projects

### Photography
- ✅ Bulk upload with metadata
- ✅ AI-powered metadata generation
- ✅ Camera settings tracking
- ✅ Category organization

---

**Note**: This CMS is configured to not be indexed by search engines. All pages include `noindex` meta tags and robots.txt disallows all crawlers.
