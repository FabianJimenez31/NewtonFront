<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import KanbanBoard from '$lib/components/kanban/kanban.core.board.svelte';
	import TenantSwitcher from '$lib/components/TenantSwitcher.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let availableTenants = [];

	onMount(() => {
		// Check auth state immediately
		const unsubscribe = authStore.subscribe((state) => {
			// Redirect immediately if not authenticated and not loading
			if (!state.isAuthenticated && !state.isLoading) {
				goto('/login');
			}
			availableTenants = state.availableTenants;
		});

		// Initial check in case already not authenticated
		const currentState = $authStore;
		if (!currentState.isAuthenticated && !currentState.isLoading) {
			goto('/login');
		}

		return unsubscribe;
	});

	function handleLeadClick(lead: any) {
		console.log('Lead clicked:', lead);
		// TODO: Navigate to conversation detail or open modal
	}

	function handleConfigureClick() {
		goto('/configuracion');
	}
</script>

<div class="flex h-full flex-col bg-background">
	<!-- Tenant Switcher (if multiple tenants) -->
	{#if availableTenants.length > 1}
		<div class="border-b border-border bg-background px-4 py-2">
			<TenantSwitcher />
		</div>
	{/if}

	<!-- Kanban Board -->
	<div class="flex-1 overflow-hidden">
		<KanbanBoard
			onLeadClick={handleLeadClick}
			onConfigureClick={handleConfigureClick}
			autoRefresh={true}
		/>
	</div>
</div>
