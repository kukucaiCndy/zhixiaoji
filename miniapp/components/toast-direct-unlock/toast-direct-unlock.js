Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {},

  observers: {
    'show'(val) {
      if (val) {
        setTimeout(() => {
          this.setData({ show: false });
          this.triggerEvent('close');
        }, 2000);
      }
    }
  },

  methods: {}
});
