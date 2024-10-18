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
}

// Additional message types from your original code
export interface CarouselPayload {
    type: 'carousel';
    content: string;
    items: CarouselItem[];
}

export interface CarouselItem {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    actions?: Action[];
}

export interface CardPayload {
    type: 'card';
    title: string;
    subtitle?: string;
    imageUrl?: string;
    actions?: Action[];
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

export interface BlockPayload {
    type: 'bloc';
    text: string;
    attachments?: any[];
}

export interface InteractiveButtonPayload {
    type: 'interactive_button';
    text: string;
    buttons: InteractiveButton[];
}

export interface InteractiveButton {
    label: string;
    payload: string;
    type: 'postback' | 'url';
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
    | CardPayload
    | LocationPayload
    | MarkdownPayload
    | BlockPayload
    | InteractiveButtonPayload;
