import { WordUtils } from "../../src/data/wordUtils";

describe("WordUtils", () => {
  describe("should split text by lines with length", () => {
    let TEXT: string;

    beforeEach(() => {
      TEXT = "Long line with a b and c";
    });

    it("10", () => {
      expect(WordUtils.splitText(TEXT, 10)).toStrictEqual([
        "Long line",
        "with a b",
        "and c",
      ]);
    });

    it("8", () => {
      expect(WordUtils.splitText(TEXT, 8)).toStrictEqual([
        "Long",
        "line",
        "with a b",
        "and c",
      ]);
    });

    it("23", () => {
      expect(WordUtils.splitText(TEXT, 23)).toStrictEqual([
        "Long line with a b and",
        "c",
      ]);
    });

    it("24", () => {
      expect(WordUtils.splitText(TEXT, 24)).toStrictEqual([TEXT]);
    });

    it("25", () => {
      expect(WordUtils.splitText(TEXT, 25)).toStrictEqual([TEXT]);
    });
  });
});
