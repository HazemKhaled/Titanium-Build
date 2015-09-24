var apd = require('atom-package-dependencies'),
  _ = require('underscore');

// install missing packages
apd.install();

module.exports = {
  activate: function() {
    atom.commands.add('atom-workspace', 'titanium-atom-menu:run-iphone', this.runIPhone);
    atom.commands.add('atom-workspace', 'titanium-atom-menu:run-android', this.runAndroid);
  },
  runIPhone: function() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'build:select-active-target');
  },
  runAndroid: function() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'build:select-active-target');
  },
  provideBuilder: function(service) {

    return {
      niceName: 'Titanium builder',
      isEligable: function(path) {
        if (!atom.project.contains(path + '/tiapp.xml')) {
          return false;
        }

        atom.notifications.addInfo("Welcome to Titanium project", {
          "detail": "Try cmd-alt-b to run on iPhone/Android"
        });

        return true;
      },
      settings: function(path) {

        var configs = [{
            "exec": "titanium",
            "name": "Android Emulator",
            "args": ["build", "--target", "emulator", "-p", "android"]
          }, {
            "exec": "titanium",
            "name": "Android Device",
            "args": ["build", "--target", "device", "-p", "android"]
          }],
          iOSDevices = { //titanium build --target simulator --platform ios -C ?
            "iPad 2": "68CB796C-0C7B-4A49-931E-A102461508C1",
            "iPad Retina": "8BAC16A8-5B67-4DC6-9651-5B7F5B414CF3",
            "Resizable iPad": "262E3B5E-1B28-447E-84A1-E0B86C054039",
            "iPad Air": "8BC50F99-B19C-43BF-A07F-4DD8471176F6",
            "iPhone 4s": "DD6BEAEA-7E90-46C0-B2E2-46879169EDAD",
            "iPhone 5": "6AF1053D-59EE-45AE-9C34-D7DD4C432A87",
            "iPhone 5s": "672E1B01-5814-4FC6-BF46-5D03C9FCB97E",
            "Resizable iPhone": "D9CBB6F7-07AE-4D82-B7CB-EBD5A951A26F",
            "iPhone 6 Plus": "9D94B000-9382-4B6A-884A-C230CB76DDC0",
            "iPhone 6": "D39CA231-F3FB-42C1-8419-"
          };

        _.each(iOSDevices, function(id, name) {
          configs.push({
            "exec": "titanium",
            "name": name,
            "args": ["build", "--target", "simulator", "-p", "ios", "-C", id]
          });
        });

        return configs;
      }
    };
  }
};
