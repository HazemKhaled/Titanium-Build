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
          }, {
            "exec": "titanium",
            "name": "iOS default simulator",
            "args": ["build", "--target", "simulator", "-p", "ios"]
          }],
          iOSDevices = { //titanium build --target simulator --platform ios -C ?
            "iPad 2": "B9989943-E73E-48F9-AD51-4A44E6CF7038",
            "iPad 2 (8.4)": "68CB796C-0C7B-4A49-931E-A102461508C1",
            "iPad Retina": "78777B03-60BA-41B9-9CC0-0E5682B49BA9",
            "iPad Retina (8.4)": "8BAC16A8-5B67-4DC6-9651-5B7F5B414CF3",
            "iPad Air": "2866A62C-9808-4A5A-BFA8-EF413AC5422A",
            "iPad Air (8.4)": "8BC50F99-B19C-43BF-A07F-4DD8471176F6",
            "iPad Air 2": "D77670FE-104C-4693-959F-F0EA261DB44E",
            "iPhone 4s": "DC5D9A56-1CDA-4DE9-95B2-D690EFEA16EF",
            "iPhone 4s (8.4)": "DD6BEAEA-7E90-46C0-B2E2-46879169EDAD",
            "iPhone 5": "2D621309-B0BD-45A9-9D6D-D678CF824E1C",
            "iPhone 5 (8.4)": "6AF1053D-59EE-45AE-9C34-D7DD4C432A87",
            "iPhone 5s": "A70A6F6A-3309-428E-8D70-56FB9B79CBCE",
            "iPhone 5s (8.4)": "672E1B01-5814-4FC6-BF46-5D03C9FCB97E",
            "iPhone 6 Plus": "04809D87-292A-4D88-9549-94DC596AA808",
            "iPhone 6 Plus (8.4)": "9D94B000-9382-4B6A-884A-C230CB76DDC0",
            "iPhone 6": "7A5B51CE-CBB3-4C07-8F2B-50DDFAA9D9A3",
            "iPhone 6 (8.4)": "D39CA231-F3FB-42C1-8419-1F1EDBAE662D",
            "iPhone 6s": "92C92D02-D286-428A-B113-1C307A5D1DB7",
            "iPhone 6s Plus": "75648DBF-421F-4028-BA9C-9C68BF95F8E4"
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
