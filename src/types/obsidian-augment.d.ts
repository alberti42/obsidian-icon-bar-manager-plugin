// obsidian-augment.d.ts

// Import Obsidian base module for extension
import 'obsidian';

// Augmenting the Obsidian module
declare module 'obsidian' {
    interface App {
        setting: Setting;
    }

    interface Setting {
        activeTab: SettingTab;
    }
}