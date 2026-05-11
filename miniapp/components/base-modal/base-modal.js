Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '' },
    icon: { type: String, value: '' },
    showCancel: { type: Boolean, value: false },
    showConfirm: { type: Boolean, value: true },
    cancelText: { type: String, value: '知道了' },
    confirmText: { type: String, value: '去查看' },
    confirmType: { type: String, value: 'primary' }
  },
  methods: {
    onClose() {
      this.triggerEvent('close')
    },
    onCancel() {
      this.triggerEvent('cancel')
    },
    onConfirm() {
      this.triggerEvent('confirm')
    },
    noop() {}
  }
})
