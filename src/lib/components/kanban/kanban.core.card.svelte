<!-- @core -->
<script lang="ts">
	/**
	 * Kanban Core Card - Newton CRM
	 * Business-critical component for displaying lead/conversation cards in kanban
	 */

	import type { LeadKanban } from '$lib/types/kanban';
	import { Badge } from '$lib/components/ui';
	import { MessageSquare, Clock, User } from 'lucide-svelte';

	interface Props {
		lead: LeadKanban;
		onclick?: () => void;
		draggable?: boolean;
		class?: string;
	}

	let { lead, onclick, draggable = false, class: className = '' }: Props = $props();

	/**
	 * Format timestamp to relative time (e.g., "Hace 5 min")
	 */
	function formatRelativeTime(timestamp?: string): string {
		if (!timestamp) return '';

		const now = new Date();
		const date = new Date(timestamp);
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Ahora';
		if (diffMins < 60) return `Hace ${diffMins} min`;
		if (diffHours < 24) return `Hace ${diffHours}h`;
		if (diffDays === 1) return 'Ayer';
		if (diffDays < 7) return `Hace ${diffDays} días`;

		return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
	}

	/**
	 * Get priority badge variant
	 */
	function getPriorityVariant(priority?: string): 'default' | 'secondary' | 'destructive' {
		if (!priority) return 'secondary';
		const lower = priority.toLowerCase();
		if (lower === 'alta' || lower === 'high') return 'destructive';
		if (lower === 'media' || lower === 'medium') return 'default';
		return 'secondary';
	}

	/**
	 * Truncate text to max length
	 */
	function truncate(text: string, maxLength: number = 80): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + '...';
	}
</script>

<div
	class="group relative rounded-lg border border-border bg-card p-3 hover:shadow-md transition-all cursor-pointer {className}"
	class:draggable
	{draggable}
	onclick={onclick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
>
	<!-- Header: Name + Unread Badge -->
	<div class="flex items-start justify-between gap-2 mb-2">
		<div class="flex items-center gap-2 flex-1 min-w-0">
			<User class="h-4 w-4 text-muted-foreground flex-shrink-0" />
			<h3 class="font-semibold text-sm text-foreground truncate">{lead.name}</h3>
		</div>

		{#if lead.unread_count && lead.unread_count > 0}
			<Badge variant="default" class="flex-shrink-0 h-5">
				{lead.unread_count}
			</Badge>
		{/if}
	</div>

	<!-- Last Message -->
	{#if lead.last_message}
		<div class="flex items-start gap-2 mb-2">
			<MessageSquare class="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
			<p class="text-xs text-muted-foreground line-clamp-2 flex-1">
				{truncate(lead.last_message)}
			</p>
		</div>
	{/if}

	<!-- Footer: Timestamp + Priority + Score -->
	<div class="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border">
		<!-- Timestamp -->
		<div class="flex items-center gap-1 text-xs text-muted-foreground">
			<Clock class="h-3 w-3" />
			<span>{formatRelativeTime(lead.last_interaction)}</span>
		</div>

		<!-- Priority & Score -->
		<div class="flex items-center gap-1.5">
			{#if lead.priority}
				<Badge variant={getPriorityVariant(lead.priority)} class="text-xs h-5">
					{lead.priority}
				</Badge>
			{/if}

			{#if lead.score !== undefined && lead.score !== null}
				<Badge variant="outline" class="text-xs h-5">
					{lead.score}
				</Badge>
			{/if}

			{#if lead.ai_automation_enabled}
				<Badge variant="secondary" class="text-xs h-5">
					AI
				</Badge>
			{/if}
		</div>
	</div>

	<!-- Drag handle indicator (when draggable) -->
	{#if draggable}
		<div
			class="absolute inset-0 rounded-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
		></div>
	{/if}
</div>

<style>
	.draggable:active {
		cursor: grabbing;
		opacity: 0.8;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
