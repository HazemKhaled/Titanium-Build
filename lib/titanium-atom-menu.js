var at = require("atom"),
    BufferedProcess = at.BufferedProcess;

module.exports = {
    activate: function() {
        atom.commands.add('atom-workspace', 'titanium-atom-menu:run-android', this.runAndroid);
        atom.commands.add('atom-workspace', 'titanium-atom-menu:run-iphone', this.runIPhone);
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
  }
}
