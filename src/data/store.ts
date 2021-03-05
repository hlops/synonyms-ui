import _ from "lodash";
import type { WordData } from "./wordData";
import { ResultOptions, WordUtils } from "./wordUtils";

const cache: _.Dictionary<Promise<WordData>> = {};

export async function getWord(word: string): Promise<WordData> {
  if (!cache[word]) {
    cache[word] = fetch(
      `http://localhost:8080/word/${encodeURIComponent(word)}`
    ).then((r) => r.json());
  }
  return cache[word];
}

export async function getWords(
  word: string,
  options?: ResultOptions
): Promise<[WordData, ...Promise<WordData>[]]> {
  return getWord(word).then((data) => [
    data,
    ..._.map(WordUtils.getWords(data, options), (w) => getWord(w).then(d => {return d})),
  ]);
}
