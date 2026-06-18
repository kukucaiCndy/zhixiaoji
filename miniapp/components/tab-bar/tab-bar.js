var theme = require('../../utils/theme');

Component({
  properties: {
    activeIndex: { type: Number, value: 0 }
  },

  data: {
    theme: 'light',
    tabRoutes: [
      '/pages/home/home',
      '/pages/learn/learn',
      '/pages/profile/profile'
    ]
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
    onTabTap(e) {
      var index = e.currentTarget.dataset.index;
      if (index === this.data.activeIndex) return;
      this.triggerEvent('change', index);
      var url = this.data.tabRoutes[index];
      if (url) {
        wx.redirectTo({ url: url });
      }
    },

    onThemeChange(effective) {
      this.setData({ theme: effective });
    }
  }
});
