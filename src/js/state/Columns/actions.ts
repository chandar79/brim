import columnKey from "../../lib/columnKey"
import {ColumnName} from "./models/column"
import {
  COLUMNS_HIDE_ALL,
  COLUMNS_SHOW_ALL,
  COLUMNS_UPDATE,
  ColumnUpdates
} from "./types"

function updateColumns(
  tableId: string,
  updates: ColumnUpdates
): COLUMNS_UPDATE {
  return {
    type: "COLUMNS_UPDATE",
    tableId,
    updates
  }
}

const hideColumn = (tableId: string, column: ColumnName): COLUMNS_UPDATE =>
  updateColumns(tableId, {
    [columnKey(column)]: {
      isVisible: false
    }
  })

const showColumn = (tableId: string, column: ColumnName): COLUMNS_UPDATE =>
  updateColumns(tableId, {
    [columnKey(column)]: {
      isVisible: true
    }
  })

const showAllColumns = (tableId: string): COLUMNS_SHOW_ALL => {
  return {
    type: "COLUMNS_SHOW_ALL",
    tableId
  }
}

const hideAllColumns = (tableId: string): COLUMNS_HIDE_ALL => {
  return {
    type: "COLUMNS_HIDE_ALL",
    tableId
  }
}

export default {
  updateColumns,
  hideColumn,
  showColumn,
  showAllColumns,
  hideAllColumns
}
