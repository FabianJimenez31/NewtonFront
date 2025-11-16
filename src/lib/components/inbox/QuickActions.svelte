<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button, Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';
	import { Sparkles, FileText, Zap, Plus } from 'lucide-svelte';

	interface Snippet {
		id: string;
		name: string;
		content: string;
		category?: string;
	}

	interface Template {
		id: string;
		name: string;
		content: string;
	}

	interface Props {
		snippets?: Snippet[];
		templates?: Template[];
		aiAssistEnabled?: boolean;
		showAIAssist?: boolean;
		showSnippets?: boolean;
		showTemplates?: boolean;
		onAIAssist?: () => void;
		onSnippetSelect?: (snippet: Snippet) => void;
		onTemplateSelect?: (template: Template) => void;
		onCreateSnippet?: () => void;
		class?: string;
	}

	let {
		snippets = [],
		templates = [],
		aiAssistEnabled = true,
		showAIAssist = true,
		showSnippets = true,
		showTemplates = true,
		onAIAssist,
		onSnippetSelect,
		onTemplateSelect,
		onCreateSnippet,
		class: className
	}: Props = $props();

	// Group snippets by category
	const groupedSnippets = $derived(() => {
		const groups: Record<string, Snippet[]> = {};

		snippets.forEach((snippet) => {
			const category = snippet.category || 'General';
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(snippet);
		});

		return Object.entries(groups);
	});
</script>

<div class={cn('flex items-center gap-2 flex-wrap', className)}>
	<!-- AI Assist Button -->
	{#if showAIAssist && onAIAssist}
		<Button
			variant="outline"
			size="sm"
			onclick={onAIAssist}
			disabled={!aiAssistEnabled}
			class={cn(
				'gap-2',
				aiAssistEnabled && 'hover:bg-primary/10 hover:border-primary'
			)}
		>
			<Sparkles class="h-4 w-4" />
			AI Assist
			{#if !aiAssistEnabled}
				<Badge variant="secondary" class="ml-1 text-xs">Pro</Badge>
			{/if}
		</Button>
	{/if}

	<!-- Snippets Dropdown -->
	{#if showSnippets && snippets.length > 0}
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" class="gap-2">
					<Zap class="h-4 w-4" />
					Snippets
					<Badge variant="secondary" class="ml-1">
						{snippets.length}
					</Badge>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" class="w-72 max-h-96 overflow-y-auto">
				{#each groupedSnippets() as [category, categorySnippets]}
					<DropdownMenuLabel>{category}</DropdownMenuLabel>
					{#each categorySnippets as snippet}
						<DropdownMenuItem onclick={() => onSnippetSelect?.(snippet)}>
							<div class="flex flex-col gap-1 w-full">
								<span class="font-medium text-sm">{snippet.name}</span>
								<span class="text-xs text-muted-foreground line-clamp-2">
									{snippet.content}
								</span>
							</div>
						</DropdownMenuItem>
					{/each}
					<DropdownMenuSeparator />
				{/each}

				{#if onCreateSnippet}
					<DropdownMenuItem onclick={onCreateSnippet} class="text-primary">
						<Plus class="h-4 w-4 mr-2" />
						Crear nuevo snippet
					</DropdownMenuItem>
				{/if}
			</DropdownMenuContent>
		</DropdownMenu>
	{/if}

	<!-- Templates Dropdown -->
	{#if showTemplates && templates.length > 0}
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" class="gap-2">
					<FileText class="h-4 w-4" />
					Plantillas
					<Badge variant="secondary" class="ml-1">
						{templates.length}
					</Badge>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" class="w-72 max-h-96 overflow-y-auto">
				<DropdownMenuLabel>Plantillas de mensajes</DropdownMenuLabel>
				{#each templates as template}
					<DropdownMenuItem onclick={() => onTemplateSelect?.(template)}>
						<div class="flex flex-col gap-1 w-full">
							<span class="font-medium text-sm">{template.name}</span>
							<span class="text-xs text-muted-foreground line-clamp-2">
								{template.content}
							</span>
						</div>
					</DropdownMenuItem>
				{/each}
			</DropdownMenuContent>
		</DropdownMenu>
	{/if}

	<!-- Empty state hint -->
	{#if snippets.length === 0 && templates.length === 0 && !showAIAssist}
		<div class="text-xs text-muted-foreground">
			<span>Agrega snippets o plantillas para responder más rápido</span>
		</div>
	{/if}
</div>
