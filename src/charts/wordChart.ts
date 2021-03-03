import type { HierarchyNode, HierarchyRectangularNode } from "d3";
import * as d3 from "d3";
import _ from "lodash";
import { GenericChart } from "./genericChart";
import type { WordDatum } from "./wordConverter";
import { WordUtils } from "./wordUtils";

export class WorldChart extends GenericChart<WordDatum> {
  private radius = this.width / 6;

  public draw(datum: WordDatum): void {
    const root = WorldChart.buildPartition(datum);

    const path = this.topGroup
      .append("g")
      .selectAll("path")
      .data(root.descendants())
      .join("path")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return WorldChart.color(d, d.data.name);
      })
      .attr("fill-opacity", (d) =>
        WorldChart.arcVisible(d) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("d", (d) => this.arc(d));
    this.showLabel(root);
  }

  public redraw(datum: WordDatum): void {
    this.topGroup.datum(datum);
  }

  private static buildPartition(
    data: WordDatum
  ): HierarchyRectangularNode<WordDatum> {
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) =>
        b.value != a.value
          ? b.value - a.value
          : a.data.name?.localeCompare(b.data.name)
      );
    return d3.partition<WordDatum>().size([2 * Math.PI, root.height + 1])(root);
  }

  private static arcVisible(
    node: HierarchyRectangularNode<WordDatum>
  ): boolean {
    return node.y1 <= 3 && node.y0 >= 1 && node.x1 > node.x0;
  }

  private arc(node: HierarchyRectangularNode<WordDatum>) {
    return d3
      .arc<HierarchyRectangularNode<WordDatum>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(this.radius * 1.5)
      .innerRadius((d) => d.y0 * this.radius)
      .outerRadius((d) => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1))(
      node
    );
  }

  private static isLabelVisible(d): boolean {
    return d.y1 <= 3 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  private showLabel(root: HierarchyRectangularNode<WordDatum>): void {
    const tr = (d) => {
      if (d.depth > 0) {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        const y = ((d.y0 + d.y1) / 2) * this.radius;
        return `rotate(${x - 90}) translate(${y},0)`;
      }
    };

    const textGroup = this.topGroup
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("fill-opacity", (d) => +WorldChart.isLabelVisible(d))
      .attr("transform", (d) => tr(d))
      .selectAll("text")
      .data((d) => TextChunk.createFromNode(d))
      .join("text");

    textGroup
      .filter((d) => d.count > 1)
      .attr("text-anchor", (d) => (d.isReverted ? "center" : "center"))
      .attr("transform", (d) =>
        d.isReverted
          ? `rotate(180) translate(${Math.abs(d.dy)*2} , ${d.dy * 20 + 4}) rotate(${-d.dy * 5})`
          : `translate(${- Math.abs(d.dy)*2}, ${d.dy * 20 + 4}) rotate(${d.dy * 5})`
      )
      .text((d) => {
        return d.text;
      });
    textGroup
      .filter((d) => d.count === 1)
      .attr("transform", (d) => (d.isReverted ? "rotate(180)" : ""))
      .text((d) => {
        return d.text;
      });
  }

  private static color(data: HierarchyNode<WordDatum>, name: string) {
    return d3.scaleOrdinal(
      d3.quantize(
        d3.interpolateRainbow,
        data.children ? data.children.length + 2 : 1
      ),
      ["red", "orange", "yellow", "green", "blue"]
    )(name);
  }
}

class TextChunk {
  public static createFromNode(
    node: HierarchyRectangularNode<WordDatum>
  ): TextChunk[] {
    const lines = WordUtils.splitText(node.data.name, 23);
    const maxLineWidth = Math.ceil((node.x1 - node.x0) * 10);
    if (lines.length > maxLineWidth) {
      lines.length = maxLineWidth;
    }
    const x = (((node.x0 + node.x1) / 2) * 180) / Math.PI;
    return _.map(
      lines,
      (text, i) => new TextChunk(text, i, lines.length, x > 180)
    );
  }

  constructor(
    public readonly text: string,
    public readonly pos: number,
    public readonly count: number,
    public isReverted: boolean
  ) {
    if (!count) {
      this.count = 1;
    }
  }

  public get dy(): number {
    return this.pos - this.count / 2 + 0.5;
  }
}
