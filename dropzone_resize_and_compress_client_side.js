// getUrlParameter URL sent from homepage
function getUrlParameter(sParam)
{
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++)
	{
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam)
		{
			return sParameterName[1];
		}
	}
}

// transfom param URL to check radio options
var phuongthuc = getUrlParameter('phuongthuc');

if (phuongthuc == 'camdo') {
	$('#c1').prop('checked', true);
}
else if (phuongthuc == 'ban') {
	$('#c2').prop('checked', true);
}
else {
	$('#c1').prop('checked', true);
}

// dropzone
Dropzone.autoDiscover = false;
var filelist = [];
var resizeImgList = [];

Dropzone.options.myDropzone = {
	// Prevents Dropzone from uploading dropped files immediately
	autoProcessQueue: false,
	clickable: '.fileinput-button',
	maxFiles: 5,
	init: function() {
		myDropzone = this; // closure
		var submitButton = document.querySelector('#next1');
		var canvas = document.createElement('canvas');
		submitButton.addEventListener('click', function() {}, false);

		// You might want to show the submit button only when
		// files are dropped here:
		this.on('addedfile', function(file) {
			var modified = file.lastModifiedDate;
			var current = new Date();
			var diff = current - modified;
			var toNow = Math.floor(diff / (1000 * 60 * 60 * 24));
			var imgWarning = $('#img-warning');

			filelist.push(file);
			// Show submit button here and/or inform user to click it.
			if (filelist.length > 0) {
				document.getElementById('next1').className = document.getElementById('next1').className.replace(/\bdisabled\b/, '');
			}

			if(!imgWarning.hasClass('hidden'))
			{
				imgWarning.addClass('hidden');
			}

			if(toNow > 7)
			{
				imgWarning.removeClass('hidden');
				this.removeFile(file);
			}
			else
			{
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
			}
		});

		this.on('removedfile', function(file) {
			var k = filelist.indexOf(file);
			if (k > -1) {
				filelist.splice(k, 1);
				resizeImgList.splice(k, 1);
			}

			if (filelist.length === 0) {
				document.getElementById('next1').className = document.getElementById('next1').className + ' disabled';
			}
		});

		this.on('maxfilesexceeded', function(file) {
			this.removeFile(file);
			alert('bạn chỉ được upload 5 files');
		});
	}
};

var myDropzone = new Dropzone('div#my-dropzone', { url: '/submitform'});

var latitude = '';
var longitude = '';
(function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosition);
	}
})();

function getPosition(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
}

//submit the main form to server
function Submitform() {
	var rs = $('#result');
	rs.html('<div class="text-center"><img src="/statics/images/waiting.gif"></div>');

	var form = document.getElementById('submit_main_form');
	var fdnew = new FormData(form);
	var listLen = resizeImgList.length;

	if(!form['agree'].value || !form['productname'].value.trim() || !form['price'].value.trim() || !form['howlong'].value.trim() || !form['name'].value.trim() || !form['email'].value.trim() || !form['phone'].value.trim() || !form['description'].value.trim() || listLen == 0)
	{
		rs.html('<p>Bạn chưa cung cấp đầy đủ thông tin. Hồ sơ chưa được hoàn tất. Hãy chọn "Quay lại trang chủ" để bắt đầu lại.</p>');
		return
	}

	for(var i = 0; i < listLen; i++) {
		fdnew.append('photo' + (i + 1), resizeImgList[i], 'photo.jpg');
	}

	fdnew.append('latitude', latitude);
	fdnew.append('longitude', longitude);

	$.ajax({
		url: '/submitform/',
		data: fdnew,
		cache: false,
		contentType: false,
		processData: false,
		type: 'POST',

		// handle a successful response
		success: function (data) {
			window.google_trackConversion({
				google_conversion_id: 954944428,
				google_conversion_language: 'en',
				google_conversion_format: '3',
				google_conversion_color: 'ffffff',
				google_conversion_label: 'MUooCMD1h10QrJetxwM',
				google_remarketing_only: false
			});
			$('.complete').closest('form').find('input, select, textarea').val('');
			$('#result').html(data.message);
			console.log('success'); // another sanity check
		},

		// handle a non-successful response
		error: function (xhr) {
			$('.complete').closest('form').find('input, select, textarea').val('');
			if(xhr.status == 500)
			{
				$('#result').html('<p>Xin lỗi! Rất tiếc về sự bất tiện này. Xin quay lại với chúng tôi sau ít phút nữa.</p>');
			}
			else if(xhr.status == 422)
			{
				$('#result').html('<p>Bạn chưa cung cấp đầy đủ thông tin. Hồ sơ chưa được hoàn tất. Hãy chọn "Quay lại trang chủ" để bắt đầu lại.</p>');
			}
			console.log(xhr.responseText);
		}
	});
}

// check and send csrf token with the form
function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}
var csrftoken = getCookie('csrftoken');

/*
The functions below will create a header with csrftoken
*/

function csrfSafeMethod(method) {
	// these HTTP methods do not require CSRF protection
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function sameOrigin(url) {
	// test that a given url is a same-origin URL
	// url could be relative or scheme relative or absolute
	var host = document.location.host; // host + port
	var protocol = document.location.protocol;
	var sr_origin = '//' + host;
	var origin = protocol + sr_origin;
	// Allow absolute or scheme relative URLs to same origin
	return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
		(url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
		// or any other URL that isn't scheme relative or absolute i.e relative.
		!(/^(\/\/|http:|https:).*/.test(url));
}

$.ajaxSetup({
	beforeSend: function(xhr, settings) {
		if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
			// Send the token to same-origin, relative URLs only.
			// Send the token only if the method warrants CSRF protection
			// Using the CSRFToken value acquired earlier
			xhr.setRequestHeader('X-CSRFToken', csrftoken);
		}
	}
});

$(document).ready(function() {
	var video = document.getElementById('camera');
	$('#snapshot').on('click', function(e) {
		e.preventDefault();

		if($(this).text() == 'Dùng webcam') {
			cameraRequest();
		}
		else {
			var w = 800;
			var h = 600;

			var canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			var ctx = canvas.getContext('2d', {preserveDrawingBuffer: true});
			ctx.drawImage(video, 0, 0, w, h);

			var dataURL = canvas.toDataURL('image/png');
			var a = dataURL.split(',')[1];
			var blob = atob(a);
			var array = [];
			for(var k = 0; k < blob.length; k++) {
				array.push(blob.charCodeAt(k));
			}

			var file = new Blob([new Uint8Array(array)], {type: 'image/png'});
			myDropzone.addFile(file);
		}
	})
});
