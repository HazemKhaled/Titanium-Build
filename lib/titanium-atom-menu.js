var apd = require("atom-package-dependencies"),
  _ = require("underscore"),
  BufferedProcess = require("atom").BufferedProcess;

// install missing packages
apd.install();

module.exports = {
  activate: function() {
    atom.commands.add("atom-workspace", "titanium-atom-menu:run-iphone", this.runIPhone);
    atom.commands.add("atom-workspace", "titanium-atom-menu:run-android-emulators", this.runAndroidEmulators);
    atom.commands.add("atom-workspace", "titanium-atom-menu:run-android-devices", this.runAndroidDevices);
  },
  runIPhone: function() {
    tiCMD('ios', function(result) {

      atom.myConfig = [];

      // simulators
      _.each(result.simulators.ios, function(simulators, os) {
        _.each(simulators, function(simulator) {
          atom.myConfig.push({
            "exec": "titanium",
            "name": simulator.name + " (" + simulator.version + ")",
            "args": ["build", "--target", "simulator", "-p", "ios", "-C", simulator.udid]
          });
        });
      });
    });
  },
  runAndroidEmulators: function() {
    tiCMD('android', function(result) {
      // Emulators
      atom.myConfig = [];
      _.each(result.emulators, function(emulator) {
        atom.myConfig.push({
          "exec": "titanium",
          "name": emulator.name,
          "args": ["build", "--target", "emulator", "--platform", "android", "-C", '"' + emulator.id + '"']
        });
      });
    });
  },
  runAndroidDevices: function() {
    tiCMD('android', function(result) {

      // Devices
      _.each(result.devices, function(device) {
        atom.myConfig.push({
          "exec": "titanium",
          "name": device.name,
          "args": ["build", "--target", "device", "--platform", "android", "-C", device.id]
        });
      });
    });
  },
  provideBuilder: function(service) {

    return {
      niceName: "Titanium builder",
      isEligable: function(path) {
        if (!atom.project.contains(path + "/tiapp.xml")) {
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

/**
 * Exec. titanium command to list Android devices and emulators
 *
 * @param os      string    android or ios
 * @param parser  function  callback function to process the cmd stdout
 **/
function tiCMD(os, parser) {
  // Reset build configs
  atom.myConfig = [];

  os = os === "android" ? os : 'ios';

  var process = new BufferedProcess({
    command: "titanium",
    args: ["info", "-t", os, "--output", "json"],
    stdout: function(e) {

      // parse result and update the global variable used by build service
      var result = JSON.parse(e);

      parser(result[os]);
    },
    stderr: function(error) {
      // No need to show notices, notice come by Longjohn
      if (error.indexOf("NOTICE:") === 0) {
        return;
      }
      atom.notifications.addError("Can't detect simulators/emulators or devices", {
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
}
