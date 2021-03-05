import _ from "lodash";
import type { WordData, WordResult } from "../data/wordData";

interface ResultOptions {
  also?: true;
  antonyms?: true;
  similarTo?: true;
  synonyms?: true;
}

export interface WordDatum {
  name: string;
  value?: number;
  children?: WordDatum[];
}

export class WordConverter {
  public static toDatum(
    wordData: WordData,
    frequencies: _.Dictionary<number>,
    options: ResultOptions = { antonyms: true }
  ): WordDatum {
    const datum: WordDatum = {
      name: wordData.word,
    };

    datum.children = _.compact(
      _.map<WordResult, WordDatum>(wordData.results, (result) => {
        const inner: WordDatum = {
          name: result.definition,
        };

        const arr = [];
        if (options.also && !_.isEmpty(result.also)) {
          arr.push(...result.also);
        }
        if (options.antonyms && !_.isEmpty(result.antonyms)) {
          arr.push(...result.antonyms);
        }
        if (options.similarTo && !_.isEmpty(result.similarTo)) {
          arr.push(...result.similarTo);
        }
        if (options.synonyms && !_.isEmpty(result.synonyms)) {
          arr.push(...result.synonyms);
        }

        inner.children = _.compact(
          _.map(arr, (word) => {
            return word && (frequencies[word] > 0 || !frequencies[word])
              ? {
                  name:
                    word + (frequencies[word] ? ` (${frequencies[word]})` : ""),
                  value: frequencies[word] || 3,
                }
              : undefined;
          })
        );
        return _.isEmpty(inner.children) ? undefined : inner;
      })
    );
    return datum;
  }
}
