import { Post, MerchItem, AppItem, SiteInfo } from '../types/index.ts';

interface SampleData {
  posts: Post[];
  merch: MerchItem[];
  apps: AppItem[];
  site_info: SiteInfo;
}

export const sampleData: SampleData = {
  "posts": [
    {
      "id": "sample-post-1",
      "created_at": "2024-01-01T12:00:00Z",
      // FIX: Added missing title property.
      "title": "SYSTEM ONLINE",
      "header_media_url": "https://placehold.co/600x600/E10600/FFFFFF?text=FBA:01",
      "header_media_type": "image",
      "body_richtext": [
        { "type": "heading", "level": 2, "content": "SYSTEM ONLINE" },
        { "type": "paragraph", "content": "Welcome to THE.SCRL. This is the primary feed. Connect to Supabase and log in to begin posting your own content." }
      ],
      "external_links": [
        { "label": "View on X", "url": "https://x.com" }
      ],
      "hidden": false,
      "order_index": 1
    },
    {
      "id": "sample-post-2",
      "created_at": "2024-01-02T12:00:00Z",
      // FIX: Added missing title property.
      "title": "TILE INFORMATION",
      "header_media_url": "https://placehold.co/600x600/000000/FFFFFF?text=FBA:02",
      "header_media_type": "image",
      "body_richtext": [
        { "type": "paragraph", "content": "Each tile opens to reveal more information. This one has a list." },
        { "type": "list", "items": ["Item One", "Item Two", "Item Three"] }
      ],
      "external_links": [],
      "hidden": false,
      "order_index": 2
    }
  ],
  "merch": [
    {
      "id": "sample-merch-1",
      "created_at": "2024-01-01T12:00:00Z",
      "name": "FBA Standard Issue Tee",
      "image_url": "https://placehold.co/600x800/000000/E10600?text=FBA+TEE",
      "price_cents": 2999,
      "currency": "USD",
      "description": "High quality cotton tee. Black with red logo. The official uniform.",
      "external_url": "#",
      "hidden": false,
      "order_index": 1
    }
  ],
  "apps": [
    {
      "id": "sample-app-1",
      "created_at": "2024-01-01T12:00:00Z",
      "name": "Project Chimera",
      "icon_url": "https://placehold.co/128x128/E10600/000000?text=PC",
      "short_desc": "A sample application entry.",
      "body_richtext": [
        { "type": "paragraph", "content": "This is a description of Project Chimera. It does many amazing things." }
      ],
      "links": [
        { "label": "Learn More", "url": "#" }
      ],
      "hidden": false,
      "order_index": 1
    }
  ],
  "site_info": {
    "id": true,
    "body_richtext": [
      { "type": "heading", "level": 1, "content": "THE.INFO" },
      { "type": "paragraph", "content": "This is the main information hub. In disconnected mode, this content is loaded from a local file. Once you connect to Supabase and log in, you can manage this content from the database." },
      { "type": "heading", "level": 2, "content": "Link Hub" },
      { "type": "list", "items": ["Link A", "Link B", "Link C"] }
    ]
  }
};