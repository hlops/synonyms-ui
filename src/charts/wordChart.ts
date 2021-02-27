import type { HierarchyNode, HierarchyRectangularNode } from "d3";
import * as d3 from "d3";
import { GenericChart } from "./genericChart";
import type { WordDatum } from "./wordConverter";

export class WorldChart extends GenericChart<WordDatum> {
  private radius = this.width / 6;

  public draw(data: WordDatum): void {
    console.log(data);
    const root = WorldChart.buildPartition(data);

    const path = this.topGroup
      .append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return WorldChart.color(d, d.data.name);
      })
      .attr("fill-opacity", (d) =>
        WorldChart.arcVisible(d) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("d", (d) => this.arc(d));

    path.append("title").text(
      (d) =>
        `${d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join("/")}\n${d.value}`
    );

    const label = this.topGroup
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", ".35em")
      .attr("fill-opacity", (d) => +WorldChart.isLabelVisible(d))
      .attr("transform", (d) => this.transformLabel(d))
      .text((d) => d.data.name);
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
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  private transformLabel(d) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * this.radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
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
