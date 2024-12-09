//File: ChatWoot/src/msn/message-type.ts

export interface TextPayload {
    type: 'text';
    content: string;
}

export interface ChoicePayload {
    type: 'choice';
    text: string;
    options: ChoiceOption[];
}

export interface ChoiceOption {
    label: string;
    value: string;
}

export interface DropdownPayload {
    type: 'dropdown';
    text: string;
    options: DropdownOption[];
}

export interface DropdownOption {
    label: string;
    value: string;
}

// Separate payload definitions for each media type
export interface ImagePayload {
    type: 'image';
    url: string;
    caption?: string;
}

export interface VideoPayload {
    type: 'video';
    url: string;
    caption?: string;
}

export interface AudioPayload {
    type: 'audio';
    url: string;
    caption?: string;
}

export interface FilePayload {
    type: 'file';
    url: string;
    caption?: string;
    title?: string;
}

// Carousel and Cards Payload Adjustments
export interface CarouselPayload {
    type: 'carousel';
    items: CarouselItem[];  // List of carousel items
}

export interface CarouselItem {
    headerImageUrl?: string;  // Optional image for the card header
    body: string;             // Card description
    buttons: Action[];        // Up to 2 buttons per card
}

export interface CardsPayload {
    type: 'cards';  // Updated to 'cards' for plural
    headerImageUrl?: string;  // Optional image for the card header
    title: string;            // Main title of the card
    subtitle?: string;        // Subtitle (optional)
    buttons: Action[];        // Up to 2 action buttons (URL or postback)
}

export interface LocationPayload {
    type: 'location';
    title: string;
    latitude: number;
    longitude: number;
    address: string;
}

export interface MarkdownPayload {
    type: 'markdown';
    text: string;
}

export interface BlocPayload {
    type: 'bloc';
    text: string;
    attachments?: any[];
}

export interface Action {
    label: string;
    type: 'link' | 'button';
    url?: string; // For links
    value?: string; // For actions like buttons
}

// Unified Message Type covering all possible payloads
export type Message =
    | TextPayload
    | ChoicePayload
    | DropdownPayload
    | ImagePayload
    | VideoPayload
    | AudioPayload
    | FilePayload
    | CarouselPayload
    | CardsPayload  // Updated from 'CardPayload' to 'CardsPayload'
    | LocationPayload
    | MarkdownPayload
    | BlocPayload;
