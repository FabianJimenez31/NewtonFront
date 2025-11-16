<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		rows?: number;
		maxlength?: number;
		class?: string;
		oninput?: (event: Event & { currentTarget: HTMLTextAreaElement }) => void;
		onchange?: (event: Event & { currentTarget: HTMLTextAreaElement }) => void;
		onfocus?: (event: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
		onblur?: (event: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
		onkeydown?: (event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => void;
	}

	let {
		value = $bindable(''),
		placeholder,
		disabled = false,
		readonly = false,
		rows = 3,
		maxlength,
		class: className,
		oninput,
		onchange,
		onfocus,
		onblur,
		onkeydown
	}: Props = $props();
</script>

<textarea
	bind:value
	{placeholder}
	{disabled}
	{readonly}
	{rows}
	{maxlength}
	class={cn(
		'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
		'ring-offset-background placeholder:text-muted-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'resize-y',
		className
	)}
	{oninput}
	{onchange}
	{onfocus}
	{onblur}
	{onkeydown}
></textarea>
