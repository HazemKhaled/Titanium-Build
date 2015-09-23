var at = require("atom"),
    BufferedProcess = at.BufferedProcess;

module.exports = {
    activate: function() {
        atom.commands.add('atom-workspace', 'titanium-atom-menu:run-android', this.runAndroid);
        atom.commands.add('atom-workspace', 'titanium-atom-menu:run-iphone', this.runIPhone);
    },

    provideBuilder: function (service) {
      atom.notifications.addInfo("Yalla iPhone", {
        "details": 'Ha ya 3m'
      });

      return {
        niceName: 'iPhone b2a',
        isEligable: function (path) {
          if (!atom.project.contains(atom.project.getPaths()[0] + '/tiapp.xml')) {
            console.log(atom.project.getPaths()[0] + '/tiapp.xml');
            return false;
          }

          return true;
        },
        settings: function (path) {
          return [{
            "cmd": "titanium",
            "name": "Run iPhone",
            "args": ["build", "-p", "ios", "--retina", "--tall"],
            "sh": true,
            "keymap": "cmd-U"
          }];
        }
      };
      //at.stopUsingService(service);
    },

    runAndroid: function() {
        //atom.notifications.addInfo("Yalla android");
        run("android");
    },
    runIPhone: function() {
        run("iphone");
    }
};

function run(what) {
  // check if ti cli is available
  var process = new BufferedProcess({
      command: "titanium"
  });
  process.onWillThrowError(function() {
      atom.notifications.addError("Please run sudo npm install -g titanium and try again");
      return;
  });

  // My full path
  var ppath = atom.project.getPaths()[0];

  // Check if this is a Titanium project
  if (!atom.project.contains(ppath + '/tiapp.xml')) {
    atom.notifications.addError("Doesn't look like a Titanium project");
    return;
  }

  if (what == "iphone") {
    atom.notifications.addInfo("Let's run an iPhone simulator");

    /*var process = new BufferedProcess({
        command: "titanium",
        args: ["build", "-p", "ios", "--retina", "--tall"],
        stdout: function(e) {
            console.log(e);
        },
        stderr: function(e) {
            console.log(e);
            atom.notifications.addError("Error in build", {
              detail: e
            });
        }
    });
    process.process.on('exit', function() {
        atom.notifications.addInfo("Please wait - Building the project");
    });*/
  }
}
