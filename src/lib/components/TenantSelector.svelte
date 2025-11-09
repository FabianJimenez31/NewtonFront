<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { Building, Check } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { TenantInfo } from '$lib/types/auth';

	export let tenants: TenantInfo[] = [];

	let isLoading = false;
	let error: string | null = null;
	let selectedTenantId: string | null = null;

	// Handle tenant selection
	async function handleSelectTenant(tenantId: string) {
		console.log("🎯 [TENANT SELECTOR] User selected tenant:", tenantId);
		selectedTenantId = tenantId;
		isLoading = true;
		error = null;

		try {
			console.log("📡 [TENANT SELECTOR] Calling authStore.selectTenant...");
			await authStore.selectTenant({ tenant_id: tenantId });
			console.log("✅ [TENANT SELECTOR] Tenant selected successfully, redirecting to /pipeline");
			// Redirect to dashboard on success
			goto('/pipeline');
		} catch (err) {
			console.error("❌ [TENANT SELECTOR] Failed to select tenant:", err);
			error = err instanceof Error ? err.message : 'Error al seleccionar tenant';
			isLoading = false;
			selectedTenantId = null;
		}
	}
</script>

<div class="tenant-selector-container">
	<div class="tenant-selector-card">
		<!-- Header -->
		<div class="selector-header">
			<h1>Selecciona tu Organización</h1>
			<p class="subtitle">Tienes acceso a {tenants.length} organización{tenants.length > 1 ? 'es' : ''}</p>
		</div>

		<!-- Error message -->
		{#if error}
			<div class="error-banner">
				<p>{error}</p>
			</div>
		{/if}

		<!-- Tenant List -->
		<div class="tenant-list">
			{#each tenants as tenant (tenant.tenant_id)}
				<button
					class="tenant-item"
					class:selected={selectedTenantId === tenant.tenant_id}
					class:loading={isLoading && selectedTenantId === tenant.tenant_id}
					on:click={() => handleSelectTenant(tenant.tenant_id)}
					disabled={isLoading}
				>
					<div class="tenant-icon">
						<Building size={24} />
					</div>
					<div class="tenant-info">
						<h3>{tenant.tenant_name}</h3>
						<p class="tenant-role">{tenant.role}</p>
					</div>
					{#if selectedTenantId === tenant.tenant_id && isLoading}
						<div class="loading-spinner"></div>
					{:else if selectedTenantId === tenant.tenant_id}
						<Check size={20} class="check-icon" />
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.tenant-selector-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%);
		padding: var(--spacing-md);
	}

	.tenant-selector-card {
		width: 100%;
		max-width: 600px;
		background: var(--color-background);
		border-radius: var(--radius-card);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		padding: var(--spacing-xl);
	}

	.selector-header {
		text-align: center;
		margin-bottom: var(--spacing-lg);
	}

	.selector-header h1 {
		color: var(--color-primary);
		margin-bottom: var(--spacing-xs);
	}

	.subtitle {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.error-banner {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: var(--radius-button);
		padding: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
	}

	.error-banner p {
		color: #c33;
		font-size: 0.875rem;
		margin: 0;
	}

	.tenant-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.tenant-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: white;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-card);
		cursor: pointer;
		transition: all var(--transition);
		text-align: left;
	}

	.tenant-item:hover:not(:disabled) {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(113, 39, 111, 0.15);
	}

	.tenant-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.tenant-item.selected {
		border-color: var(--color-primary);
		background: rgba(113, 39, 111, 0.05);
	}

	.tenant-item.loading {
		opacity: 0.8;
	}

	.tenant-icon {
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		border-radius: var(--radius-card);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.tenant-info {
		flex: 1;
	}

	.tenant-info h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 4px;
	}

	.tenant-role {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-transform: capitalize;
	}

	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(113, 39, 111, 0.3);
		border-radius: 50%;
		border-top-color: var(--color-primary);
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	.check-icon {
		color: var(--color-primary);
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		.tenant-selector-card {
			padding: var(--spacing-lg);
		}

		.tenant-item {
			padding: var(--spacing-sm);
		}

		.tenant-icon {
			width: 40px;
			height: 40px;
		}
	}
</style>
