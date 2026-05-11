Page({
  data: {},

  onBack() {
    wx.navigateBack();
  },

  onEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit-profile/edit-profile'
    });
  },

  onSetting(e) {
    const action = e.currentTarget.dataset.action;
    const routes = {
      'wechat-bind': '/pages/settings/wechat-bind/wechat-bind',
      'phone-bind': '/pages/settings/phone-bind/phone-bind',
      'change-password': '/pages/settings/change-password/change-password',
      'wechat-auth': '/pages/settings/wechat-auth/wechat-auth',
      'account-delete': '/pages/settings/account-delete/account-delete'
    };
    const url = routes[action];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  }
});