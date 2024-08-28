// types.ts

import { DEFAULT_SETTINGS } from "default";

export interface IconBarSettings {
    compatibility: string;
    logs?: Record<string, string[]>; // To include logs on mobile apps
}

