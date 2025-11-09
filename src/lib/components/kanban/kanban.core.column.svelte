<!-- @core -->
<script lang="ts">
	/**
	 * Kanban Core Column - Newton CRM
	 * Business-critical component for displaying stage columns in kanban board
	 */

	import type { Stage, LeadKanban } from '$lib/types/kanban';
	import KanbanCard from './kanban.core.card.svelte';
	import { Badge } from '$lib/components/ui';

	interface Props {
		stage: Stage;
		leads: LeadKanban[];
		onLeadClick?: (lead: LeadKanban) => void;
		onDrop?: (leadId: string) => void;
		class?: string;
	}

	let { stage, leads = [], onLeadClick, onDrop, class: className = '' }: Props = $props();

	let isDragOver = $state(false);

	/**
	 * Calculate total unread count for this column
	 */
	let totalUnread = $derived(
		leads.reduce((sum, lead) => sum + (lead.unread_count || 0), 0)
	);

	/**
	 * Handle drag over event
	 */
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragOver = true;
	}

	/**
	 * Handle drag leave event
	 */
	function handleDragLeave(e: DragEvent) {
		const target = e.currentTarget as HTMLElement;
		if (e.relatedTarget && !target.contains(e.relatedTarget as Node)) {
			isDragOver = false;
		}
	}

	/**
	 * Handle drop event
	 */
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;

		const leadId = e.dataTransfer?.getData('application/json');
		if (leadId && onDrop) {
			try {
				const data = JSON.parse(leadId);
				onDrop(data.leadId);
			} catch (error) {
				console.error('Error parsing drop data:', error);
			}
		}
	}

	/**
	 * Start drag event
	 */
	function handleDragStart(e: DragEvent, lead: LeadKanban) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('application/json', JSON.stringify({ leadId: lead.id, fromStage: stage.id }));
		}
	}
</script>

<div
	class="flex flex-col h-full min-w-[320px] max-w-[380px] {className}"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="region"
	aria-label="Columna {stage.name}"
>
	<!-- Column Header -->
	<div
		class="flex-shrink-0 rounded-t-lg p-4 text-white font-semibold"
		style="background-color: {stage.color}"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<h2 class="text-lg">{stage.name}</h2>
				{#if totalUnread > 0}
					<Badge variant="secondary" class="bg-white/20 text-white">
						{totalUnread}
					</Badge>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<span class="text-sm font-normal opacity-90">{leads.length}</span>
			</div>
		</div>
	</div>

	<!-- Cards Container -->
	<div
		class="flex-1 overflow-y-auto bg-muted/20 p-3 space-y-3 rounded-b-lg border-x border-b border-border"
		class:drag-over={isDragOver}
	>
		{#if leads.length === 0}
			<!-- Empty state -->
			<div class="flex items-center justify-center h-32 text-center">
				<p class="text-sm text-muted-foreground">
					No hay conversaciones<br />en esta etapa
				</p>
			</div>
		{:else}
			<!-- Lead cards -->
			{#each leads as lead (lead.id)}
				<div
					draggable="true"
					ondragstart={(e) => handleDragStart(e, lead)}
				>
					<KanbanCard
						{lead}
						onclick={() => onLeadClick?.(lead)}
						draggable={true}
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.drag-over {
		background-color: hsl(var(--primary) / 0.1);
		border-color: hsl(var(--primary));
	}

	/* Custom scrollbar */
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: hsl(var(--border));
		border-radius: 3px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground));
	}
</style>
