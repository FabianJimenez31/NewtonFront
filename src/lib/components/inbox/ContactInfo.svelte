<script lang="ts">
	import { cn } from '$lib/utils';
	import { Input, Label, Button, Badge } from '$lib/components/ui';
	import { Mail, Phone, MapPin, Globe, Edit2, Save, X } from 'lucide-svelte';
	import type { ConversationDetail } from '$lib/types/inbox.types';

	interface Props {
		conversation: ConversationDetail;
		onUpdate?: (data: Partial<ConversationDetail>) => void;
		class?: string;
	}

	let { conversation, onUpdate, class: className }: Props = $props();

	let isEditing = $state(false);
	let editedName = $state(conversation.contact_name);
	let editedEmail = $state(conversation.contact_email || '');
	let editedPhone = $state(conversation.contact_phone);

	function startEdit() {
		isEditing = true;
		editedName = conversation.contact_name;
		editedEmail = conversation.contact_email || '';
		editedPhone = conversation.contact_phone;
	}

	function cancelEdit() {
		isEditing = false;
	}

	function saveEdit() {
		onUpdate?.({
			contact_name: editedName,
			contact_email: editedEmail,
			contact_phone: editedPhone
		});
		isEditing = false;
	}

	const country = $derived(conversation.metadata?.country || 'N/A');
	const language = $derived(conversation.metadata?.language || 'N/A');
</script>

<div class={cn('space-y-4', className)}>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-foreground">Información de Contacto</h3>
		{#if !isEditing}
			<Button variant="ghost" size="icon" onclick={startEdit} title="Editar">
				<Edit2 class="h-4 w-4" />
			</Button>
		{/if}
	</div>

	<!-- Contact Fields -->
	<div class="space-y-3">
		{#if isEditing}
			<!-- Edit Mode -->
			<div class="space-y-3">
				<div>
					<Label class="text-xs">Nombre</Label>
					<Input
						bind:value={editedName}
						class="mt-1"
						placeholder="Nombre del contacto"
					/>
				</div>

				<div>
					<Label class="text-xs">Email</Label>
					<Input
						type="email"
						bind:value={editedEmail}
						class="mt-1"
						placeholder="email@ejemplo.com"
					/>
				</div>

				<div>
					<Label class="text-xs">Teléfono</Label>
					<Input
						type="tel"
						bind:value={editedPhone}
						class="mt-1"
						placeholder="+1234567890"
					/>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-2 pt-2">
					<Button size="sm" onclick={saveEdit} class="flex-1">
						<Save class="h-3 w-3 mr-2" />
						Guardar
					</Button>
					<Button size="sm" variant="outline" onclick={cancelEdit}>
						<X class="h-3 w-3 mr-2" />
						Cancelar
					</Button>
				</div>
			</div>
		{:else}
			<!-- View Mode -->
			<div class="space-y-3">
				<!-- Name -->
				<div>
					<p class="text-xs text-muted-foreground mb-1">Nombre</p>
					<p class="text-sm font-medium">{conversation.contact_name}</p>
				</div>

				<!-- Email -->
				{#if conversation.contact_email}
					<div class="flex items-start gap-2">
						<Mail class="h-4 w-4 text-muted-foreground mt-0.5" />
						<div class="flex-1 min-w-0">
							<p class="text-xs text-muted-foreground mb-0.5">Email</p>
							<a
								href="mailto:{conversation.contact_email}"
								class="text-sm text-primary hover:underline truncate block"
							>
								{conversation.contact_email}
							</a>
						</div>
					</div>
				{/if}

				<!-- Phone -->
				<div class="flex items-start gap-2">
					<Phone class="h-4 w-4 text-muted-foreground mt-0.5" />
					<div class="flex-1 min-w-0">
						<p class="text-xs text-muted-foreground mb-0.5">Teléfono</p>
						<a
							href="tel:{conversation.contact_phone}"
							class="text-sm text-primary hover:underline"
						>
							{conversation.contact_phone}
						</a>
					</div>
				</div>

				<!-- Country -->
				{#if country !== 'N/A'}
					<div class="flex items-start gap-2">
						<MapPin class="h-4 w-4 text-muted-foreground mt-0.5" />
						<div class="flex-1">
							<p class="text-xs text-muted-foreground mb-0.5">País</p>
							<p class="text-sm">{country}</p>
						</div>
					</div>
				{/if}

				<!-- Language -->
				{#if language !== 'N/A'}
					<div class="flex items-start gap-2">
						<Globe class="h-4 w-4 text-muted-foreground mt-0.5" />
						<div class="flex-1">
							<p class="text-xs text-muted-foreground mb-0.5">Idioma</p>
							<p class="text-sm">{language}</p>
						</div>
					</div>
				{/if}

				<!-- Channel Badge -->
				<div>
					<p class="text-xs text-muted-foreground mb-1">Canal</p>
					<Badge variant="outline" class="capitalize">
						{conversation.channel}
					</Badge>
				</div>
			</div>
		{/if}
	</div>
</div>
