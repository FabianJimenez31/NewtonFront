<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { Building, ChevronDown, Check } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { TenantInfo } from '$lib/types/auth';

	let currentTenant: string = '';
	let currentTenantName: string = '';
	let availableTenants: TenantInfo[] = [];
	let isOpen = false;
	let isLoading = false;

	// Subscribe to auth store
	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			if (state.user) {
				currentTenant = state.user.tenant_id;
			}
			availableTenants = state.availableTenants;
		});

		return unsubscribe;
	});

	// Find current tenant name
	$: {
		const tenant = availableTenants.find((t) => t.tenant_id === currentTenant);
		currentTenantName = tenant?.tenant_name || currentTenant;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	async function handleSwitchTenant(tenantId: string) {
		if (tenantId === currentTenant || isLoading) return;

		isLoading = true;
		try {
			await authStore.switchTenant({ tenant_id: tenantId });
			isOpen = false;
			// Optionally reload the page or refresh data
			window.location.reload();
		} catch (error) {
			console.error('Error switching tenant:', error);
			isLoading = false;
		}
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.tenant-switcher')) {
			isOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="tenant-switcher">
	<button class="switcher-button" on:click|stopPropagation={toggleDropdown} disabled={isLoading}>
		<Building size={18} />
		<span class="tenant-name">{currentTenantName}</span>
		<span class="chevron-wrapper" class:rotated={isOpen}>
			<ChevronDown size={16} />
		</span>
	</button>

	{#if isOpen}
		<div class="dropdown">
			<div class="dropdown-header">
				<p>Cambiar Organización</p>
			</div>
			<div class="dropdown-list">
				{#each availableTenants as tenant (tenant.tenant_id)}
					<button
						class="dropdown-item"
						class:active={tenant.tenant_id === currentTenant}
						on:click={() => handleSwitchTenant(tenant.tenant_id)}
						disabled={isLoading}
					>
						<div class="tenant-info">
							<span class="tenant-title">{tenant.tenant_name}</span>
							<span class="tenant-role">{tenant.role}</span>
						</div>
						{#if tenant.tenant_id === currentTenant}
							<Check size={16} class="check-icon" />
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.tenant-switcher {
		position: relative;
	}

	.switcher-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-button);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition);
	}

	.switcher-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.switcher-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.tenant-name {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron-wrapper {
		display: inline-flex;
		align-items: center;
		transition: transform var(--transition);
	}

	.chevron-wrapper.rotated {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		min-width: 280px;
		background: white;
		border-radius: var(--radius-card);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		overflow: hidden;
	}

	.dropdown-header {
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-primary);
		color: white;
	}

	.dropdown-header p {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0;
	}

	.dropdown-list {
		max-height: 300px;
		overflow-y: auto;
	}

	.dropdown-item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
		background: white;
		color: var(--color-text);
		border: none;
		border-bottom: 1px solid var(--color-border);
		text-align: left;
		cursor: pointer;
		transition: background var(--transition);
	}

	.dropdown-item:last-child {
		border-bottom: none;
	}

	.dropdown-item:hover:not(:disabled) {
		background: #f9f9f9;
	}

	.dropdown-item.active {
		background: rgba(113, 39, 111, 0.05);
	}

	.dropdown-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.tenant-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.tenant-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.tenant-role {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: capitalize;
	}

	.check-icon {
		color: var(--color-primary);
		flex-shrink: 0;
	}

	/* Scrollbar styling */
	.dropdown-list::-webkit-scrollbar {
		width: 6px;
	}

	.dropdown-list::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	.dropdown-list::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 3px;
	}

	.dropdown-list::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-muted);
	}
</style>
