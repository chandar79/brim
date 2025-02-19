import {SearchRecord} from "../../types"
import {Thunk} from "../types"
import Search from "./"
import SearchBar from "../SearchBar"

export default {
  restore(record: SearchRecord): Thunk {
    return function(dispatch) {
      dispatch(
        SearchBar.restoreSearchBar({
          current: record.program,
          pinned: record.pins,
          error: null
        })
      )
      dispatch(Search.setSpanArgs(record.spanArgs))
    }
  }
}
