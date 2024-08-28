/* eslint-disable @typescript-eslint/no-inferrable-types */

// Import necessary Obsidian API components
import {
	App,
	MarkdownView,
	MarkdownFileInfo,
	Editor,
	Notice,
	FileSystemAdapter,
	Plugin,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	Platform,
	PluginManifest,
	TextComponent,
	normalizePath,
} from "obsidian";

import { DEFAULT_SETTINGS } from "default";
import { IconBarSettings } from "types";

import { monkeyPatchConsole, unpatchConsole } from "patchConsole";

// Helper function to check if a node is an Element
function isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE;
}

function isHTMLElement(node: Node): node is HTMLElement {
    return node instanceof HTMLElement ;
}

// Main plugin class
export default class IconBarManager extends Plugin {
	settings: IconBarSettings = { ...DEFAULT_SETTINGS };
    settingsTab: IconBarSettingTab;
    menu: Element | null = null;
	
	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		if (process.env.NODE_ENV === "development") {
            monkeyPatchConsole(this);
            console.log("Icon Bar Manager: development mode including extra logging and debug features");
        }


		this.settingsTab = new IconBarSettingTab(this.app, this);
	}

	// Load plugin settings
	async onload() {
		// Load and add settings tab
		await this.loadSettings();
		this.addSettingTab(this.settingsTab);
		
		// console.log('Loaded plugin Icon Bar Manager');

        this.app.workspace.onLayoutReady(() => {
            this.patchIconBar();
        });
	}

    patchIconBar() {

        // Function to flag elements based on their title text
        const flagMenuItemByText = (titleText:string, className:string) => {
            const elements = document.querySelectorAll('div.menu-item:has(> div.menu-item-title)');
            elements.forEach(element => {
                const titleElement = element.querySelector('div.menu-item-title');
                if (titleElement && titleElement.textContent && titleElement.textContent.trim() === titleText) {
                    element.classList.add(className);
                }
            });
        };

        // MutationObserver callback function
        const observerCallback1: MutationCallback = (mutationsList: MutationRecord[]) => {
            mutationsList.forEach(mutation => {
                // We're interested in 'childList' mutations
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if(isElement(node)) {
                            node.innerHTML;
                        }
                        // Check if the added node is an Element and has the class 'menu-item'
                        if (isElement(node) && node.classList.contains('menu-item')) {
                            console.log('New menu-item detected:', node);

                            // Optionally perform further operations, like adding a class
                            // node.classList.add('your-custom-class');
                        }
                    });
                }
            });
        };

        // MutationObserver callback function
        const observerCallback: MutationCallback = (mutationsList: MutationRecord[]) => {
            mutationsList.forEach((mutation: MutationRecord) => {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node: Node) => {
                        // Use the helper function to check if the node is an Element
                        if (isElement(node)) {
                            
                            // Check if the node has the 'menu-item' class
                            if (node.classList.contains('menu')) {
                                
                                const titleElements = node.querySelectorAll('div.menu-item');

                                titleElements.forEach((el:Element) => {
                                    if(isHTMLElement(el)) {
                                        const children = el.children;
                                        if(children.length>=2) {
                                            const text = children[1].textContent;
                                            if(text) {
                                                el.dataset.name = text;
                                            }
                                        }
                                    }
                                });
                                console.log(node.innerHTML);
                            }
                        }
                    });
                }
            });
        };

        this.menu = document.querySelector('.menu');
        if(this.menu)
        {
            console.log("MENU FOUND");
        }
            // Set up the MutationObserver to watch for new menu items
            const observer = new MutationObserver(observerCallback);

            // Start observing the entire document body for added nodes
            observer.observe(document.body, { childList: true, subtree: true });
        

        // Optionally flag existing elements already in the DOM on plugin load
        flagMenuItemByText('Open quick switcher', 'hide-quick-switcher');
        flagMenuItemByText('Open graph view', 'hide-graph-view');
    }

	onunload() {
	}

	async loadSettings() {
    	this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Plugin settings tab
class IconBarSettingTab extends PluginSettingTab {
	plugin: IconBarManager;

	private saveTimeout: number | null = null;

	constructor(app: App, plugin: IconBarManager) {
		super(app, plugin);
		this.plugin = plugin;
    }

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

	}

	hide(): void {   
    }
}
