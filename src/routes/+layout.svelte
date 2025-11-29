<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { goto } from '$app/navigation';

	// Determine active menu item based on current route
	$: activeItem = $page.url.pathname.split('/')[1] || 'pipeline';

	// Check if we're on the login page
	$: isLoginPage = $page.url.pathname === '/login';

	// Client-side authentication check
	onMount(() => {
		if (!browser) return;

		const unsubscribe = authStore.subscribe((auth) => {
			const currentPath = window.location.pathname;
			const isPublicRoute = currentPath === '/login' || currentPath === '/register';

			// Redirect to login if not authenticated and not on public route
			if (!auth.isAuthenticated && !isPublicRoute) {
				console.log('[LAYOUT] Not authenticated, redirecting to /login');
				goto('/login');
			}

			// Redirect to pipeline if authenticated and on login page
			if (auth.isAuthenticated && !auth.needsTenantSelection && currentPath === '/login') {
				console.log('[LAYOUT] Already authenticated, redirecting to /pipeline');
				goto('/pipeline');
			}
		});

		return () => unsubscribe();
	});
</script>

{#if isLoginPage}
	<!-- Login page without sidebar -->
	<slot />
{:else}
	<!-- Main app layout with sidebar -->
	<div class="flex h-screen overflow-hidden">
		<Sidebar {activeItem} />
		<main class="flex-1 overflow-y-auto bg-background">
			<slot />
		</main>
	</div>
{/if}
