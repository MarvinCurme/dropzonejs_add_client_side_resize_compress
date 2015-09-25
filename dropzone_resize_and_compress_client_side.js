// dropzone
Dropzone.autoDiscover = false;
var filelist = [];
var resizeImgList = [];

Dropzone.options.myDropzone = {
	// Prevents Dropzone from uploading dropped files immediately
	autoProcessQueue: false,
	maxFiles: 5,
	init: function() {
		myDropzone = this; // closure
		var canvas = document.createElement('canvas');

		// You might want to show the submit button only when
		// files are dropped here:
		this.on('addedfile', function(file) {
			var max_w = 800;
			var max_h = 600;

			var reader = new FileReader();
			reader.onload = function(e) {
				var img = new Image();
				img.onload = function() {
					var w = img.width;
					var h = img.height;
					var ratio_w = 1;
					var ratio_h = 1;
					if(w > max_w) {
						ratio_w = max_w / w;
					}
					if(h > max_h) {
						ratio_h = max_h / h;
					}

					var ratio = Math.min(ratio_w, ratio_h);
					w = Math.floor(w * ratio);
					h = Math.floor(h * ratio);
					canvas.width = w;
					canvas.height = h;
					var ctx = canvas.getContext('2d', {preserveDrawingBuffer: true});
					ctx.drawImage(img, 0, 0, w, h);

					var dataURL = canvas.toDataURL('image/jpeg', 0.5);
					var a = dataURL.split(',')[1];
					var blob = atob(a);
					var array = [];
					for(var k = 0; k < blob.length; k++) {
						array.push(blob.charCodeAt(k));
					}
					var data = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
					resizeImgList.push(data);
				};
				img.src = e.target.result;
			};
			reader.readAsDataURL(file);
		});

		this.on('removedfile', function(file) {
			var k = filelist.indexOf(file);
			if (k > -1) {
				filelist.splice(k, 1);
				resizeImgList.splice(k, 1);
			}
		});

	}
};

var myDropzone = new Dropzone('div#my-dropzone', { url: '/submitform'});
