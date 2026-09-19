export type SiteConfig = {
	name: string;
	nameLine1: string;
	nameLine2: string;
	title: string;
	location: string;
	email: string;
	phone: string;
	linkedin: string;
	github: string;
	instagram: string;
	whatsapp: string;
	brand: string;
	url: string;
	portrait: string;
	resume: string;
	availability?: string;
	projectsLabel?: string;
	projectsHeading?: string;
	projectsIntro?: string;
	contactLabel?: string;
	contactHeading?: string;
	skillsLabel?: string;
	skillsHeading?: string;
	skillsIntro?: string;
	certificationsLabel?: string;
	certificationsHeading?: string;
	certificationsIntro?: string;
	footerDescription?: string;
	copyrightText?: string;
};

export const SITE: SiteConfig = {
	name: 'JAYSHIL THAKKAR',
	nameLine1: 'JAYSHIL',
	nameLine2: 'THAKKAR',
	title: 'Software Engineer & AI Enthusiast',
	location: 'Ahmedabad, Gujarat, India',
	email: 'jayshilthakkar007@gmail.com',
	phone: '+91 9173389217',
	linkedin: 'https://www.linkedin.com/in/jayshil-thakkar',
	github: 'https://github.com/Jesh766',
	instagram: 'https://www.instagram.com/jesh.766/',
	whatsapp: 'https://wa.me/919173389217',
	brand: 'Building intelligent web applications, AI-powered tools, and modern digital experiences.',
	url: 'http://localhost:5173',
	portrait: '/images/jayshil-portrait.png',
	resume: '/resume.pdf',
	availability: 'Available for opportunities',
	projectsLabel: 'Projects',
	projectsHeading: 'Featured work',
	projectsIntro: 'Real projects with real code. Every card links to GitHub.',
	contactLabel: 'Contact',
	contactHeading: "Let's build something remarkable",
	skillsLabel: 'Technical Skills',
	skillsHeading: 'Skill universe',
	skillsIntro: 'Full-stack development, AI tooling, and everything in between.',
	certificationsLabel: 'Certifications',
	certificationsHeading: 'Credentials',
	certificationsIntro: '',
	footerDescription: 'Software Engineer & AI Enthusiast',
	copyrightText: '© {year} · {title}'
};

export const SOCIAL_LINKS = [
	{ label: 'LinkedIn', href: SITE.linkedin, icon: 'linkedin' as const },
	{ label: 'GitHub', href: SITE.github, icon: 'github' as const },
	{ label: 'Instagram', href: SITE.instagram, icon: 'instagram' as const },
	{ label: 'WhatsApp', href: SITE.whatsapp, icon: 'whatsapp' as const }
] as const;

export const HERO_ROLES = [
	'Software Engineer',
	'AI Enthusiast',
	'Full Stack Developer',
	'Problem Solver'
] as const;

export type HeroStat = {
	value: number;
	suffix: string;
	label: string;
	display?: string;
};

export type NavigationItem = { id: string; label: string; visible: boolean; order: number };
export type SocialLink = { id: string; label: string; href: string; icon: string; visible: boolean; order: number };
export type SEOContent = { title: string; description: string; keywords: string; ogTitle: string; ogDescription: string; ogImage: string };
export type SectionSetting = { id: string; label: string; visible: boolean; order: number };
export type AboutContent = { eyebrow: string; title: string; description: string; introEyebrow: string; introTitle: string; introTitleAccent: string; introDescription: string; focusEyebrow: string; focuses: Array<{ icon: string; label: string }>; metrics: HeroStat[] };
export type ContactContent = { email: string; phone: string; location: string; formTitle: string; formDescription: string; nameLabel: string; emailLabel: string; messageLabel: string; submitLabel: string; successMessage: string; errorMessage: string };
export type PortfolioContent = {
	site: SiteConfig;
	navigation: NavigationItem[];
	socials: SocialLink[];
	heroRoles: string[];
	heroStats: HeroStat[];
	about: AboutContent;
	contact: ContactContent;
	seo: SEOContent;
	sections: SectionSetting[];
	footer: { name: string; description: string; copyright: string };
	projects: Project[];
	skills: SkillCategory[];
	certifications: Certification[];
};

export const HERO_STATS: HeroStat[] = [
	{ value: 4, suffix: '+', label: 'AI Certifications' },
	{ value: 1, suffix: '', label: 'Hackathon Competed' },
	{ value: 6, suffix: '+', label: 'Languages & Frameworks' },
	{ value: 2, suffix: '+', label: 'Years of Learning' }
];

export const DEFAULT_NAVIGATION: NavigationItem[] = [
	{ id: 'about', label: 'About', visible: true, order: 0 },
	{ id: 'skills', label: 'Skills', visible: true, order: 1 },
	{ id: 'projects', label: 'Projects', visible: true, order: 2 },
	{ id: 'certifications', label: 'Certifications', visible: true, order: 3 }
];
export const DEFAULT_SOCIALS: SocialLink[] = [
	{ id: 'linkedin', label: 'LinkedIn', href: SITE.linkedin, icon: 'linkedin', visible: true, order: 0 },
	{ id: 'github', label: 'GitHub', href: SITE.github, icon: 'github', visible: true, order: 1 },
	{ id: 'instagram', label: 'Instagram', href: SITE.instagram, icon: 'instagram', visible: true, order: 2 },
	{ id: 'whatsapp', label: 'WhatsApp', href: SITE.whatsapp, icon: 'whatsapp', visible: true, order: 3 }
];
export const DEFAULT_HERO_ROLES = [...HERO_ROLES];
export const DEFAULT_ABOUT: AboutContent = {
	eyebrow: 'About',
	title: 'Story & trajectory',
	description: 'From university foundations to creative technology—crafting experiences where design, AI, and engineering meet with intention.',
	introEyebrow: 'Software Engineer & AI Enthusiast',
	introTitle: 'Building Intelligent',
	introTitleAccent: 'Digital Experiences',
	introDescription: 'I transform ideas into impactful digital products by combining modern full-stack development, AI-powered tools, and thoughtful product design — bridging the gap between creativity and code.',
	focusEyebrow: 'Current Focus',
	focuses: [
		{ icon: '⚡', label: 'AI Engineering' },
		{ icon: '🎨', label: 'Creative Development' },
		{ icon: '✦', label: 'Frontend Experiences' },
		{ icon: '🧭', label: 'Product Thinking' },
		{ icon: '🤝', label: 'Human + AI Collaboration' }
	],
	metrics: [
		{ value: 1, suffix: '', label: 'Hackathon Competed' },
		{ value: 4, suffix: '+', label: 'AI Certifications' },
		{ value: 5, suffix: '+', label: 'Projects Built' },
		{ value: 2, suffix: '+', label: 'Years Learning' }
	]
};
export const DEFAULT_SECTIONS: SectionSetting[] = [
	{ id: 'hero', label: 'Hero', visible: true, order: 0 },
	{ id: 'about', label: 'About', visible: true, order: 1 },
	{ id: 'skills', label: 'Skills', visible: true, order: 2 },
	{ id: 'projects', label: 'Projects', visible: true, order: 3 },
	{ id: 'certifications', label: 'Certifications', visible: true, order: 4 },
	{ id: 'contact', label: 'Contact', visible: true, order: 5 }
];
export const DEFAULT_SEO: SEOContent = {
	title: `${SITE.name} · ${SITE.title}`,
	description: 'Jayshil Thakkar — Software Engineer & AI Enthusiast from Ahmedabad, India. Building intelligent web applications, AI-powered tools, and modern digital experiences.',
	keywords: 'Jayshil Thakkar, Software Engineer Portfolio, AI Developer, Full Stack Developer, Ahmedabad Developer, Web Developer India',
	ogTitle: `${SITE.name} · ${SITE.title}`,
	ogDescription: 'Building intelligent web applications, AI-powered tools, and modern digital experiences.',
	ogImage: '/og-image.svg'
};

export const HERO_FLOATING_CARDS = [
	{ title: 'AI Certifications', position: 'top-left' as const, delay: 0, floatDuration: 4.2 },
	{ title: 'FarmSathi Project', position: 'top-right' as const, delay: 0.15, floatDuration: 5.1 },
	{
		title: 'Hackathon Participant',
		position: 'bottom-left' as const,
		delay: 0.3,
		floatDuration: 6.3
	},
	{ title: 'Team Leader', position: 'bottom-right' as const, delay: 0.45, floatDuration: 7 }
] as const;

export const ABOUT_INFO = [
	{ label: 'Education', value: 'GLS University — BSc IT' },
	{ label: 'Location', value: SITE.location },
	{ label: 'Focus', value: 'AI + Full Stack' },
	{ label: 'Availability', value: 'Open to Internships' }
] as const;

export const ABOUT_SKILLS = [
	'React',
	'Svelte',
	'JavaScript',
	'TypeScript',
	'Node.js',
	'Python',
	'AI/ML',
	'Git',
	'GitHub',
	'Vercel',
	'Supabase'
] as const;

export const ABOUT_VALUES = [
	'Innovation',
	'Leadership',
	'Continuous Learning',
	'Collaboration',
	'Problem Solving'
] as const;

export const ABOUT_TECH = ['HTML', 'CSS', 'JS', 'React', 'Node', 'AI'] as const;

export const NAV = [
	{ id: 'about', label: 'About' },
	{ id: 'skills', label: 'Skills' },
	{ id: 'projects', label: 'Projects' },
	{ id: 'certifications', label: 'Certifications' }
] as const;

export const NAV_CONTACT = { id: 'contact', label: 'Contact' } as const;

export type SkillCategory = {
	category: string;
	icon: string;
	color: string;
	items: string[];
};

export type Certification = {
	title: string;
	issuer: string;
	issuerKey: string;
	url: string;
	year: string;
	note?: string;
};

export type Project = {
	id: string;
	title: string;
	tagline: string;
	tags: string[];
	status: string;
	year: string;
	github: string;
	demo: string;
	metrics: Array<{ value: string; label: string }>;
	featured: boolean;
};

export const SKILLS_CATEGORIZED: SkillCategory[] = [
	{
		category: 'Frontend',
		icon: '◈',
		color: 'var(--accent-gold)',
		items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Svelte']
	},
	{
		category: 'Backend',
		icon: '◉',
		color: 'var(--accent-purple)',
		items: ['Node.js', 'Express', 'Python', 'REST APIs']
	},
	{
		category: 'Database',
		icon: '◎',
		color: 'var(--accent-teal)',
		items: ['PostgreSQL', 'Supabase', 'MongoDB']
	},
	{
		category: 'AI & ML',
		icon: '◆',
		color: 'var(--accent-gold)',
		items: ['LLMs', 'Prompt Engineering', 'AI Ethics', 'Generative AI']
	},
	{
		category: 'Tools',
		icon: '▸',
		color: 'var(--accent-purple)',
		items: ['Git', 'GitHub', 'Vercel', 'VS Code', 'Figma']
	}
] as const;

export const SKILLS = [
	'Artificial Intelligence',
	'Large Language Models',
	'Prompt Engineering',
	'AI Ethics',
	'Human + AI Collaboration',
	'JavaScript',
	'TypeScript',
	'HTML',
	'CSS',
	'React',
	'Svelte',
	'Node.js',
	'Web Development',
	'Product Thinking',
	'Problem Solving'
] as const;

export const CERTIFICATIONS: Certification[] = [
	{
		title: 'AI Fluency Framework & Foundations',
		issuer: 'Anthropic',
		issuerKey: 'anthropic',
		url: 'https://verify.skilljar.com/c/yocgvc36qdpg',
		year: '2026',
		note: 'Generative AI · Prompt Engineering · +3 skills'
	},
	{
		title: 'AI Tools Workshop',
		issuer: 'Be10x',
		issuerKey: 'be10x',
		url: 'https://certx.in/certificate/0270772f-3809-4400-b29b-1e1c61cd09971285007',
		year: '2026',
		note: 'Artificial Intelligence (AI) · Generative AI · +6 skills'
	},
	{
		title: 'Deloitte Data Analytics Job Simulation',
		issuer: 'Deloitte',
		issuerKey: 'deloitte',
		url: 'https://www.theforage.com/completion-certificates/9PBTqmSxAf6zZTseP/io9DzWKe3PTsiS6GG_9PBTqmSxAf6zZTseP_69efa7cb46cdaaf6083732a1_1777351911651_completion_certificate.pdf',
		year: '2026',
		note: 'Data Analysis · Microsoft Excel · +3 skills'
	},
	{
		title: 'Gemini Certification for Students (K12)',
		issuer: 'Google',
		issuerKey: 'google',
		url: 'https://edu.exceedlms.com/student/award/NxZ5F5nk3FfXtMMRrV3mSjNB',
		year: '2026',
		note: 'Generative AI · Artificial Intelligence (AI) · +3 skills'
	}
] as const;

export const PROJECTS: Project[] = [
	{
		id: 'farmsathi',
		title: 'FarmSathi',
		tagline:
			'A platform enabling farmers to share equipment and labour through a token-based ecosystem.',
		tags: ['AgriTech', 'AI', 'Full Stack', 'UX'],
		status: 'Hackathon Project',
		year: '2024',
		github: 'https://github.com/Jesh766',
		demo: '',
		metrics: [
			{ value: '6', label: 'Case chapters' },
			{ value: '1', label: 'Flagship product' },
			{ value: '∞', label: 'Farmer potential' }
		],
		featured: true
	}
];

export const BEYOND_CODING = [
	{ label: 'Reading', icon: '📚' },
	{ label: 'Hiking', icon: '🥾' },
	{ label: 'Photography', icon: '📷' },
	{ label: 'Music', icon: '🎧' }
] as const;

export const FARMSATHI = {
	title: 'FarmSathi',
	tagline:
		'A platform enabling farmers to share equipment and labour through a token-based ecosystem.',
	sections: [
		{
			label: 'Problem',
			body: 'Smallholder farmers often lack access to expensive machinery and seasonal labour at the right time. Idle equipment on one farm sits unused while neighbours struggle during peak harvest windows.'
		},
		{
			label: 'Research',
			body: 'We interviewed farmers, cooperative leaders, and agri-tech mentors to map sharing behaviours, trust barriers, and payment preferences. Insights shaped a token model that rewards contribution and fair exchange.'
		},
		{
			label: 'Solution',
			body: 'FarmSathi connects farmers through a verified network where equipment and labour are booked using tokens—creating transparency, reducing cash friction, and building community trust.'
		},
		{
			label: 'Product Design',
			body: 'A calm, mobile-first interface with clear availability maps, booking flows, and reputation signals. Visual language draws from earth tones and clarity—never overwhelming users who work long days in the field.'
		},
		{
			label: 'Impact',
			body: 'Pilot communities reported higher equipment utilization, faster harvest coordination, and stronger peer networks—demonstrating how thoughtful product design can unlock rural collaboration.'
		},
		{
			label: 'Future Vision',
			body: 'Integrate AI-assisted scheduling, weather-aware recommendations, and regional partnerships to scale FarmSathi into a trusted platform for sustainable agricultural economies.'
		}
	]
} as const;

/** Lowercase aliases for section components */
export const site = SITE;
export const navLinks = NAV.map((n) => ({ href: `#${n.id}`, label: n.label }));
export const skills = SKILLS;
export const certifications = CERTIFICATIONS;
export const farmsathiCaseStudy = {
	title: FARMSATHI.title,
	tagline: FARMSATHI.tagline,
	sections: FARMSATHI.sections.map((s) => ({
		id: s.label.toLowerCase().replace(/\s+/g, '-'),
		title: s.label,
		body: s.body
	}))
};
