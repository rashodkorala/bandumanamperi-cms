A. PAGE-BY-PAGE REPORT
Route: / (Home Page)
Source Files:
app/page.tsx
components/home/home.tsx
Components Used:
HeroSection (components/home/heroSection-v2.tsx)
FeaturedWorks (components/home/featuredWorks.tsx)
AboutSection (components/home/aboutSection.tsx)
ContactSection (components/home/contactSection.tsx)
Dynamic Fields Required:
Hero Section:
hero.tagline (text): "Sri Lankan Contemporary Artist"
hero.subtitle (text): "Performance · Sculpture · Visual Art"
hero.artist_name (text): "Bandu Manamperi"
hero.description (rich text): "A multidisciplinary practice that challenges conventional narratives..."
hero.cta_text (text): "View Portfolio" / "Discover Works"
hero.cta_link (URL): link target
hero.mobile_image (image): /IMG_8614.JPG
Alt text: "Bandu Manamperi - Contemporary Performance Artist"
hero.desktop_grid_images (repeater, 4 items):
Image (media)
Title (text): "Performance Series", "Sculptural Works", etc.
Alt text (text)
Featured Works Section:
featured_works.heading (text): "Featured Work"
featured_works.description (text): "A selection of recent works..."
featured_works.cta_text (text): "View All Artworks"
featured_works.cta_link (URL): "/artworks"
featured_works.items (relationship): Links to Artwork content type (filtered by featured flag)
About Section:
about_section.eyebrow (text): "About"
about_section.heading (text): "The Artist"
about_section.body (rich text): Full biography paragraphs
about_section.image (image): /IMG_8614.JPG
Alt text: "Bandu manamperi"
about_section.stats (repeater, 3 items):
Value (text): "15+", "40+", "12"
Label (text): "Years", "Exhibitions", "Countries"
Contact Section:
contact_section.eyebrow (text): "Get in Touch"
contact_section.heading (text): "Connect With Bandu"
contact_section.description (rich text)
Contact info fields (see Shared Content)
Form labels and placeholders (see Shared Content)
Images on Home:
/IMG_8614.JPG - Hero image (mobile and desktop versions)
/IMG_8614.JPG - Hero grid images (4 instances)
/IMG_8614.JPG - About section portrait
Dynamic artwork images from database (featured works)
Route: /about (About Page)
Source Files:
app/about/page.tsx
Components Used:
Inline component (no separate file)
Dynamic Fields Required:
Page Metadata:
seo.title (text): "About | Bandu Manamperi"
seo.description (text): "About Bandu Manamperi - Biography, artistic practice, and curriculum vitae"
Header Section:
header.eyebrow (text): "Get to Know"
header.heading (text): "About the Artist"
header.description (text): "An exploration into the life, work..."
Biography Section:
biography.eyebrow (text): "Biography"
biography.heading (text): "Bandu Manamperi"
biography.body (rich text): Full biography with multiple paragraphs
biography.image (image): /IMG_8614.JPG
Alt text: "Bandu Manamperi"
biography.stats (repeater, 3 items):
Value (text): "15+", "40+", "12"
Label (text): "Years", "Exhibitions", "Countries"
Artistic Practice Section:
artistic_practice.heading (text): "Artistic Practice"
artistic_practice.items (repeater, 3 items):
Title (text): "Performance Art", "Drawings & Installations", "Mixed Media"
Description (text)
CV Section:
cv.eyebrow (text): "Background"
cv.heading (text): "Curriculum Vitae"
Education:
cv.education (repeater):
Year range (text): "1995-1999"
Degree (text): "Bachelor of Fine Arts"
Institution (text): "University of Visual and Performing Arts, Colombo, Sri Lanka"
Solo Exhibitions:
cv.solo_exhibitions (repeater):
Year (text): "2024", "2023", etc.
Title (text): "Exhibition Title" (placeholder data)
Venue (text): "Gallery Name, City, Country" (placeholder data)
Group Exhibitions:
cv.group_exhibitions (repeater):
Year (text)
Title (text)
Venue (text)
Awards & Grants:
cv.awards (repeater):
Year (text): "2023", "2021", etc.
Award (text): "Award Title", "Artist Grant", etc.
Public Collections:
cv.collections (repeater):
Name (text): "Collection Name, City, Country" (placeholder data)
Images on About:
/IMG_8614.JPG - Biography portrait
Note: Most CV data appears to be placeholder content that should be replaced with real data via CMS.
Route: /work (Work Categories)
Source Files:
app/work/page.tsx
Components Used:
Inline component
Dynamic Fields Required:
Header:
work_page.eyebrow (text): "Explore"
work_page.heading (text): "Work"
work_page.description (text): "Discover the full breadth of artistic practice..."
Work Categories:
work_categories (repeater, currently 4 items):
Title (text): "Artworks", "Exhibitions", "Performances", "Art Framing, Restoration, and Conservation"
Description (text)
Link (URL): "/artworks", "/exhibitions", "/performances", "/art-framing-and-restoration"
Image (media): /IMG_8614.JPG (all currently same image)
Alt text (text)
Images on Work:
/IMG_8614.JPG - Category card image (4 instances)
Note: Links to /exhibitions, /performances, and /art-framing-and-restoration routes don't exist yet.
Route: /artworks (Artworks Listing)
Source Files:
app/artworks/page.tsx
components/artworks/index.tsx
Components Used:
Artworks component with filters and grid
Dynamic Fields Required:
Header:
artworks_page.eyebrow (text): "Portfolio"
artworks_page.heading (text): "Artworks"
artworks_page.description (text): "Explore the collection of..."
Search & Filters:
artworks_page.search_placeholder (text): "Search artworks by title, description, or medium..."
artworks_page.filters_label (text): "Filters"
artworks_page.all_label (text): "All"
artworks_page.clear_filters_label (text): "Clear all" / "Clear filters"
artworks_page.results_text (text): "Showing {count} of {total} artworks"
artworks_page.no_results_text (text): "No artworks found matching your filters."
Advanced filter labels:
artworks_page.filter_series_label (text): "Series"
artworks_page.filter_status_label (text): "Status"
artworks_page.filter_availability_label (text): "Availability"
artworks_page.filter_tags_label (text): "Tags"
Artwork Items:
Fetched from Artwork content type (see schema below)
Images:
Dynamic from database (artwork thumbnails)
Route: /artworks/[slug] (Artwork Detail)
Source Files:
app/artworks/[slug]/page.tsx
components/artworks/artworkDetail.tsx
Components Used:
ArtworkDetail component
Dynamic Fields Required:
Page Metadata (Dynamic per artwork):
Generated from artwork data in database
Navigation:
artwork_detail.back_text (text): "Back to Artworks"
Field Labels:
artwork_detail.label_medium (text): "Medium"
artwork_detail.label_dimensions (text): "Dimensions"
artwork_detail.label_category (text): "Category"
artwork_detail.label_series (text): "Series"
artwork_detail.label_materials (text): "Materials"
artwork_detail.label_technique (text): "Technique"
artwork_detail.label_location (text): "Location"
artwork_detail.label_availability (text): "Availability"
artwork_detail.label_description (text): "Description"
artwork_detail.label_artist_notes (text): "Artist Notes"
artwork_detail.label_tags (text): "Tags"
artwork_detail.label_exhibition_history (text): "Exhibition History"
Availability Display Text:
availability.available (text): "Available"
availability.sold (text): "Sold"
availability.on_loan (text): "On Loan"
availability.private_collection (text): "Private Collection"
availability.nfs (text): "Not For Sale"
Artwork Data:
All fields from Artwork content type (see schema)
Images:
Dynamic from database (main image + gallery thumbnails)
Route: (Root Layout - All Pages)
Source Files:
app/layout.tsx
Components Used:
Navbar (components/navBar/navbar.tsx)
Footer (components/footer/footer.tsx)
Dynamic Fields Required:
Site Metadata (Shared):
site.title (text): Currently "Create Next App" - needs to be updated
site.description (text): Currently "Generated by create next app" - needs to be updated
site.og_image (image): Not set
site.lang (text): "en"
SHARED COMPONENTS (Used Across Multiple Pages)
Navbar Component
Source: components/navBar/navbar.tsx
Dynamic Fields:
navbar.brand_text (text): "Portfolio"
navbar.nav_items (repeater):
Label (text): "About", "Work", "Contact", "Blog"
Href (URL): "/about", "/work", "/contact", "/blog"
Note: /contact and /blog routes don't exist yet.
Footer Component
Source: components/footer/footer.tsx
Dynamic Fields:
Brand Section:
footer.brand_name (text): "Bandu Manamperi"
footer.brand_description (text): "Contemporary artist exploring identity..."
Navigation Links:
footer.nav_heading (text): "Navigation"
footer.nav_items (repeater):
Label (text): "Work", "About", "Contact", "All Artworks"
Href (URL)
Social Links:
footer.social_heading (text): "Connect"
footer.social_links (repeater):
Platform (text): "Facebook", "Instagram", "Theertha Collective"
URL (URL): "<https://www.facebook.com/bandu.manamperi>", etc.
Icon (select): facebook, instagram, building
Contact Info:
footer.contact_heading (text): "Contact"
footer.email (email): "<bandumanamperi@yahoo.com>"
footer.location (text): "Colombo, Sri Lanka"
Copyright:
footer.copyright_text (text): "© {year} Bandu Manamperi. All rights reserved."
footer.tagline (text): "Performance & Visual Artist"
Note: Year is dynamic (current year)
Contact Section Component
Source: components/home/contactSection.tsx and components/contact/contactSection.tsx
Dynamic Fields:
Heading:
contact.eyebrow (text): "Get in Touch"
contact.heading (text): "Connect With Bandu"
contact.description (rich text): "For exhibition inquiries, commissions..."
Contact Information:
contact.info_heading (text): "Contact Information"
contact.email_label (text): "Email"
contact.email (email): "<bandumanamperi@yahoo.com>"
contact.gallery_label (text): "Gallery Representation"
contact.gallery_name (text): "Theertha International Artists' Collective"
contact.gallery_location (text): "Colombo, Sri Lanka"
contact.location_label (text): "Location"
contact.location_city (text): "Colombo"
contact.location_country (text): "Sri Lanka"
Social Links:
contact.social_heading (text): "Follow"
contact.facebook_url (URL): "<https://www.facebook.com/bandu.manamperi>"
contact.instagram_url (URL): "<https://www.instagram.com/bandu_manamperi/>"
contact.theertha_url (URL): "<https://theertha.org/artists/bandu-manamperi/>"
Form:
contact.form_name_label (text): "Name "
contact.form_name_placeholder (text): "Your name"
contact.form_email_label (text): "Email "
contact.form_email_placeholder (text): "<your.email@example.com>"
contact.form_message_label (text): "Message "
contact.form_message_placeholder (text): "Tell me about your inquiry..."
contact.form_submit_text (text): "Send Message"
contact.form_submitting_text (text): "Sending..."
contact.form_success_title (text): "Message sent successfully"
contact.form_success_description (text): "Thank you for your message. I'll get back to you soon."
Unused/Alternative Hero Section
Source: components/home/heroSection.tsx (not currently used; heroSection-v2 is used instead)
Contains similar content but different layout.
MISSING ROUTES (Mentioned but not implemented)
/exhibitions - Mentioned in Work page, no implementation
/performances - Mentioned in Work page, no implementation
/art-framing-and-restoration - Mentioned in Work page, no implementation
/contact - Linked in navbar and footer, no dedicated page (contact section on home)
/blog - Linked in navbar, no implementation
B. PROPOSED CMS CONTENT MODEL
Content Type: SiteSettings (Singleton)
Global site-wide settings that appear across all pages.
Field Name Type Required Description
site_name Text Yes "Bandu Manamperi"
site_tagline Text No "Performance & Visual Artist"
site_title Text Yes SEO title template
site_description Text Yes Meta description
og_image Image No Default Open Graph image
favicon Image No Site favicon
contact_email Email Yes "<bandumanamperi@yahoo.com>"
contact_location_city Text No "Colombo"
contact_location_country Text No "Sri Lanka"
gallery_name Text No "Theertha International Artists' Collective"
gallery_location Text No "Colombo, Sri Lanka"
social_facebook URL No Facebook profile URL
social_instagram URL No Instagram profile URL
social_theertha URL No Theertha Collective URL
copyright_text Text No Copyright notice (supports {year} placeholder)
navbar_brand Text Yes "Portfolio"
footer_description Rich Text No Footer brand description
Content Type: Page (Collection)
Flexible page type for static content pages. Used for Home, About, Work, and future pages.
Field Name Type Required Description
title Text Yes Page title
slug Slug Yes URL slug (e.g., "about", "work")
seo_title Text No Override SEO title
seo_description Text No Meta description
og_image Image No Override OG image
status Select Yes draft, published, archived
sections Sections No Flexible sections (see Section Types below)
created_at DateTime Auto Creation date
updated_at DateTime Auto Last update
Section Types for Pages:
Hero Section
type: "hero"
eyebrow: Text
heading: Text
description: Rich Text
cta_text: Text
cta_link: URL
images: Repeater
Image: Media
Alt text: Text
Caption: Text (optional)
Biography Section
type: "biography"
eyebrow: Text
heading: Text
body: Rich Text
image: Media
image_alt: Text
stats: Repeater
Value: Text
Label: Text
Artistic Practice Section
type: "artistic_practice"
heading: Text
items: Repeater
Title: Text
Description: Text
Featured Works Section
type: "featured_works"
heading: Text
description: Text
cta_text: Text
cta_link: URL
filter_by: Select (all, featured_only, by_category)
category_filter: Text (if filter_by is by_category)
limit: Number
About Section
type: "about"
eyebrow: Text
heading: Text
body: Rich Text
image: Media
image_alt: Text
stats: Repeater (same as Biography)
Contact Section
type: "contact"
eyebrow: Text
heading: Text
description: Rich Text
Form settings inherited from SiteSettings
CV Section
type: "cv"
eyebrow: Text
heading: Text
subsections: Repeater (see CV content type below)
Work Categories Grid
type: "work_categories"
heading: Text
description: Text
categories: Repeater (or relationship to WorkCategory)
Content Type: Artwork (Collection)
Individual artworks. Already implemented in database.
Field Name Type Required Description
id UUID Auto Primary key
title Text Yes Artwork title
slug Slug No Auto-generated from title if not provided
year Text No Year created (text to allow "2022-2023")
description Rich Text No Public description
artist_notes Rich Text No Internal/artist notes
media Media (multiple) No Array of images/videos
thumbnail_path Media No Custom thumbnail (uses first media if not set)
category Select No painting, sculpture, performance, other
medium Text No "Oil on canvas", "Performance Art", etc.
materials Text No Detailed materials list
technique Text No Artistic technique
width Number No Width in specified unit
height Number No Height in specified unit
depth Number No Depth in specified unit
unit Select No cm, m, in, ft (default: cm)
series Text No Series or collection name
tags Tags No Array of tags
location Text No Current location
availability Select Yes available, sold, on_loan, private_collection, nfs
price Number No Price
currency Select No USD, EUR, LKR, etc.
status Select Yes published, draft, archived
featured Boolean No Show in featured sections
sort_order Number No Custom ordering
date_created Date No Actual creation date (vs DB timestamp)
exhibition_history Repeater No See Exhibition History below
views_count Number Auto Page view analytics
created_at DateTime Auto Database creation
updated_at DateTime Auto Last update
Exhibition History (nested):
name: Text (required)
location: Text
date: Date or Text
curator: Text
notes: Text
Content Type: CVSection (Collection)
For CV/Resume entries - can be reused across pages.
Field Name Type Required Description
section_type Select Yes education, solo_exhibitions, group_exhibitions, awards, collections, residencies, publications
title Text Yes Section title (e.g., "Education", "Solo Exhibitions")
entries Repeater Yes See Entry structure below
sort_order Number No Display order
Entry structure:
year or year_range: Text (e.g., "2023" or "1995-1999")
title: Text (degree, exhibition title, award name)
subtitle: Text (institution, venue, location)
description: Rich Text (optional notes)
Content Type: WorkCategory (Collection)
Work category cards for /work page.
Field Name Type Required Description
title Text Yes "Artworks", "Exhibitions", etc.
slug Slug Yes URL slug
description Text Yes Category description
image Image Yes Card image
image_alt Text Yes Alt text
link URL Yes Target page
sort_order Number No Display order
status Select Yes published, draft
Content Type: Exhibition (Collection) (Recommended for future)
For dedicated exhibition pages (not yet implemented).
Field Name Type Required Description
title Text Yes Exhibition title
slug Slug Yes URL slug
description Rich Text No Exhibition description
type Select Yes solo, group, online, residency
venue Text No Gallery/venue name
location Text No City, Country
start_date Date No Opening date
end_date Date No Closing date
curator Text No Curator name(s)
featured_image Image No Main exhibition image
gallery Media (multiple) No Exhibition photos
artworks Relationship No Link to Artwork items
press_links Repeater No External press coverage
status Select Yes upcoming, current, past, draft
featured Boolean No Feature on home/work page
Content Type: NavItem (Collection)
Navigation links for header and footer.
Field Name Type Required Description
label Text Yes Link text
href URL or Slug Yes Target URL
location Select Yes header, footer, both
sort_order Number No Display order
status Select Yes active, inactive
Content Type: UILabels (Singleton)
Text strings for UI elements (buttons, labels, error messages).
Field Name Type Required Description
cta_learn_more Text Yes "Learn More"
cta_view_all Text Yes "View All Artworks"
cta_view_portfolio Text Yes "View Portfolio"
cta_discover_works Text Yes "Discover Works"
cta_back_to_artworks Text Yes "Back to Artworks"
label_medium Text Yes "Medium"
label_dimensions Text Yes "Dimensions"
label_category Text Yes "Category"
label_series Text Yes "Series"
label_materials Text Yes "Materials"
label_technique Text Yes "Technique"
label_location Text Yes "Location"
label_availability Text Yes "Availability"
label_description Text Yes "Description"
label_artist_notes Text Yes "Artist Notes"
label_tags Text Yes "Tags"
label_exhibition_history Text Yes "Exhibition History"
search_placeholder Text Yes "Search artworks..."
filter_label Text Yes "Filters"
clear_filters Text Yes "Clear filters"
no_results Text Yes "No artworks found..."
loading_text Text Yes "Loading..."
error_not_found Text Yes "Not found"
(And many more UI strings...)
Relationships
Page → Artwork: Featured works section can filter/display artworks
Artwork → Exhibition: Exhibition history (currently inline, could be relationship)
Exhibition → Artwork: Artworks shown in exhibition
Page → CVSection: About page includes CV sections
WorkCategory → Page or Exhibition: Category links to relevant page
Media Management Strategy
Current Images:
/IMG_8614.JPG - Used as placeholder across the site (15+ instances)
All artwork media stored in Supabase Storage: artworks bucket
CMS Media Fields Should Include:
url: Media URL
alt_text: Alt text for accessibility
caption: Optional caption
credits: Photo/artwork credits
focal_point: X/Y coordinates for smart cropping
width: Original width
height: Original height
file_size: File size in bytes
mime_type: image/jpeg, video/mp4, etc.
C. MACHINE-READABLE JSON OUTPUT
Now let me create the comprehensive JSON inventory file:
{  "inventory_version": "1.0.0",  "generated_at": "2025-12-13",  "project_name": "Bandu Manamperi Portfolio Website",  "pages": [    {      "route": "/",      "name": "Home",      "source_files": [        "app/page.tsx",        "components/home/home.tsx"      ],      "components": [        "components/home/heroSection-v2.tsx",        "components/home/featuredWorks.tsx",        "components/home/aboutSection.tsx",        "components/home/contactSection.tsx"      ],      "sections": [        {          "section_name": "Hero Section",          "component": "HeroSection",          "fields": [            {              "key": "hero.tagline",              "type": "text",              "current_value": "Sri Lankan Contemporary Artist",              "usage": "Eyebrow text above heading (mobile)"            },            {              "key": "hero.subtitle",              "type": "text",              "current_value": "Performance · Sculpture · Visual Art",              "usage": "Subtitle above heading (desktop)"            },            {              "key": "hero.artist_name",              "type": "text",              "current_value": "Bandu Manamperi",              "usage": "Main heading"            },            {              "key": "hero.description_mobile",              "type": "rich_text",              "current_value": "Exploring the boundaries of body, identity, and social consciousness through performance, sculpture, and visual intervention.",              "usage": "Description text (mobile version)"            },            {              "key": "hero.description_desktop",              "type": "rich_text",              "current_value": "A multidisciplinary practice that challenges conventional narratives, investigating the intersections of corporeality, cultural identity, and the socio-political landscape of contemporary Sri Lanka.",              "usage": "Description text (desktop version)"            },            {              "key": "hero.cta_mobile_text",              "type": "text",              "current_value": "Discover Works",              "usage": "CTA button text (mobile)"            },            {              "key": "hero.cta_desktop_text",              "type": "text",              "current_value": "View Portfolio",              "usage": "CTA button text (desktop)"            },            {              "key": "hero.cta_link",              "type": "url",              "current_value": "#",              "usage": "CTA button destination"            },            {              "key": "hero.mobile_image",              "type": "image",              "current_value": "/IMG_8614.JPG",              "usage": "Full-screen background image (mobile)",              "alt_text": "Bandu Manamperi - Contemporary Performance Artist"            },            {              "key": "hero.desktop_grid",              "type": "repeater",              "usage": "4-column image grid (desktop)",              "items": [                {                  "image": "/IMG_8614.JPG",                  "title": "Performance Series",                  "alt": "Performance Series by Bandu Manamperi"                },                {                  "image": "/IMG_8614.JPG",                  "title": "Sculptural Works",                  "alt": "Sculptural Works by Bandu Manamperi"                },                {                  "image": "/IMG_8614.JPG",                  "title": "Installation Art",                  "alt": "Installation Art by Bandu Manamperi"                },                {                  "image": "/IMG_8614.JPG",                  "title": "Visual Narratives",                  "alt": "Visual Narratives by Bandu Manamperi"                }              ]            }          ]        },        {          "section_name": "Featured Works",          "component": "FeaturedWorks",          "fields": [            {              "key": "featured_works.heading",              "type": "text",              "current_value": "Featured Work",              "usage": "Section heading"            },            {              "key": "featured_works.description",              "type": "text",              "current_value": "A selection of recent works exploring identity, body, and social constructs.",              "usage": "Section description"            },            {              "key": "featured_works.cta_text",              "type": "text",              "current_value": "View All Artworks",              "usage": "Link to full artworks page"            },            {              "key": "featured_works.cta_link",              "type": "url",              "current_value": "/artworks",              "usage": "CTA destination"            },            {              "key": "featured_works.items",              "type": "relationship",              "current_value": "Filtered from Artwork content type where featured=true",              "usage": "Dynamic artwork grid"            },            {              "key": "featured_works.loading_text",              "type": "text",              "current_value": "Loading artworks...",              "usage": "Loading state"            }          ]        },        {          "section_name": "About Section",          "component": "AboutSection",          "fields": [            {              "key": "about.eyebrow",              "type": "text",              "current_value": "About",              "usage": "Section eyebrow"            },            {              "key": "about.heading",              "type": "text",              "current_value": "The Artist",              "usage": "Section heading"            },            {              "key": "about.body",              "type": "rich_text",              "current_value": "Two paragraphs about Bandu Manamperi and Theertha Collective",              "usage": "Biography text"            },            {              "key": "about.image",              "type": "image",              "current_value": "/IMG_8614.JPG",              "usage": "Portrait image",              "alt_text": "Bandu manamperi"            },            {              "key": "about.stats",              "type": "repeater",              "usage": "Achievement statistics",              "items": [                {"value": "15+", "label": "Years"},                {"value": "40+", "label": "Exhibitions"},                {"value": "12", "label": "Countries"}              ]            }          ]        },        {          "section_name": "Contact Section",          "component": "ContactSection",          "fields": [            {              "key": "contact.eyebrow",              "type": "text",              "current_value": "Get in Touch",              "usage": "Section eyebrow"            },            {              "key": "contact.heading",              "type": "text",              "current_value": "Connect With Bandu",              "usage": "Section heading"            },            {              "key": "contact.description",              "type": "rich_text",              "current_value": "For exhibition inquiries, commissions, performances, or to discuss Bandu Manamperi's work, please reach out using the form below or contact directly.",              "usage": "Section description"            }          ],          "shared_content": "Uses SiteSettings for contact info, social links, and form configuration"        }      ],      "images": [        {          "path": "/IMG_8614.JPG",          "usage_locations": [            "Hero section mobile background",            "Hero section desktop grid (4 instances)",            "About section portrait"          ],          "alt_texts": [            "Bandu Manamperi - Contemporary Performance Artist",            "Performance Series by Bandu Manamperi",            "Sculptural Works by Bandu Manamperi",            "Installation Art by Bandu Manamperi",            "Visual Narratives by Bandu Manamperi",            "Bandu manamperi"          ],          "needs_replacement": true,          "note": "Same placeholder image used 6 times"        }      ]    },    {      "route": "/about",      "name": "About",      "source_files": ["app/about/page.tsx"],      "components": ["Inline component in page.tsx"],      "metadata": [        {          "key": "seo.title",          "type": "text",          "current_value": "About | Bandu Manamperi"        },        {          "key": "seo.description",          "type": "text",          "current_value": "About Bandu Manamperi - Biography, artistic practice, and curriculum vitae"        }      ],      "sections": [        {          "section_name": "Page Header",          "fields": [            {              "key": "about_page.header.eyebrow",              "type": "text",              "current_value": "Get to Know"            },            {              "key": "about_page.header.heading",              "type": "text",              "current_value": "About the Artist"            },            {              "key": "about_page.header.description",              "type": "text",              "current_value": "An exploration into the life, work, and artistic journey of Bandu Manamperi"            }          ]        },        {          "section_name": "Biography",          "fields": [            {              "key": "biography.eyebrow",              "type": "text",              "current_value": "Biography"            },            {              "key": "biography.heading",              "type": "text",              "current_value": "Bandu Manamperi"            },            {              "key": "biography.body",              "type": "rich_text",              "current_value": "Four paragraphs covering his work, themes, Theertha Collective, and legacy"            },            {              "key": "biography.image",              "type": "image",              "current_value": "/IMG_8614.JPG",              "alt_text": "Bandu Manamperi"            },            {              "key": "biography.stats",              "type": "repeater",              "items": [                {"value": "15+", "label": "Years"},                {"value": "40+", "label": "Exhibitions"},                {"value": "12", "label": "Countries"}              ]            }          ]        },        {          "section_name": "Artistic Practice",          "fields": [            {              "key": "artistic_practice.heading",              "type": "text",              "current_value": "Artistic Practice"            },            {              "key": "artistic_practice.items",              "type": "repeater",              "items": [                {                  "title": "Performance Art",                  "description": "Manamperi's performance works engage directly with audiences..."                },                {                  "title": "Drawings & Installations",                  "description": "Through drawings and installations, he explores the intersection..."                },                {                  "title": "Mixed Media",                  "description": "His diverse use of materials reflects a commitment to experimentation..."                }              ]            }          ]        },        {          "section_name": "Curriculum Vitae",          "fields": [            {              "key": "cv.eyebrow",              "type": "text",              "current_value": "Background"            },            {              "key": "cv.heading",              "type": "text",              "current_value": "Curriculum Vitae"            },            {              "key": "cv.education",              "type": "repeater",              "note": "Should be managed via CVSection content type",              "items": [                {                  "year_range": "1995-1999",                  "degree": "Bachelor of Fine Arts",                  "institution": "University of Visual and Performing Arts, Colombo, Sri Lanka"                }              ]            },            {              "key": "cv.solo_exhibitions",              "type": "repeater",              "note": "Placeholder data - needs real content",              "items": [                {                  "year": "2024",                  "title": "Exhibition Title",                  "venue": "Gallery Name, City, Country"                },                {                  "year": "2023",                  "title": "Exhibition Title",                  "venue": "Gallery Name, City, Country"                }              ],              "placeholder_count": 5            },            {              "key": "cv.group_exhibitions",              "type": "repeater",              "note": "Mix of placeholder and real data",              "items": [                {                  "year": "2020",                  "title": "Theertha Collective Exhibition",                  "venue": "Gallery Name, Colombo, Sri Lanka"                }              ],              "placeholder_count": 4            },            {              "key": "cv.awards",              "type": "repeater",              "note": "Placeholder data",              "items": [                {"year": "2023", "award": "Award Title"},                {"year": "2021", "award": "Award Title"},                {"year": "2019", "award": "Artist Grant"},                {"year": "2016", "award": "Fellowship, Location"}              ]            },            {              "key": "cv.collections",              "type": "repeater",              "note": "Placeholder data",              "items": [                "Collection Name, City, Country",                "Collection Name, City, Country",                "Collection Name, City, Country",                "Collection Name, City, Country",                "Collection Name, City, Country",                "Collection Name, City, Country"              ]            }          ]        }      ],      "images": [        {          "path": "/IMG_8614.JPG",          "usage_locations": ["Biography section portrait"],          "alt_text": "Bandu Manamperi",          "needs_replacement": false        }      ]    },    {      "route": "/work",      "name": "Work Categories",      "source_files": ["app/work/page.tsx"],      "components": ["Inline component"],      "sections": [        {          "section_name": "Page Header",          "fields": [            {              "key": "work_page.eyebrow",              "type": "text",              "current_value": "Explore"            },            {              "key": "work_page.heading",              "type": "text",              "current_value": "Work"            },            {              "key": "work_page.description",              "type": "text",              "current_value": "Discover the full breadth of artistic practice spanning paintings, performances, and exhibitions across international venues."            }          ]        },        {          "section_name": "Work Categories Grid",          "fields": [            {              "key": "work_categories",              "type": "repeater",              "note": "Should be WorkCategory content type",              "items": [                {                  "title": "Artworks",                  "description": "Paintings, mixed media, and works on paper",                  "link": "/artworks",                  "image": "/IMG_8614.JPG",                  "alt": "Artworks"                },                {                  "title": "Exhibitions",                  "description": "Current and past solo and group exhibitions",                  "link": "/exhibitions",                  "image": "/IMG_8614.JPG",                  "alt": "Exhibitions",                  "note": "Route not implemented"                },                {                  "title": "Performances",                  "description": "Live art performances and interventions",                  "link": "/performances",                  "image": "/IMG_8614.JPG",                  "alt": "Performances",                  "note": "Route not implemented"                },                {                  "title": "Art Framing, Restoration, and Conservation",                  "description": "Art framing and restoration of artworks and sculptures",                  "link": "/art-framing-and-restoration",                  "image": "/IMG_8614.JPG",                  "alt": "Art Framing and Restoration",                  "note": "Route not implemented"                }              ]            },            {              "key": "work_page.cta_text",              "type": "text",              "current_value": "View →"            }          ]        }      ],      "images": [        {          "path": "/IMG_8614.JPG",          "usage_locations": [            "Artworks category card",            "Exhibitions category card",            "Performances category card",            "Art Framing category card"          ],          "alt_texts": [            "Artworks",            "Exhibitions",            "Performances",            "Art Framing and Restoration"          ],          "needs_replacement": true,          "note": "Same image used for all 4 categories"        }      ]    },    {      "route": "/artworks",      "name": "Artworks Listing",      "source_files": [        "app/artworks/page.tsx",        "components/artworks/index.tsx"      ],      "components": ["Artworks"],      "sections": [        {          "section_name": "Page Header",          "fields": [            {              "key": "artworks_page.eyebrow",              "type": "text",              "current_value": "Portfolio"            },            {              "key": "artworks_page.heading",              "type": "text",              "current_value": "Artworks"            },            {              "key": "artworks_page.description",              "type": "text",              "current_value": "Explore the collection of {count} artworks",              "note": "{count} is dynamic"            }          ]        },        {          "section_name": "Search and Filters",          "fields": [            {              "key": "artworks_page.search_placeholder",              "type": "text",              "current_value": "Search artworks by title, description, or medium..."            },            {              "key": "artworks_page.filter_button_text",              "type": "text",              "current_value": "Filters"            },            {              "key": "artworks_page.all_filter_text",              "type": "text",              "current_value": "All"            },            {              "key": "artworks_page.clear_filters_text",              "type": "text",              "current_value": "Clear all"            },            {              "key": "artworks_page.results_text",              "type": "text",              "current_value": "Showing {filtered} of {total} artworks"            },            {              "key": "artworks_page.no_results_text",              "type": "text",              "current_value": "No artworks found matching your filters."            },            {              "key": "artworks_page.filter_series_label",              "type": "text",              "current_value": "Series"            },            {              "key": "artworks_page.filter_series_all",              "type": "text",              "current_value": "All Series"            },            {              "key": "artworks_page.filter_status_label",              "type": "text",              "current_value": "Status"            },            {              "key": "artworks_page.filter_status_all",              "type": "text",              "current_value": "All Statuses"            },            {              "key": "artworks_page.filter_availability_label",              "type": "text",              "current_value": "Availability"            },            {              "key": "artworks_page.filter_availability_all",              "type": "text",              "current_value": "All"            },            {              "key": "artworks_page.filter_tags_label",              "type": "text",              "current_value": "Tags"            },            {              "key": "artworks_page.loading_text",              "type": "text",              "current_value": "Loading artworks..."            }          ]        },        {          "section_name": "Artwork Grid",          "fields": [            {              "key": "artworks_list",              "type": "relationship",              "current_value": "Fetched from Artwork content type",              "note": "Dynamic grid with filtering"            }          ]        }      ],      "images": [        {          "path": "Dynamic from database",          "usage_locations": ["Artwork grid thumbnails"],          "note": "Uses artwork.thumbnail_url or first media item"        }      ]    },    {      "route": "/artworks/[slug]",      "name": "Artwork Detail",      "source_files": [        "app/artworks/[slug]/page.tsx",        "components/artworks/artworkDetail.tsx"      ],      "components": ["ArtworkDetail"],      "metadata": [        {          "key": "seo.title",          "type": "text",          "current_value": "{artwork.title} - Bandu Manamperi",          "note": "Dynamic from artwork data"        },        {          "key": "seo.description",          "type": "text",          "current_value": "View {title} by Bandu Manamperi. Medium: {medium}. Year: {year}.",          "note": "Dynamic from artwork data"        },        {          "key": "og.image",          "type": "image",          "current_value": "artwork.thumbnail_url or first media",          "note": "Dynamic from artwork data"        }      ],      "sections": [        {          "section_name": "Navigation",          "fields": [            {              "key": "artwork_detail.back_text",              "type": "text",              "current_value": "Back to Artworks"            }          ]        },        {          "section_name": "Artwork Display",          "fields": [            {              "key": "artwork_detail.not_found_text",              "type": "text",              "current_value": "Artwork not found"            },            {              "key": "artwork_detail.loading_text",              "type": "text",              "current_value": "Loading artwork..."            },            {              "key": "artwork_detail.label_medium",              "type": "text",              "current_value": "Medium"            },            {              "key": "artwork_detail.label_dimensions",              "type": "text",              "current_value": "Dimensions"            },            {              "key": "artwork_detail.label_category",              "type": "text",              "current_value": "Category"            },            {              "key": "artwork_detail.label_series",              "type": "text",              "current_value": "Series"            },            {              "key": "artwork_detail.label_materials",              "type": "text",              "current_value": "Materials"            },            {              "key": "artwork_detail.label_technique",              "type": "text",              "current_value": "Technique"            },            {              "key": "artwork_detail.label_location",              "type": "text",              "current_value": "Location"            },            {              "key": "artwork_detail.label_availability",              "type": "text",              "current_value": "Availability"            },            {              "key": "artwork_detail.label_description",              "type": "text",              "current_value": "Description"            },            {              "key": "artwork_detail.label_artist_notes",              "type": "text",              "current_value": "Artist Notes"            },            {              "key": "artwork_detail.label_tags",              "type": "text",              "current_value": "Tags"            },            {              "key": "artwork_detail.label_exhibition_history",              "type": "text",              "current_value": "Exhibition History"            }          ]        },        {          "section_name": "Availability Display Mapping",          "fields": [            {              "key": "availability_text.available",              "type": "text",              "current_value": "Available"            },            {              "key": "availability_text.sold",              "type": "text",              "current_value": "Sold"            },            {              "key": "availability_text.on_loan",              "type": "text",              "current_value": "On Loan"            },            {              "key": "availability_text.private_collection",              "type": "text",              "current_value": "Private Collection"            },            {              "key": "availability_text.nfs",              "type": "text",              "current_value": "Not For Sale"            }          ]        },        {          "section_name": "Artwork Data",          "fields": [            {              "key": "artwork",              "type": "relationship",              "current_value": "Fetched from Artwork content type by slug",              "note": "All artwork fields displayed dynamically"            }          ]        }      ],      "images": [        {          "path": "Dynamic from database",          "usage_locations": [            "Main artwork image",            "Gallery thumbnails"          ],          "note": "Uses artwork.media array"        }      ]    }  ],  "shared_components": [    {      "name": "Navbar",      "source_file": "components/navBar/navbar.tsx",      "used_on": ["All pages"],      "fields": [        {          "key": "navbar.brand_text",          "type": "text",          "current_value": "Portfolio"        },        {          "key": "navbar.nav_items",          "type": "repeater",          "note": "Should be NavItem content type",          "items": [            {"label": "About", "href": "/about"},            {"label": "Work", "href": "/work"},            {"label": "Contact", "href": "/contact", "note": "Route not implemented"},            {"label": "Blog", "href": "/blog", "note": "Route not implemented"}          ]        }      ]    },    {      "name": "Footer",      "source_file": "components/footer/footer.tsx",      "used_on": ["All pages"],      "fields": [        {          "key": "footer.brand_name",          "type": "text",          "current_value": "Bandu Manamperi",          "shared_with": "SiteSettings.site_name"        },        {          "key": "footer.brand_description",          "type": "text",          "current_value": "Contemporary artist exploring identity, body, and social constructs through performance art, sculpture, and visual works."        },        {          "key": "footer.nav_heading",          "type": "text",          "current_value": "Navigation"        },        {          "key": "footer.nav_items",          "type": "repeater",          "items": [            {"label": "Work", "href": "#work"},            {"label": "About", "href": "#about"},            {"label": "Contact", "href": "#contact"},            {"label": "All Artworks", "href": "/artworks"}          ],          "note": "Uses hash links for homepage sections"        },        {          "key": "footer.social_heading",          "type": "text",          "current_value": "Connect"        },        {          "key": "footer.social_facebook_url",          "type": "url",          "current_value": "https://www.facebook.com/bandu.manamperi",          "shared_with": "SiteSettings.social_facebook"        },        {          "key": "footer.social_facebook_label",          "type": "text",          "current_value": "Facebook"        },        {          "key": "footer.social_instagram_url",          "type": "url",          "current_value": "https://www.instagram.com/bandu_manamperi/",          "shared_with": "SiteSettings.social_instagram"        },        {          "key": "footer.social_instagram_label",          "type": "text",          "current_value": "Instagram"        },        {          "key": "footer.social_theertha_url",          "type": "url",          "current_value": "https://theertha.org/artists/bandu-manamperi/",          "shared_with": "SiteSettings.social_theertha"        },        {          "key": "footer.social_theertha_label",          "type": "text",          "current_value": "Theertha Collective"        },        {          "key": "footer.contact_heading",          "type": "text",          "current_value": "Contact"        },        {          "key": "footer.email",          "type": "email",          "current_value": "bandumanamperi@yahoo.com",          "shared_with": "SiteSettings.contact_email"        },        {          "key": "footer.location",          "type": "text",          "current_value": "Colombo, Sri Lanka",          "shared_with": "SiteSettings.contact_location_city + contact_location_country"        },        {          "key": "footer.copyright_text",          "type": "text",          "current_value": "© {year} Bandu Manamperi. All rights reserved.",          "note": "{year} is dynamic",          "shared_with": "SiteSettings.copyright_text"        },        {          "key": "footer.tagline",          "type": "text",          "current_value": "Performance & Visual Artist",          "shared_with": "SiteSettings.site_tagline"        }      ]    },    {      "name": "Contact Section",      "source_file": "components/home/contactSection.tsx",      "used_on": ["Home page", "potentially /contact page"],      "fields": [        {          "key": "contact.eyebrow",          "type": "text",          "current_value": "Get in Touch"        },        {          "key": "contact.heading",          "type": "text",          "current_value": "Connect With Bandu"        },        {          "key": "contact.description",          "type": "rich_text",          "current_value": "For exhibition inquiries, commissions, performances, or to discuss Bandu Manamperi's work, please reach out using the form below or contact directly."        },        {          "key": "contact.info_heading",          "type": "text",          "current_value": "Contact Information"        },        {          "key": "contact.email_label",          "type": "text",          "current_value": "Email"        },        {          "key": "contact.email",          "type": "email",          "current_value": "bandumanamperi@yahoo.com",          "shared_with": "SiteSettings.contact_email"        },        {          "key": "contact.gallery_label",          "type": "text",          "current_value": "Gallery Representation"        },        {          "key": "contact.gallery_name",          "type": "text",          "current_value": "Theertha International Artists' Collective",          "shared_with": "SiteSettings.gallery_name"        },        {          "key": "contact.gallery_location",          "type": "text",          "current_value": "Colombo, Sri Lanka",          "shared_with": "SiteSettings.gallery_location"        },        {          "key": "contact.location_label",          "type": "text",          "current_value": "Location"        },        {          "key": "contact.location_city",          "type": "text",          "current_value": "Colombo",          "shared_with": "SiteSettings.contact_location_city"        },        {          "key": "contact.location_country",          "type": "text",          "current_value": "Sri Lanka",          "shared_with": "SiteSettings.contact_location_country"        },        {          "key": "contact.social_heading",          "type": "text",          "current_value": "Follow"        },        {          "key": "contact.form_name_label",          "type": "text",          "current_value": "Name *"        },        {          "key": "contact.form_name_placeholder",          "type": "text",          "current_value": "Your name"        },        {          "key": "contact.form_email_label",          "type": "text",          "current_value": "Email*"        },        {          "key": "contact.form_email_placeholder",          "type": "text",          "current_value": "your.email@example.com"        },        {          "key": "contact.form_message_label",          "type": "text",          "current_value": "Message *"        },        {          "key": "contact.form_message_placeholder",          "type": "text",          "current_value": "Tell me about your inquiry..."        },        {          "key": "contact.form_submit_text",          "type": "text",          "current_value": "Send Message"        },        {          "key": "contact.form_submitting_text",          "type": "text",          "current_value": "Sending..."        },        {          "key": "contact.form_success_title",          "type": "text",          "current_value": "Message sent successfully"        },        {          "key": "contact.form_success_description",          "type": "text",          "current_value": "Thank you for your message. I'll get back to you soon."        }      ]    }  ],  "media": [    {      "path": "/IMG_8614.JPG",      "type": "image",      "format": "JPEG",      "usage_count": 15,      "usage_locations": [        {          "page": "Home",          "location": "Hero section mobile background",          "alt_text": "Bandu Manamperi - Contemporary Performance Artist"        },        {          "page": "Home",          "location": "Hero section desktop grid",          "alt_text": "Performance Series by Bandu Manamperi",          "instance": 1        },        {          "page": "Home",          "location": "Hero section desktop grid",          "alt_text": "Sculptural Works by Bandu Manamperi",          "instance": 2        },        {          "page": "Home",          "location": "Hero section desktop grid",          "alt_text": "Installation Art by Bandu Manamperi",          "instance": 3        },        {          "page": "Home",          "location": "Hero section desktop grid",          "alt_text": "Visual Narratives by Bandu Manamperi",          "instance": 4        },        {          "page": "Home",          "location": "About section portrait",          "alt_text": "Bandu manamperi"        },        {          "page": "About",          "location": "Biography portrait",          "alt_text": "Bandu Manamperi"        },        {          "page": "Work",          "location": "Artworks category card",          "alt_text": "Artworks"        },        {          "page": "Work",          "location": "Exhibitions category card",          "alt_text": "Exhibitions"        },        {          "page": "Work",          "location": "Performances category card",          "alt_text": "Performances"        },        {          "page": "Work",          "location": "Art Framing category card",          "alt_text": "Art Framing and Restoration"        }      ],      "needs_replacement": true,      "note": "Single placeholder image used throughout site - should be replaced with unique images for each usage"    },    {      "path": "/file.svg",      "type": "svg",      "usage_locations": ["Not currently used in components"],      "note": "Next.js default SVG"    },    {      "path": "/globe.svg",      "type": "svg",      "usage_locations": ["Not currently used in components"],      "note": "Next.js default SVG"    },    {      "path": "/next.svg",      "type": "svg",      "usage_locations": ["Not currently used in components"],      "note": "Next.js logo"    },    {      "path": "/vercel.svg",      "type": "svg",      "usage_locations": ["Not currently used in components"],      "note": "Vercel logo"    },    {      "path": "/window.svg",      "type": "svg",      "usage_locations": ["Not currently used in components"],      "note": "Next.js default SVG"    },    {      "path": "Supabase Storage: artworks bucket",      "type": "Various (images, videos)",      "usage_locations": [        "Artwork detail pages",        "Featured works section",        "Artworks listing page"      ],      "note": "Dynamic media from database, served via signed URLs"    }  ],  "contentTypes": [    {      "name": "SiteSettings",      "type": "singleton",      "description": "Global site-wide settings",      "fields": [        {"name": "site_name", "type": "text", "required": true},        {"name": "site_tagline", "type": "text", "required": false},        {"name": "site_title", "type": "text", "required": true},        {"name": "site_description", "type": "text", "required": true},        {"name": "og_image", "type": "image", "required": false},        {"name": "favicon", "type": "image", "required": false},        {"name": "contact_email", "type": "email", "required": true},        {"name": "contact_location_city", "type": "text", "required": false},        {"name": "contact_location_country", "type": "text", "required": false},        {"name": "gallery_name", "type": "text", "required": false},        {"name": "gallery_location", "type": "text", "required": false},        {"name": "social_facebook", "type": "url", "required": false},        {"name": "social_instagram", "type": "url", "required": false},        {"name": "social_theertha", "type": "url", "required": false},        {"name": "copyright_text", "type": "text", "required": false},        {"name": "navbar_brand", "type": "text", "required": true},        {"name": "footer_description", "type": "rich_text", "required": false}      ]    },    {      "name": "Page",      "type": "collection",      "description": "Flexible page content",      "fields": [        {"name": "title", "type": "text", "required": true},        {"name": "slug", "type": "slug", "required": true},        {"name": "seo_title", "type": "text", "required": false},        {"name": "seo_description", "type": "text", "required": false},        {"name": "og_image", "type": "image", "required": false},        {"name": "status", "type": "select", "required": true, "options": ["draft", "published", "archived"]},        {"name": "sections", "type": "sections", "required": false, "note": "Flexible sections component"},        {"name": "created_at", "type": "datetime", "required": false, "auto": true},        {"name": "updated_at", "type": "datetime", "required": false, "auto": true}      ]    },    {      "name": "Artwork",      "type": "collection",      "description": "Individual artworks - already implemented in Supabase",      "fields": [        {"name": "id", "type": "uuid", "required": true, "auto": true},        {"name": "title", "type": "text", "required": true},        {"name": "slug", "type": "slug", "required": false, "note": "Auto-generated from title"},        {"name": "year", "type": "text", "required": false},        {"name": "description", "type": "rich_text", "required": false},        {"name": "artist_notes", "type": "rich_text", "required": false},        {"name": "media", "type": "media_multiple", "required": false},        {"name": "thumbnail_path", "type": "media", "required": false},        {"name": "category", "type": "select", "required": false, "options": ["painting", "sculpture", "performance", "other"]},        {"name": "medium", "type": "text", "required": false},        {"name": "materials", "type": "text", "required": false},        {"name": "technique", "type": "text", "required": false},        {"name": "width", "type": "number", "required": false},        {"name": "height", "type": "number", "required": false},        {"name": "depth", "type": "number", "required": false},        {"name": "unit", "type": "select", "required": false, "options": ["cm", "m", "in", "ft"], "default": "cm"},        {"name": "series", "type": "text", "required": false},        {"name": "tags", "type": "tags", "required": false},        {"name": "location", "type": "text", "required": false},        {"name": "availability", "type": "select", "required": true, "options": ["available", "sold", "on_loan", "private_collection", "nfs"]},        {"name": "price", "type": "number", "required": false},        {"name": "currency", "type": "select", "required": false, "options": ["USD", "EUR", "LKR", "GBP"]},        {"name": "status", "type": "select", "required": true, "options": ["published", "draft", "archived"]},        {"name": "featured", "type": "boolean", "required": false, "default": false},        {"name": "sort_order", "type": "number", "required": false},        {"name": "date_created", "type": "date", "required": false},        {"name": "exhibition_history", "type": "repeater", "required": false},        {"name": "views_count", "type": "number", "required": false, "auto": true},        {"name": "created_at", "type": "datetime", "required": false, "auto": true},        {"name": "updated_at", "type": "datetime", "required": false, "auto": true}      ],      "relationships": [        {"name": "exhibitions", "type": "many_to_many", "target": "Exhibition", "note": "Future enhancement"}      ]    },    {      "name": "CVSection",      "type": "collection",      "description": "CV/Resume entries for About page",      "fields": [        {"name": "section_type", "type": "select", "required": true, "options": ["education", "solo_exhibitions", "group_exhibitions", "awards", "collections", "residencies", "publications"]},        {"name": "title", "type": "text", "required": true},        {"name": "entries", "type": "repeater", "required": true},        {"name": "sort_order", "type": "number", "required": false}      ]    },    {      "name": "WorkCategory",      "type": "collection",      "description": "Work category cards for /work page",      "fields": [        {"name": "title", "type": "text", "required": true},        {"name": "slug", "type": "slug", "required": true},        {"name": "description", "type": "text", "required": true},        {"name": "image", "type": "image", "required": true},        {"name": "image_alt", "type": "text", "required": true},        {"name": "link", "type": "url", "required": true},        {"name": "sort_order", "type": "number", "required": false},        {"name": "status", "type": "select", "required": true, "options": ["published", "draft"]}      ]    },    {      "name": "Exhibition",      "type": "collection",      "description": "Future: dedicated exhibition pages",      "fields": [        {"name": "title", "type": "text", "required": true},        {"name": "slug", "type": "slug", "required": true},        {"name": "description", "type": "rich_text", "required": false},        {"name": "type", "type": "select", "required": true, "options": ["solo", "group", "online", "residency"]},        {"name": "venue", "type": "text", "required": false},        {"name": "location", "type": "text", "required": false},        {"name": "start_date", "type": "date", "required": false},        {"name": "end_date", "type": "date", "required": false},        {"name": "curator", "type": "text", "required": false},        {"name": "featured_image", "type": "image", "required": false},        {"name": "gallery", "type": "media_multiple", "required": false},        {"name": "artworks", "type": "relationship_many", "required": false, "target": "Artwork"},        {"name": "press_links", "type": "repeater", "required": false},        {"name": "status", "type": "select", "required": true, "options": ["upcoming", "current", "past", "draft"]},        {"name": "featured", "type": "boolean", "required": false}      ]    },    {      "name": "NavItem",      "type": "collection",      "description": "Navigation links",      "fields": [        {"name": "label", "type": "text", "required": true},        {"name": "href", "type": "text", "required": true},        {"name": "location", "type": "select", "required": true, "options": ["header", "footer", "both"]},        {"name": "sort_order", "type": "number", "required": false},        {"name": "status", "type": "select", "required": true, "options": ["active", "inactive"]}      ]    },    {      "name": "UILabels",      "type": "singleton",      "description": "UI text strings and labels",      "fields": [        {"name": "cta_learn_more", "type": "text", "required": true, "default": "Learn More"},        {"name": "cta_view_all", "type": "text", "required": true, "default": "View All Artworks"},        {"name": "cta_view_portfolio", "type": "text", "required": true, "default": "View Portfolio"},        {"name": "cta_back_to_artworks", "type": "text", "required": true, "default": "Back to Artworks"},        {"name": "label_medium", "type": "text", "required": true, "default": "Medium"},        {"name": "label_dimensions", "type": "text", "required": true, "default": "Dimensions"},        {"name": "label_category", "type": "text", "required": true, "default": "Category"},        {"name": "search_placeholder", "type": "text", "required": true, "default": "Search artworks..."},        {"name": "filter_label", "type": "text", "required": true, "default": "Filters"},        {"name": "loading_text", "type": "text", "required": true, "default": "Loading..."},        {"name": "error_not_found", "type": "text", "required": true, "default": "Not found"}      ],      "note": "Additional UI label fields should be added as needed"    }  ],  "missing_routes": [    {      "route": "/exhibitions",      "mentioned_in": ["Work page category card"],      "priority": "high",      "note": "Should display list of exhibitions, link to individual exhibition pages"    },    {      "route": "/performances",      "mentioned_in": ["Work page category card"],      "priority": "medium",      "note": "Could be filtered view of artworks with category='performance', or dedicated page type"    },    {      "route": "/art-framing-and-restoration",      "mentioned_in": ["Work page category card"],      "priority": "low",      "note": "Service page for framing/restoration business"    },    {      "route": "/contact",      "mentioned_in": ["Navbar", "Footer"],      "priority": "medium",      "note": "Dedicated contact page using ContactSection component"    },    {      "route": "/blog",      "mentioned_in": ["Navbar"],      "priority": "low",      "note": "Blog/news section for updates"    }  ],  "placeholder_data_notes": [    {      "location": "About page CV section",      "issue": "Solo Exhibitions, Group Exhibitions, Awards, and Collections contain placeholder text",      "example": "'Exhibition Title', 'Gallery Name, City, Country', 'Award Title'",      "action_required": "Replace with real exhibition history and awards"    },    {      "location": "Sample artworks data",      "issue": "lib/data/artworks.ts contains sample artwork data that's not currently used (database is used instead)",      "action_required": "Can be removed or used for development/testing"    },    {      "location": "Work page categories",      "issue": "All category images use same placeholder",      "action_required": "Replace with unique representative images"    },    {      "location": "Root layout metadata",      "issue": "Site title is 'Create Next App' and description is placeholder",      "action_required": "Update to proper site metadata"    }  ],  "assumptions": [    {      "assumption": "Contact form currently simulates submission (setTimeout)",      "implication": "Will need backend integration for form submissions (email service or database)",      "recommendation": "Integrate with email service (SendGrid, Resend) or form handling service"    },    {      "assumption": "Artworks are already in database (Supabase)",      "implication": "CMS should integrate with existing Supabase structure",      "recommendation": "Option 1: Use Supabase as backend for CMS. Option 2: Migrate to dedicated CMS with sync to Supabase"    },    {      "assumption": "Site is single-language (English)",      "implication": "No i18n infrastructure needed initially",      "recommendation": "Consider i18n structure if multilingual support is planned (Sinhala, Tamil)"    },    {      "assumption": "All pages use same navbar and footer",      "implication": "Shared component data should be in SiteSettings",      "recommendation": "Consider flexible nav/footer configuration if different layouts needed"    },    {      "assumption": "Hero section has two versions (v1 and v2)",      "implication": "Only v2 is used; v1 may be legacy",      "recommendation": "Remove unused hero section component or make it selectable in CMS"    }  ],  "recommendations": [    {      "priority": "high",      "recommendation": "Create SiteSettings content type first",      "reason": "Many components rely on shared contact info, social links, and site-wide settings"    },    {      "priority": "high",      "recommendation": "Update root layout metadata",      "reason": "Currently has placeholder SEO title and description"    },    {      "priority": "high",      "recommendation": "Replace /IMG_8614.JPG with unique images",      "reason": "Same image used 15+ times across site; needs diverse visual content"    },    {      "priority": "medium",      "recommendation": "Populate CV section with real data",      "reason": "About page contains extensive placeholder content"    },    {      "priority": "medium",      "recommendation": "Implement Exhibition content type and pages",      "reason": "Work page links to /exhibitions but route doesn't exist"    },    {      "priority": "medium",      "recommendation": "Create WorkCategory content type",      "reason": "Work page categories are hardcoded; should be CMS-managed"    },    {      "priority": "low",      "recommendation": "Consider UILabels singleton for all UI text",      "reason": "Improves maintainability and allows easy text updates without code changes"    },    {      "priority": "low",      "recommendation": "Implement contact form backend",      "reason": "Current form only simulates submission"    }  ]}
SUMMARY
Total Dynamic Fields Identified: 200+
Pages Analyzed: 5 (Home, About, Work, Artworks, Artwork Detail)
Shared Components: 3 (Navbar, Footer, Contact Section)
Content Types Proposed: 8 (SiteSettings, Page, Artwork, CVSection, WorkCategory, Exhibition, NavItem, UILabels)
Images Inventoried: 1 primary placeholder (/IMG_8614.JPG used 15+ times) + dynamic database images
Missing Routes: 5 (/exhibitions, /performances, /art-framing-and-restoration, /contact, /blog)
Database Schema: Already implemented in Supabase with comprehensive artwork fields
NEXT STEPS
Choose CMS Platform:
Option A: Use Supabase directly with admin UI (Supabase Studio)
Option B: Headless CMS (Payload, Sanity, Strapi) with Supabase integration
Option C: Build custom admin panel using existing Supabase setup
Phase 1: Site Settings & Shared Content
Implement SiteSettings singleton
Create NavItem and UILabels management
Replace hardcoded contact info, social links, copyright
Phase 2: Page Content
Create Page content type with flexible sections
Migrate Home, About, Work pages to CMS
Replace placeholder CV data
Phase 3: Artwork Management
Already in database; enhance admin UI
Add bulk edit, media management features
Implement Exhibition content type and pages
Phase 4: Polish
Replace all placeholder images
Implement missing routes
Add analytics, SEO improvements
Set up preview mode for draft content
Would you like me to clarify anything or provide more detail on any specific section?


# CMS Content Inventory & Requirements

## Bandu Manamperi Portfolio Website

**Version:** 1.0.0  
**Generated:** December 13, 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Page-by-Page Analysis](#page-by-page-analysis)
3. [Shared Components](#shared-components)
4. [Content Type Schema](#content-type-schema)
5. [Media Inventory](#media-inventory)
6. [Missing Routes](#missing-routes)
7. [Recommendations](#recommendations)

---

## Executive Summary

### Overview

- **Total Dynamic Fields:** 200+
- **Pages Analyzed:** 5 (Home, About, Work, Artworks, Artwork Detail)
- **Shared Components:** 3 (Navbar, Footer, Contact Section)
- **Content Types Proposed:** 8
- **Primary Placeholder Image:** `/IMG_8614.JPG` (used 15+ times)
- **Missing Routes:** 5

### Current State

- Artwork data already implemented in Supabase database
- Most content is hardcoded in React components
- Extensive placeholder content in CV section
- Single placeholder image used throughout site
- Contact form simulates submission (no backend)

---

## Page-by-Page Analysis

### 1. Home Page (`/`)

**Route:** `/`  
**Source Files:**

- `app/page.tsx`
- `components/home/home.tsx`

**Components Used:**

- `HeroSection` (`components/home/heroSection-v2.tsx`)
- `FeaturedWorks` (`components/home/featuredWorks.tsx`)
- `AboutSection` (`components/home/aboutSection.tsx`)
- `ContactSection` (`components/home/contactSection.tsx`)

#### Hero Section Fields

| Field Key | Type | Current Value | Usage |
|-----------|------|---------------|-------|
| `hero.tagline` | text | "Sri Lankan Contemporary Artist" | Eyebrow text (mobile) |
| `hero.subtitle` | text | "Performance · Sculpture · Visual Art" | Subtitle (desktop) |
| `hero.artist_name` | text | "Bandu Manamperi" | Main heading |
| `hero.description_mobile` | rich_text | "Exploring the boundaries of body, identity..." | Mobile description |
| `hero.description_desktop` | rich_text | "A multidisciplinary practice that challenges..." | Desktop description |
| `hero.cta_mobile_text` | text | "Discover Works" | Mobile CTA button |
| `hero.cta_desktop_text` | text | "View Portfolio" | Desktop CTA button |
| `hero.cta_link` | url | "#" | CTA destination |
| `hero.mobile_image` | image | `/IMG_8614.JPG` | Mobile background image |
| `hero.desktop_grid` | repeater | 4 items | Desktop image grid |

**Desktop Grid Items:**

1. Image: `/IMG_8614.JPG`, Title: "Performance Series"
2. Image: `/IMG_8614.JPG`, Title: "Sculptural Works"
3. Image: `/IMG_8614.JPG`, Title: "Installation Art"
4. Image: `/IMG_8614.JPG`, Title: "Visual Narratives"

#### Featured Works Section

| Field Key | Type | Current Value |
|-----------|------|---------------|
| `featured_works.heading` | text | "Featured Work" |
| `featured_works.description` | text | "A selection of recent works..." |
| `featured_works.cta_text` | text | "View All Artworks" |
| `featured_works.cta_link` | url | "/artworks" |
| `featured_works.items` | relationship | From Artwork content type (featured=true) |

#### About Section

| Field Key | Type | Current Value |
|-----------|------|---------------|
| `about.eyebrow` | text | "About" |
| `about.heading` | text | "The Artist" |
| `about.body` | rich_text | Biography paragraphs |
| `about.image` | image | `/IMG_8614.JPG` |
| `about.stats` | repeater | 3 items (Years, Exhibitions, Countries) |

**Stats Items:**

- Value: "15+", Label: "Years"
- Value: "40+", Label: "Exhibitions"
- Value: "12", Label: "Countries"

#### Contact Section

See [Shared Components](#shared-components)

---

### 2. About Page (`/about`)

**Route:** `/about`  
**Source Files:**

- `app/about/page.tsx`

**SEO Metadata:**

- Title: "About | Bandu Manamperi"
- Description: "About Bandu Manamperi - Biography, artistic practice, and curriculum vitae"

#### Page Header

| Field Key | Type | Current Value |
|-----------|------|---------------|
| `about_page.header.eyebrow` | text | "The Artist" |
| `about_page.header.heading` | text | "About" |
| `about_page.header.description` | text | "An artist interrogating the politics..." |

#### Biography Section

| Field Key | Type | Current Value |
|-----------|------|---------------|
| `biography.heading` | text | "Bandu Manamperi" |
| `biography.body` | rich_text | Multiple paragraphs about practice |
| `biography.image` | image | `/IMG_8614.JPG` |
| `biography.stats` | repeater | Same as home page |

#### Artistic Practice Section

| Field Key | Type | Items |
|-----------|------|-------|
| `artistic_practice.heading` | text | "Artistic Practice" |
| `artistic_practice.items` | repeater | 3 cards |

**Practice Items:**

1. **Performance Art**: "Durational and participatory works..."
2. **Installation & Sculpture**: "Site-responsive installations..."
3. **Drawing & Documentation**: "An ongoing drawing practice..."

#### Curriculum Vitae Section

| Section | Type | Status |
|---------|------|--------|
| Education | repeater | Real data |
| Solo Exhibitions | repeater | **PLACEHOLDER** |
| Group Exhibitions | repeater | Mix (partial real data) |
| Residencies | repeater | Real data |
| Awards & Grants | repeater | **PLACEHOLDER** |
| Public Collections | repeater | **PLACEHOLDER** |
| Publications | repeater | Real data |

**⚠️ Note:** CV sections with "PLACEHOLDER" status contain sample data like "Exhibition Title", "Gallery Name, City, Country" that needs to be replaced with real information.

---

### 3. Work Page (`/work`)

**Route:** `/work`  
**Source Files:**

- `app/work/page.tsx`

#### Page Header

| Field Key | Type | Current Value |
|-----------|------|---------------|
| `work_page.eyebrow` | text | "Explore" |
| `work_page.heading` | text | "Work" |
| `work_page.description` | text | "Discover the full breadth..." |

#### Work Categories

| Title | Link | Status | Image |
|-------|------|--------|-------|
| Artworks | `/artworks` | ✅ Implemented | `/IMG_8614.JPG` |
| Exhibitions | `/exhibitions` | ❌ Missing | `/IMG_8614.JPG` |
| Performances | `/performances` | ❌ Missing | `/IMG_8614.JPG` |
| Art Framing, Restoration, and Conservation | `/art-framing-and-restoration` | ❌ Missing | `/IMG_8614.JPG` |

**⚠️ Issue:** All categories use the same placeholder image.

---

### 4. Artworks Listing (`/artworks`)

**Route:** `/artworks`  
**Source Files:**

- `app/artworks/page.tsx`
- `components/artworks/index.tsx`

#### Search & Filter UI Labels

| Field Key | Current Value |
|-----------|---------------|
| `artworks_page.search_placeholder` | "Search artworks by title, description, or medium..." |
| `artworks_page.filter_button_text` | "Filters" |
| `artworks_page.all_filter_text` | "All" |
| `artworks_page.clear_filters_text` | "Clear all" |
| `artworks_page.results_text` | "Showing {filtered} of {total} artworks" |
| `artworks_page.no_results_text` | "No artworks found matching your filters." |

#### Filter Labels

- Series: "Series" / "All Series"
- Status: "Status" / "All Statuses"
- Availability: "Availability" / "All"
- Tags: "Tags"

**Data Source:** Artworks fetched from Supabase database with filtering applied client-side.

---

### 5. Artwork Detail (`/artworks/[slug]`)

**Route:** `/artworks/[slug]`  
**Source Files:**

- `app/artworks/[slug]/page.tsx`
- `components/artworks/artworkDetail.tsx`

#### Dynamic SEO (Per Artwork)

- Title: `{artwork.title} - Bandu Manamperi`
- Description: `View {title} by Bandu Manamperi. Medium: {medium}. Year: {year}.`
- OG Image: First artwork media or thumbnail

#### Field Labels

| Label Key | Display Text |
|-----------|--------------|
| `label_medium` | "Medium" |
| `label_dimensions` | "Dimensions" |
| `label_category` | "Category" |
| `label_series` | "Series" |
| `label_materials` | "Materials" |
| `label_technique` | "Technique" |
| `label_location` | "Location" |
| `label_availability` | "Availability" |
| `label_description` | "Description" |
| `label_artist_notes` | "Artist Notes" |
| `label_tags` | "Tags" |
| `label_exhibition_history` | "Exhibition History" |

#### Availability Display Mapping

| Database Value | Display Text |
|----------------|--------------|
| `available` | "Available" |
| `sold` | "Sold" |
| `on_loan` | "On Loan" |
| `private_collection` | "Private Collection" |
| `nfs` | "Not For Sale" |

---

## Shared Components

### Navbar

**Source:** `components/navBar/navbar.tsx`  
**Used On:** All pages

| Field Key | Type | Current Value |
|-----------|------|---------------|
| `navbar.brand_text` | text | "Portfolio" |
| `navbar.nav_items` | repeater | 4 items |

**Nav Items:**

1. "About" → `/about` ✅
2. "Work" → `/work` ✅
3. "Contact" → `/contact` ❌
4. "Blog" → `/blog` ❌

---

### Footer

**Source:** `components/footer/footer.tsx`  
**Used On:** All pages

#### Brand Section

| Field Key | Current Value | Shared With |
|-----------|---------------|-------------|
| `footer.brand_name` | "Bandu Manamperi" | `SiteSettings.site_name` |
| `footer.brand_description` | "Contemporary artist exploring..." | - |

#### Navigation

| Label | Link | Status |
|-------|------|--------|
| Work | `#work` | Hash link (homepage) |
| About | `#about` | Hash link (homepage) |
| Contact | `#contact` | Hash link (homepage) |
| All Artworks | `/artworks` | ✅ |

#### Social Links

| Platform | URL | Icon |
|----------|-----|------|
| Facebook | `https://www.facebook.com/bandu.manamperi` | facebook |
| Instagram | `https://www.instagram.com/bandu_manamperi/` | instagram |
| Theertha Collective | `https://theertha.org/artists/bandu-manamperi/` | building |

#### Contact Info

- **Email:** <bandumanamperi@yahoo.com>
- **Location:** Colombo, Sri Lanka

#### Copyright

- **Text:** "© {year} Bandu Manamperi. All rights reserved."
- **Tagline:** "Performance & Visual Artist"

---

### Contact Section

**Source:** `components/home/contactSection.tsx`  
**Used On:** Home page (potentially `/contact` page)

#### Contact Information

| Field Key | Current Value |
|-----------|---------------|
| `contact.email` | <bandumanamperi@yahoo.com> |
| `contact.gallery_name` | "Theertha International Artists' Collective" |
| `contact.gallery_location` | "Colombo, Sri Lanka" |
| `contact.location_city` | "Colombo" |
| `contact.location_country` | "Sri Lanka" |

#### Form Labels

| Field | Label | Placeholder |
|-------|-------|-------------|
| Name | "Name *" | "Your name" |
| Email | "Email*" | "<your.email@example.com>" |
| Message | "Message *" | "Tell me about your inquiry..." |

#### Form States

- Submit: "Send Message"
- Submitting: "Sending..."
- Success Title: "Message sent successfully"
- Success Description: "Thank you for your message. I'll get back to you soon."

**⚠️ Note:** Form currently simulates submission with `setTimeout`. Needs backend integration.

---

## Content Type Schema

### 1. SiteSettings (Singleton)

Global site-wide settings that appear across all pages.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `site_name` | text | Yes | "Bandu Manamperi" |
| `site_tagline` | text | No | "Performance & Visual Artist" |
| `site_title` | text | Yes | SEO title template |
| `site_description` | text | Yes | Meta description |
| `og_image` | image | No | Default Open Graph image |
| `favicon` | image | No | Site favicon |
| `contact_email` | email | Yes | <bandumanamperi@yahoo.com> |
| `contact_location_city` | text | No | "Colombo" |
| `contact_location_country` | text | No | "Sri Lanka" |
| `gallery_name` | text | No | "Theertha International Artists' Collective" |
| `gallery_location` | text | No | "Colombo, Sri Lanka" |
| `social_facebook` | url | No | Facebook profile URL |
| `social_instagram` | url | No | Instagram profile URL |
| `social_theertha` | url | No | Theertha Collective URL |
| `copyright_text` | text | No | Copyright notice (supports {year}) |
| `navbar_brand` | text | Yes | "Portfolio" |
| `footer_description` | rich_text | No | Footer brand description |

---

### 2. Page (Collection)

Flexible page type for static content pages.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | text | Yes | Page title |
| `slug` | slug | Yes | URL slug (e.g., "about", "work") |
| `seo_title` | text | No | Override SEO title |
| `seo_description` | text | No | Meta description |
| `og_image` | image | No | Override OG image |
| `status` | select | Yes | draft, published, archived |
| `sections` | sections | No | Flexible sections |
| `created_at` | datetime | Auto | Creation date |
| `updated_at` | datetime | Auto | Last update |

#### Section Types

**Hero Section:**

- `type`: "hero"
- `eyebrow`: text
- `heading`: text
- `description`: rich_text
- `cta_text`: text
- `cta_link`: url
- `images`: repeater (image, alt_text, caption)

**Biography Section:**

- `type`: "biography"
- `eyebrow`: text
- `heading`: text
- `body`: rich_text
- `image`: media
- `image_alt`: text
- `stats`: repeater (value, label)

**Artistic Practice Section:**

- `type`: "artistic_practice"
- `heading`: text
- `items`: repeater (title, description)

**Featured Works Section:**

- `type`: "featured_works"
- `heading`: text
- `description`: text
- `cta_text`: text
- `cta_link`: url
- `filter_by`: select (all, featured_only, by_category)
- `limit`: number

**About Section:**

- `type`: "about"
- `eyebrow`: text
- `heading`: text
- `body`: rich_text
- `image`: media
- `stats`: repeater

**Contact Section:**

- `type`: "contact"
- `eyebrow`: text
- `heading`: text
- `description`: rich_text

**CV Section:**

- `type`: "cv"
- `eyebrow`: text
- `heading`: text
- `subsections`: repeater

**Work Categories Grid:**

- `type`: "work_categories"
- `heading`: text
- `description`: text
- `categories`: repeater

---

### 3. Artwork (Collection)

Individual artworks. **Already implemented in Supabase database.**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | uuid | Auto | Primary key |
| `title` | text | Yes | Artwork title |
| `slug` | slug | No | Auto-generated from title |
| `year` | text | No | Year created (text to allow ranges) |
| `description` | rich_text | No | Public description |
| `artist_notes` | rich_text | No | Internal/artist notes |
| `media` | media_multiple | No | Array of images/videos |
| `thumbnail_path` | media | No | Custom thumbnail |
| `category` | select | No | painting, sculpture, performance, other |
| `medium` | text | No | "Oil on canvas", "Performance Art" |
| `materials` | text | No | Detailed materials list |
| `technique` | text | No | Artistic technique |
| `width` | number | No | Width in specified unit |
| `height` | number | No | Height in specified unit |
| `depth` | number | No | Depth in specified unit |
| `unit` | select | No | cm, m, in, ft (default: cm) |
| `series` | text | No | Series or collection name |
| `tags` | tags | No | Array of tags |
| `location` | text | No | Current location |
| `availability` | select | Yes | available, sold, on_loan, private_collection, nfs |
| `price` | number | No | Price |
| `currency` | select | No | USD, EUR, LKR, etc. |
| `status` | select | Yes | published, draft, archived |
| `featured` | boolean | No | Show in featured sections |
| `sort_order` | number | No | Custom ordering |
| `date_created` | date | No | Actual creation date |
| `exhibition_history` | repeater | No | See below |
| `views_count` | number | Auto | Page view analytics |
| `created_at` | datetime | Auto | Database creation |
| `updated_at` | datetime | Auto | Last update |

**Exhibition History (nested):**

- `name`: text (required)
- `location`: text
- `date`: date or text
- `curator`: text
- `notes`: text

---

### 4. CVSection (Collection)

For CV/Resume entries - can be reused across pages.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `section_type` | select | Yes | education, solo_exhibitions, group_exhibitions, awards, collections, residencies, publications |
| `title` | text | Yes | Section title |
| `entries` | repeater | Yes | See entry structure |
| `sort_order` | number | No | Display order |

**Entry Structure:**

- `year` or `year_range`: text
- `title`: text
- `subtitle`: text
- `description`: rich_text (optional)

---

### 5. WorkCategory (Collection)

Work category cards for `/work` page.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | text | Yes | "Artworks", "Exhibitions", etc. |
| `slug` | slug | Yes | URL slug |
| `description` | text | Yes | Category description |
| `image` | image | Yes | Card image |
| `image_alt` | text | Yes | Alt text |
| `link` | url | Yes | Target page |
| `sort_order` | number | No | Display order |
| `status` | select | Yes | published, draft |

---

### 6. Exhibition (Collection)

**Status:** Recommended for future implementation

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | text | Yes | Exhibition title |
| `slug` | slug | Yes | URL slug |
| `description` | rich_text | No | Exhibition description |
| `type` | select | Yes | solo, group, online, residency |
| `venue` | text | No | Gallery/venue name |
| `location` | text | No | City, Country |
| `start_date` | date | No | Opening date |
| `end_date` | date | No | Closing date |
| `curator` | text | No | Curator name(s) |
| `featured_image` | image | No | Main exhibition image |
| `gallery` | media_multiple | No | Exhibition photos |
| `artworks` | relationship | No | Link to Artwork items |
| `press_links` | repeater | No | External press coverage |
| `status` | select | Yes | upcoming, current, past, draft |
| `featured` | boolean | No | Feature on home/work page |

---

### 7. NavItem (Collection)

Navigation links for header and footer.

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `label` | text | Yes | Link text |
| `href` | url or slug | Yes | Target URL |
| `location` | select | Yes | header, footer, both |
| `sort_order` | number | No | Display order |
| `status` | select | Yes | active, inactive |

---

### 8. UILabels (Singleton)

Text strings for UI elements (buttons, labels, error messages).

| Field Name | Default Value |
|------------|---------------|
| `cta_learn_more` | "Learn More" |
| `cta_view_all` | "View All Artworks" |
| `cta_view_portfolio` | "View Portfolio" |
| `cta_discover_works` | "Discover Works" |
| `cta_back_to_artworks` | "Back to Artworks" |
| `label_medium` | "Medium" |
| `label_dimensions` | "Dimensions" |
| `label_category` | "Category" |
| `label_series` | "Series" |
| `label_materials` | "Materials" |
| `label_technique` | "Technique" |
| `label_location` | "Location" |
| `label_availability` | "Availability" |
| `label_description` | "Description" |
| `label_artist_notes` | "Artist Notes" |
| `label_tags` | "Tags" |
| `label_exhibition_history` | "Exhibition History" |
| `search_placeholder` | "Search artworks..." |
| `filter_label` | "Filters" |
| `clear_filters` | "Clear filters" |
| `no_results` | "No artworks found..." |
| `loading_text` | "Loading..." |
| `error_not_found` | "Not found" |

**Note:** Additional UI label fields should be added as needed for complete i18n support.

---

## Media Inventory

### Primary Placeholder Image

**Path:** `/IMG_8614.JPG`  
**Format:** JPEG  
**Usage Count:** 15+ instances

#### Usage Locations

| Page | Location | Alt Text | Priority |
|------|----------|----------|----------|
| Home | Hero mobile background | "Bandu Manamperi - Contemporary Performance Artist" | High |
| Home | Hero desktop grid (×4) | Various titles (Performance, Sculptural, Installation, Visual) | High |
| Home | About section portrait | "Bandu manamperi" | Medium |
| About | Biography portrait | "Bandu Manamperi" | Medium |
| Work | Artworks category card | "Artworks" | High |
| Work | Exhibitions category card | "Exhibitions" | High |
| Work | Performances category card | "Performances" | High |
| Work | Framing category card | "Art Framing and Restoration" | High |

**⚠️ CRITICAL:** Same placeholder image used throughout site. **Must be replaced** with unique, representative images for each usage.

---

### Next.js Default Assets

The following default assets are present but not currently used:

- `/file.svg`
- `/globe.svg`
- `/next.svg`
- `/vercel.svg`
- `/window.svg`

**Recommendation:** Can be removed if not needed.

---

### Supabase Storage

**Bucket:** `artworks`  
**Content:** Dynamic artwork media (images, videos)  
**Access:** Signed URLs  
**Usage:**

- Artwork detail pages
- Featured works section
- Artworks listing page

---

### Media Management Strategy

#### Required Media Fields

All media uploads should include:

| Field | Description |
|-------|-------------|
| `url` | Media URL |
| `alt_text` | Alt text for accessibility |
| `caption` | Optional caption |
| `credits` | Photo/artwork credits |
| `focal_point` | X/Y coordinates for smart cropping |
| `width` | Original width (px) |
| `height` | Original height (px) |
| `file_size` | File size in bytes |
| `mime_type` | image/jpeg, video/mp4, etc. |

---

## Missing Routes

| Route | Status | Priority | Notes |
|-------|--------|----------|-------|
| `/exhibitions` | ❌ Not Implemented | High | Linked from Work page. Should display exhibition list/detail pages |
| `/performances` | ❌ Not Implemented | Medium | Linked from Work page. Could be filtered artworks view or dedicated page |
| `/art-framing-and-restoration` | ❌ Not Implemented | Low | Service page for framing/restoration business |
| `/contact` | ❌ Not Implemented | Medium | Linked in navbar and footer. Could reuse ContactSection component |
| `/blog` | ❌ Not Implemented | Low | Linked in navbar. Blog/news section for updates |

---

## Issues & Required Actions

### Critical Issues

1. **Placeholder Image Overuse**
   - **Issue:** `/IMG_8614.JPG` used 15+ times across site
   - **Impact:** Poor visual diversity, unprofessional appearance
   - **Action:** Replace with unique images for each usage context
   - **Priority:** HIGH

2. **Root Layout Metadata**
   - **Issue:** Site title is "Create Next App", description is placeholder
   - **Impact:** Poor SEO, unprofessional
   - **Action:** Update `app/layout.tsx` with proper metadata
   - **Priority:** HIGH

3. **CV Placeholder Content**
   - **Issue:** Extensive placeholder data ("Exhibition Title", "Gallery Name")
   - **Impact:** Non-functional About page
   - **Action:** Replace with real exhibition history and awards
   - **Priority:** HIGH

### Medium Priority Issues

4. **Contact Form Backend**
   - **Issue:** Form submission is simulated with `setTimeout`
   - **Impact:** Contact form non-functional
   - **Action:** Integrate with email service (SendGrid, Resend) or form handler
   - **Priority:** MEDIUM

5. **Missing Routes**
   - **Issue:** 5 routes linked but not implemented
   - **Impact:** Broken links, incomplete site
   - **Action:** Implement or remove links
   - **Priority:** MEDIUM

6. **Work Category Images**
   - **Issue:** All category cards use same image
   - **Impact:** Poor visual distinction between categories
   - **Action:** Create/select unique representative images
   - **Priority:** MEDIUM

### Low Priority Issues

7. **Unused Hero Section Component**
   - **Issue:** `heroSection.tsx` exists but `heroSection-v2.tsx` is used
   - **Impact:** Code maintenance overhead
   - **Action:** Remove or make selectable in CMS
   - **Priority:** LOW

8. **Unused Sample Data**
   - **Issue:** `lib/data/artworks.ts` contains sample data not used
   - **Impact:** Code clutter
   - **Action:** Remove or use for development/testing
   - **Priority:** LOW

---

## Recommendations

### Phase 1: Foundation (Week 1-2)

#### 1.1 Choose CMS Platform

**Option A: Supabase Direct**

- ✅ Pros: Already using Supabase, minimal setup
- ❌ Cons: Limited CMS features, manual admin UI

**Option B: Headless CMS (Payload, Sanity, Strapi)**

- ✅ Pros: Rich CMS features, good UX, flexible
- ❌ Cons: Additional service, integration needed

**Option C: Custom Admin Panel**

- ✅ Pros: Full control, tailored to needs
- ❌ Cons: Development time, maintenance

**Recommendation:** Start with **Option B (Payload CMS)** for best balance of features and ease of use.

#### 1.2 Site Settings & Shared Content

- [ ] Implement `SiteSettings` singleton
- [ ] Create `NavItem` management
- [ ] Create `UILabels` management
- [ ] Replace hardcoded contact info with CMS fields
- [ ] Update root layout metadata

#### 1.3 Replace Critical Placeholders

- [ ] Update site title/description in `app/layout.tsx`
- [ ] Replace `/IMG_8614.JPG` with unique images (minimum 8 new images needed)
- [ ] Update alt text for all images

---

### Phase 2: Content Migration (Week 3-4)

#### 2.1 Page Content

- [ ] Create `Page` content type with flexible sections
- [ ] Migrate Home page to CMS
- [ ] Migrate About page to CMS
- [ ] Migrate Work page to CMS
- [ ] Replace placeholder CV data with real information

#### 2.2 Work Categories

- [ ] Create `WorkCategory` content type
- [ ] Add unique images for each category
- [ ] Make categories CMS-manageable

---

### Phase 3: Artwork Enhancement (Week 5-6)

#### 3.1 Artwork Management

- [ ] Enhance Supabase admin UI for artworks
- [ ] Add bulk edit capabilities
- [ ] Improve media management workflow
- [ ] Add image optimization/processing

#### 3.2 Exhibition Implementation

- [ ] Create `Exhibition` content type
- [ ] Implement `/exhibitions` route
- [ ] Create exhibition list view
- [ ] Create exhibition detail view
- [ ] Link exhibitions to artworks

---

### Phase 4: Polish & Launch (Week 7-8)

#### 4.1 Missing Routes

- [ ] Implement `/performances` page
- [ ] Implement `/contact` page
- [ ] Implement `/art-framing-and-restoration` page
- [ ] Decide on `/blog` implementation

#### 4.2 Form Integration

- [ ] Integrate contact form with email service
- [ ] Add form validation
- [ ] Add spam protection
- [ ] Test form submissions

#### 4.3 SEO & Analytics

- [ ] Add structured data (Schema.org)
- [ ] Implement sitemap generation
- [ ] Set up preview mode for draft content
- [ ] Add analytics integration
- [ ] Test social media sharing

---

## Content Relationships

```
SiteSettings (singleton)
    ├─→ Used by: Navbar, Footer, ContactSection
    └─→ Contains: Contact info, social links, site-wide text

Page (collection)
    ├─→ Sections: Hero, Biography, Featured Works, etc.
    ├─→ References: Artworks (for featured works)
    └─→ References: CVSections (for about page)

Artwork (collection)
    ├─→ Referenced by: Page (
