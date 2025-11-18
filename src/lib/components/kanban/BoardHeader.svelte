<script lang="ts">
	import { Button, Badge } from '$lib/components/ui';
	import { RefreshCw, Settings } from 'lucide-svelte';
	import type { PipelineMetrics } from '$lib/composables/usePipelineMetrics';

	interface Props {
		metrics: PipelineMetrics;
		isRefreshing?: boolean;
		onRefresh?: () => void;
		onConfigureClick?: () => void;
		class?: string;
	}

	let {
		metrics,
		isRefreshing = false,
		onRefresh,
		onConfigureClick,
		class: className = ''
	}: Props = $props();
</script>

<div class="flex items-center justify-between mb-4 {className}">
	<div class="flex items-center gap-4">
		<h2 class="text-2xl font-bold text-foreground">Pipeline de Ventas</h2>
		<div class="flex items-center gap-2">
			<Badge variant="secondary">
				{metrics.totalLeads} leads
			</Badge>
			{#if metrics.totalUnread > 0}
				<Badge variant="default">
					{metrics.totalUnread} sin leer
				</Badge>
			{/if}
			{#if metrics.totalValue > 0}
				<Badge variant="outline" class="font-semibold">
					{metrics.formattedValue}
				</Badge>
			{/if}
		</div>
	</div>

	<div class="flex items-center gap-2">
		{#if onRefresh}
			<Button
				variant="ghost"
				size="icon"
				onclick={onRefresh}
				disabled={isRefreshing}
				class="relative"
			>
				<RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
			</Button>
		{/if}

		{#if onConfigureClick}
			<Button variant="ghost" size="icon" onclick={onConfigureClick}>
				<Settings class="h-4 w-4" />
			</Button>
		{/if}
	</div>
</div>
