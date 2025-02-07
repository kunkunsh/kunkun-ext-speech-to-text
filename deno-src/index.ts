import { expose } from '@kunkun/api/runtime/deno';
import OpenAI from '@openai/openai';
import type { API } from '../src/api.types';

expose({
	transcribe: async (filepath: string, language: string) => {
		const apiKey = Deno.env.get('OPENAI_API_KEY');
		const openai = new OpenAI({ apiKey });

		const fileData = await Deno.readFile(filepath);

		// Convert to a File (filename is required)
		const file = new File([fileData], 'audio.m4a', { type: 'audio/m4a' });

		const transcription = await openai.audio.transcriptions.create({
			file: file,
			model: 'whisper-1',
			language: language // this is optional but helps the model
		});

		return transcription.text;
	}
} satisfies API);
