import { defineComponent, h, Teleport, PropType, ref, Ref, inject, computed, provide, onUnmounted, reactive, nextTick, watch, onMounted, createCommentVNode } from 'vue'
import XEUtils from 'xe-utils'
import { getConfig, getIcon, getI18n, globalEvents, GLOBAL_EVENT_KEYS, createEvent, useSize, VxeComponentSlotType } from '../../ui'
import { getEventTargetNode, getAbsolutePos } from '../../ui/src/dom'
import { getLastZIndex, nextZIndex, getFuncText } from '../../ui/src/utils'
import VxeInputComponent from '../../input/src/input'
import { getSlotVNs } from '../../ui/src/vn'

import type { VxeSelectPropTypes, VxeSelectConstructor, SelectReactData, VxeSelectEmits, VxeInputConstructor, SelectMethods, SelectPrivateRef, VxeSelectMethods, VxeOptgroupProps, VxeOptionProps, VxeTableConstructor, VxeTablePrivateMethods, VxeFormDefines, VxeFormConstructor, VxeFormPrivateMethods } from '../../../types'

function isOptionVisible (option: any) {
  return option.visible !== false
}

function getOptUniqueId () {
  return XEUtils.uniqueId('opt_')
}

export default defineComponent({
  name: 'VxeSelect',
  props: {
    modelValue: [String, Number, Array] as PropType<VxeSelectPropTypes.ModelValue>,
    clearable: Boolean as PropType<VxeSelectPropTypes.Clearable>,
    placeholder: {
      type: String as PropType<VxeSelectPropTypes.Placeholder>,
      default: () => XEUtils.eqNull(getConfig().select.placeholder) ? getI18n('vxe.base.pleaseSelect') : getConfig().select.placeholder
    },
    readonly: {
      type: Boolean as PropType<VxeSelectPropTypes.Readonly>,
      default: null
    },
    loading: Boolean as PropType<VxeSelectPropTypes.Loading>,
    disabled: {
      type: Boolean as PropType<VxeSelectPropTypes.Disabled>,
      default: null
    },
    multiple: Boolean as PropType<VxeSelectPropTypes.Multiple>,
    multiCharOverflow: { type: [Number, String] as PropType<VxeSelectPropTypes.MultiCharOverflow>, default: () => getConfig().select.multiCharOverflow },
    prefixIcon: String as PropType<VxeSelectPropTypes.PrefixIcon>,
    placement: String as PropType<VxeSelectPropTypes.Placement>,
    options: Array as PropType<VxeSelectPropTypes.Options>,
    optionProps: Object as PropType<VxeSelectPropTypes.OptionProps>,
    optionGroups: Array as PropType<VxeSelectPropTypes.OptionGroups>,
    optionGroupProps: Object as PropType<VxeSelectPropTypes.OptionGroupProps>,
    optionConfig: Object as PropType<VxeSelectPropTypes.OptionConfig>,
    className: [String, Function] as PropType<VxeSelectPropTypes.ClassName>,
    popupClassName: [String, Function] as PropType<VxeSelectPropTypes.PopupClassName>,
    max: { type: [String, Number] as PropType<VxeSelectPropTypes.Max>, default: null },
    size: { type: String as PropType<VxeSelectPropTypes.Size>, default: () => getConfig().select.size || getConfig().size },
    filterable: Boolean as PropType<VxeSelectPropTypes.Filterable>,
    filterMethod: Function as PropType<VxeSelectPropTypes.FilterMethod>,
    remote: Boolean as PropType<VxeSelectPropTypes.Remote>,
    remoteMethod: Function as PropType<VxeSelectPropTypes.RemoteMethod>,
    emptyText: String as PropType<VxeSelectPropTypes.EmptyText>,
    // 已废弃，被 option-config.keyField 替换
    optionId: { type: String as PropType<VxeSelectPropTypes.OptionId>, default: () => getConfig().select.optionId },
    // 已废弃，被 option-config.useKey 替换
    optionKey: Boolean as PropType<VxeSelectPropTypes.OptionKey>,
    transfer: {
      type: Boolean as PropType<VxeSelectPropTypes.Transfer>,
      default: null
    }
  },
  emits: [
    'update:modelValue',
    'change',
    'clear',
    'blur',
    'focus'
  ] as VxeSelectEmits,
  setup (props, context) {
    const { slots, emit } = context

    const $xeTable = inject<VxeTableConstructor & VxeTablePrivateMethods | null>('$xeTable', null)
    const $xeForm = inject<VxeFormConstructor & VxeFormPrivateMethods | null>('$xeForm', null)
    const formItemInfo = inject<VxeFormDefines.ProvideItemInfo | null>('xeFormItemInfo', null)

    const xID = XEUtils.uniqueId()

    const { computeSize } = useSize(props)

    const reactData = reactive<SelectReactData>({
      initialized: false,
      staticOptions: [],
      fullGroupList: [],
      fullOptionList: [],
      visibleGroupList: [],
      visibleOptionList: [],
      remoteValueList: [],
      panelIndex: 0,
      panelStyle: {},
      panelPlacement: null,
      currentOption: null,
      currentValue: null,
      visiblePanel: false,
      animatVisible: false,
      isActivated: false,
      searchValue: '',
      searchLoading: false
    })

    const refElem = ref() as Ref<HTMLDivElement>
    const refInput = ref() as Ref<VxeInputConstructor>
    const refInpSearch = ref() as Ref<VxeInputConstructor>
    const refOptionWrapper = ref() as Ref<HTMLDivElement>
    const refOptionPanel = ref() as Ref<HTMLDivElement>

    const refMaps: SelectPrivateRef = {
      refElem
    }

    const $xeSelect = {
      xID,
      props,
      context,
      reactData,
      getRefMaps: () => refMaps
    } as unknown as VxeSelectConstructor & VxeSelectMethods

    let selectMethods = {} as SelectMethods

    const computeFormReadonly = computed(() => {
      const { readonly } = props
      if (readonly === null) {
        if ($xeForm) {
          return $xeForm.props.readonly
        }
        return false
      }
      return readonly
    })

    const computeIsDisabled = computed(() => {
      const { disabled } = props
      if (disabled === null) {
        if ($xeForm) {
          return $xeForm.props.disabled
        }
        return false
      }
      return disabled
    })

    const computeTransfer = computed(() => {
      const { transfer } = props
      if (transfer === null) {
        const globalTransfer = getConfig().select.transfer
        if (XEUtils.isBoolean(globalTransfer)) {
          return globalTransfer
        }
        if ($xeTable || $xeForm) {
          return true
        }
      }
      return transfer
    })

    const computePropsOpts = computed(() => {
      return props.optionProps || {}
    })

    const computeGroupPropsOpts = computed(() => {
      return props.optionGroupProps || {}
    })

    const computeLabelField = computed(() => {
      const propsOpts = computePropsOpts.value
      return propsOpts.label || 'label'
    })

    const computeValueField = computed(() => {
      const propsOpts = computePropsOpts.value
      return propsOpts.value || 'value'
    })

    const computeGroupLabelField = computed(() => {
      const groupPropsOpts = computeGroupPropsOpts.value
      return groupPropsOpts.label || 'label'
    })

    const computeGroupOptionsField = computed(() => {
      const groupPropsOpts = computeGroupPropsOpts.value
      return groupPropsOpts.options || 'options'
    })

    const computeIsMaximize = computed(() => {
      const { modelValue, multiple, max } = props
      if (multiple && max) {
        return (modelValue ? modelValue.length : 0) >= XEUtils.toNumber(max)
      }
      return false
    })

    const computeOptionOpts = computed(() => {
      return Object.assign({}, getConfig().select.optionConfig, props.optionConfig)
    })

    const computeIsGroup = computed(() => {
      return reactData.fullGroupList.some((item) => item.options && item.options.length)
    })

    const computeMultiMaxCharNum = computed(() => {
      return XEUtils.toNumber(props.multiCharOverflow)
    })

    const callSlot = <T>(slotFunc: ((params: T) => VxeComponentSlotType | VxeComponentSlotType[]) | string | null, params: T) => {
      if (slotFunc) {
        if (XEUtils.isString(slotFunc)) {
          slotFunc = slots[slotFunc] || null
        }
        if (XEUtils.isFunction(slotFunc)) {
          return getSlotVNs(slotFunc(params))
        }
      }
      return []
    }

    const findOption = (optionValue: any) => {
      const { fullOptionList, fullGroupList } = reactData
      const isGroup = computeIsGroup.value
      const valueField = computeValueField.value as 'value'
      if (isGroup) {
        for (let gIndex = 0; gIndex < fullGroupList.length; gIndex++) {
          const group = fullGroupList[gIndex]
          if (group.options) {
            for (let index = 0; index < group.options.length; index++) {
              const option = group.options[index]
              if (optionValue === option[valueField]) {
                return option
              }
            }
          }
        }
      }
      return fullOptionList.find((item) => optionValue === item[valueField])
    }

    const findVisibleOption = (optionValue: any) => {
      const { visibleOptionList, visibleGroupList } = reactData
      const isGroup = computeIsGroup.value
      const valueField = computeValueField.value as 'value'
      if (isGroup) {
        for (let gIndex = 0; gIndex < visibleGroupList.length; gIndex++) {
          const group = visibleGroupList[gIndex]
          if (group.options) {
            for (let index = 0; index < group.options.length; index++) {
              const option = group.options[index]
              if (optionValue === option[valueField]) {
                return option
              }
            }
          }
        }
      }
      return visibleOptionList.find((item) => optionValue === item[valueField])
    }

    const getRemoteSelectLabel = (value: any) => {
      const { remoteValueList } = reactData
      const labelField = computeLabelField.value
      const remoteItem = remoteValueList.find(item => value === item.key)
      const item = remoteItem ? remoteItem.result : null
      return XEUtils.toValueString(item ? item[labelField] : value)
    }

    const getSelectLabel = (value: any) => {
      const labelField = computeLabelField.value
      const item = findOption(value)
      return XEUtils.toValueString(item ? item[labelField as 'label'] : value)
    }

    const computeSelectLabel = computed(() => {
      const { modelValue, multiple, remote } = props
      const multiMaxCharNum = computeMultiMaxCharNum.value
      if (modelValue && multiple) {
        const vals = XEUtils.isArray(modelValue) ? modelValue : [modelValue]
        if (remote) {
          return vals.map(val => getRemoteSelectLabel(val)).join(', ')
        }
        return vals.map((val) => {
          const label = getSelectLabel(val)
          if (multiMaxCharNum > 0 && label.length > multiMaxCharNum) {
            return `${label.substring(0, multiMaxCharNum)}...`
          }
          return label
        }).join(', ')
      }
      if (remote) {
        return getRemoteSelectLabel(modelValue)
      }
      return getSelectLabel(modelValue)
    })

    const getOptkey = () => {
      const optionOpts = computeOptionOpts.value
      return optionOpts.keyField || props.optionId || '_X_OPTION_KEY'
    }

    const getOptid = (option: any) => {
      const optid = option[getOptkey()]
      return optid ? encodeURIComponent(optid) : ''
    }

    /**
     * 刷新选项，当选项被动态显示/隐藏时可能会用到
     */
    const refreshOption = () => {
      const { filterable, filterMethod } = props
      const { fullOptionList, fullGroupList, searchValue } = reactData
      const isGroup = computeIsGroup.value
      const groupLabelField = computeGroupLabelField.value
      const labelField = computeLabelField.value
      if (isGroup) {
        if (filterable && filterMethod) {
          reactData.visibleGroupList = fullGroupList.filter(group => isOptionVisible(group) && filterMethod({ group, option: null, searchValue }))
        } else if (filterable) {
          reactData.visibleGroupList = fullGroupList.filter(group => isOptionVisible(group) && (!searchValue || `${group[groupLabelField]}`.indexOf(searchValue) > -1))
        } else {
          reactData.visibleGroupList = fullGroupList.filter(isOptionVisible)
        }
      } else {
        if (filterable && filterMethod) {
          reactData.visibleOptionList = fullOptionList.filter(option => isOptionVisible(option) && filterMethod({ group: null, option, searchValue }))
        } else if (filterable) {
          reactData.visibleOptionList = fullOptionList.filter(option => isOptionVisible(option) && (!searchValue || `${option[labelField]}`.indexOf(searchValue) > -1))
        } else {
          reactData.visibleOptionList = fullOptionList.filter(isOptionVisible)
        }
      }
      return nextTick()
    }

    const cacheItemMap = () => {
      const { fullOptionList, fullGroupList } = reactData
      const groupOptionsField = computeGroupOptionsField.value
      const key = getOptkey()
      const handleOptis = (item: any) => {
        if (!getOptid(item)) {
          item[key] = getOptUniqueId()
        }
      }
      if (fullGroupList.length) {
        fullGroupList.forEach((group: any) => {
          handleOptis(group)
          if (group[groupOptionsField]) {
            group[groupOptionsField].forEach(handleOptis)
          }
        })
      } else if (fullOptionList.length) {
        fullOptionList.forEach(handleOptis)
      }
      refreshOption()
    }

    const setCurrentOption = (option: any) => {
      const valueField = computeValueField.value
      if (option) {
        reactData.currentOption = option
        reactData.currentValue = option[valueField]
      }
    }

    const scrollToOption = (option: any, isAlignBottom?: boolean) => {
      return nextTick().then(() => {
        if (option) {
          const optWrapperElem = refOptionWrapper.value
          const panelElem = refOptionPanel.value
          const optElem = panelElem.querySelector(`[optid='${getOptid(option)}']`) as HTMLElement
          if (optWrapperElem && optElem) {
            const wrapperHeight = optWrapperElem.offsetHeight
            const offsetPadding = 5
            if (isAlignBottom) {
              if (optElem.offsetTop + optElem.offsetHeight - optWrapperElem.scrollTop > wrapperHeight) {
                optWrapperElem.scrollTop = optElem.offsetTop + optElem.offsetHeight - wrapperHeight
              }
            } else {
              if (optElem.offsetTop + offsetPadding < optWrapperElem.scrollTop || optElem.offsetTop + offsetPadding > optWrapperElem.scrollTop + optWrapperElem.clientHeight) {
                optWrapperElem.scrollTop = optElem.offsetTop - offsetPadding
              }
            }
          }
        }
      })
    }

    const updateZindex = () => {
      if (reactData.panelIndex < getLastZIndex()) {
        reactData.panelIndex = nextZIndex()
      }
    }

    const updatePlacement = () => {
      return nextTick().then(() => {
        const { placement } = props
        const { panelIndex } = reactData
        const el = refElem.value
        const panelElem = refOptionPanel.value
        const transfer = computeTransfer.value
        if (panelElem && el) {
          const targetHeight = el.offsetHeight
          const targetWidth = el.offsetWidth
          const panelHeight = panelElem.offsetHeight
          const panelWidth = panelElem.offsetWidth
          const marginSize = 5
          const panelStyle: { [key: string]: any } = {
            zIndex: panelIndex
          }
          const { boundingTop, boundingLeft, visibleHeight, visibleWidth } = getAbsolutePos(el)
          let panelPlacement = 'bottom'
          if (transfer) {
            let left = boundingLeft
            let top = boundingTop + targetHeight
            if (placement === 'top') {
              panelPlacement = 'top'
              top = boundingTop - panelHeight
            } else if (!placement) {
              // 如果下面不够放，则向上
              if (top + panelHeight + marginSize > visibleHeight) {
                panelPlacement = 'top'
                top = boundingTop - panelHeight
              }
              // 如果上面不够放，则向下（优先）
              if (top < marginSize) {
                panelPlacement = 'bottom'
                top = boundingTop + targetHeight
              }
            }
            // 如果溢出右边
            if (left + panelWidth + marginSize > visibleWidth) {
              left -= left + panelWidth + marginSize - visibleWidth
            }
            // 如果溢出左边
            if (left < marginSize) {
              left = marginSize
            }
            Object.assign(panelStyle, {
              left: `${left}px`,
              top: `${top}px`,
              minWidth: `${targetWidth}px`
            })
          } else {
            if (placement === 'top') {
              panelPlacement = 'top'
              panelStyle.bottom = `${targetHeight}px`
            } else if (!placement) {
              // 如果下面不够放，则向上
              if (boundingTop + targetHeight + panelHeight > visibleHeight) {
                // 如果上面不够放，则向下（优先）
                if (boundingTop - targetHeight - panelHeight > marginSize) {
                  panelPlacement = 'top'
                  panelStyle.bottom = `${targetHeight}px`
                }
              }
            }
          }
          reactData.panelStyle = panelStyle
          reactData.panelPlacement = panelPlacement
          return nextTick()
        }
      })
    }

    let hidePanelTimeout: number

    const showOptionPanel = () => {
      const { loading, filterable } = props
      const isDisabled = computeIsDisabled.value
      if (!loading && !isDisabled) {
        clearTimeout(hidePanelTimeout)
        if (!reactData.initialized) {
          reactData.initialized = true
        }
        reactData.isActivated = true
        reactData.animatVisible = true
        if (filterable) {
          refreshOption()
        }
        setTimeout(() => {
          const { modelValue, multiple } = props
          const currOption = findOption(multiple && modelValue ? modelValue[0] : modelValue)
          reactData.visiblePanel = true
          if (currOption) {
            setCurrentOption(currOption)
            scrollToOption(currOption)
          }
          handleFocusSearch()
        }, 10)
        updateZindex()
        updatePlacement()
      }
    }

    const hideOptionPanel = () => {
      reactData.searchValue = ''
      reactData.searchLoading = false
      reactData.visiblePanel = false
      hidePanelTimeout = window.setTimeout(() => {
        reactData.animatVisible = false
      }, 350)
    }

    const changeEvent = (evnt: Event, selectValue: any) => {
      if (selectValue !== props.modelValue) {
        emit('update:modelValue', selectValue)
        selectMethods.dispatchEvent('change', { value: selectValue }, evnt)
        // 自动更新校验状态
        if ($xeForm && formItemInfo) {
          $xeForm.triggerItemEvent(evnt, formItemInfo.itemConfig.field, selectValue)
        }
      }
    }

    const clearValueEvent = (evnt: Event, selectValue: any) => {
      reactData.remoteValueList = []
      changeEvent(evnt, selectValue)
      selectMethods.dispatchEvent('clear', { value: selectValue }, evnt)
    }

    const clearEvent = (params: any, evnt: Event) => {
      clearValueEvent(evnt, null)
      hideOptionPanel()
    }

    const changeOptionEvent = (evnt: Event, selectValue: any, option: any) => {
      const { modelValue, multiple } = props
      const { remoteValueList } = reactData
      if (multiple) {
        let multipleValue
        if (modelValue) {
          if (modelValue.indexOf(selectValue) === -1) {
            multipleValue = modelValue.concat([selectValue])
          } else {
            multipleValue = (modelValue as any[]).filter((val) => val !== selectValue)
          }
        } else {
          multipleValue = [selectValue]
        }
        const remoteItem = remoteValueList.find(item => item.key === selectValue)
        if (remoteItem) {
          remoteItem.result = option
        } else {
          remoteValueList.push({ key: selectValue, result: option })
        }
        changeEvent(evnt, multipleValue)
      } else {
        reactData.remoteValueList = [{ key: selectValue, result: option }]
        changeEvent(evnt, selectValue)
        hideOptionPanel()
      }
    }

    const handleGlobalMousewheelEvent = (evnt: MouseEvent) => {
      const { visiblePanel } = reactData
      const isDisabled = computeIsDisabled.value
      if (!isDisabled) {
        if (visiblePanel) {
          const panelElem = refOptionPanel.value
          if (getEventTargetNode(evnt, panelElem).flag) {
            updatePlacement()
          } else {
            hideOptionPanel()
          }
        }
      }
    }

    const handleGlobalMousedownEvent = (evnt: MouseEvent) => {
      const { visiblePanel } = reactData
      const isDisabled = computeIsDisabled.value
      if (!isDisabled) {
        const el = refElem.value
        const panelElem = refOptionPanel.value
        reactData.isActivated = getEventTargetNode(evnt, el).flag || getEventTargetNode(evnt, panelElem).flag
        if (visiblePanel && !reactData.isActivated) {
          hideOptionPanel()
        }
      }
    }

    const findOffsetOption = (optionValue: any, isUpArrow: boolean) => {
      const { visibleOptionList, visibleGroupList } = reactData
      const isGroup = computeIsGroup.value
      const valueField = computeValueField.value as 'value'
      const groupOptionsField = computeGroupOptionsField.value as 'options'
      let firstOption
      let prevOption
      let nextOption
      let currOption
      if (isGroup) {
        for (let gIndex = 0; gIndex < visibleGroupList.length; gIndex++) {
          const group = visibleGroupList[gIndex]
          const groupOptionList = group[groupOptionsField]
          const isGroupDisabled = group.disabled
          if (groupOptionList) {
            for (let index = 0; index < groupOptionList.length; index++) {
              const option = groupOptionList[index]
              const isVisible = isOptionVisible(option)
              const isDisabled = isGroupDisabled || option.disabled
              if (!firstOption && !isDisabled) {
                firstOption = option
              }
              if (currOption) {
                if (isVisible && !isDisabled) {
                  nextOption = option
                  if (!isUpArrow) {
                    return { offsetOption: nextOption }
                  }
                }
              }
              if (optionValue === option[valueField]) {
                currOption = option
                if (isUpArrow) {
                  return { offsetOption: prevOption }
                }
              } else {
                if (isVisible && !isDisabled) {
                  prevOption = option
                }
              }
            }
          }
        }
      } else {
        for (let index = 0; index < visibleOptionList.length; index++) {
          const option = visibleOptionList[index]
          const isDisabled = option.disabled
          if (!firstOption && !isDisabled) {
            firstOption = option
          }
          if (currOption) {
            if (!isDisabled) {
              nextOption = option
              if (!isUpArrow) {
                return { offsetOption: nextOption }
              }
            }
          }
          if (optionValue === option[valueField]) {
            currOption = option
            if (isUpArrow) {
              return { offsetOption: prevOption }
            }
          } else {
            if (!isDisabled) {
              prevOption = option
            }
          }
        }
      }
      return { firstOption }
    }

    const handleGlobalKeydownEvent = (evnt: KeyboardEvent) => {
      const { clearable } = props
      const { visiblePanel, currentValue, currentOption } = reactData
      const isDisabled = computeIsDisabled.value
      if (!isDisabled) {
        const isTab = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.TAB)
        const isEnter = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ENTER)
        const isEsc = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ESCAPE)
        const isUpArrow = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ARROW_UP)
        const isDwArrow = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ARROW_DOWN)
        const isDel = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.DELETE)
        const isSpacebar = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.SPACEBAR)
        if (isTab) {
          reactData.isActivated = false
        }
        if (visiblePanel) {
          if (isEsc || isTab) {
            hideOptionPanel()
          } else if (isEnter) {
            evnt.preventDefault()
            evnt.stopPropagation()
            changeOptionEvent(evnt, currentValue, currentOption)
          } else if (isUpArrow || isDwArrow) {
            evnt.preventDefault()
            let { firstOption, offsetOption } = findOffsetOption(currentValue, isUpArrow)
            if (!offsetOption && !findVisibleOption(currentValue)) {
              offsetOption = firstOption
            }
            setCurrentOption(offsetOption)
            scrollToOption(offsetOption, isDwArrow)
          } else if (isSpacebar) {
            evnt.preventDefault()
          }
        } else if ((isUpArrow || isDwArrow || isEnter || isSpacebar) && reactData.isActivated) {
          evnt.preventDefault()
          showOptionPanel()
        }
        if (reactData.isActivated) {
          if (isDel && clearable) {
            clearValueEvent(evnt, null)
          }
        }
      }
    }

    const handleGlobalBlurEvent = () => {
      hideOptionPanel()
    }

    const handleFocusSearch = () => {
      if (props.filterable) {
        nextTick(() => {
          const inpSearch = refInpSearch.value
          if (inpSearch) {
            inpSearch.focus()
          }
        })
      }
    }

    const focusEvent = (evnt: FocusEvent) => {
      const isDisabled = computeIsDisabled.value
      if (!isDisabled) {
        reactData.isActivated = true
      }
      selectMethods.dispatchEvent('focus', {}, evnt)
    }

    const blurEvent = (evnt: FocusEvent) => {
      reactData.isActivated = false
      selectMethods.dispatchEvent('blur', {}, evnt)
    }

    const modelSearchEvent = (value: string) => {
      reactData.searchValue = value
    }

    const focusSearchEvent = () => {
      reactData.isActivated = true
    }

    const triggerSearchEvent = XEUtils.debounce(function () {
      const { remote, remoteMethod } = props
      const { searchValue } = reactData
      if (remote && remoteMethod) {
        reactData.searchLoading = true
        Promise.resolve(remoteMethod({ searchValue })).then(() => nextTick()).catch(() => nextTick()).finally(() => {
          reactData.searchLoading = false
          refreshOption()
        })
      } else {
        refreshOption()
      }
    }, 350, { trailing: true })

    const togglePanelEvent = (params: any) => {
      const { $event } = params
      $event.preventDefault()
      if (reactData.visiblePanel) {
        hideOptionPanel()
      } else {
        showOptionPanel()
      }
    }

    const checkOptionDisabled = (isSelected: any, option: VxeOptionProps, group?: VxeOptgroupProps) => {
      if (option.disabled) {
        return true
      }
      if (group && group.disabled) {
        return true
      }
      const isMaximize = computeIsMaximize.value
      if (isMaximize && !isSelected) {
        return true
      }
      return false
    }

    const renderOption = (list: VxeOptionProps[], group?: VxeOptgroupProps) => {
      const { optionKey, modelValue, multiple } = props
      const { currentValue } = reactData
      const optionOpts = computeOptionOpts.value
      const labelField = computeLabelField.value
      const valueField = computeValueField.value
      const isGroup = computeIsGroup.value
      const { useKey } = optionOpts
      const optionSlot = slots.option
      return list.map((option, cIndex) => {
        const { slots, className } = option
        const optionValue = option[valueField as 'value']
        const isSelected = multiple ? (modelValue && modelValue.indexOf(optionValue) > -1) : modelValue === optionValue
        const isVisible = !isGroup || isOptionVisible(option)
        const isDisabled = checkOptionDisabled(isSelected, option, group)
        const optid = getOptid(option)
        const defaultSlot = slots ? slots.default : null
        const optParams = { option, group: null, $select: $xeSelect }
        return isVisible
          ? h('div', {
            key: useKey || optionKey ? optid : cIndex,
            class: ['vxe-select-option', className ? (XEUtils.isFunction(className) ? className(optParams) : className) : '', {
              'is--disabled': isDisabled,
              'is--selected': isSelected,
              'is--hover': currentValue === optionValue
            }],
            // attrs
            optid: optid,
            // event
            onMousedown: (evnt: MouseEvent) => {
              const isLeftBtn = evnt.button === 0
              if (isLeftBtn) {
                evnt.stopPropagation()
              }
            },
            onClick: (evnt: MouseEvent) => {
              if (!isDisabled) {
                changeOptionEvent(evnt, optionValue, option)
              }
            },
            onMouseenter: () => {
              if (!isDisabled) {
                setCurrentOption(option)
              }
            }
          }, optionSlot ? callSlot(optionSlot, optParams) : (defaultSlot ? callSlot(defaultSlot, optParams) : getFuncText(option[labelField as 'label'])))
          : createCommentVNode()
      })
    }

    const renderOptgroup = () => {
      const { optionKey } = props
      const { visibleGroupList } = reactData
      const optionOpts = computeOptionOpts.value
      const groupLabelField = computeGroupLabelField.value
      const groupOptionsField = computeGroupOptionsField.value
      const { useKey } = optionOpts
      const optionSlot = slots.option
      return visibleGroupList.map((group, gIndex) => {
        const { slots, className } = group
        const optid = getOptid(group)
        const isGroupDisabled = group.disabled
        const defaultSlot = slots ? slots.default : null
        const optParams = { option: group, group, $select: $xeSelect }
        return h('div', {
          key: useKey || optionKey ? optid : gIndex,
          class: ['vxe-optgroup', className ? (XEUtils.isFunction(className) ? className(optParams) : className) : '', {
            'is--disabled': isGroupDisabled
          }],
          // attrs
          optid: optid
        }, [
          h('div', {
            class: 'vxe-optgroup--title'
          }, optionSlot ? callSlot(optionSlot, optParams) : (defaultSlot ? callSlot(defaultSlot, optParams) : getFuncText(group[groupLabelField as 'label']))),
          h('div', {
            class: 'vxe-optgroup--wrapper'
          }, renderOption(group[groupOptionsField as 'options'] || [], group))
        ])
      })
    }

    const renderOpts = () => {
      const { visibleGroupList, visibleOptionList, searchLoading } = reactData
      const isGroup = computeIsGroup.value
      if (searchLoading) {
        return [
          h('div', {
            class: 'vxe-select--search-loading'
          }, [
            h('i', {
              class: ['vxe-select--search-icon', getIcon().SELECT_LOADED]
            }),
            h('span', {
              class: 'vxe-select--search-text'
            }, getI18n('vxe.select.loadingText'))
          ])
        ]
      }
      if (isGroup) {
        if (visibleGroupList.length) {
          return renderOptgroup()
        }
      } else {
        if (visibleOptionList.length) {
          return renderOption(visibleOptionList)
        }
      }
      return [
        h('div', {
          class: 'vxe-select--empty-placeholder'
        }, props.emptyText || getI18n('vxe.select.emptyText'))
      ]
    }

    selectMethods = {
      dispatchEvent (type, params, evnt) {
        emit(type, createEvent(evnt, { $select: $xeSelect }, params))
      },
      isPanelVisible () {
        return reactData.visiblePanel
      },
      togglePanel () {
        if (reactData.visiblePanel) {
          hideOptionPanel()
        } else {
          showOptionPanel()
        }
        return nextTick()
      },
      hidePanel () {
        if (reactData.visiblePanel) {
          hideOptionPanel()
        }
        return nextTick()
      },
      showPanel () {
        if (!reactData.visiblePanel) {
          showOptionPanel()
        }
        return nextTick()
      },
      refreshOption,
      focus () {
        const $input = refInput.value
        reactData.isActivated = true
        $input.blur()
        return nextTick()
      },
      blur () {
        const $input = refInput.value
        $input.blur()
        reactData.isActivated = false
        return nextTick()
      }
    }

    Object.assign($xeSelect, selectMethods)

    const renderVN = () => {
      const { className, popupClassName, loading, filterable } = props
      const { initialized, isActivated, visiblePanel } = reactData
      const vSize = computeSize.value
      const isDisabled = computeIsDisabled.value
      const selectLabel = computeSelectLabel.value
      const transfer = computeTransfer.value
      const formReadonly = computeFormReadonly.value
      const defaultSlot = slots.default
      const headerSlot = slots.header
      const footerSlot = slots.footer
      const prefixSlot = slots.prefix
      if (formReadonly) {
        return h('div', {
          ref: refElem,
          class: ['vxe-select--readonly', className]
        }, [
          h('div', {
            class: 'vxe-select-slots',
            ref: 'hideOption'
          }, defaultSlot ? defaultSlot({}) : []),
          h('span', {
            class: 'vxe-select-label'
          }, selectLabel)
        ])
      }
      return h('div', {
        ref: refElem,
        class: ['vxe-select', className ? (XEUtils.isFunction(className) ? className({ $select: $xeSelect }) : className) : '', {
          [`size--${vSize}`]: vSize,
          'is--visible': visiblePanel,
          'is--disabled': isDisabled,
          'is--filter': filterable,
          'is--loading': loading,
          'is--active': isActivated
        }]
      }, [
        h('div', {
          class: 'vxe-select-slots',
          ref: 'hideOption'
        }, defaultSlot ? defaultSlot({}) : []),
        h(VxeInputComponent, {
          ref: refInput,
          clearable: props.clearable,
          placeholder: props.placeholder,
          readonly: true,
          disabled: isDisabled,
          type: 'text',
          prefixIcon: props.prefixIcon,
          suffixIcon: loading ? getIcon().SELECT_LOADED : (visiblePanel ? getIcon().SELECT_OPEN : getIcon().SELECT_CLOSE),
          modelValue: selectLabel,
          onClear: clearEvent,
          onClick: togglePanelEvent,
          onFocus: focusEvent,
          onBlur: blurEvent,
          onSuffixClick: togglePanelEvent
        }, prefixSlot
          ? {
              prefix: () => prefixSlot({})
            }
          : {}),
        h(Teleport, {
          to: 'body',
          disabled: transfer ? !initialized : true
        }, [
          h('div', {
            ref: refOptionPanel,
            class: ['vxe-table--ignore-clear vxe-select--panel', popupClassName ? (XEUtils.isFunction(popupClassName) ? popupClassName({ $select: $xeSelect }) : popupClassName) : '', {
              [`size--${vSize}`]: vSize,
              'is--transfer': transfer,
              'animat--leave': !loading && reactData.animatVisible,
              'animat--enter': !loading && visiblePanel
            }],
            placement: reactData.panelPlacement,
            style: reactData.panelStyle
          }, initialized
            ? [
                filterable
                  ? h('div', {
                    class: 'vxe-select--panel-search'
                  }, [
                    h(VxeInputComponent, {
                      ref: refInpSearch,
                      class: 'vxe-select-search--input',
                      modelValue: reactData.searchValue,
                      clearable: true,
                      placeholder: getI18n('vxe.select.search'),
                      prefixIcon: getIcon().INPUT_SEARCH,
                      'onUpdate:modelValue': modelSearchEvent,
                      onFocus: focusSearchEvent,
                      onChange: triggerSearchEvent,
                      onSearch: triggerSearchEvent
                    })
                  ])
                  : createCommentVNode(),
                h('div', {
                  class: 'vxe-select--panel-wrapper'
                }, [
                  headerSlot
                    ? h('div', {
                      class: 'vxe-select--panel-header'
                    }, headerSlot({}))
                    : createCommentVNode(),
                  h('div', {
                    class: 'vxe-select--panel-body'
                  }, [
                    h('div', {
                      ref: refOptionWrapper,
                      class: 'vxe-select-option--wrapper'
                    }, renderOpts())
                  ]),
                  footerSlot
                    ? h('div', {
                      class: 'vxe-select--panel-footer'
                    }, footerSlot({}))
                    : createCommentVNode()
                ])
              ]
            : [])
        ])
      ])
    }

    $xeSelect.renderVN = renderVN

    watch(() => reactData.staticOptions, (value) => {
      if (value.some((item) => item.options && item.options.length)) {
        reactData.fullOptionList = []
        reactData.fullGroupList = value
      } else {
        reactData.fullGroupList = []
        reactData.fullOptionList = value || []
      }
      cacheItemMap()
    })

    watch(() => props.options, (value) => {
      reactData.fullGroupList = []
      reactData.fullOptionList = value || []
      cacheItemMap()
    })

    watch(() => props.optionGroups, (value) => {
      reactData.fullOptionList = []
      reactData.fullGroupList = value || []
      cacheItemMap()
    })

    onMounted(() => {
      nextTick(() => {
        const { options, optionGroups } = props
        if (optionGroups) {
          reactData.fullGroupList = optionGroups
        } else if (options) {
          reactData.fullOptionList = options
        }
        cacheItemMap()
      })
      globalEvents.on($xeSelect, 'mousewheel', handleGlobalMousewheelEvent)
      globalEvents.on($xeSelect, 'mousedown', handleGlobalMousedownEvent)
      globalEvents.on($xeSelect, 'keydown', handleGlobalKeydownEvent)
      globalEvents.on($xeSelect, 'blur', handleGlobalBlurEvent)
    })

    onUnmounted(() => {
      globalEvents.off($xeSelect, 'mousewheel')
      globalEvents.off($xeSelect, 'mousedown')
      globalEvents.off($xeSelect, 'keydown')
      globalEvents.off($xeSelect, 'blur')
    })

    provide('$xeSelect', $xeSelect)

    return $xeSelect
  },
  render () {
    return this.renderVN()
  }
})
