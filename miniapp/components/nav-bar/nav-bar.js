Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onBackTap() {
      this.triggerEvent('backtap');
      wx.navigateBack({ delta: 1 });
    }
  }
});
