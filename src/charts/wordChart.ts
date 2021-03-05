import type { HierarchyNode, HierarchyRectangularNode } from "d3";
import * as d3 from "d3";
import _ from "lodash";
import { WordUtils } from "../data/wordUtils";
import { GenericChart } from "./genericChart";
import type { WordDatum } from "./wordConverter";

export class WorldChart extends GenericChart<WordDatum> {
  private radius = this.width / 6;
  private angle = 0;
  private root: HierarchyRectangularNode<WordDatum>;

  constructor(containerId: string, width?: number, height?: number) {
    super(containerId, width, height);
    this.svg.on("wheel", (event) => {
      this.angle = (this.angle - Math.sign(event.wheelDelta) * 10) % 360;
      if (this.angle < 0) {
        this.angle = 360 + this.angle;
      }

      this.svg
        .transition("easeElastic")
        .attr("transform", `rotate(${-this.angle})`);
      //this.topGroup.selectAll("text").call((sel) => this.transformLabels(sel as any));

      this.transformLabels(
        this.topGroup
          .transition("easeElastic")
          .selectAll<d3.BaseType, TextChunk>("text")
      );
    });
  }

  public draw(datum: WordDatum): void {
    this.root = WorldChart.buildPartition(datum);

    const path = this.topGroup
      .append("g")
      .selectAll("path")
      .data(this.root.descendants())
      .join("path")
      .attr("fill", (d) => {
        return WorldChart.color(d);
      })
      .attr("fill-opacity", (d) =>
        WorldChart.arcVisible(d) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("d", (d) => this.arc(d));

    path
//      .filter((d) => !!d.children)
      .style("cursor", "pointer")
      .on("click", (event, p) => this.clicked(event, p));

    this.drawLabel(this.root);

    const parent = this.topGroup
      .append("circle")
      .datum(this.root)
      .attr("r", this.radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", (event, p) => this.clicked(event, p));
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
    return node.y1 <= 3 && node.x1 > node.x0;
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

  private drawLabel(root: HierarchyRectangularNode<WordDatum>): void {
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
      .join("text")
      .text((d) => {
        return d.text;
      })
      .attr("alignment-baseline", "central");
    this.transformLabels(textGroup);
  }

  private transformLabels(
    sel:
      | d3.Selection<d3.BaseType, TextChunk, any, any>
      | d3.Transition<d3.BaseType, TextChunk, any, any>
  ): void {
    sel
      .filter((d) => d.isRoot)
      .attr("transform", (d) => `rotate(${this.angle})`);
    sel
      .filter((d) => !d.isRoot && d.count > 1)
      .attr("text-anchor", "center")
      .attr("transform", (d) => {
        const sign = d.isTurnover(this.angle) ? -1 : 1;
        return `rotate(${d.isTurnover(this.angle) ? 180 : 0}) translate(${
          sign * Math.abs(d.dy) * 2
        }, ${d.dy * 20}) rotate(${sign * d.dy * 6})`;
      });
    sel
      .filter((d) => !d.isRoot && d.count === 1)
      .attr("transform", (d) =>
        d.isTurnover(this.angle) ? "rotate(180)" : ""
      );
  }

  private static color(data: HierarchyNode<WordDatum>) {
    if (data.depth == 0) {
      return "orange";
    } else if (data.depth == 1) {
      return "green";
    } else {
      const v = (data.value - 2.5) / 2;
      return d3.interpolateRgb("white", "green")(v > 1 ? 1 : v);
    }
  }

  private clicked(event: any, p: HierarchyRectangularNode<WordDatum>) {
    console.log(p);
    this.draw(p.data)
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
    return _.map(
      lines,
      (text, i) =>
        new TextChunk(
          text,
          i,
          lines.length,
          (((node.x0 + node.x1) / 2) * 180) / Math.PI,
          node.depth === 0
        )
    );
  }

  constructor(
    public readonly text: string,
    public readonly pos: number,
    public readonly count: number,
    private readonly x: number,
    public readonly isRoot: boolean
  ) {
    if (!count) {
      this.count = 1;
    }
  }

  public isTurnover(angle: number): boolean {
    let value = (this.x - angle) % 360;
    if (value < 0) {
      value = 360 + value;
    }
    return value > 180;
  }

  public get dy(): number {
    return this.pos - this.count / 2 + 0.5;
  }
}
