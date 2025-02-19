import {zed} from "@brimdata/zealot"
import {isEmpty} from "lodash"
import brim from "src/js/brim"
import {ANALYTIC_MAX_RESULTS, PER_PAGE} from "src/js/flows/config"
import {indexOfLastChange} from "src/js/lib/Array"
import {addHeadProc} from "src/js/lib/Program"
import {DateTuple} from "src/js/lib/TimeWindow"
import Tabs from "src/js/state/Tabs"
import {Thunk} from "src/js/state/types"
import Url from "src/js/state/Url"
import Viewer from "src/js/state/Viewer"
import {viewerSearch} from "./viewer-search"

/**
 * Called for the infinite scroll behavior in the viewer
 */
export const nextPageViewerSearch = (): Thunk => (dispatch, getState) => {
  const params = Url.getSearchParams(getState())
  if (!params.spanArgs) return
  const program = brim.program(params.program, params.pins)
  const perPage = program.hasAnalytics() ? ANALYTIC_MAX_RESULTS : PER_PAGE
  const query = addHeadProc(program.string(), perPage)
  const origSpan = brim.span(params.spanArgs).toDateTuple()
  const logs = Viewer.getLogs(getState())
  const tabId = Tabs.getActive(getState())
  const [spliceIndex, span] = nextPageArgs(logs, origSpan)
  const [from, to] = span
  const append = true

  dispatch(Viewer.splice(tabId, spliceIndex))
  return dispatch(viewerSearch({query, from, to, append}))
}

function nextPageArgs(
  logs: zed.Record[],
  span: DateTuple
): [number, DateTuple] {
  let spliceIndex = 0
  const nextSpan: DateTuple = [...span]
  if (!isEmpty(logs)) {
    const index = indexOfLastChange(logs, (log) => log.try("ts")?.toString())
    if (index >= 0) {
      const ts = logs[index].try<zed.Time>("ts")
      if (ts instanceof zed.Time) {
        const prevTs = ts.toDate()
        nextSpan[1] = brim
          .time(prevTs)
          .add(1, "ms")
          .toDate()
        spliceIndex = index
      }
    }
  }
  return [spliceIndex, nextSpan]
}

export default nextPageViewerSearch
