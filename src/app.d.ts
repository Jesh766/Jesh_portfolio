/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
	readonly VITE_EMAILJS_SERVICE_ID: string;
	readonly VITE_EMAILJS_TEMPLATE_ID: string;
	readonly VITE_EMAILJS_PUBLIC_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace App {
	interface Locals {}
	interface PageData {}
	interface PageState {}
	interface Platform {}
}
