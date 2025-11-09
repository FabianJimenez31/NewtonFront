<script lang="ts">
	import Login from '$lib/components/Login.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Handle authentication state and redirects
	onMount(() => {
		// DO NOT clear localStorage here! It destroys multi-tenant flow
		// The auth store will handle invalid tokens properly
		console.log("📍 [LOGIN PAGE] Mounting login page");

		const unsubscribe = authStore.subscribe((state) => {
			console.log("🔄 [LOGIN PAGE] Auth state changed:", {
				isAuthenticated: state.isAuthenticated,
				needsTenantSelection: state.needsTenantSelection,
				hasTempToken: !!state.tempToken
			});

			if (state.isAuthenticated) {
				console.log("✅ [LOGIN PAGE] User authenticated, redirecting to /pipeline");
				goto('/pipeline');
			}
		});

		return unsubscribe;
	});
</script>

<Login />
