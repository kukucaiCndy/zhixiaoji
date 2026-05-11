Component({
  properties: {
    show: { type: Boolean, value: false },
    // 弹窗结构模式: icon/title/desc/score/text
    icon: { type: String, value: '' },
    iconBg: { type: Boolean, value: false },
    title: { type: String, value: '' },
    desc: { type: String, value: '' },
    // 大数字显示
    score: { type: String, value: '' },
    scoreLabel: { type: String, value: '' },
    scoreColor: { type: String, value: '#F59E0B' },
    // 中间富文本（JSON数组，每个元素为{text, color, bold}）
    richText: { type: Array, value: [] },
    // 按钮配置
    singleBtn: { type: Boolean, value: false },
    primaryText: { type: String, value: '' },
    primaryType: { type: String, value: 'primary' },
    secondaryText: { type: String, value: '' },
    maskClosable: { type: Boolean, value: false },
    // 稀有度标签
    rarity: { type: String, value: '' },
    contentName: { type: String, value: '' }
  },
  data: {
    rarityMap: { common: '普通', advanced: '进阶', high: '高级', legend: '传说' }
  },
  methods: {
    onPrimary() { this.triggerEvent('primary') },
    onSecondary() { this.triggerEvent('secondary') },
    noop() {}
  }
})
