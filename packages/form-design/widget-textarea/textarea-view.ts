import { PropType, defineComponent, h, inject } from 'vue'
import { getI18n } from '@vxe-ui/core'
import { WidgetTextareaFormObjVO } from './textarea-data'
import { useWidgetName } from '../../form-design/src/use'
import VxeFormItemComponent from '../../form/src/form-item'

import type { VxeGlobalRendererHandles, VxeFormViewConstructor, VxeFormViewPrivateMethods } from '../../../types'

export const WidgetTextareaViewComponent = defineComponent({
  props: {
    renderOpts: {
      type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewOptions>,
      default: () => ({})
    },
    renderParams: {
      type: Object as PropType<VxeGlobalRendererHandles.RenderFormDesignWidgetViewParams<WidgetTextareaFormObjVO>>,
      default: () => ({})
    }
  },
  emits: [],
  setup (props) {
    const $xeFormView = inject<(VxeFormViewConstructor & VxeFormViewPrivateMethods) | null>('$xeFormView', null)

    const { computeKebabCaseName } = useWidgetName(props)

    const changeEvent = () => {
      const { renderParams } = props
      const { widget } = renderParams
      if ($xeFormView) {
        const itemValue = $xeFormView ? $xeFormView.getItemValue(widget) : null
        $xeFormView.updateItemStatus(widget, itemValue)
      }
    }

    return () => {
      const { renderParams } = props
      const { widget } = renderParams
      const { options } = widget
      const kebabCaseName = computeKebabCaseName.value

      return h(VxeFormItemComponent, {
        class: ['vxe-form-design--widget-render-form-item', `widget-${kebabCaseName}`],
        title: widget.title,
        field: widget.field
      }, {
        default () {
          return h('textarea', {
            class: 'vxe-default-textarea',
            placeholder: options.placeholder || getI18n('vxe.base.pleaseInput'),
            value: $xeFormView ? $xeFormView.getItemValue(widget) : null,
            onChange: changeEvent,
            onInput (evnt: InputEvent & { target: HTMLTextAreaElement }) {
              if ($xeFormView) {
                $xeFormView.setItemValue(widget, evnt.target.value)
              }
            }
          })
        }
      })
    }
  }
})
