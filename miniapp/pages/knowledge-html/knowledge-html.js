Page({
  data: {
    url: ''
  },

  onLoad(options) {
    var url = options.url ? decodeURIComponent(options.url) : '';
    this.setData({ url: url });
  }
});
