var hitOptions = {
		segments: false,
		stroke: true,
		fill: true,
		tolerance: 5
};

var socket = io();
var sessionId = "";
var bee_room = window.location.pathname.split('/')[2];

paths = {};
var path;
var pathname = '';
var imagename = '';
var color = 'black';
var strokeSlider = $('#ex8').slider({tooltip: 'always'})
		.on('change', changeThick)
		.data('slider');

var thick = 5;
var isErase =  $('#toggle-erase').prop('checked');

// $('#btn_color').colorpicker().on('changeColor', function(e) {
// 	 color = e.color.toHex();
// });

$( "#btn_png" ).click(function() {
	console.log(bee_room);
});


$('#toggle-erase').change(function() {
		isErase = $(this).prop('checked');
});

// User selects an image from the file browser to upload
$('#fileInput').bind('change', function(e) {
	var file = fileInput.files[0];
	var imageType = /image.*/;

	if (file.type.match(imageType)) {
		var reader = new FileReader();

		reader.onload = function(e) {

			var img = new Image();
			img.src = reader.result;

			drawImage(img.src);
			//socket.emit('loadImage', img.src);
		}

		reader.readAsDataURL(file);
	} else {
		alert('Can not load image!');
	}
});


$( "#btn_img_up" ).click(function() {
	selectObject.scale(1.2);
	makeTopRightCircle();
});


$( "#btn_img_down" ).click(function() {
	selectObject.scale(0.8);
	makeTopRightCircle();
});

$( "#btn_img_delete" ).click(function() {
	selectObject.remove();
});

function changeThick() {
	thick = strokeSlider.getValue();
};

function drawImage(img){
	var raster = new Raster(img);
	raster.position = view.center;
	imagename = sessionId + ":image:" + raster.id;
	raster.name = imagename;
	socket.emit('image:add', bee_room, img, raster.position, raster.name);
}

function exportPNG() {
  var canvas = document.getElementById('myCanvas');
	var img    = canvas.toDataURL("image/png");
	document.write('<img src="'+img+'"/>');
}

var selectObject;
var selectObject_tr;
var entire;


function makeTopRightCircle(){

	// if (selectObject_tr) {
	// 	selectObject_tr.remove();
	// }
	//
	// selectObject_tr = new Shape.Circle(
	// 	new Point(selectObject.bounds.topRight.x, selectObject.bounds.topRight.y), 4);
	// selectObject_tr.fillColor = 'black';
	//
	// selectObject_tr.onMouseLeave = function(event) {
	// 		selectObject_tr.fillColor = 'black';
	//     entire = false;
	// }

}


function onMouseDown(event) {

	var startObject = {
	  x: event.point.x,
	  y: event.point.y,
		color: color,
		thick: thick
	}

	if (isErase) {

		hitResult = project.hitTest(event.point, hitOptions);

		if (hitResult) {
			if (hitResult.type == 'stroke') {
				var hitItem = hitResult.item;
				hitItem.remove();
				view.draw();
				socket.emit('Hit:remove', bee_room, hitItem.name);
			}else if (hitResult.type == 'pixel') {
				selectObject = hitResult.item;
				console.log(selectObject);
				selectObject.selected = true;
			}

		}else{
			if (!entire) {
				selectObject_tr.remove();
				selectObject.selected = false;
				selectObject = null;
			}
		}

	}else{
			startPath(startObject, sessionId);
			socket.emit('startPath', startObject, sessionId, bee_room);
	}

}

function onMouseDrag(event) {

	var step        = event.delta / 50;
  var top         = event.middlePoint + step;
  var bottom      = event.middlePoint - step;

  var topObject = {
    x: top.x,
    y: top.y
  }

  var bottomObject = {
    x: bottom.x,
    y: bottom.y
  }

	var moveImage = {
		raster: selectObject,
		move: event.delta
	}

	if (isErase) {
			//moveImage(selectObject);
			console.log(selectObject);
			//socket.emit('moveImage', moveImage);
			makeTopRightCircle();
	}else{
		continuePath(top, bottom, sessionId);
		socket.emit('continuePath', topObject, bottomObject, sessionId, bee_room);
	}

}

function onMouseUp(event) {

  var endObject = {
    x: event.point.x,
    y: event.point.y
  }

	if (!isErase) {

		endPath(endObject, pathname, sessionId);
	  socket.emit('endPath', endObject, pathname, color, thick, sessionId, bee_room);
	}

}


function startPath(data, sessionId) {

  paths[sessionId] = new Path({
	  	strokeColor: data.color,
			strokeWidth : data.thick
	  }
	);

	pathname = sessionId + ":path:" + paths[sessionId].id;

  paths[sessionId].add(new Point(data.x,data.y));

}

function continuePath(top, bottom, sessionId) {

  var path = paths[sessionId];

  path.add(new Point(top.x,top.y));
  path.insert(0, new Point(bottom.x,bottom.y));

}



function endPath(data, pathname, sessionId) {

	var path = paths[sessionId];
	path.name = pathname;
	path.add(new Point(data.x,data.y));
	path.closed = true;
	path.smooth();

	delete paths[sessionId]

}



function pathEndStore(data, pathname, color, thick, user, room) {
	var path = paths[user];

	var path_to_send = {
		name:  pathname,
		color: color,
		thick: thick
	};

	path.name = pathname;
  path.add(new Point(data.x,data.y));
  path.closed = true;
  path.smooth();

	path_to_send.path = paths[user];

  delete paths[user]

	socket.emit('final', JSON.stringify(path_to_send), user, room);

}


socket.emit('subscribe', {room:bee_room});

socket.on('connect', function () {
	console.log('connected');
	socket.emit('subscribe', {room:bee_room});
});


socket.on('user', function(msg){
	sessionId = msg;
	console.log(sessionId);
});

socket.on('project:load', function(json) {
  console.log("project:load");
  paper.project.activeLayer.remove();
  paper.project.importJSON(json.project);

  view.draw();

});


socket.on('project:load:error', function() {
  console.log('project:load:error');
});


socket.on('loading:start', function() {
  console.log('loading:start');
});

socket.on('loading:end', function() {
  console.log('loading:end');
});


socket.on('startPath', function(data, user, room){
		startPath(data, user);
});

socket.on('continuePath', function(top, bottom, user, room) {
		continuePath(top, bottom, user);
		view.draw();
		console.log('receive continue from server');
});

socket.on('endPath', function(data, pathname, color, thick, user, room) {
		pathEndStore(data, pathname, color, thick, user, room);
		view.draw();
		console.log('receive end from server');
});

socket.on('Hit:remove', function(name) {
	 var target = project.activeLayer.children[name];
		target.remove();
		view.draw();
});

socket.on('image:add', function(img, position, name) {
	var raster = new Raster(img);
	raster.position = new Point(position[1], position[2]);
	raster.name = name;
	view.draw();
	console.log(raster);

});
