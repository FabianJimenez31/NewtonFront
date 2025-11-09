<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import TenantSelector from './TenantSelector.svelte';
	import BrandPanel from './login/BrandPanel.svelte';
	import LoginForm from './login/LoginForm.svelte';
	import type { TenantInfo } from '$lib/types/auth';

	// Use Svelte's auto-subscription instead of manual subscribe
	$: isLoading = $authStore.isLoading;
	$: error = $authStore.error;
	$: needsTenantSelection = $authStore.needsTenantSelection;
	$: availableTenants = $authStore.availableTenants;

	$: {
		if (needsTenantSelection) {
			console.log("🏢 [LOGIN] Showing tenant selector with", availableTenants.length, "tenants");
		} else {
			console.log("📝 [LOGIN] Showing login form");
		}
	}

	async function handleLoginSubmit(event: CustomEvent<{ email: string; password: string }>) {
		console.log("🔐 [LOGIN] User submitted login form", { email: event.detail.email });
		authStore.clearError();

		try {
			console.log("📡 [LOGIN] Calling authStore.loginMultiTenant...");
			await authStore.loginMultiTenant({
				email: event.detail.email,
				password: event.detail.password
			});
			console.log("✅ [LOGIN] loginMultiTenant completed successfully");
		} catch (err) {
			console.error('❌ [LOGIN] Multi-tenant login failed:', err);

			// Try traditional login as fallback
			console.log("🔄 [LOGIN] Trying traditional login as fallback...");
			try {
				// Use default tenant for traditional login
				const defaultTenant = "celucambio_main";
				console.log(`📡 [LOGIN] Calling traditional login with tenant: ${defaultTenant}`);

				await authStore.login({
					email: event.detail.email,
					password: event.detail.password,
					tenant_id: defaultTenant
				});
				console.log("✅ [LOGIN] Traditional login succeeded!");
			} catch (fallbackErr) {
				console.error('❌ [LOGIN] Traditional login also failed:', fallbackErr);
				// Error will be shown via the store
			}
		}
	}
</script>

{#if needsTenantSelection}
	<TenantSelector tenants={availableTenants} />
{:else}
	<div class="login-container">
		<BrandPanel />
		<LoginForm {isLoading} {error} on:submit={handleLoginSubmit} />
	</div>
{/if}

<style>
	.login-container {
		min-height: 100vh;
		display: grid;
		grid-template-columns: 1fr 1fr;
		position: relative;
		overflow: hidden;
	}

	.login-container::before {
		content: '';
		position: absolute;
		width: 50%;
		height: 100%;
		left: 0;
		background: linear-gradient(135deg, #71276f 0%, #571d54 50%, #3d1438 100%);
		z-index: 0;
	}

	.login-container::after {
		content: '';
		position: absolute;
		width: 50%;
		height: 100%;
		left: 0;
		background-image:
			radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
			radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
		z-index: 1;
		animation: pulse 8s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	@media (max-width: 968px) {
		.login-container {
			grid-template-columns: 1fr;
			display: flex;
			flex-direction: column;
		}

		.login-container::before,
		.login-container::after {
			position: relative;
			width: 100%;
			height: auto;
		}
	}
</style>
