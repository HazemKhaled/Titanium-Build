var apd = require("atom-package-dependencies"),
  _ = require("underscore"),
  at = require("atom"),
  BufferedProcess = at.BufferedProcess,
  File = at.File,
  tiappFile = null;

// install missing packages
apd.install();

module.exports = {
  activate: function() {
    atom.commands.add("atom-workspace", "titanium-atom-menu:run-iphone", this.runIPhone);
    atom.commands.add("atom-workspace", "titanium-atom-menu:run-android-emulators", this.runAndroidEmulators);
    atom.commands.add("atom-workspace", "titanium-atom-menu:run-android-devices", this.runAndroidDevices);
  },
  runIPhone: function() {

    tiCMD({
      args: ["info", "-t", "ios", "--output", "json"],
      returnJson: true,
      os: "ios",
      parser: function(result) {

        atom.myConfig = [];

        // simulators
        _.each(result.simulators.ios, function(simulators, os) {
          _.each(simulators, function(simulator) {
            atom.myConfig.push({
              "exec": "titanium",
              "name": simulator.name + " (" + simulator.version + ")",
              "args": ["build", "--log-level", "debug", "--target", "simulator", "-p", "ios", "-C", simulator.udid]
            });
          });
        });
      }
    });
  },
  runAndroidEmulators: function() {
    tiCMD({
      args: ["info", "-t", "android", "--output", "json"],
      returnJson: true,
      os: "android",
      parser: function(result) {

        // Emulators
        _.each(result.emulators, function(emulator) {
          atom.myConfig.push({
            "exec": "titanium",
            "name": emulator.name,
            "args": ["build", "--log-level", "debug", "--target", "emulator", "--platform", "android", "-C", '"' + emulator.id + '"']
          });
        });
      }
    });
  },
  runAndroidDevices: function() {
    tiCMD({
      args: ["info", "-t", "android", "--output", "json"],
      returnJson: true,
      os: "android",
      parser: function(result) {

        // Devices
        _.each(result.devices, function(device) {
          atom.myConfig.push({
            "exec": "titanium",
            "name": device.name,
            "args": ["build", "--log-level", "debug", "--target", "device", "--platform", "android", "-C", device.id]
          });
        });
      }
    });
  },
  provideBuilder: function(service) {

    return {
      niceName: "Titanium builder",
      isEligable: function(path) {

        if (!isTitaniumProject()) {
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
function tiCMD(_params) {
  if (!isTitaniumProject(true)) {
    return;
  }

  // Reset build configs
  atom.myConfig = [];

  params = {
    args: _params.args || [],
    returnJson: _params.returnJson || false,
    os: _params.os === "android" ? _params.os : 'ios',
    parser: _params.parser
  };

  var process = new BufferedProcess({
    command: "titanium",
    args: params.args,
    stdout: function(e) {

      // parse result and update the global variable used by build service
      if (params.returnJson) {
        params.parser(JSON.parse(e)[params.os]);
      } else {
        paramsparser(e);
      }
    },
    stderr: function(error) {
      // No need to show notices, notice come by Longjohn
      if (error.indexOf("NOTICE:") === 0) {
        return;
      }
      atom.notifications.addError("Can't detect simulators/emulators or devices", {
        "detail": error
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

function isTitaniumProject(wanrUser) {
  var exists;
  tiappFile = tiappFile || new File(atom.project.getPaths()[0] + "/tiapp.xml"),
    exists = tiappFile.existsSync();

  if (!exists && wanrUser) {
    atom.notifications.addWarning("Not a Titanium project, can't reach tiapp.xml");
  }

  console.log('exists: ', exists);

  return exists;
}
