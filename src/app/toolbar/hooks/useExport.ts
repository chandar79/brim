import {useDispatch} from "react-redux"
import Modal from "src/js/state/Modal"
import {ActionButtonProps} from "../action-button"

export default function useExport(): ActionButtonProps {
  const dispatch = useDispatch()

  return {
    label: "Export",
    title: "Export search results to file",
    icon: "export",
    click: () => dispatch(Modal.show("export"))
  }
}
