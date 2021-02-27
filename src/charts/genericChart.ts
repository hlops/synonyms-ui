import * as d3 from "d3";

export class GenericChart<Datum> {
  protected readonly svg: d3.Selection<SVGElement, Datum, HTMLElement, Datum>;
  protected readonly topGroup: d3.Selection<
    SVGElement,
    Datum,
    HTMLElement,
    Datum
  >;

  constructor(
    protected readonly containerId: string,
    protected readonly width = 1024,
    protected readonly height = 1024
  ) {
    this.svg = d3
      .select<HTMLElement, Datum>(containerId)
      .append("svg")
      .attr("viewBox", `0, 0, ${width}, ${height}`)
      .style("font", "15px sans-serif");

    this.topGroup = this.svg
      .append("g")
      .attr("transform", `translate(${width / 2},${width / 2})`);
  }
}
