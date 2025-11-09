<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/stores';

	// Determine active menu item based on current route
	$: activeItem = $page.url.pathname.split('/')[1] || 'pipeline';

	// Check if we're on the login page
	$: isLoginPage = $page.url.pathname === '/login';
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
