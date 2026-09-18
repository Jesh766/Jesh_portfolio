/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace App {
	interface Locals {}
	interface PageData {}
	interface PageState {}
	interface Platform {}
}
