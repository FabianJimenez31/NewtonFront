<script lang="ts">
	import { cn } from '$lib/utils';
	import { Badge, Button } from '$lib/components/ui';
	import { TrendingUp, Target, DollarSign, Calendar } from 'lucide-svelte';
	import type { ConversationDetail } from '$lib/types/inbox.types';
	import type { Stage } from '$lib/types/kanban';

	interface Props {
		conversation: ConversationDetail;
		availableStages?: Stage[];
		onStageChange?: (stageId: string) => void;
		class?: string;
	}

	let { conversation, availableStages = [], onStageChange, class: className }: Props = $props();

	const lead = $derived(conversation.lead);

	// Priority colors
	const priorityColors = {
		high: 'bg-red-500',
		medium: 'bg-yellow-500',
		low: 'bg-blue-500'
	};

	const priorityLabels = {
		high: 'Alta',
		medium: 'Media',
		low: 'Baja'
	};

	// Score color based on value
	const scoreColor = $derived.by(() => {
		if (!lead?.score) return 'text-muted-foreground';
		if (lead.score >= 80) return 'text-green-600';
		if (lead.score >= 50) return 'text-yellow-600';
		return 'text-red-600';
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class={cn('space-y-4', className)}>
	<h3 class="text-sm font-semibold text-foreground">Información del Lead</h3>

	{#if lead}
		<div class="space-y-3">
			<!-- Stage -->
			<div>
				<p class="text-xs text-muted-foreground mb-2">Etapa Actual</p>
				<Badge variant="secondary" class="w-full justify-start">
					{lead.stage}
				</Badge>
			</div>

			<!-- Score -->
			<div class="flex items-start gap-2">
				<TrendingUp class="h-4 w-4 text-muted-foreground mt-0.5" />
				<div class="flex-1">
					<p class="text-xs text-muted-foreground mb-1">Puntuación</p>
					<div class="flex items-center gap-2">
						<div class="flex-1 bg-muted rounded-full h-2 overflow-hidden">
							<div
								class={cn('h-full transition-all', scoreColor.replace('text-', 'bg-'))}
								style="width: {lead.score}%"
							></div>
						</div>
						<span class={cn('text-sm font-semibold', scoreColor)}>
							{lead.score}
						</span>
					</div>
				</div>
			</div>

			<!-- Priority -->
			<div class="flex items-start gap-2">
				<Target class="h-4 w-4 text-muted-foreground mt-0.5" />
				<div class="flex-1">
					<p class="text-xs text-muted-foreground mb-1">Prioridad</p>
					<div class="flex items-center gap-2">
						<div class={cn('w-2 h-2 rounded-full', priorityColors[lead.priority])}></div>
						<span class="text-sm">{priorityLabels[lead.priority]}</span>
					</div>
				</div>
			</div>

			<!-- Created Date -->
			<div class="flex items-start gap-2">
				<Calendar class="h-4 w-4 text-muted-foreground mt-0.5" />
				<div class="flex-1">
					<p class="text-xs text-muted-foreground mb-0.5">Creado</p>
					<p class="text-sm">{formatDate(lead.created_at)}</p>
				</div>
			</div>

			<!-- Last Contact -->
			{#if lead.last_contact}
				<div class="flex items-start gap-2">
					<Calendar class="h-4 w-4 text-muted-foreground mt-0.5" />
					<div class="flex-1">
						<p class="text-xs text-muted-foreground mb-0.5">Último Contacto</p>
						<p class="text-sm">{formatDate(lead.last_contact)}</p>
					</div>
				</div>
			{/if}

			<!-- Assigned Agent -->
			{#if lead.assigned_agent}
				<div>
					<p class="text-xs text-muted-foreground mb-1">Agente Asignado</p>
					<div class="flex items-center gap-2">
						<div
							class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium"
						>
							{lead.assigned_agent.name.charAt(0).toUpperCase()}
						</div>
						<span class="text-sm">{lead.assigned_agent.name}</span>
					</div>
				</div>
			{/if}

			<!-- Tags -->
			{#if lead.tags && lead.tags.length > 0}
				<div>
					<p class="text-xs text-muted-foreground mb-2">Etiquetas</p>
					<div class="flex flex-wrap gap-1">
						{#each lead.tags as tag}
							<Badge variant="outline" class="text-xs">{tag}</Badge>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">No hay información de lead disponible</p>
	{/if}
</div>
