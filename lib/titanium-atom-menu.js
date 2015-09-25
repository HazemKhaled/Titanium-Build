var apd = require('atom-package-dependencies'),
  _ = require('underscore'),
  ioslib = require('ioslib');

// install missing packages
apd.install();

module.exports = {
  activate: function() {
    atom.commands.add('atom-workspace', 'titanium-atom-menu:run-iphone', this.runIPhone);
    atom.commands.add('atom-workspace', 'titanium-atom-menu:run-android', this.runAndroid);
  },
  runIPhone: function() {
    atom.myConfig = [];
    ioslib.simulator.detect(function(err, result) {
      if (err) {
        atom.notifications.addError("Can't detect iOS simulators", {
          "details": err
        });
        return;
      }
      _.each(result.simulators.ios, function(simulators, os) {

        _.each(simulators, function(simulator) {
          atom.myConfig.push({
            "exec": "titanium",
            "name": simulator.name + " (" + simulator.version + ")",
            "args": ["build", "--target", "simulator", "-p", "ios", "-C", simulator.udid]
          });
          if (_.last(simulators) === simulator) {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'build:select-active-target');
          }
        });

      });
    });

  },
  runAndroid: function() {
    atom.myConfig = [{
      "exec": "titanium",
      "name": "Android Emulator",
      "args": ["build", "--target", "emulator", "-p", "android"]
    }, {
      "exec": "titanium",
      "name": "Android Device",
      "args": ["build", "--target", "device", "-p", "android"]
    }];
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'build:select-active-target');
  },
  provideBuilder: function(service) {

    return {
      niceName: 'Titanium builder',
      isEligable: function(path) {
        if (!atom.project.contains(path + '/tiapp.xml')) {
          return false;
        }

        return true;
      },
      settings: function(path) {
        return atom.myConfig;
      }
    };
  }
};
