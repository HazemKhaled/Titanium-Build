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
    atom.commands.add("atom-workspace", "titanium-build:run-iphone", this.runIPhone);
    atom.commands.add("atom-workspace", "titanium-build:run-android-emulators", this.runAndroidEmulators);
    atom.commands.add("atom-workspace", "titanium-build:run-android-devices", this.runAndroidDevices);
    atom.commands.add("atom-workspace", "titanium-build:clean", this.clean);
  },
  // iPhone Simulators
  runIPhone: function() {

    // Reset build configs
    atom.titaniumBuildConfigs = [];

    tiCMD({
      args: ["info", "-t", "ios", "--output", "json"],
      returnJson: true,
      os: "ios",
      parser: function(result) {
        _.each(result.simulators.ios, function(simulators, os) {
          _.each(simulators, function(simulator) {
            atom.titaniumBuildConfigs.push({
              "exec": "titanium",
              "name": simulator.name + " (" + simulator.version + ")",
              "args": ["build", "--log-level", "debug", "--target", "simulator", "-p", "ios", "-C", simulator.udid]
            });
          });
        });
      }
    });
  },
  // Android Emulators
  runAndroidEmulators: function() {

    // Reset build configs
    atom.titaniumBuildConfigs = [];

    tiCMD({
      args: ["info", "-t", "android", "--output", "json"],
      returnJson: true,
      os: "android",
      parser: function(result) {
        _.each(result.emulators, function(emulator) {
          atom.titaniumBuildConfigs.push({
            "exec": "titanium",
            "name": emulator.name,
            "args": ["build", "--log-level", "debug", "--target", "emulator", "--platform", "android", "-C", '"' + emulator.id + '"']
          });
        });
      }
    });
  },
  // Android Devices
  runAndroidDevices: function() {

    // Reset build configs
    atom.titaniumBuildConfigs = [];

    tiCMD({
      args: ["info", "-t", "android", "--output", "json"],
      returnJson: true,
      os: "android",
      parser: function(result) {

        _.each(result.devices, function(device) {
          atom.titaniumBuildConfigs.push({
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
        return atom.titaniumBuildConfigs;
      }
    };
  },
  // Run ti clean
  clean: function() {

    atom.titaniumBuildConfigs = [{
      "exec": "titanium",
      "name": "Titanium clean build",
      "args": ["clean"]
    }];
    atom.commands.dispatch(atom.views.getView(atom.workspace), "build:trigger");
    atom.notifications.addSuccess("Clean done");
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

  params = {
    args: _params.args || [],
    returnJson: _params.returnJson || false,
    os: _params.os === "android" ? _params.os : 'ios',
    parser: _params.parser
  };

  var _stdout = "";

  var process = new BufferedProcess({
    command: "titanium",
    args: params.args,
    stdout: function(e) {

      // parse result and update the global variable used by build service
      if (params.returnJson) {
        _stdout += e;
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
    if (params.returnJson) {
      params.parser(JSON.parse(_stdout)[params.os]);
    }
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

  return exists;
}
