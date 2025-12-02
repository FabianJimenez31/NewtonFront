<script lang="ts">
	/**
	 * Search Wrapper Component
	 * Handles search functionality with debouncing and global API search
	 */
	import type { Snippet } from "svelte";
	import { handleSearchWithDebounce } from "$lib/handlers/search.handlers";
	import type { InboxTab } from "$lib/types/inbox.types";

	interface Props {
		token: string;
		activeTab: InboxTab;
		priority?: boolean;
		onSearchChange: (query: string) => void;
		children: Snippet;
	}

	let { token, activeTab, priority = false, onSearchChange, children }: Props = $props();

	function handleSearch(query: string) {
		// Call the original handler (updates filters)
		onSearchChange(query);

		// Perform global search with debouncing
		handleSearchWithDebounce(query, token, activeTab, priority);
	}
</script>

{@render children()}
