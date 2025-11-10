<!-- Kanban Column with Global Cards -->
<script lang="ts">
	/**
	 * Kanban Global Column - Newton CRM
	 * Column component using the extended global card
	 * Use this instead of kanban.core.column when ready to show global fields
	 */

	import type { Stage, LeadKanban } from '$lib/types/kanban';
	import { Badge } from '$lib/components/ui';
	import { MoreVertical } from 'lucide-svelte';
	import KanbanCard from './kanban.card.svelte'; // Using unified card
	import { formatCompactCurrency } from '$lib/utils/currency';

	interface Props {
		stage: Stage;
		leads: LeadKanban[];
		onLeadClick?: (lead: LeadKanban) => void;
		onDrop?: (lead: LeadKanban, targetStageId: string) => Promise<void>;
		class?: string;
	}

	let {
		stage,
		leads = [],
		onLeadClick,
		onDrop,
		class: className = ''
	}: Props = $props();

	let draggedOver = $state(false);
	let isProcessing = $state(false);

	// Calculate total deal value for this stage
	const stageTotalValue = $derived(
		leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0)
	);

	// Get predominant currency (most common)
	const stageCurrency = $derived((() => {
		const currencies = leads
			.filter(l => l.currency)
			.map(l => l.currency!);
		if (currencies.length === 0) return 'USD';

		const counts = currencies.reduce((acc, curr) => {
			acc[curr] = (acc[curr] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return Object.entries(counts)
			.sort(([, a], [, b]) => b - a)[0]?.[0] || 'USD';
	})());

	// Count unread messages
	const totalUnread = $derived(
		leads.reduce((sum, lead) => sum + (lead.unread_count || 0), 0)
	);

	// Channel distribution
	const channelCounts = $derived((() => {
		const counts: Record<string, number> = {};
		leads.forEach(lead => {
			if (lead.channel) {
				counts[lead.channel] = (counts[lead.channel] || 0) + 1;
			}
		});
		return counts;
	})());

	function handleDragStart(e: DragEvent, lead: LeadKanban) {
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('application/json', JSON.stringify(lead));
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		draggedOver = false;

		if (!onDrop || isProcessing) return;

		const data = e.dataTransfer?.getData('application/json');
		if (!data) return;

		try {
			isProcessing = true;
			const lead = JSON.parse(data) as LeadKanban;
			await onDrop(lead, stage.id);
		} catch (error) {
			console.error('Error processing drop:', error);
		} finally {
			isProcessing = false;
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		draggedOver = true;
	}

	function handleDragLeave() {
		draggedOver = false;
	}
</script>

<div
	class="flex flex-col h-full bg-muted/30 rounded-lg {className}"
	class:ring-2={draggedOver}
	class:ring-primary={draggedOver}
	class:opacity-50={isProcessing}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
>
	<!-- Stage Header with enhanced metrics -->
	<div
		class="px-3 py-2 border-b border-border"
		style="background-color: {stage.color}20; border-top: 3px solid {stage.color}"
	>
		<div class="flex items-center justify-between mb-1">
			<h3 class="font-semibold text-sm text-foreground">
				{stage.name}
			</h3>
			<div class="flex items-center gap-1">
				<Badge variant="secondary" class="h-5 text-xs">
					{leads.length}
				</Badge>
				{#if totalUnread > 0}
					<Badge variant="default" class="h-5 text-xs">
						{totalUnread}
					</Badge>
				{/if}
				<button class="p-0.5 hover:bg-accent rounded">
					<MoreVertical class="h-4 w-4 text-muted-foreground" />
				</button>
			</div>
		</div>

		<!-- Stage Metrics (new) -->
		{#if stageTotalValue > 0}
			<div class="text-xs text-muted-foreground mt-1">
				<span class="font-medium">
					{formatCompactCurrency(stageTotalValue, stageCurrency)}
				</span>
			</div>
		{/if}

		<!-- Channel distribution badges (new) -->
		{#if Object.keys(channelCounts).length > 0}
			<div class="flex gap-1 mt-1 flex-wrap">
				{#each Object.entries(channelCounts) as [channel, count]}
					<span
						class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-background/50"
						title="{channel}: {count} leads"
					>
						{channel.substring(0, 2).toUpperCase()}:{count}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Leads Container -->
	<div class="flex-1 overflow-y-auto p-2 space-y-2">
		{#if leads.length === 0}
			<div class="text-center py-8 text-muted-foreground text-sm">
				No hay conversaciones en esta etapa
			</div>
		{:else}
			{#each leads as lead (lead.id)}
				<div
					draggable="true"
					ondragstart={(e) => handleDragStart(e, lead)}
					role="button"
					tabindex="0"
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

	<!-- Stage Footer with total value (new) -->
	{#if stageTotalValue > 0 || leads.length > 3}
		<div class="px-3 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
			<div class="flex justify-between items-center">
				<span>{leads.length} leads</span>
				{#if stageTotalValue > 0}
					<span class="font-semibold">
						Total: {formatCompactCurrency(stageTotalValue, stageCurrency)}
					</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Smooth transitions */
	.ring-2 {
		transition: all 0.2s ease;
	}

	/* Drag and drop cursor */
	[draggable='true'] {
		cursor: move;
	}

	[draggable='true']:active {
		cursor: grabbing;
	}

	/* Hide scrollbar but keep functionality */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.1);
		border-radius: 3px;
	}
</style>