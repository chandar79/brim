import {useDispatch, useSelector} from "react-redux"
import React from "react"
import InvestigationLinear from "../Investigation/InvestigationLinear"
import FilterTree from "../FilterTree"
import {
  ClickRegion,
  DragAnchor,
  SectionContents,
  SectionHeader,
  StyledArrow,
  StyledSection,
  StyledViewSelect,
  Title
} from "./common"
import usePopupMenu from "../hooks/usePopupMenu"
import {capitalize} from "lodash"
import DropdownArrow from "../../icons/DropdownArrow"
import Appearance from "src/js/state/Appearance"

function InvestigationView({view}) {
  switch (view) {
    case "tree":
      return <InvestigationTree />
    case "linear":
      return <InvestigationLinear />
    default:
      return null
  }
}

function InvestigationTree() {
  return <FilterTree />
}

const ViewSelect = () => {
  const dispatch = useDispatch()
  const currentView = useSelector(Appearance.getHistoryView)

  const menu = usePopupMenu([
    {
      label: "Linear",
      click: () => dispatch(Appearance.setHistoryView("linear"))
    },
    {
      label: "Tree",
      click: () => dispatch(Appearance.setHistoryView("tree"))
    }
  ])

  return (
    <StyledViewSelect onClick={menu.onClick}>
      {capitalize(currentView)}
      <DropdownArrow />
    </StyledViewSelect>
  )
}

function HistorySection({isOpen, style, resizeProps, toggleProps}) {
  const view = useSelector(Appearance.getHistoryView)
  return (
    <StyledSection style={style}>
      <DragAnchor {...resizeProps} />
      <SectionHeader>
        <ClickRegion {...toggleProps}>
          <StyledArrow show={isOpen} />
          <Title>History</Title>
        </ClickRegion>
        <ViewSelect />
      </SectionHeader>
      <SectionContents>
        <InvestigationView view={view} />
      </SectionContents>
    </StyledSection>
  )
}

export default HistorySection
