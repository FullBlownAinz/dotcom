// FIX: Removed self-imports that caused declaration conflicts.
export interface RichTextBlock {
    type: 'heading' | 'paragraph' | 'list' | 'image' | 'video' | 'embed' | 'quill-delta';
    level?: 1 | 2 | 3;
    content?: string;
    items?: string[];
    src?: string;
    alt?: string;
    delta?: any; // For Quill's Delta object
}

export interface ExternalLink {
    label: string;
    url: string;
}

export interface Post {
    id: string;
    created_at: string;
    title: string;
    header_media_url: string;
    header_media_type: 'image' | 'gif' | 'video';
    body_richtext: RichTextBlock[];
    external_links: ExternalLink[];
    hidden: boolean;
    order_index: number;
    is_published?: boolean;
}

export interface MerchItem {
    id: string;
    created_at: string;
    name: string;
    image_url: string; // Primary image (legacy support)
    image_urls?: string[]; // New: Array of images
    price_cents: number;
    currency: string;
    description: string; // Stored as text, but may contain JSON string of RichTextBlock[]
    external_url: string;
    button_text?: string; // New: Custom button text
    hidden: boolean;
    order_index: number;
}

export interface AppItem {
    id: string;
    created_at: string;
    name: string;
    icon_url: string;
    short_desc: string;
    body_richtext: RichTextBlock[];
    links: ExternalLink[];
    hidden: boolean;
    order_index: number;
}

export interface SiteInfo {
    id: boolean;
    body_richtext: RichTextBlock[];
}

export interface SiteSettings {
    id: boolean;
    colors: {
        bg: string;
        fg: string;
        accent: string;
    };
    fonts: {
        display: string;
        base: string;
        ticker?: string; // Stored in JSONB
        tickerSpeed?: number; // New: Animation duration in seconds
    };
    promo?: {
        enabled: boolean;
        image_url: string;
        link_url: string;
    };
    overlay_animation?: {
        enabled: boolean;
        type: 'snow' | 'leaves' | 'confetti';
    };
    header_overlay_url: string | null;
    density: 'S' | 'M' | 'L';
}