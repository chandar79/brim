import {ResultStream} from "@brimdata/zealot"
import {search} from "src/js/flows/search/mod"
import {parallelizeProcs} from "src/js/lib/Program"
import {
  filenameCorrelation,
  md5Correlation,
  rxHostsCorrelation,
  txHostsCorrelation
} from "src/js/searches/programs"
import Current from "src/js/state/Current"
import Tab from "src/js/state/Tab"
import {Thunk} from "src/js/state/types"

const id = "Md5"

export const md5Search = (md5: string): Thunk<Promise<ResultStream>> => (
  dispatch,
  getState
) => {
  const poolId = Current.getPoolId(getState())
  if (!poolId) return
  const [from, to] = Tab.getSpanAsDates(getState())
  const q = parallelizeProcs([
    filenameCorrelation(md5),
    md5Correlation(md5),
    rxHostsCorrelation(md5),
    txHostsCorrelation(md5)
  ])

  return dispatch(search({id, query: q, from, to, poolId}))
}
