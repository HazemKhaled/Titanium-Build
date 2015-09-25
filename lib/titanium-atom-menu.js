var apd = require("atom-package-dependencies"),
  _ = require("underscore"),
  ioslib = require("ioslib"),
  BufferedProcess = require("atom").BufferedProcess;

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

    // Exec. titanium command to list Android devices and emulators
    var process = new BufferedProcess({
      command: "titanium",
      args: ["info", "-t", "android", "--output", "json"],
      stdout: function(e) {

        // parse result and update the global variable used by build service
        var result = JSON.parse(e);

        // Emulators
        atom.myConfig = [];
        _.each(result.android.emulators, function(emulator) {
          atom.myConfig.push({
            "exec": "titanium",
            "name": emulator.name,
            "args": ["build", "--target", "emulator", "--platform", "android", "-C", '"' + emulator.id + '"']
          });
        });

        // Devices
        _.each(result.android.devices, function(device) {
          atom.myConfig.push({
            "exec": "titanium",
            "name": device.name,
            "args": ["build", "--target", "device", "--platform", "android", "-C", device.id]
          });
        });
      },
      stderr: function(error) {
        // No need to show notices, notice come by Longjohn
        if (error.indexOf("NOTICE:") === 0) {
          return;
        }
        atom.notifications.addError("Can't detect Android emulators & devices", {
          "details": error
        });
      }
    });

    // Select build after get all devices and emulators
    process.process.on('exit', function() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), "build:select-active-target");
    });

    // Check if the Titanium npm package installed or not
    process.onWillThrowError(function() {
      atom.notifications.addError("Please install titanium cli or add it to your PATH variable");
      return;
    });
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
