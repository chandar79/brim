import {isEqual} from "lodash"
import * as d3 from "d3"

import {DateSpan, Pen} from "../types"
import {innerHeight, innerWidth} from "../dimens"

type Props = {
  onSelection?: (arg0: DateSpan) => void
}

export default function(props: Props = {}): Pen {
  const {onSelection} = props
  let brushG

  function mount(svg) {
    brushG = d3
      .select(svg)
      .append("g")
      .attr("class", "brush")
  }

  function draw(chart) {
    let prevSelection = null

    function onBrushStart() {
      prevSelection = d3.brushSelection(brushG.node())
    }

    function onBrushEnd(this: d3.ContainerElement) {
      const {selection, sourceEvent} = d3.event

      if (!sourceEvent) {
        return
      }

      if (!selection) {
        return
      }

      if (!isEqual(selection, prevSelection)) {
        onSelection && onSelection(selection.map(chart.xScale.invert))
        return
      }
    }

    brushG.attr(
      "transform",
      `translate(${chart.margins.left}, ${chart.margins.top})`
    )
    const brush = d3.brushX().extent([
      [0, 0],
      [
        innerWidth(chart.width, chart.margins),
        innerHeight(chart.height, chart.margins)
      ]
    ])

    brushG.call(brush)
    chart.state.selection
      ? brush.move(brushG, chart.state.selection.map(chart.xScale))
      : brush.move(brushG, null)

    brush.on("end", onBrushEnd)
    brush.on("start", onBrushStart)
  }

  return {mount, draw}
}
