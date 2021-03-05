export interface WordResult {
    definition: string;
    partOfSpeech: string;
    also?: string[];
    antonyms?: string[];
    attribute?: string[];
    derivation?: string[];
    examples?: string[];
    hasTypes?: string[];
    similarTo?: string[];
    synonyms?: string[];
    typeOf?: string[];
    usageOf?: string[];
}

export interface WordData {
    word: string;
    pronunciation: string;
    frequency: number;
    results: WordResult[];
}
