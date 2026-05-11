Component({
  properties: {
    activeIndex: {
      type: Number,
      value: 0
    }
  },

  data: {
    tabRoutes: [
      '/pages/home/home',
      '/pages/learn/learn',
      '/pages/note/note',
      '/pages/profile/profile'
    ]
  },

  methods: {
    onTabTap(e) {
      const index = e.currentTarget.dataset.index;
      
      // 如果点击的是当前页面，不执行跳转
      if (index === this.data.activeIndex) {
        return;
      }

      // 触发父组件事件
      this.triggerEvent('change', { index });

      // 执行页面跳转
      const url = this.data.tabRoutes[index];
      if (url) {
        wx.switchTab({
          url: url,
          fail: () => {
            // 如果 switchTab 失败（页面未在 app.json 中配置为 tabBar），使用 navigateTo
            wx.navigateTo({ url });
          }
        });
      }
    }
  }
});
