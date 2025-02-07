<script>
	import { Alert, Button, ThemeWrapper, Input, Label } from '@kksh/svelte5';
	import { ui, kv, toast } from '@kksh/api/ui/iframe';
	import { onMount } from 'svelte';
	let apiKey = $state('');

	onMount(() => {
		kv.get('OPENAI_API_KEY').then((key) => {
			console.log('key', key);

			if (!key) {
				return toast.warning('Please enter your OpenAI API key');
			}
			apiKey = key;
		});
	});

	function save() {
		return kv
			.set('OPENAI_API_KEY', apiKey)
			.then(() => {
				toast.success('API Key saved');
			})
			.catch((err) => {
				toast.error('Failed to save API Key', { description: err.message });
			});
	}
</script>

<main class="container">
	<h1 class="text-2xl font-bold">Preferences</h1>
	<small class="block ">
		OpenAI's whisper model is used to transcribe audio files.
	</small>
	<Label>OpenAI API Key</Label>
	<form class="flex gap-1" onsubmit={save}>
		<Input bind:value={apiKey} />
		<Button type="submit">Save</Button>
	</form>
</main>
