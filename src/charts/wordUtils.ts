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
}
