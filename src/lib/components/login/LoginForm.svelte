<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { LogIn, Mail, Lock } from 'lucide-svelte';
	import { ThinkingLoader } from '$lib/components/ui';
	import './login-form.css';

	export let isLoading = false;
	export let error: string | null = null;

	const dispatch = createEventDispatcher<{ submit: { email: string; password: string } }>();

	let email = '';
	let password = '';
	let showPassword = false;

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email || !password) {
			return;
		}

		dispatch('submit', { email, password });
	}
</script>

<div class="login-card">
	<div class="login-header">
		<h1>Bienvenido</h1>
		<p class="subtitle">Inicia sesión en tu cuenta</p>
	</div>

	{#if error}
		<div class="error-banner">
			<p>{error}</p>
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="login-form">
		<div class="form-group">
			<label for="email">Correo electrónico</label>
			<div class="input-wrapper">
				<Mail size={18} class="input-icon" />
				<input
					type="email"
					id="email"
					name="username"
					bind:value={email}
					placeholder="tu@email.com"
					required
					disabled={isLoading}
					autocomplete="username"
					aria-label="Correo electrónico"
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="current-password">Contraseña</label>
			<div class="input-wrapper">
				<Lock size={18} class="input-icon" />
				<input
					type={showPassword ? 'text' : 'password'}
					id="current-password"
					name="password"
					bind:value={password}
					placeholder="••••••••"
					required
					disabled={isLoading}
					autocomplete="current-password"
					aria-label="Contraseña"
				/>
			</div>
		</div>

		<div class="form-checkbox">
			<input
				type="checkbox"
				id="show-password"
				bind:checked={showPassword}
				disabled={isLoading}
			/>
			<label for="show-password">Mostrar contraseña</label>
		</div>

		<button type="submit" class="login-button" disabled={isLoading}>
			{#if isLoading}
				<ThinkingLoader size="sm" variant="brain" message="Thinking" />
			{:else}
				<LogIn size={18} />
				Iniciar Sesión
			{/if}
		</button>
	</form>

	<div class="login-footer">
		<p class="text-muted">¿Problemas para iniciar sesión? Contacta a soporte.</p>
	</div>
</div>
