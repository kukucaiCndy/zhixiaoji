Page({
  data: {
    message: '欢迎使用智晓记'
  },
  onLoad() {
    console.log('Index page loaded')
  },
  testButton ()
    {
      console.log("1111111111111");
      //API请求
      //获取到返回值
      //this.setData({message:"返回值"});
      this.setData({message:"test"});
    }
})