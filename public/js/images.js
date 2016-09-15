window.onload = function() {

    var socket = io();

		var fileInput = document.getElementById('fileInput');
		var fileDisplayArea = document.getElementById('fileDisplayArea');


		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			var imageType = /image.*/;

			if (file.type.match(imageType)) {
				var reader = new FileReader();

				reader.onload = function(e) {

					var img = new Image();
					img.src = reader.result;

          socket.emit('loadImage', img.src);

          //console.log(img.src);

					//fileDisplayArea.appendChild(img);
				}

				reader.readAsDataURL(file);
			} else {
				fileDisplayArea.innerHTML = "File not supported!";
			}
		});
continuePath(top, bottom, sessionId);

		socket.emit('continuePath', topObject, bottomObject, sessionId);
}
