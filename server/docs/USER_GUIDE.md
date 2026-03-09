# User Guide

**Laravel CMS & E-commerce Platform — Admin Panel**

This guide is written for content editors and administrators who manage the platform through the admin panel. No coding knowledge is required.

---

## Table of Contents

1. [What Is This Platform?](#1-what-is-this-platform)
2. [Getting Started](#2-getting-started)
3. [Dashboard](#3-dashboard)
4. [CMS — Content Management](#4-cms--content-management)
   - [Pages](#41-pages)
   - [Page Builder](#42-page-builder)
   - [Reusable Blocks](#43-reusable-blocks)
   - [Menus](#44-menus)
   - [Themes](#45-themes)
   - [Forms](#46-forms)
   - [FAQ](#47-faq)
   - [Stores](#48-stores)
5. [Blog](#5-blog)
6. [Shop — E-commerce](#6-shop--e-commerce)
   - [Products](#61-products)
   - [Categories](#62-categories)
   - [Brands](#63-brands)
   - [Product Types & Attributes](#64-product-types--attributes)
   - [Product Flags](#65-product-flags)
   - [Orders](#66-orders)
   - [Customers](#67-customers)
   - [Discounts](#68-discounts)
   - [Promotions](#69-promotions)
   - [Tax Rates](#610-tax-rates)
   - [Shipping Methods](#611-shipping-methods)
   - [Returns](#612-returns)
   - [Carts & Wishlists](#613-carts--wishlists)
7. [Newsletter](#7-newsletter)
8. [Finance](#8-finance)
9. [Users & Roles](#9-users--roles)
10. [Notifications](#10-notifications)
11. [Activity Log](#11-activity-log)
12. [Version History](#12-version-history)
13. [Cookie Consents](#13-cookie-consents)
14. [Languages & Translations](#14-languages--translations)
15. [Affiliates](#15-affiliates)
16. [Settings](#16-settings)
17. [Your Profile & Security](#17-your-profile--security)
18. [Common Workflows](#18-common-workflows)

---

## 1. What Is This Platform?

This is a headless CMS and e-commerce platform. It powers two things simultaneously:

- **The admin panel** — where you manage all content, products, orders, users, and settings. This is the interface you are reading about now.
- **The public website** — a separate frontend that shows your content and shop to visitors.

Everything you create or update in the admin panel is immediately reflected on the public site (after publishing, where applicable).

---

## 2. Getting Started

### Logging In

Navigate to `/admin` in your browser. You will see the login page.

- Enter your **email address** and **password**.
- If two-factor authentication (2FA) is enabled on your account, you will be prompted to enter a 6-digit code from your authenticator app after entering your password.

### Two-Factor Authentication (2FA)

2FA adds a second layer of security to your account. To set it up:

1. Go to your **Profile** (top-right corner menu).
2. Find the **Two-Factor Authentication** section.
3. Click **Enable** and scan the QR code with an authenticator app (such as Google Authenticator, Authy, or 1Password).
4. Confirm with the 6-digit code shown in the app.

> Keep your recovery codes safe. They allow you to log in if you lose access to your authenticator app.

### Navigation Overview

The left sidebar contains all major sections:

| Section | What It Contains |
|---|---|
| Dashboard | Overview widgets and quick stats |
| CMS | Pages, Menus, Themes, Forms, FAQ, Stores |
| Blog | Posts and Categories |
| Shop | Products, Orders, Customers, Discounts, Returns |
| Newsletter | Subscribers, Segments, Campaigns |
| Finance | Currencies, Exchange Rates |
| Users | User accounts and roles |
| Notifications | Push/email/SMS notifications to users |
| Activity Log | Audit trail of all admin actions |
| Settings | System configuration |

The top bar contains:
- **Search** — global search across all content
- **Notifications bell** — real-time alerts
- **Profile menu** — your account settings

---

## 3. Dashboard

The dashboard shows an overview of your platform's activity. It is made up of **widgets** that you can configure.

**Widget types available:**

| Type | Description |
|---|---|
| Statistic Card | A single number (e.g. total orders today) |
| Chart | A line or bar chart over time |
| Table | A small data table (e.g. recent orders) |
| Recent Activity | Latest actions in the activity log |
| Quick Actions | Buttons to common tasks |

**Real-time notifications** appear in the top-right bell icon. The system checks for new notifications every few seconds automatically — no need to refresh the page.

---

## 4. CMS — Content Management

### 4.1 Pages

Pages are the building blocks of your website. Navigate to **CMS > Pages**.

**Page types:**

| Type | Description |
|---|---|
| Blocks | Built using the visual page builder with drag-and-drop sections |
| Module | Linked to a data source (e.g. a product catalogue or blog listing) |

**Key actions on a page:**

- **Edit** — opens the page editor
- **Preview** — view the page as it will appear on the website (uses a secure preview token, no login required for the preview URL)
- **Duplicate** — create a copy of the page with all its content
- **Publish / Save as Draft** — pages have draft and published states; visitors only see published content

**Draft vs. Published:**

Every page has a draft state and a published state. Editing a page modifies the draft. Click **Publish** to push the draft live. This means you can safely work on changes without affecting the live site.

**SEO fields** are available on each page: title, meta description, and Open Graph settings. Fill these in to help search engines and social media display your content correctly.

**Translatable fields:** Page title, excerpt, content, and rich content can be entered in multiple languages. Use the language selector on the edit form to switch between locales.

---

### 4.2 Page Builder

The page builder is the visual editor for pages of type **Blocks**. Access it by editing a Blocks-type page.

**How it works:**

A page is made up of **sections**. Each section contains one or more **blocks**. You can drag and drop both sections and blocks to reorder them.

**Available block types:**

| Block | Purpose |
|---|---|
| Hero Banner | Full-width banner with heading, text, and CTA button |
| Rich Text | Formatted text content (headings, lists, links) |
| Featured Products | Display a selection of products |
| Categories Grid | Show product categories as a visual grid |
| Promotional Banner | Marketing banner with image and text |
| Newsletter Signup | Email capture form |
| Testimonials | Customer quotes |
| Image Gallery | Photo gallery |
| Video Embed | Embedded video |
| Custom HTML | Raw HTML for advanced users |
| Two Columns | Side-by-side layout |
| Three Columns | Three-column layout |
| Accordion | Expandable FAQ-style items |
| Tabs | Tabbed content |
| Form Embed | Embed a contact/custom form |
| Map | Location map |

**Useful features:**

- **Undo / Redo** — up to 20 steps of history with the undo/redo buttons in the toolbar
- **Copy / Paste blocks** — click the copy icon on any block to copy it to your clipboard, then paste it anywhere on the same or a different page
- **Mobile preview** — switch to mobile preview mode in the toolbar to see how the page looks on a phone screen
- **Split view** — view the editor and the page preview side by side

**To add a block:**

1. Click **Add Block** inside a section, or create a new section first.
2. Choose the block type from the list.
3. Fill in the block's settings (text, images, links, etc.).
4. Save the draft, then publish when ready.

---

### 4.3 Reusable Blocks

Reusable blocks (also called **Global Blocks**) are blocks you design once and then embed into multiple pages. This is useful for content that appears in many places, such as a promotional banner or a call-to-action.

Navigate to **CMS > Reusable Blocks**.

- Create a block and configure it as you would a normal page builder block.
- On any page, when adding a block, choose **Reusable Block** and select the global block you want to use.
- Updating the global block updates it everywhere it is used.

---

### 4.4 Menus

Menus control the navigation links on your website (header, footer, etc.). Navigate to **CMS > Menus**.

**Menu locations:**

| Location | Description |
|---|---|
| Header | Main top navigation |
| Footer | Links at the bottom of the page |
| Footer Legal | Legal links (privacy, terms) in the footer |

**Adding menu items:**

1. Open a menu and click **Add Item**.
2. Choose the link type:
   - **Custom URL** — any URL you type
   - **Category** — links to a product category
   - **Product** — links to a specific product
   - **Page** — links to a CMS page
3. Enter the label (supports multiple languages).
4. Save.

Menu items can be nested (drag a child item under a parent) to create dropdown menus.

---

### 4.5 Themes

Themes control the visual appearance (colours, fonts, spacing) of your public website. Navigate to **CMS > Themes**.

- **Activate** — makes a theme live on the website immediately.
- **Duplicate** — create a copy of a theme to experiment with changes safely.
- **Disable** — removes the active theme (the site will use default styles).

> Only one theme can be active at a time.

---

### 4.6 Forms

Custom forms let visitors submit enquiries, feedback, or requests. Navigate to **CMS > Forms**.

**Creating a form:**

1. Click **New Form**.
2. Give it a name and a success message (shown to visitors after submission).
3. Add fields (text, email, select, textarea, etc.).
4. Set **Notification Emails** — a list of email addresses that receive alerts for each submission.
5. Toggle **Allow Multiple Responses** if the same visitor can submit more than once.

**Viewing submissions:**

Go to **CMS > Form Submissions** to see all data submitted through your forms. You can filter by form and date.

**Embedding a form:**

Use the **Form Embed** block in the page builder, or ask a developer to embed it via the API.

---

### 4.7 FAQ

The FAQ section stores questions and answers displayed on your website. Navigate to **CMS > FAQ**.

- Drag items to reorder them by position.
- Toggle items active/inactive without deleting them.
- The website shows only active FAQ items.

---

### 4.8 Stores

If you have physical locations, manage them under **CMS > Stores**. Each store has:

- Name, address, phone, and opening hours
- Map coordinates (for map display on the website)
- Active/inactive toggle

---

## 5. Blog

Navigate to **Blog** in the sidebar.

### Blog Posts

Each post has:

- **Title** (translatable)
- **Content** — rich text editor with full formatting
- **Excerpt** — short summary for listings and SEO
- **Featured Image**
- **Status**: Draft, Scheduled, Published, or Archived
- **Categories** — assign to one or more blog categories
- **Tags** — free-form tags
- **Featured flag** — mark a post as featured to highlight it
- **SEO fields** — meta title and description
- **Reading time** — calculated automatically
- **Available locales** — choose which languages this post appears in

**Scheduling a post:**

1. Set the status to **Scheduled**.
2. Pick a publish date and time.
3. Save.

The system will automatically publish the post at the scheduled time.

**Version history:**

Every save creates a version. Click **Version History** on the edit page to see all past versions, compare changes field by field, and restore any previous version.

### Blog Categories

Navigate to **Blog > Categories** to create and organise categories. Categories can be **hierarchical** (a category can have a parent category).

---

## 6. Shop — E-commerce

### 6.1 Products

Navigate to **Shop > Products**.

**Key fields:**

| Field | Description |
|---|---|
| Name | Product name (translatable) |
| Description | Full description (translatable) |
| Short Description | Brief summary shown in listings (translatable) |
| SKU | Stock keeping unit code |
| Active | Whether the product is visible on the site |
| Saleable | Whether the product can be purchased |
| Brand | Linked brand |
| Product Type | Determines which attributes are available |
| Categories | Which categories the product appears in |
| Images | Upload photos; mark one as the thumbnail |
| SEO | Meta title, description, and slug |

**Variants:**

Products can have multiple variants (e.g. Size S / Blue, Size M / Red). Each variant has its own price, SKU, and stock quantity. Variants are defined by the attributes from the product's Product Type.

**Flags:**

Assign coloured labels (e.g. "New", "Sale", "Bestseller") from the Product Flags list.

**Promotions:**

Link active promotions directly to a product to apply automatic discounts.

**Version history:**

Every save creates a version. See [Section 12](#12-version-history) for details.

**Search:**

Products are indexed for fast search powered by Laravel Scout. The search bar in the product list searches across names, descriptions, and SKUs.

---

### 6.2 Categories

Navigate to **Shop > Categories**.

Categories can be nested (a category can have a parent). Each category supports:

- Translatable name and description
- Linked Product Type (affects which attributes products in this category use)
- Linked Tax Rate (default tax for products in this category)
- Version history

---

### 6.3 Brands

Navigate to **Shop > Brands** to manage product brands. You can select multiple brands and delete them in bulk.

---

### 6.4 Product Types & Attributes

**Product Types** define which attributes a group of products shares. For example, a "Clothing" product type might have attributes: Colour, Size, Material.

Navigate to **Shop > Product Types** to create types and assign attributes to them.

**Attributes** define the individual properties. Navigate to **Shop > Attributes**.

**Attribute types:**

| Type | Description |
|---|---|
| Text | Free-form text |
| Select | Single choice from a list of values |
| Multiselect | Multiple choices |
| Numeric | A number |
| Color | A colour picker |

Each attribute has **Attribute Values** — the specific options (e.g. "Red", "Blue", "Green" for a Colour attribute).

---

### 6.5 Product Flags

Flags are coloured tags you can attach to products. Navigate to **Shop > Product Flags**.

- Each flag has a name, a colour, and a position (controls display order).
- Assign flags to products on the product edit page.
- Useful for highlighting "New", "Sale", "Bestseller", "Eco", etc.

---

### 6.6 Orders

Navigate to **Shop > Orders** to see all customer orders.

**Order status workflow:**

```
Pending → Awaiting Payment → Paid → Processing → Shipped → Delivered
                                                         ↘ Cancelled
                                                         ↘ Refunded
```

**Order details page shows:**

- Customer information and addresses
- Ordered items with prices
- Payment status and method
- Shipment tracking
- Status history (every change is logged with a timestamp)

**Exporting orders:**

Use the **Export** button on the order list to download a CSV of filtered orders.

---

### 6.7 Customers

Navigate to **Shop > Customers** to view registered customers.

- View and edit customer profile and addresses
- See order history
- Export customer list to CSV

---

### 6.8 Discounts

Navigate to **Shop > Discounts**.

Discounts are code-based reductions customers apply at checkout.

**Key settings:**

| Setting | Description |
|---|---|
| Code | The discount code customers enter |
| Type | Percentage or fixed amount |
| Value | How much discount |
| Minimum order value | Minimum cart total to qualify |
| Usage limit | Maximum number of uses |
| Valid from / until | Active date range |
| Stackable | Whether this discount can combine with others |
| Product targeting | Restrict to specific products or categories |

**Conditions** can be added to a discount (e.g. only valid for orders above a certain amount, or for first-time customers).

---

### 6.9 Promotions

Navigate to **Shop > Promotions**.

Promotions are automatic price reductions applied to specific products or categories — no code needed.

- Set a discount value and type (percentage or fixed)
- Assign to specific products or categories
- Toggle active/inactive

---

### 6.10 Tax Rates

Navigate to **Shop > Tax Rates** to define tax rates (e.g. VAT 23%, VAT 8%).

Tax rates are linked to:
- Product categories (default tax for that category)
- Product variants (override per variant)

---

### 6.11 Shipping Methods

Navigate to **Shop > Shipping Methods**.

**Supported carriers:**

| Carrier | Description |
|---|---|
| InPost | Parcel locker delivery |
| DPD | Courier delivery |
| DHL | Courier delivery |
| Pickup | In-store pickup |

Each shipping method has:
- Name and description
- Carrier
- Price
- Pickup option (for click-and-collect)
- Active toggle

---

### 6.12 Returns

Navigate to **Shop > Returns** to manage return requests submitted by customers.

**Return status workflow:**

```
Pending → Approved → Return Label Sent → Awaiting Return → Received → Inspected → Refunded → Closed
          Rejected (at any active stage)
```

**Actions available:**

- **Approve** — accept the return request
- **Reject** — decline the return
- **Process Refund** — mark the refund as processed (after inspection)

---

### 6.13 Carts & Wishlists

Navigate to **Shop > Carts** and **Shop > Wishlists** for read-only views of:

- **Carts** — active shopping carts (both guest carts using a token and logged-in customer carts)
- **Wishlists** — products customers have saved for later

These views are for monitoring and customer support purposes.

---

## 7. Newsletter

Navigate to **Newsletter** in the sidebar.

### Subscribers

The subscriber list shows everyone who has opted in to your newsletter.

**Bulk actions:**
- Activate selected subscribers
- Deactivate selected subscribers
- Delete selected subscribers

---

### Segments

Segments let you group subscribers for targeted campaigns.

**Audience types:**

| Type | Description |
|---|---|
| All | All active subscribers |
| Segment | A manually defined group |
| Tags | Subscribers with specific tags |

Bulk actions: activate or deactivate multiple segments at once.

---

### Campaigns

Campaigns are newsletter emails you send to subscribers.

**Campaign types:**

| Type | Description |
|---|---|
| Broadcast | One-time send to all or a segment |
| Automated | Triggered automatically by an event |
| Scheduled | Sent at a specific date and time |

**Campaign actions:**

- **Send** — send the campaign immediately
- **Schedule** — set a date and time for automatic sending
- **Duplicate** — copy a campaign to reuse its content

---

## 8. Finance

### Currencies

Navigate to **Finance > Currencies** to manage the currencies your shop accepts.

### Exchange Rates

Navigate to **Finance > Exchange Rates** to set conversion rates between currencies. This is used to display prices in the customer's preferred currency.

---

## 9. Users & Roles

Navigate to **Users** to manage admin panel accounts.

**Roles:**

| Role | Access Level |
|---|---|
| Admin | Full access to all features |
| Editor | Access to content (CMS, Blog, Products) but not system settings or user management |

**Managing users:**

1. Click **New User** to create an account.
2. Fill in name, email, and password.
3. Assign a role.
4. The user receives a welcome email and can log in immediately.

To edit a user, click their name. You can update their details or change their role. Deleting a user removes their admin access but does not delete their customer data.

---

## 10. Notifications

Navigate to **Notifications** to send in-app, email, or SMS notifications to platform users.

**Notification channels:**

| Channel | Description |
|---|---|
| Email | Sent to the user's email address |
| SMS | Sent to the user's phone number |
| Push | In-app push notification |

**Actions:**

- **Create** — compose a notification and choose recipients and channel
- **Send** — send immediately
- **Resend** — resend a previously sent notification
- **Bulk delete** — remove multiple notifications at once

---

## 11. Activity Log

Navigate to **Activity Log** to see a full audit trail of every action taken in the admin panel.

**What is logged:** every model creation, update, and deletion, including which user performed the action and when.

**Filters available:**

- By user
- By model type (e.g. Product, Order, Page)
- By action (created, updated, deleted)
- By date range

**Field-level diff:** click on any log entry to see the exact fields that changed, with before and after values shown side by side.

---

## 12. Version History

Products, Blog Posts, and Categories automatically save a version every time you save them.

**To view version history:**

1. Open the edit page for a Product, Blog Post, or Category.
2. Click the **Version History** button (usually in the top-right area of the form).
3. A panel shows all saved versions with timestamps and the user who made the change.

**To compare versions:**

Click any two versions to see a side-by-side diff of every field that changed.

**To restore a version:**

Click **Restore** next to any version. The record is restored to that state and a new version entry is created (the restore action itself is also versioned).

**Version limits:**

| Model | Maximum Versions Kept |
|---|---|
| Product | 50 |
| Blog Post | 30 |
| Category | 30 |

Older versions are automatically removed when the limit is reached.

---

## 13. Cookie Consents

Navigate to **Cookie Consents** for a read-only log of cookie consent records submitted by website visitors. This is useful for GDPR compliance audits.

---

## 14. Languages & Translations

### Locales

Navigate to **Locales** to manage the languages your platform supports.

- **Add a locale** — enable a new language (e.g. `pl` for Polish, `de` for German)
- **Set default** — the default language used when no locale is specified
- **Remove** — disable a language

### Translations

Navigate to **Translations** to edit UI string translations for your public website (labels, buttons, messages, etc.).

- Filter by locale, group, or key
- Edit translations inline by clicking a cell
- Changes are applied to the public website immediately (cached for 1 hour)

**Translatable content fields** (name, description, title, etc.) are edited directly within each model's edit form using the language selector.

---

## 15. Affiliates

Navigate to **Affiliates** in the sidebar.

### Codes

Affiliate codes are unique referral codes you give to partners or influencers. Navigate to **Affiliates > Codes**.

- Create a new code with a custom code string
- Toggle active/inactive
- The dashboard shows how many times each code has been used (`uses_count`)

### Referrals

Navigate to **Affiliates > Referrals** to see orders placed using an affiliate code.

**Referral commission workflow:**

```
Pending → Approved → Paid
          Cancelled (at any stage)
```

**Actions:**

- **Approve** — confirm the referral is valid
- **Mark as Paid** — confirm the affiliate commission has been paid out
- **Cancel** — invalidate a referral
- **Bulk mark paid** — mark multiple referrals as paid at once

---

## 16. Settings

Navigate to **Settings** for system configuration.

### General Settings

Site name, default language, timezone, and other global options.

### Mail Settings

Configure how the platform sends emails:

| Setting | Description |
|---|---|
| Mail Driver | `smtp`, `sendmail`, `mailgun`, `ses`, etc. |
| SMTP Host | Your mail server address |
| SMTP Port | Usually 587 (TLS) or 465 (SSL) |
| SMTP Username | Your mail account username |
| SMTP Password | Your mail account password (stored encrypted) |
| From Address | The "from" email address |
| From Name | The "from" display name |

> Changes to mail settings take effect within 1 hour (they are cached). To apply immediately, ask a developer to clear the application cache.

### Feature Flags

Enable or disable major platform features:

| Feature | Description |
|---|---|
| Blog | Enables the blog module and its public API endpoints |
| E-commerce | Enables the shop, products, orders, and checkout |
| Reviews | Enables customer product reviews |
| Newsletter | Enables newsletter subscription and campaigns |

Disabling a feature hides it from the public website but does not delete its data.

---

## 17. Your Profile & Security

Click your name or avatar in the top-right corner to access your profile.

**Profile page options:**

- **Update name and email** — change your display name or email address
- **Change password** — update your admin panel password
- **Two-factor authentication** — enable or disable 2FA for your account

### Setting Up 2FA Step by Step

1. Go to Profile > Two-Factor Authentication.
2. Click **Enable**.
3. Scan the QR code with an authenticator app.
4. Enter the 6-digit code to confirm it is working.
5. Save your **recovery codes** — you will need them if you lose your phone.

To disable 2FA, click **Disable** and confirm with your password.

---

## 18. Common Workflows

### Creating and Publishing a Page

1. Go to **CMS > Pages** and click **New Page**.
2. Choose a page type (**Blocks** for visual editing, **Module** for data-driven pages).
3. Enter the title and slug (URL path).
4. Fill in SEO fields (meta title, meta description).
5. Click **Save as Draft** — the page is not yet live.
6. Click **Edit in Builder** (for Blocks pages) to add sections and blocks.
7. When satisfied, click **Publish** to make it live.
8. Use **Preview** at any time to check how it looks.

---

### Adding a New Product

1. Go to **Shop > Products** and click **New Product**.
2. Fill in the name, description, and short description (in all required languages).
3. Set the **Product Type** — this determines which attribute fields appear.
4. Upload product images and mark the thumbnail.
5. Add at least one **Variant** with a price and SKU.
6. Set the product to **Active** and **Saleable**.
7. Assign **Categories** and optionally a **Brand**.
8. Fill in **SEO fields**.
9. Click **Save**.

The product is now live if it is set to active. It will appear in search results within a few moments (search indexing is near-real-time).

---

### Scheduling a Blog Post

1. Go to **Blog > Posts** and click **New Post**.
2. Write your content and fill in all fields.
3. Set the **Status** to **Scheduled**.
4. Pick the **Publish Date**.
5. Click **Save**.

The system will automatically publish the post at the scheduled time. You do not need to do anything else.

---

### Sending a Newsletter Campaign

1. Ensure you have subscribers. Go to **Newsletter > Subscribers** to confirm.
2. Optionally create a **Segment** (e.g. "VIP customers") under **Newsletter > Segments**.
3. Go to **Newsletter > Campaigns** and click **New Campaign**.
4. Choose the type (usually **Broadcast** for a one-time send).
5. Write the subject and body.
6. Select the audience (all subscribers or a specific segment).
7. Click **Send** to send immediately, or **Schedule** to set a date and time.

---

### Processing a Return

1. Go to **Shop > Returns**.
2. Click on the return request.
3. Review the items and the customer's reason.
4. Click **Approve** to accept it, or **Reject** to decline.
5. If approved, send the return label (outside the platform) and update the status when the item arrives.
6. After inspection, click **Process Refund** to mark the refund complete.

---

### Creating an Affiliate Programme

1. Go to **Affiliates > Codes** and click **New Code**.
2. Enter a code (e.g. `INFLUENCER2025`).
3. Share the code with your affiliate partner.
4. Partners give the code to their audience who use it at checkout.
5. Each order with the code appears in **Affiliates > Referrals**.
6. Approve referrals and mark them paid when you have paid the commission.

---

### Configuring a New Language

1. Go to **Locales** and click **Add Locale**.
2. Enter the locale code (e.g. `de` for German).
3. Go to **Translations** and add translated strings for your UI labels.
4. Edit your Pages, Products, Categories, and Blog Posts — use the language selector to enter content in the new language.
5. The public website will serve the new language at `/{locale}/` paths (e.g. `/de/products`).

---

### Configuring Abandoned Cart Recovery

The system automatically emails customers who leave items in their cart without completing checkout.

1. Go to **Settings** and find the `cart` group.
2. Set `abandoned_cart_hours` — the number of hours after which a cart is considered abandoned (default: 24).
3. Optionally set `abandoned_cart_discount_code` — a discount code to include in the email to incentivise return.
4. The job runs every hour automatically via the scheduler.

---

### Setting Up Low-Stock Alerts

Get notified by email when product variants fall below their stock threshold.

1. Go to **Settings** and find the `inventory` group.
2. Set `low_stock_alert_email` to your admin email address.
3. Set the `stock_threshold` field on each product variant (in the product edit page, variant tab).
4. The system sends a daily summary email listing all variants at or below their threshold.

---

### Blog RSS Feed

The blog automatically provides an RSS feed at `GET /feed`. Share this URL with customers and RSS readers. You can filter by locale using `?locale=en` query parameter. The feed is cached for 1 hour.

