# RTE Enterprise Contract

Canonical storage:

- `content_json` stores serialized Lexical editor state for admin editing and future diffs.
- Rendered HTML remains the public output and is sanitized by `HtmlSanitizerService`.
- Existing HTML-only records remain valid; the editor still imports HTML when JSON is missing.

Media node contracts:

- `ImageNode` exports JSON version 2 and public `<figure data-rte-image>` HTML with optional caption, credit, link, focal point and loading metadata.
- `ImageGalleryNode` exports JSON version 2 and public `<figure data-rte-gallery>` HTML with ordered assets, desktop/mobile columns, gap, aspect ratio and lightbox metadata.
- `AttachmentNode` exports public `<a data-rte-attachment>` links with media ID, public name, file name, MIME type, size and description.

Backend allowlist:

- RTE HTML allows safe structural tags for headings, lists, blockquotes, code, tables, figures, images, captions and attachment links.
- RTE-specific `data-*` attributes are explicitly registered in HTMLPurifier.
- Unsafe protocols, inline event handlers and scripts are stripped.

Linking and health:

- Internal links are resolved through `admin.rte.links.search` and return locale-aware URLs for pages, products, categories and blog posts.
- The local content health pass warns about missing image alt text, empty/unsafe link metadata, heading jumps, multiple H1s, long paragraphs, inline styles, generic attachment labels and tables without headers.
