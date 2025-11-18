<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { RefreshCw, AlertCircle } from 'lucide-svelte';

	interface Props {
		onRefresh?: () => void;
		class?: string;
	}

	let { onRefresh, class: className = '' }: Props = $props();
</script>

<div class="flex items-center justify-center h-64 {className}">
	<div class="text-center">
		<AlertCircle class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
		<p class="text-lg font-semibold mb-2">No hay datos disponibles</p>
		<p class="text-muted-foreground mb-4">
			No se encontraron leads o etapas configuradas
		</p>
		{#if onRefresh}
			<Button onclick={onRefresh} variant="ghost">
				<RefreshCw class="h-4 w-4 mr-2" />
				Reintentar
			</Button>
		{/if}
	</div>
</div>
