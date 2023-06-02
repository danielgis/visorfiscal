define(['dojo/_base/declare', 'jimu/BaseWidgetSetting'], function (declare, BaseWidgetSetting) {
  return declare([BaseWidgetSetting], {
    baseClass: 'carto-maintenance-wgt-setting',

    postCreate: function postCreate() {
      // the config object is passed in
      this.setConfig(this.config);
    },
    setConfig: function setConfig(config) {
      this.text1Node.value = config.reasignacionUrl;
      this.text2Node.value = config.acumulacionUrl;
      this.text3Node.value = config.subdivisionUrl;
      this.text4Node.value = config.inactivacionUrl;
      this.text5Node.value = config.applicationListUrl;
      this.text6Node.value = config.landsByApplicationUrl;
      this.text7Node.value = config.observationUrl;
      this.text8Node.value = config.resultsByApplication;
      this.text9Node.value = config.updateStatusApplication;
    },
    getConfig: function getConfig() {
      // WAB will get config object through this method
      return {
        reasignacionUrl: this.text1Node.value,
        acumulacionUrl: this.text2Node.value,
        subdivisionUrl: this.text3Node.value,
        inactivacionUrl: this.text4Node.value,
        applicationListUrl: this.text5Node.value,
        landsByApplicationUrl: this.text6Node.value,
        observationUrl: this.text7Node.value,
        resultsByApplication: this.text8Node.value,
        updateStatusApplication: this.text9Node.value
      };
    }
  });
});
//# sourceMappingURL=Setting.js.map
