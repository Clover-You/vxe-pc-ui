import { RenderFunction, SetupContext, Ref, ComponentPublicInstance, DefineComponent } from 'vue'
import { defineVxeComponent, VxeComponentBaseOptions, VxeComponentEventParams, VxeComponentSizeType, VxeComponentStatusType, ValueOf } from '@vxe-ui/core'

/* eslint-disable no-use-before-define,@typescript-eslint/ban-types */

export declare const VxeTip: defineVxeComponent<VxeTipProps, VxeTipEventProps, VxeTipSlots>
export type VxeTipComponent = DefineComponent<VxeTipProps, VxeTipEmits>

export type VxeTipInstance = ComponentPublicInstance<VxeTipProps, VxeTipConstructor>

export interface VxeTipConstructor extends VxeComponentBaseOptions, VxeTipMethods {
  props: VxeTipProps
  context: SetupContext<VxeTipEmits>
  reactData: TipReactData
  getRefMaps(): TipPrivateRef
  getComputeMaps(): TipPrivateComputed
  renderVN: RenderFunction
}

export interface TipPrivateRef {
  refElem: Ref<HTMLDivElement | undefined>
}
export interface VxeTipPrivateRef extends TipPrivateRef { }

export namespace VxeTipPropTypes {
  export type Title = string | number
  export type Content = string | number
  export type Status = VxeComponentStatusType
  export type Icon = string
  export type Size = VxeComponentSizeType
}

export type VxeTipProps = {
  title?: VxeTipPropTypes.Title
  content?: VxeTipPropTypes.Content
  status?: VxeTipPropTypes.Status
  icon?: VxeTipPropTypes.Icon
  size?: VxeTipPropTypes.Size
}

export interface TipPrivateComputed {
}
export interface VxeTipPrivateComputed extends TipPrivateComputed { }

export interface TipReactData {
}

export interface TipMethods {
  dispatchEvent(type: ValueOf<VxeTipEmits>, params: Record<string, any>, evnt: Event | null): void
}
export interface VxeTipMethods extends TipMethods { }

export interface TipPrivateMethods { }
export interface VxeTipPrivateMethods extends TipPrivateMethods { }

export type VxeTipEmits = []

export namespace VxeTipDefines {
  export interface TipEventParams extends VxeComponentEventParams {
    $tip: VxeTipConstructor
  }
}

export type VxeTipEventProps = {}

export interface VxeTipListeners { }

export namespace VxeTipEvents { }

export namespace VxeTipSlotTypes {
  export interface DefaultSlotParams {}
}

export interface VxeTipSlots {
  default: (params: VxeTipSlotTypes.DefaultSlotParams) => any
  title: (params: VxeTipSlotTypes.DefaultSlotParams) => any
  icon: (params: VxeTipSlotTypes.DefaultSlotParams) => any
}

export const Tip: typeof VxeTip
export default VxeTip
