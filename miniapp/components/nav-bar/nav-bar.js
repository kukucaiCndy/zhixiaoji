var theme = require('../../utils/theme');

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

  data: {
    theme: 'light'
  },

  lifetimes: {
    attached() {
      this.setData({ theme: theme.getEffectiveTheme() });
    }
  },

  pageLifetimes: {
    show() {
      this.setData({ theme: theme.getEffectiveTheme() });
    }
  },

  methods: {
    onBackTap() {
      this.triggerEvent('backtap');
      wx.navigateBack({ delta: 1 });
    },

    onThemeChange(effective) {
      this.setData({ theme: effective });
    }
  }
});
