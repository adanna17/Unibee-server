var paper = require('paper');
var projects = require('../util/projects.js');
var db = require('../util/ueberDB.js');

projects = projects.projects;

// Create an in memory paper canvas
var drawing = paper.setup(new paper.Canvas(1920, 1080));

// Continues to draw a path in real time
exports.progressExternalPath = function (room, points, artist) {

  var project = projects[room].project;
  project.activate();
  var path = projects[room].external_paths[artist];

  // The path hasn't already been started
  // So start it
  if (!path) {
    projects[room].external_paths[artist] = new drawing.Path();
    path = projects[room].external_paths[artist];

    // Starts the path
    var start_point = new drawing.Point(points.start[1], points.start[2]);
    var color = new drawing.Color(points.rgba.color);
    path.strokeColor = color;
    path.strokeWidth = points.thick;

    path.name = points.name;
    path.add(start_point);
  }

  // Draw all the points along the length of the path
  var paths = points.path;
  var length = paths.length;
  for (var i = 0; i < length; i++) {
    path.add(new drawing.Point(paths[i].top[1], paths[i].top[2]));
    path.insert(0, new drawing.Point(paths[i].bottom[1], paths[i].bottom[2]));
  }

  path.smooth();
  project.view.draw();
};

exports.endExternalPath = function (room, points, artist) {
  var project = projects[room].project;

  project.activate();
  var path = projects[room].external_paths[artist];
  if (path) {
    // Close the path
    path.add(new drawing.Point(points.end[1], points.end[2]));
    path.closed = true;
    path.smooth();
    project.view.draw();
    // Remove the old data
    projects[room].external_paths[artist] = false;
  }
  db.storeProject(room);
};

exports.pathStoreFinal = function (object, user, room) {

  var project = projects[room].project;
  project.activate();
  var path = projects[room].external_paths[user];

  // The path hasn't already been started
  // So start it
  if (!path) {
    projects[room].external_paths[user] = new drawing.Path();
    path = projects[room].external_paths[user];

    // Starts the path
    var start_point = new drawing.Point(
        object.path[1].segments[0][0][0],
        object.path[1].segments[0][0][1]);
    path.strokeColor = object.color;
    path.strokeWidth = object.thick;

    console.log(object.name);
    path.name = object.name;
    path.add(start_point);
  }

  var length = object.path[1].segments.length;

  for (var i = 1; i < length; i++) {
    path.add(new drawing.Point(
      object.path[1].segments[i][0][0],
      object.path[1].segments[i][0][1]));
  }

  path.closed = true;
  path.smooth();
  project.view.draw();
  projects[room].external_paths[user] = false;

  db.storeProject(room);

};


// Remove an item from the canvas
exports.removeHitItem = function(room, itemName) {
  var project = projects[room].project;
  if (project && project.activeLayer && project.activeLayer._namedChildren[itemName] && project.activeLayer._namedChildren[itemName][0]) {
    project.activeLayer._namedChildren[itemName][0].remove();
    db.storeProject(room);
  }
}
