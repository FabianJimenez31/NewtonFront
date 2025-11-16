<script lang="ts">
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import {
		ArrowRight,
		UserPlus,
		Sparkles,
		MessageSquare,
		FileText,
		Calendar
	} from 'lucide-svelte';

	interface TimelineEvent {
		id: string;
		type: 'stage_change' | 'assignment' | 'ai_toggle' | 'note' | 'message';
		title: string;
		description?: string;
		timestamp: string;
		user?: string;
		metadata?: Record<string, any>;
	}

	interface Props {
		events?: TimelineEvent[];
		maxEvents?: number;
		class?: string;
	}

	let { events = [], maxEvents = 10, class: className }: Props = $props();

	const displayedEvents = $derived(events.slice(0, maxEvents));

	const eventIcons = {
		stage_change: ArrowRight,
		assignment: UserPlus,
		ai_toggle: Sparkles,
		note: FileText,
		message: MessageSquare
	};

	const eventColors = {
		stage_change: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
		assignment: 'text-green-600 bg-green-50 dark:bg-green-950',
		ai_toggle: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
		note: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
		message: 'text-gray-600 bg-gray-50 dark:bg-gray-950'
	};

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Ahora';
		if (diffMins < 60) return `Hace ${diffMins} min`;
		if (diffHours < 24) return `Hace ${diffHours}h`;
		if (diffDays < 7) return `Hace ${diffDays}d`;

		return date.toLocaleDateString('es-ES', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<div class={cn('space-y-3', className)}>
	<h3 class="text-sm font-semibold text-foreground">Línea de Tiempo</h3>

	{#if displayedEvents.length === 0}
		<div class="text-center py-6">
			<Calendar class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
			<p class="text-sm text-muted-foreground">No hay actividad reciente</p>
		</div>
	{:else}
		<div class="relative space-y-3">
			<!-- Timeline line -->
			<div
				class="absolute left-4 top-2 bottom-2 w-px bg-border"
				aria-hidden="true"
			></div>

			{#each displayedEvents as event (event.id)}
				{@const Icon = eventIcons[event.type] || MessageSquare}
				<div class="relative flex gap-3">
					<!-- Icon -->
					<div
						class={cn(
							'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10',
							eventColors[event.type]
						)}
					>
						<Icon class="h-4 w-4" />
					</div>

					<!-- Content -->
					<div class="flex-1 min-w-0 pt-0.5">
						<div class="flex items-start justify-between gap-2 mb-1">
							<p class="text-sm font-medium text-foreground">
								{event.title}
							</p>
							<span class="text-xs text-muted-foreground flex-shrink-0">
								{formatTime(event.timestamp)}
							</span>
						</div>

						{#if event.description}
							<p class="text-xs text-muted-foreground">
								{event.description}
							</p>
						{/if}

						{#if event.user}
							<p class="text-xs text-muted-foreground mt-1">
								Por {event.user}
							</p>
						{/if}

						<!-- Metadata badges -->
						{#if event.metadata}
							<div class="flex flex-wrap gap-1 mt-1">
								{#if event.metadata.from_stage}
									<Badge variant="outline" class="text-xs">
										{event.metadata.from_stage}
									</Badge>
									<span class="text-xs text-muted-foreground">→</span>
								{/if}
								{#if event.metadata.to_stage}
									<Badge variant="secondary" class="text-xs">
										{event.metadata.to_stage}
									</Badge>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		{#if events.length > maxEvents}
			<p class="text-xs text-center text-muted-foreground pt-2">
				Mostrando {maxEvents} de {events.length} eventos
			</p>
		{/if}
	{/if}
</div>
