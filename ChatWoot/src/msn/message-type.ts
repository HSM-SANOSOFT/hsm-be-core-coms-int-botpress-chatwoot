// File: ChatWoot/src/msn/message-type.ts

export interface TextPayload {
    type: 'text';
    content: string;
}

export interface MediaPayload {
    type: 'media';
    mediaType: 'image' | 'video' | 'audio' | 'file'; // Differentiates the type of media
    url: string;
    caption?: string;
}

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
    type: 'block';
    text: string;
    attachments?: any[];
}

export interface Action {
    label: string;
    type: 'link' | 'button';
    url?: string; // For links
    value?: string; // For actions like buttons
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

// The unified message type that covers all possible message payloads.
export type Message =
    | TextPayload
    | MediaPayload
    | CarouselPayload
    | CardPayload
    | ChoicePayload
    | DropdownPayload
    | LocationPayload
    | MarkdownPayload
    | BlockPayload
    | InteractiveButtonPayload;
