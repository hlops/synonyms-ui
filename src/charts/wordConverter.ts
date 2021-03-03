import _ from "lodash";

interface WordResult {
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

interface WordData {
  word: string;
  pronunciation: string;
  frequency: number;
  results: WordResult[];
}

export interface WordDatum {
  name: string;
  value?: number;
  children?: WordDatum[];
}

export class WordConverter {
  public static toDatum(wordData: WordData): WordDatum {
    const datum: WordDatum = {
      name: wordData.word,
    };

    datum.children = _.compact(_.map<WordResult, WordDatum>(
      wordData.results,
      (result) => {
        const inner: WordDatum = {
          name: result.definition,
        };
        const value = _.concat(result.synonyms, result.also, result.antonyms);
        inner.children = _.compact(
          _.map(value, (word) =>
            word
              ? {
                  name: word,
                  value: 1,
                }
              : undefined
          )
        );
        return _.isEmpty(inner.children) ? undefined : inner;
      }
    ));
    return datum;
  }
}
