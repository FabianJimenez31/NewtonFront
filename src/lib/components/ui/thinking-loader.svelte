<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
	type LoaderVariant = 'default' | 'subtle' | 'brain' | 'dots';

	interface Props {
		size?: LoaderSize;
		variant?: LoaderVariant;
		message?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		size = 'md',
		variant = 'default',
		message = 'Thinking',
		class: className,
		children
	}: Props = $props();

	const sizeClasses: Record<LoaderSize, string> = {
		sm: 'text-sm gap-2',
		md: 'text-base gap-3',
		lg: 'text-lg gap-4',
		xl: 'text-xl gap-5'
	};

	const spinnerSizes: Record<LoaderSize, string> = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
		xl: 'w-8 h-8'
	};
</script>

<div class={cn('thinking-loader', sizeClasses[size], className)}>
	{#if variant === 'brain'}
		<!-- AI Brain Animation -->
		<div class={cn('brain-loader', spinnerSizes[size])}>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					class="brain-path"
					d="M12 4C10.5 4 9 4.5 8 5.5C7 6.5 6.5 8 6.5 9.5C6.5 10 6.6 10.5 6.7 11C5.8 11.3 5 12 4.5 13C4 14 4 15.2 4.5 16.2C5 17.2 6 18 7 18.3C7.3 19 7.8 19.7 8.5 20.2C9.5 21 10.7 21.5 12 21.5C13.3 21.5 14.5 21 15.5 20.2C16.2 19.7 16.7 19 17 18.3C18 18 19 17.2 19.5 16.2C20 15.2 20 14 19.5 13C19 12 18.2 11.3 17.3 11C17.4 10.5 17.5 10 17.5 9.5C17.5 8 17 6.5 16 5.5C15 4.5 13.5 4 12 4Z"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<circle class="brain-pulse pulse-1" cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
				<circle class="brain-pulse pulse-2" cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
			</svg>
		</div>
	{:else if variant === 'dots'}
		<!-- Thinking Dots Animation -->
		<div class={cn('dots-loader', spinnerSizes[size])}>
			<div class="dot dot-1"></div>
			<div class="dot dot-2"></div>
			<div class="dot dot-3"></div>
		</div>
	{:else if variant === 'subtle'}
		<!-- Subtle Pulse -->
		<div class={cn('pulse-loader', spinnerSizes[size])}>
			<div class="pulse-circle"></div>
		</div>
	{:else}
		<!-- Default Spinner -->
		<div class={cn('spinner', spinnerSizes[size])}>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-dasharray="32"
					stroke-dashoffset="32"
					class="spinner-circle"
				/>
			</svg>
		</div>
	{/if}

	{#if children}
		<div class="thinking-content">
			{@render children()}
		</div>
	{:else if message}
		<span class="thinking-text">
			{message}<span class="dots">
				<span class="dot-anim">.</span><span class="dot-anim">.</span><span class="dot-anim">.</span>
			</span>
		</span>
	{/if}
</div>

<style>
	/* Container */
	.thinking-loader {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
	}

	/* Default Spinner */
	.spinner {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.spinner-circle {
		animation: spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
			stroke-dashoffset: 32;
		}
		50% {
			stroke-dashoffset: 0;
		}
		100% {
			transform: rotate(360deg);
			stroke-dashoffset: -32;
		}
	}

	/* Brain Loader */
	.brain-loader {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
	}

	.brain-path {
		animation: brain-pulse 2s ease-in-out infinite;
	}

	@keyframes brain-pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	.brain-pulse {
		animation: pulse-wave 2s ease-in-out infinite;
	}

	.pulse-1 {
		animation-delay: 0s;
	}

	.pulse-2 {
		animation-delay: 0.3s;
	}

	@keyframes pulse-wave {
		0% {
			r: 2;
			opacity: 0.8;
		}
		50% {
			r: 5;
			opacity: 0.2;
		}
		100% {
			r: 2;
			opacity: 0.8;
		}
	}

	/* Dots Loader */
	.dots-loader {
		display: flex;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.dot {
		width: 0.4em;
		height: 0.4em;
		background: currentColor;
		border-radius: 50%;
		animation: dot-bounce 1.4s ease-in-out infinite;
	}

	.dot-1 {
		animation-delay: 0s;
	}

	.dot-2 {
		animation-delay: 0.2s;
	}

	.dot-3 {
		animation-delay: 0.4s;
	}

	@keyframes dot-bounce {
		0%, 80%, 100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

	/* Pulse Loader */
	.pulse-loader {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
	}

	.pulse-circle {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: currentColor;
		animation: subtle-pulse 1.5s ease-in-out infinite;
	}

	@keyframes subtle-pulse {
		0%, 100% {
			opacity: 0.4;
			transform: scale(0.8);
		}
		50% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Text */
	.thinking-text {
		font-weight: 500;
		white-space: nowrap;
	}

	.dots {
		display: inline-block;
		width: 1.5em;
	}

	.dot-anim {
		animation: dot-fade 1.4s ease-in-out infinite;
		display: inline-block;
	}

	.dot-anim:nth-child(1) {
		animation-delay: 0s;
	}

	.dot-anim:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot-anim:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes dot-fade {
		0%, 80%, 100% {
			opacity: 0.3;
		}
		40% {
			opacity: 1;
		}
	}

	.thinking-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
