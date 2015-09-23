// install missing packages
var apd = require('atom-package-dependencies');
apd.install();

module.exports = {
  provideBuilder: function(service) {
    atom.notifications.addInfo("Yalla iPhone tany");

    return {
      niceName: 'iPhone builder',
      isEligable: function(path) {
        if (!atom.project.contains(path + '/tiapp.xml')) {
          return false;
        }

        return true;
      },
      settings: function(path) {
        return [{
          "exec": "titanium",
          "name": "iPhone",
          "args": ["build", "-p", "ios", "--retina", "--tall"]
        }, {
          "exec": "titanium",
          "name": "Android",
          "args": ["build", "-p", "android"]
        }];
      }
    };
  }
};
