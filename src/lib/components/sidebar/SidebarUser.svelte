<script lang="ts">
	import { cn } from '$lib/utils';
	import { User, LogOut } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { goto } from '$app/navigation';

	interface Props {
		isExpanded: boolean;
		class?: string;
	}

	let { isExpanded, class: className }: Props = $props();

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	async function handleLogout() {
		await authStore.logout();
		goto('/login');
	}
</script>

<div class={cn('user-section', className)}>
	<div class="user-divider"></div>

	<div class="user-profile">
		<div class="user-avatar">
			{#if $authStore.user?.name}
				<span class="avatar-initials">
					{getInitials($authStore.user.name)}
				</span>
			{:else}
				<User class="h-5 w-5" />
			{/if}
			<div class="avatar-status"></div>
		</div>

		{#if isExpanded}
			<div class="user-info">
				<span class="user-name">
					{$authStore.user?.name || 'Usuario'}
				</span>
				<span class="user-email">
					{$authStore.user?.email || 'usuario@email.com'}
				</span>
			</div>
		{/if}
	</div>

	<!-- Logout Button -->
	<button
		onclick={handleLogout}
		class={cn(
			'logout-button',
			!isExpanded && 'logout-button-collapsed'
		)}
	>
		<LogOut class="h-4 w-4" />
		{#if isExpanded}
			<span>Cerrar sesión</span>
		{/if}
	</button>
</div>

<style>
	@import './sidebar-user.css';
</style>