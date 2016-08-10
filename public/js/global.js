requirejs.config({
	"baseUrl": "./js",
	"paths": {
		"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
	}
});

$(function () {
	requirejs(
		['modules/module.photoeditor', 'jquery'],
		function (Photoeditor, $) {
			var Ph = new Photoeditor();
			var controls = $('.crop-controls');
			console.log(678);
			Ph.init({
				//wrap: '.photoedit-wrap',
				canvas: '#canvas',
				//loadButton: '#file-load',
				//image: './img/kWGfHQXmJFA.jpg',
				image: './img/R8qhDpIfH4Q.jpg',
				//cropStartAuto: true,
				width: 500,
				height: 500,
				//aspectRatio: 0.8, // w/h
				type: 'image/png', //image/jpeg,
				createCropAction: function(){
					console.log('createCropAction');

					controls.removeClass('not-active');
				}
			});

			$('.control-panel__crop-on').on('click', function (e) {
				console.log(123);
				e.preventDefault();
				controls.removeClass('hidden');
				Ph.cropStart();

				$('.control-panel button').attr('disabled', 'disabled');
			});

			$('.crop-controls__do, .crop-controls__cancel').on('click', function () {

				if($(this).hasClass('crop-controls__do')) Ph.cropAction();

				Ph.cropClear();
				controls.addClass('hidden');
				$('.control-panel button').attr('disabled', false);
				controls.addClass('not-active');
			});

			$('.control-panel__back').on('click', function (e) {
				e.preventDefault();
				Ph.backChanges();
			});
			$('.control-panel__brightness').on('click', function (e) {
				e.preventDefault();
				Ph.brightFilter(100);
			});

			$('.control-panel__contrast').on('click', function (e) {
				e.preventDefault();
				Ph.contrastFilter(100);
			});
			$('.control-panel__change').on('click', function (e) {
				e.preventDefault();
				Ph.changeImage('./img/kWGfHQXmJFA.jpg');
			});
			$('.control-panel__rotate').on('click', function (e) {
				e.preventDefault();
				Ph.rotate(90);
			});
			$('.control-panel__open').on('click', function (e) {
				e.preventDefault();
				var href = Ph.getImage();
				window.open(href);
			});
			$('.control-panel__resize').on('click', function (e) {
				e.preventDefault();
				Ph.resize(2);
			});
			$('.control-panel__resize-back').on('click', function (e) {
				e.preventDefault();
				Ph.resize(1);
			});
		}
	);
});