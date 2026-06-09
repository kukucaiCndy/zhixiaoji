const authService = require('../../../services/auth-service');
const storage = require('../../../utils/storage');

Page({
  data: {
    avatarUrl: '',
    nickname: '',
    canSave: false,
    openid: ''
  },

  onLoad(options) {
    // 获取 openid 用于生成默认昵称
    const userInfo = storage.getUserInfo();
    const openid = userInfo && userInfo.openid ? userInfo.openid : '';
    this.setData({ openid });
  },

  // 选择头像
  onChooseAvatar() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.setData({
          avatarUrl: tempFilePath
        });
        that.checkCanSave();
      }
    });
  },

  // 输入昵称
  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    });
    this.checkCanSave();
  },

  // 检查是否可以保存
  checkCanSave() {
    const { nickname, avatarUrl } = this.data;
    this.setData({
      canSave: nickname.trim().length > 0 || avatarUrl.length > 0
    });
  },

  // 保存用户信息
  onSave() {
    const { nickname, avatarUrl } = this.data;
    
    if (!nickname.trim() && !avatarUrl) {
      wx.showToast({ title: '请至少填写一项', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    // 如果有头像，先上传头像
    if (avatarUrl) {
      this.uploadAvatarAndSave(avatarUrl, nickname.trim());
    } else {
      // 只更新昵称
      this.updateProfile(nickname.trim(), null);
    }
  },

  // 上传头像并保存
  uploadAvatarAndSave(tempPath, nickname) {
    const that = this;
    wx.showLoading({ title: '上传头像中...' });
    var userInfo = storage.getUserInfo();
    var userId = userInfo && userInfo.id;
    authService.uploadAvatar(tempPath, userId).then(function (uploadRes) {
      if (uploadRes.success) {
        that.updateProfile(nickname, uploadRes.data.url);
      } else {
        wx.hideLoading();
        wx.showToast({ title: uploadRes.message || '头像上传失败', icon: 'none' });
      }
    }).catch(function () {
      wx.hideLoading();
      wx.showToast({ title: '头像上传失败', icon: 'none' });
    });
  },

  // 更新用户资料到后端
  updateProfile(nickname, avatarUrl) {
    const that = this;
    const userInfo = storage.getUserInfo();
    const userId = userInfo && userInfo.id;

    if (!userId) {
      wx.hideLoading();
      wx.showToast({ title: '用户ID不存在', icon: 'none' });
      return;
    }

    const updateData = {};
    if (nickname) updateData.nickname = nickname;

    authService.updateUser(userId, updateData)
      .then(function(result) {
        wx.hideLoading();
        if (result.success) {
          getApp().setUserInfo(result.data);
          
          wx.showToast({ title: '保存成功', icon: 'success' });
          getApp().loadUserInfo().then(function () {
            that.goHome();
          });
        } else {
          wx.showToast({ title: result.message || '保存失败', icon: 'none' });
        }
      })
      .catch(function() {
        wx.hideLoading();
        wx.showToast({ title: '网络异常', icon: 'none' });
      });
  },

  // 跳过设置
  onSkip() {
    const { openid } = this.data;
    // 生成默认昵称：用户 + openid前6位
    const defaultNickname = '用户' + (openid ? openid.substring(0, 6) : '000000');
    
    wx.showLoading({ title: '设置中...' });
    
    const userInfo = storage.getUserInfo();
    const userId = userInfo && userInfo.id;
    
    if (userId) {
      authService.updateUser(userId, { nickname: defaultNickname })
        .then(function (result) {
          if (result.success) {
            getApp().setUserInfo(result.data);
          } else {
            var newUserInfo = Object.assign({}, userInfo, { nickname: defaultNickname, avatarUrl: null });
            getApp().setUserInfo(newUserInfo);
          }
        })
        .finally(() => {
          wx.hideLoading();
          this.goHome();
        });
    } else {
      wx.hideLoading();
      this.goHome();
    }
  },

  // 跳转到首页
  goHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
});
