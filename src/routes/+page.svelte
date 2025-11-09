<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ThinkingLoader } from '$lib/components/ui';

	// Redirect immediately based on auth state
	onMount(() => {
		// Check immediate state without waiting
		const state = $authStore;

		// If we have a clear auth state, redirect immediately
		if (!state.isLoading) {
			if (state.isAuthenticated) {
				goto('/pipeline');
			} else {
				goto('/login');
			}
		} else {
			// Only subscribe if we're still loading
			const unsubscribe = authStore.subscribe((authState) => {
				if (!authState.isLoading) {
					if (authState.isAuthenticated) {
						goto('/pipeline');
					} else {
						goto('/login');
					}
				}
			});

			return unsubscribe;
		}
	});
</script>

<div class="loading-container">
	<ThinkingLoader size="lg" variant="brain" message="Loading..." />
</div>

<style>
	.loading-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(113, 39, 111, 0.05) 0%, rgba(61, 20, 56, 0.05) 100%);
	}
</style>
