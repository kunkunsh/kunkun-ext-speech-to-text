<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { ThemeWrapper, updateTheme } from '@kksh/svelte5';
	import { onMount } from 'svelte';
	import { ui } from '@kksh/api/ui/iframe';
	import { Sidebar } from '@kksh/svelte5';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children } = $props();

	onMount(() => {
		ui.registerDragRegion();
		ui.getTheme().then((theme) => {
			updateTheme(theme);
		});
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			ui.goBack();
		}
	}}
/>
<ModeWatcher />
<ThemeWrapper>
	<Sidebar.Provider>
		<AppSidebar />
		<main class="w-full">
			<Sidebar.Trigger />
			{@render children?.()}
		</main>
	</Sidebar.Provider>
</ThemeWrapper>
