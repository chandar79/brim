import {createInvestigationTree} from "./helpers"
import brim from "src/js/brim"
import {Finding} from "src/js/state/Investigation/types"

function search(pins, program): Finding {
  return {
    ts: brim.time(new Date(0)).toTs(),
    search: {
      pins,
      poolName: "default",
      poolId: "defaultId",
      program,
      spanArgs: brim.dateTuple([new Date(1), new Date(2)]).toSpan(),
      target: "events"
    }
  }
}

test("Remove all pins and make a new current", () => {
  const tree = createInvestigationTree([
    search(["a", "b"], "c"),
    search(["a", "b"], "d"),
    search(["a", "b"], "d"),
    search(["a"], "d"),
    search([], "e")
  ])

  expect(tree.model).toMatchSnapshot()
})
