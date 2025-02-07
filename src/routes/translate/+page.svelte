<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Button, Input, Label, Textarea, Command, Popover } from '@kksh/svelte5';
	import { event, fs, dialog, shell, kv, clipboard, toast, helper } from '@kksh/api/ui/custom';
	import type { API } from '../../api.types';
	import { goto } from '$app/navigation';

	let filepath = $state('');
	let openaiKey = $state('');
	let transcription = $state('');
	let transcribing = $state(false);
	let language = $state('en');
	let hasDeno = $state(false);

	onMount(() => {
        shell.hasCommand('deno').then((has) => {
			hasDeno = has;
		});
		kv.get('OPENAI_API_KEY').then((key) => {
			if (!key) {
				toast.warning('Please enter your OpenAI API key');
				return goto('/preferences');
			}
			openaiKey = key;
		});
		event.onDragDrop((payload) => {
			payload.paths;
		});
	});

	async function getAPI() {
		const { rpcChannel, process, command } = await shell.createDenoRpcChannel<object, API>(
			'$EXTENSION/deno-src/index.ts',
			[],
			{
				allowEnv: [
					'OPENAI_API_KEY',
					'OPENAI_BASE_URL',
					'OPENAI_ORG_ID',
					'OPENAI_PROJECT_ID',
					'DEBUG'
				],
				allowNet: ['api.openai.com'],
				allowRead: [filepath],
				env: {
					OPENAI_API_KEY: openaiKey
				}
			},
			{}
		);
		return { rpcChannel, process, command, api: rpcChannel.getAPI() };
	}

	function pickFile() {
		dialog
			.open({
				directory: false,
				filters: [
					{ extensions: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'], name: 'Audio Files' }
				]
			})
			.then((path: string) => {
				if (!path) {
					return toast.error('No file selected');
				}
				filepath = path;
			})
			.catch((err: any) => {
				toast.error('Failed to pick file', { description: err.message });
				return null;
			});
	}

	async function transcribe() {
		if (!filepath) {
			return toast.error('No file selected');
		}
		await fs.exists(filepath).then((exists) => {
			if (!exists) {
				return toast.error('File does not exist');
			}
		});
		toast.info('Transcribing...');
		const rpc = await getAPI();
		if (!rpc) {
			return;
		}
		const { api, process } = rpc;
		transcribing = true;
		return api
			.transcribe(filepath, language)
			.then((text) => {
				console.log(text);
				transcription = text;
				toast.success('Transcription completed');
			})
			.catch((err) => {
				toast.error('Failed to transcribe', { description: err.message });
			})
			.finally(() => {
				process.kill();
				transcribing = false;
			});
	}
</script>

<main class="container flex flex-col gap-2">
	{#if hasDeno}
		<h2 class="text-lg font-bold">Translate audio file to English</h2>
		<Label>Pick an Audio File</Label>
		<div class="flex gap-1">
			<Input bind:value={filepath} />
			<Button onclick={pickFile}>Pick File</Button>
		</div>

		<Button disabled={transcribing || !filepath} class="w-full" onclick={transcribe}>
			Transcribe and Translate
		</Button>
		{#if transcribing}
			<h2 class="text-center">Transcribing...</h2>
		{:else}
			<Textarea bind:value={transcription} class="min-h-64 w-full" />
			<Button
				class="w-full"
				disabled={!transcription}
				onclick={() => {
				clipboard
					.writeText(transcription)
					.then(() => {
						toast.success('Copied to clipboard');
					})
					.catch((err) => {
						toast.error('Failed to copy to clipboard', { description: err.message });
					});
			}}
			>
				Copy
			</Button>
		{/if}
	{:else}
		<p>Deno is not installed</p>
		<Button onclick={() => {
			helper.guideInstallDeno();
		}}>Install Deno</Button>
	{/if}
</main>
