import { RenderFunction, SetupContext, Ref, ComponentPublicInstance, DefineComponent } from 'vue'
import { defineVxeComponent, VxeComponentBaseOptions, VxeComponentEventParams, VxeComponentPermissionCodeType, VxeComponentAlignType, VxeComponentSlotType } from '@vxe-ui/core'

/* eslint-disable no-use-before-define,@typescript-eslint/ban-types */

export declare const VxeTabPane: defineVxeComponent<VxeTabPaneProps, VxeTabPaneEventProps, VxeTabPaneSlots>
export type VxeTabPaneComponent = DefineComponent<VxeTabPaneProps, VxeTabPaneEmits>

export type VxeTabPaneInstance = ComponentPublicInstance<VxeTabPaneProps, VxeTabPaneConstructor>

export interface VxeTabPaneConstructor extends VxeComponentBaseOptions, VxeTabPaneMethods {
  props: VxeTabPaneProps
  context: SetupContext<VxeTabPaneEmits>
  reactData: TabPaneReactData
  getRefMaps(): TabPanePrivateRef
  getComputeMaps(): TabPanePrivateComputed
  renderVN: RenderFunction
}

export interface TabPanePrivateRef {
  refElem: Ref<HTMLDivElement | undefined>
}
export interface VxeTabPanePrivateRef extends TabPanePrivateRef { }

export namespace VxeTabPanePropTypes {
  export type Title = string | number
  export type Name = string | number
  export type Icon = string
  export type TitleWidth = string | number
  export type TitleAlign = VxeComponentAlignType
  export type PermissionCode = VxeComponentPermissionCodeType
}

export type VxeTabPaneProps = {
  title?: VxeTabPanePropTypes.Title
  name?: VxeTabPanePropTypes.Name
  icon?: VxeTabPanePropTypes.Icon
  titleWidth?: VxeTabPanePropTypes.TitleWidth
  titleAlign?: VxeTabPanePropTypes.TitleAlign
  permissionCode?: VxeTabPanePropTypes.PermissionCode

  slots?: {
    tab?: string | ((params: { [key: string]: any }) => VxeComponentSlotType | VxeComponentSlotType[])
    default?: string | ((params: { [key: string]: any }) => VxeComponentSlotType | VxeComponentSlotType[])
  }
}

export interface TabPanePrivateComputed {
}
export interface VxeTabPanePrivateComputed extends TabPanePrivateComputed { }

export interface TabPaneReactData {
}

export interface TabPaneMethods {
}
export interface VxeTabPaneMethods extends TabPaneMethods { }

export interface TabPanePrivateMethods { }
export interface VxeTabPanePrivateMethods extends TabPanePrivateMethods { }

export type VxeTabPaneEmits = []

export namespace VxeTabPaneDefines {
  export interface TabPaneEventParams extends VxeComponentEventParams {
    $tabPane: VxeTabPaneConstructor
  }

  export interface TabConfig extends VxeTabPaneProps {
    id: string
  }
}

export type VxeTabPaneEventProps = {}

export interface VxeTabPaneListeners { }

export namespace VxeTabPaneEvents { }

export namespace VxeTabPaneSlotTypes {
  export interface DefaultSlotParams {}
}

export interface VxeTabPaneSlots {
  tab?: (params: VxeTabPaneSlotTypes.DefaultSlotParams) => any
  default?: (params: VxeTabPaneSlotTypes.DefaultSlotParams) => any
}

export const TabPane: typeof VxeTabPane
export default VxeTabPane
