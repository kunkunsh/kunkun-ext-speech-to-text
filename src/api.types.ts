export interface API {
	transcribe(filepath: string, language: string): Promise<string>;
	translate(filepath: string): Promise<string>;
}
