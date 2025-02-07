import OpenAI from 'openai';

const apiKey = Deno.env.get('OPENAI_API_KEY');
const openai = new OpenAI({ apiKey });

// expect a audio.m4a file in the current directory
const fileData = await Deno.readFile('./audio.m4a');

// Convert to a File (filename is required)
const file = new File([fileData], 'audio.m4a', { type: 'audio/m4a' });

const transcription = await openai.audio.transcriptions.create({
	file: file,
	model: 'whisper-1',
	language: 'en' // this is optional but helps the model
});

console.log(transcription);
Deno.writeTextFileSync('transcription.txt', transcription.text);
