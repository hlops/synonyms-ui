import _ from "lodash";
import type { WordData } from "./wordData";

export interface ResultOptions {
  also?: true;
  antonyms?: true;
  similarTo?: true;
  synonyms?: true;
}

export class WordUtils {
  public static splitText(text: string, maxLen: number): string[] {
    let start = 0;
    const result: string[] = [];
    while (start < text.length) {
      const chunk = text.substr(start, maxLen);
      let end = chunk.length;
      if (start + end < text.length) {
        end = text.lastIndexOf(" ", start + end) - start;
        if (end < maxLen / 2) {
          end = chunk.length;
        }
      }
      result.push(chunk.substr(0, end));
      start += end + 1;
    }
    return result;
  }

  public static getWords(
    data: WordData,
    options: ResultOptions = { antonyms: true }
  ): string[] {
    const words = [];
    _.map(data?.results, (result) => {
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
      words.push(...arr);
    });
    return _.chain(words).orderBy().sortedUniq().value();
  }
}
