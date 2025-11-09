<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { kanbanStore } from '$lib/stores/kanban.core.store';
	import { Button, Dialog } from '$lib/components/ui';
	import ConfigPipelineList from '$lib/components/config/ConfigPipelineList.svelte';
	import ConfigStageForm from '$lib/components/config/ConfigStageForm.svelte';
	import { Plus } from 'lucide-svelte';

	let showCreateForm = $state(false);

	let hasLoaded = false;

	onMount(async () => {
		// Prevent multiple loads
		if (hasLoaded) return;
		hasLoaded = true;

		const auth = $authStore;
		console.log('[CONFIG PAGE] === Starting Configuration Load ===');
		console.log('[CONFIG PAGE] Auth state:', {
			isAuthenticated: auth.isAuthenticated,
			hasToken: !!auth.token,
			tokenLength: auth.token?.length || 0,
			user: auth.user?.email || 'NO USER'
		});

		// Check localStorage directly for debugging
		if (typeof window !== 'undefined') {
			console.log('[CONFIG PAGE] LocalStorage auth_token:', !!localStorage.getItem('auth_token'));
			console.log('[CONFIG PAGE] LocalStorage auth_user:', localStorage.getItem('auth_user'));
		}

		if (!auth.token) {
			console.error('[CONFIG PAGE] ❌ No token available, cannot load config');
			// Update the store to show error in UI
			kanbanStore.setError('No se encontró token de autenticación. Por favor inicia sesión nuevamente.');
			return;
		}

		try {
			console.log('[CONFIG PAGE] 📡 Calling kanbanStore.loadConfig...');
			await kanbanStore.loadConfig(auth.token);
			console.log('[CONFIG PAGE] ✅ Config loaded successfully');
			console.log('[CONFIG PAGE] Stages count:', $kanbanStore.stages?.length || 0);
		} catch (error) {
			console.error('[CONFIG PAGE] ❌ Failed to load config:', error);
			// Make error visible in UI
			const errorMsg = error instanceof Error ? error.message : 'Error al cargar la configuración';
			kanbanStore.setError(`Error al cargar configuración: ${errorMsg}`);
		}
	});

	async function handleCreateDefault() {
		const auth = $authStore;
		if (!auth.token) return;

		try {
			await kanbanStore.createDefaultConfig(auth.token);
		} catch (error) {
			console.error('Error creating default config:', error);
		}
	}

	function handleFormSuccess() {
		showCreateForm = false;
	}

	function handleFormCancel() {
		showCreateForm = false;
	}
</script>

<div class="flex h-full flex-col bg-background">
	<!-- Header -->
	<div class="border-b border-border bg-background p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-foreground">Configuración del Pipeline</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					Gestiona las etapas de tu pipeline de ventas
				</p>
			</div>

			<Button onclick={() => (showCreateForm = true)}>
				<Plus class="mr-2 h-4 w-4" />
				Nueva Etapa
			</Button>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto p-6">
		{#if $kanbanStore.isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
					<p class="mt-4 text-sm text-muted-foreground">Cargando configuración...</p>
				</div>
			</div>
		{:else if $kanbanStore.error}
			<div class="rounded-lg border-2 border-red-300 bg-red-50 p-6 mb-6">
				<div class="flex items-start gap-3">
					<div class="text-red-500">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-semibold text-red-800">Error al cargar configuración</h3>
						<p class="text-sm text-red-700 mt-1">{$kanbanStore.error}</p>
						<button
							onclick={async () => {
								const auth = $authStore;
								if (auth.token && !$kanbanStore.isLoading) {
									kanbanStore.clearError();
									await kanbanStore.loadConfig(auth.token);
								}
							}}
							disabled={$kanbanStore.isLoading}
							class="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{$kanbanStore.isLoading ? 'Cargando...' : 'Reintentar'}
						</button>
					</div>
				</div>
			</div>
		{:else if $kanbanStore.stages.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center py-12">
				<div class="text-center max-w-md">
					<h3 class="text-lg font-semibold text-foreground">No hay etapas configuradas</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Comienza creando un pipeline por defecto o agrega etapas personalizadas
					</p>

					<div class="mt-6 flex gap-3 justify-center">
						<Button onclick={handleCreateDefault}>
							Crear Pipeline por Defecto
						</Button>

						<Button variant="secondary" onclick={() => (showCreateForm = true)}>
							<Plus class="mr-2 h-4 w-4" />
							Crear Etapa Personalizada
						</Button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Stages list -->
			<ConfigPipelineList
				stages={$kanbanStore.stages}
				isLoading={$kanbanStore.isLoading}
				bind:showCreateForm
			/>
		{/if}
	</div>
</div>

<!-- Create Form Dialog (also rendered when no stages) -->
{#if showCreateForm && $kanbanStore.stages.length === 0}
	<Dialog open={true} onOpenChange={() => showCreateForm = false}>
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Nueva Etapa</h2>

			<ConfigStageForm
				stage={null}
				onSuccess={handleFormSuccess}
				onCancel={handleFormCancel}
			/>
		</div>
	</Dialog>
{/if}
