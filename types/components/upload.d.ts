import { RenderFunction, SetupContext, Ref, ComponentPublicInstance, DefineComponent } from 'vue'
import { defineVxeComponent, VxeComponentBaseOptions, VxeComponentEventParams, ValueOf } from '@vxe-ui/core'

/* eslint-disable no-use-before-define,@typescript-eslint/ban-types */

export declare const VxeUpload: defineVxeComponent<VxeUploadProps, VxeUploadEventProps, VxeUploadSlots>
export type VxeUploadComponent = DefineComponent<VxeUploadProps, VxeUploadEmits>

export type VxeUploadInstance = ComponentPublicInstance<VxeUploadProps, VxeUploadConstructor>

export interface VxeUploadConstructor extends VxeComponentBaseOptions, VxeUploadMethods {
  props: VxeUploadProps
  context: SetupContext<VxeUploadEmits>
  reactData: UploadReactData
  getRefMaps(): UploadPrivateRef
  getComputeMaps(): UploadPrivateComputed
  renderVN: RenderFunction
}

export interface UploadPrivateRef {
  refElem: Ref<HTMLDivElement | undefined>
}
export interface VxeUploadPrivateRef extends UploadPrivateRef { }

export namespace VxeUploadPropTypes {
  export type ModelValue = VxeUploadDefines.FileObjItem | VxeUploadDefines.FileObjItem[] | string | string[]
  export type Size = VxeComponentSizeType
  export type ShowList = boolean
  export type Mode = null | '' | 'all' | 'image'
  export type Readonly = boolean
  export type Disabled = boolean
  export type ImageTypes = string[]
  export interface ImageStyle {
    width?: number | string
    height?: number | string
  }
  export type FileTypes = string[]
  export type SingleMode = boolean
  export type UrlMode = boolean
  export type Multiple = boolean
  export type LimitSize = number | string
  export type LimitCount = number | string
  export type NameField = string
  export type TypeField = string
  export type UrlField = string
  export type SizeField = string
  export type TipText = string
  export type ButtonText = string
  export type ButtonIcon = string
  export type ShowButtonText = boolean
  export type ShowButtonIcon = boolean
  export type ShowRemoveButton = boolean
  export type ShowErrorStatus = boolean
  export type ShowProgress = boolean
  export type AutoHiddenButton = boolean
  export type UploadMethod = undefined | ((params: {
    $upload: VxeUploadConstructor
    file: File,
    option: VxeUploadDefines.FileObjItem
    updateProgress: (percentNum: number) => void
  }) => Promise<any>)
  export type RemoveMethod = undefined | ((params: {
    $upload: VxeUploadConstructor
    option: VxeUploadDefines.FileObjItem
  }) => Promise<any>)
  export type GetUrlMethod = undefined | ((params: {
    $upload: VxeUploadConstructor
    option: VxeUploadDefines.FileObjItem
  }) => string)

  /**
   * 已废弃，请使用 TipText
   * @deprecated
   */
  export type HintText = string
}

export type VxeUploadProps = {
  modelValue?: VxeUploadPropTypes.ModelValue
  size?: VxeUploadPropTypes.Size
  showList?: VxeUploadPropTypes.ShowList
  mode?: VxeUploadPropTypes.Mode
  readonly?: VxeUploadPropTypes.Readonly
  disabled?: VxeUploadPropTypes.Disabled
  imageTypes?: VxeUploadPropTypes.ImageTypes
  imageStyle?: VxeUploadPropTypes.ImageStyle
  fileTypes?: VxeUploadPropTypes.FileTypes
  multiple?: VxeUploadPropTypes.Multiple
  singleMode?: VxeUploadPropTypes.SingleMode
  urlMode?: VxeUploadPropTypes.UrlMode
  /**
   * 限制文件大小，单位M
   */
  limitSize?: VxeUploadPropTypes.LimitSize
  limitCount?: VxeUploadPropTypes.LimitCount
  nameField?: VxeUploadPropTypes.NameField
  typeField?: VxeUploadPropTypes.TypeField
  urlField?: VxeUploadPropTypes.UrlField
  sizeField?: VxeUploadPropTypes.SizeField
  buttonText?: VxeUploadPropTypes.ButtonText
  buttonIcon?: VxeUploadPropTypes.ButtonIcon
  showButtonText?: VxeUploadPropTypes.ShowButtonText
  showButtonIcon?: VxeUploadPropTypes.ShowButtonIcon
  showRemoveButton?: VxeUploadPropTypes.ShowRemoveButton
  showErrorStatus?: VxeUploadPropTypes.ShowErrorStatus
  showProgress?: VxeUploadPropTypes.ShowProgress
  autoHiddenButton?: VxeUploadPropTypes.AutoHiddenButton
  tipText?: VxeUploadPropTypes.TipText
  uploadMethod?: VxeUploadPropTypes.UploadMethod
  removeMethod?: VxeUploadPropTypes.RemoveMethod
  getUrlMethod?: VxeUploadPropTypes.GetUrlMethod

  /**
   * 已废弃，请使用 tipText
   * @deprecated
   */
  hintText?: VxeUploadPropTypes.HintText
}

export interface UploadPrivateComputed {
}
export interface VxeUploadPrivateComputed extends UploadPrivateComputed { }

export interface UploadReactData {
  isDrag: boolean
  fileList: VxeUploadDefines.FileObjItem[]
}

export interface UploadMethods {
  dispatchEvent(type: ValueOf<VxeUploadEmits>, params: Record<string, any>, evnt: Event | null): void
}
export interface VxeUploadMethods extends UploadMethods { }

export interface UploadPrivateMethods { }
export interface VxeUploadPrivateMethods extends UploadPrivateMethods { }

export type VxeUploadEmits = [
  'update:modelValue',
  'add',
  'remove',
  'upload-success',
  'upload-error'
]

export namespace VxeUploadDefines {
  export interface UploadEventParams extends VxeComponentEventParams {
    $upload: VxeUploadConstructor
  }

  export type SaveFileFunction = (options: {
    filename: string
    type: string
    content: string | Blob
  } | {
    filename: string
    type?: string
    content: Blob
  }) => Promise<any>

  export type ReadFileFunction = (options?: {
    multiple?: boolean
    types?: string[]
    message?: boolean
  }) => Promise<{
    status: boolean
    files: File[]
    file: File
  }>

  export interface FileObjItem {
    _X_DATA?: {
      k?: string | number
      f: File,
      l?: boolean
      s?: string
      p?: number
    }

    [key: string]: any
  }

  export interface AddParams {
    option: VxeUploadDefines.FileObjItem
  }
  export interface AddEventParams extends UploadEventParams, AddParams { }

  export interface RemoveEventParams extends UploadEventParams {
    option: VxeUploadDefines.FileObjItem
  }

  export interface UploadSuccessEventParams extends UploadEventParams {
    option: VxeUploadDefines.FileObjItem
    data: any
  }

  export interface UploadErrorEventParams extends UploadSuccessEventParams {}
}

export type VxeUploadEventProps = {
  onAdd?: VxeUploadEvents.Add
  onRemove?: VxeUploadEvents.Remove
  onUploadSuccess?: VxeUploadEvents.UploadSuccess
  onUploadError?: VxeUploadEvents.UploadError
}

export interface VxeUploadListeners {
  add?: VxeUploadEvents.Add
  remove?: VxeUploadEvents.Remove
  uploadSuccess?: VxeUploadEvents.UploadSuccess
  uploadError?: VxeUploadEvents.UploadError
}

export namespace VxeUploadEvents {
  export type Add = (params: VxeUploadDefines.AddEventParams) => void
  export type Remove = (params: VxeUploadDefines.RemoveEventParams) => void
  export type UploadSuccess = (params: VxeUploadDefines.UploadSuccessEventParams) => void
  export type UploadError = (params: VxeUploadDefines.UploadErrorEventParams) => void
}

export namespace VxeUploadSlotTypes {
  export interface DefaultSlotParams {}
}

export interface VxeUploadSlots {
  default: (params: VxeUploadSlotTypes.DefaultSlotParams) => any
  tip: (params: VxeUploadSlotTypes.DefaultSlotParams) => any
}

export const Upload: typeof VxeUpload
export default VxeUpload
