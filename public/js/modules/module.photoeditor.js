define(
	'modules/module.photoeditor',
	['jquery'],
	function ($) {
		return function (){

			//var config = {};
			var defaults = {
				maxWidth: 500,
				maxHeight: 500
			};
			//var _init = {};

			var _private = {

				objects: {
					loadImageSrc: '',
					cropWrap: null,
					cropHandle: {}
				},
				methods: {
					eventHandlers: function () {

						//_private.objects.cropWrap.on('dragstart', false)
						//	.on('mousedown', _private.methods.onCropMouseDown);
					},
					loadImageToCanvas: function () {

						var image = _private.objects.image = document.createElement("img");

						_private.methods.clearCanvas();

						image.src = _private.objects.loadImageSrc;

						$(image).on("load", function () {
							var data;

							_private.props.originalSize.width = _private.methods.getImageData(image).width;
							_private.props.originalSize.height = _private.methods.getImageData(image).height;

							data = _private.props.originalSize;

							_private.objects.ctx.drawImage(image, 0, 0, data.width, data.height);
							console.log(_private.props.cropStartAuto);
							if(_private.props.cropStartAuto){
								_public.cropStart();
							}

							_private.methods.eventHandlers();
							$(image).off("load");
						});
					},
					clearCanvas: function () {
						var width, height;

						width = ((_private.props.rotateAngle / 90) % 2 !== 0) ?
							_private.props.canvasSize.height : _private.props.canvasSize.width;
						height = ((_private.props.rotateAngle / 90) % 2 !== 0) ?
							_private.props.canvasSize.width : _private.props.canvasSize.height;

						_private.objects.ctx.clearRect(_private.props.rotateStartCoords.x, _private.props.rotateStartCoords.y,
							width, height);
					},
					getImageData: function (image) {

						$(image).css({position: 'absolute', left: -9999}).appendTo($('body'));

						var data = _private.methods.calculateSizes(image.offsetWidth, image.offsetHeight, (image.offsetWidth / image.offsetHeight));

						$(image).detach();

						return data;
					},
					calculateSizes: function (nativeWidth, nativeHeight, k) {

						var canvasSize = _private.props.canvasSize;

						canvasSize.width = nativeWidth;
						canvasSize.height = nativeHeight;

						_private.props.horiz = (nativeWidth >= nativeHeight) ? true : false;

						if (_private.props.horiz && (nativeWidth > _private.props.maxWidth)) {

							canvasSize.width = _private.props.maxWidth;
							canvasSize.height = canvasSize.width / k;
						}
						if (!_private.props.horiz && (nativeHeight > _private.props.maxHeight)) {

							canvasSize.height = _private.props.maxHeight;
							canvasSize.width = canvasSize.height * k;
						}

						_private.objects.ctx.canvas.width = canvasSize.width;
						_private.objects.ctx.canvas.height = canvasSize.height;

						return _private.props.canvasSize;
					},
					changeCropCustom: function () {

						var cropCoords = _private.props.cropCoords;

						_private.objects.cropWrap.css({borderWidth: cropCoords.top + 'px ' + cropCoords.right + 'px ' + cropCoords.bottom + 'px ' + cropCoords.left + 'px'});
					},
					onCropMouseDown: function (e) {

						console.log('onCropMouseDown');

						_private.methods.cropDragStart(e.pageX, e.pageY, $(e.target));

						return false;
					},
					onCropMouseDownCreate: function(e){

						_private.methods.cropDragStartCreate(e.pageX, e.pageY);

						_private.objects.cropWrap.off('.common');

						return false;
					},
					onDocumentMouseMove: function (e) {
						var startX = _private.props.cropStart.X - _private.props.outCoords.left;
						var startY = _private.props.cropStart.Y - _private.props.outCoords.top;

						var checkInCrop = startX<(_private.props.cropCoords.left+_private.props.cropSize.width) &&
							startX>_private.props.cropCoords.left &&
							startY>_private.props.cropCoords.top &&
							startY<(_private.props.cropCoords.top+_private.props.cropSize.height);

						if(_private.props.resize && !checkInCrop){

							_private.methods.moveResize(e.pageX, e.pageY);

						}else{
							_private.methods.cropMoveTo(e.pageX, e.pageY);
						}

					},
					onDocumentMouseMoveHandle: function (e) {

						_private.methods.cropResize(e.pageX, e.pageY, $(e.target));
					},
					onDocumentMouseMoveCreate: function(e){

						_private.methods.createCrop(e.pageX, e.pageY);
					},
					onDocumentMouseUp: function () {
						_private.methods.cropDragEnd();
					},
					onDocumentMouseUpCreate: function () {
						_private.methods.cropDragEndCreate();
					},
					cropDragStart: function (startX, startY, target) {

						_private.props.cropStart.X = startX;
						_private.props.cropStart.Y = startY;

						_private.objects.startTarget = target;

						if (target.hasClass('cropper-wrap__handle')) {

							$(document).on('mousemove.crop', _private.methods.onDocumentMouseMoveHandle);
						} else {

							$(document).on('mousemove.crop', _private.methods.onDocumentMouseMove);
						}

						$(document).on('mouseup.crop', _private.methods.onDocumentMouseUp);
					},
					cropDragStartCreate: function (startX, startY) {

						var cropCoords = _private.props.cropCoords;
						var cropSize = _private.props.cropSize;
						console.log('cropDragStartCreate');
						_private.props.cropStart.X = startX;
						_private.props.cropStart.Y = startY;

						$(document).on('mousemove.crop', _private.methods.onDocumentMouseMoveCreate);

						$(document).on('mouseup.crop', _private.methods.onDocumentMouseUpCreate);

						_private.objects.cropWrap.removeClass('not-active');
						cropSize.width = cropSize.height = 1;

						cropCoords.top = startY - _private.objects.cropWrap.offset().top - 1;
						cropCoords.bottom = _private.props.canvasSize.height - cropCoords.top;

						cropCoords.left = startX - _private.objects.cropWrap.offset().left - 1;
						cropCoords.right = _private.props.canvasSize.width - cropCoords.left;

						_private.methods.changeCropCustom();
					},
					cropResize: function (moveX, moveY, targetMove) {

						var target = _private.objects.startTarget;
						var cropCoords = _private.props.cropCoords;
						var cropStart = _private.props.cropStart;
						var cropSize = _private.props.cropSize;
						var canvasSize = _private.props.canvasSize;

						var deltaX = cropStart.X - moveX;
						var deltaY = cropStart.Y - moveY;
						var oldWidth = cropSize.width;
						var oldHeight = cropSize.height;

						cropStart.X = moveX;
						cropStart.Y = moveY;

						for (var side in cropCoords) {

							if (cropCoords[side] < 1) {

								cropCoords[side] = 0;
								cropSize.width = canvasSize.width - cropCoords.left - cropCoords.right;
								cropSize.height = canvasSize.height - cropCoords.top - cropCoords.bottom;

								_private.methods.changeCropCustom();
								if (side == 'top' && (deltaY > 0 || deltaX !== 0) && targetSideCheck('top')) return;
								if (side == 'bottom' && (deltaY < 0 || deltaX !== 0) && targetSideCheck('bottom')) return;
								if (side == 'left' && (deltaX > 0 || deltaY !== 0) && targetSideCheck('left'))return;
								if (side == 'right' && (deltaX < 0 || deltaY !== 0) && targetSideCheck('right')) return;
							}
						}

						if(_private.props.aspectRatio){

							if (targetSideCheck('top-left')) {

								if (((cropSize.width <= cropSize.minWidth) && deltaX < 0) || ((cropSize.height <= cropSize.minHeight) && deltaY < 0)) return;

								if (Math.abs(deltaX) < Math.abs(deltaY)) {

									cropCoords.top = _private.methods.roundNumber(cropCoords.top - deltaY);
									cropSize.height += _private.methods.roundNumber(deltaY);
									cropSize.width = cropSize.height * _private.props.aspectRatio;
									cropCoords.left = _private.methods.roundNumber(cropCoords.left + (oldWidth - cropSize.width));
								} else {
									cropCoords.left = _private.methods.roundNumber(cropCoords.left - deltaX);
									cropSize.width += _private.methods.roundNumber(deltaX);
									cropSize.height = cropSize.width / _private.props.aspectRatio;
									cropCoords.top = _private.methods.roundNumber(cropCoords.top + (oldHeight - cropSize.height));
								}
							}
							if (targetSideCheck('top-right')) {

								if (((cropSize.width <= cropSize.minWidth) && deltaX > 0) || ((cropSize.height <= cropSize.minHeight) && deltaY < 0)) return;

								if (Math.abs(deltaX) < Math.abs(deltaY)) {

									cropCoords.top = _private.methods.roundNumber(cropCoords.top - deltaY);
									cropSize.height += _private.methods.roundNumber(deltaY);
									cropSize.width = cropSize.height * _private.props.aspectRatio;
									cropCoords.right = _private.methods.roundNumber(cropCoords.right + (oldWidth - cropSize.width));
								} else {

									cropCoords.right = _private.methods.roundNumber(cropCoords.right + deltaX);
									cropSize.width -= _private.methods.roundNumber(deltaX);
									cropSize.height = cropSize.width / _private.props.aspectRatio;
									cropCoords.top = _private.methods.roundNumber(cropCoords.top + (oldHeight - cropSize.height));

								}
							}
							if (targetSideCheck('bottom-right')) {

								if (((cropSize.width <= cropSize.minWidth) && deltaX > 0) || ((cropSize.height <= cropSize.minHeight) && deltaY > 0)) return;

								if (Math.abs(deltaX) < Math.abs(deltaY)) {

									cropCoords.bottom = _private.methods.roundNumber(cropCoords.bottom + deltaY);
									cropSize.height -= _private.methods.roundNumber(deltaY);
									cropSize.width = cropSize.height * _private.props.aspectRatio;
									cropCoords.right = _private.methods.roundNumber(cropCoords.right + (oldWidth - cropSize.width));
								} else {
									cropCoords.right = _private.methods.roundNumber(cropCoords.right + deltaX);
									cropSize.width -= _private.methods.roundNumber(deltaX);
									cropSize.height = cropSize.width / _private.props.aspectRatio;
									cropCoords.bottom = _private.methods.roundNumber(cropCoords.bottom + (oldHeight - cropSize.height));
								}
							}
							if (targetSideCheck('bottom-left')) {

								if (((cropSize.width <= cropSize.minWidth) && deltaX < 0) || ((cropSize.height <= cropSize.minHeight) && deltaY > 0)) return;

								if (Math.abs(deltaX) < Math.abs(deltaY)) {

									cropCoords.bottom = _private.methods.roundNumber(cropCoords.bottom + deltaY);
									cropSize.height -= _private.methods.roundNumber(deltaY);
									cropSize.width = cropSize.height * _private.props.aspectRatio;
									cropCoords.left = _private.methods.roundNumber(cropCoords.left + (oldWidth - cropSize.width));
								} else {
									cropCoords.left = _private.methods.roundNumber(cropCoords.left - deltaX);
									cropSize.width += _private.methods.roundNumber(deltaX);
									cropSize.height = cropSize.width / _private.props.aspectRatio;
									cropCoords.bottom = _private.methods.roundNumber(cropCoords.bottom + (oldHeight - cropSize.height));
								}
							}
						}else{
							if(targetSideCheck('top')){
								cropSize.height += _private.methods.roundNumber(deltaY);
								cropCoords.top = _private.methods.roundNumber(cropCoords.top - deltaY);

								if(cropSize.height < 0) {cropSize.height = 0; cropCoords.top = canvasSize.height - cropCoords.bottom; return;}
							}
							if(targetSideCheck('bottom')){
								cropSize.height -= _private.methods.roundNumber(deltaY);
								cropCoords.bottom = _private.methods.roundNumber(cropCoords.bottom + deltaY);

								if(cropSize.height < 0) {cropSize.height = 0; cropCoords.bottom = canvasSize.height - cropCoords.top; return;}

							}
							if(targetSideCheck('left')){
								cropSize.width += _private.methods.roundNumber(deltaX);
								cropCoords.left = _private.methods.roundNumber(cropCoords.left - deltaX);

								if(cropSize.width < 0) {cropSize.width = 0; cropCoords.left = canvasSize.width - cropCoords.right; return;}

							}
							if(targetSideCheck('right')){
								cropSize.width -= _private.methods.roundNumber(deltaX);
								cropCoords.right = _private.methods.roundNumber(cropCoords.right + deltaX);

								if(cropSize.width < 0) {cropSize.width = 0; cropCoords.right = canvasSize.width - cropCoords.left; return;}
							}

							if(cropSize.width < 0) {
								cropSize.width = 0;
								return;
							}

							//cropCoords.top = (deltaY>=0)? startPosition.y - deltaY : startPosition.y;
							//cropCoords.bottom = (deltaY>=0)? _private.props.canvasSize.height - startPosition.y: _private.props.canvasSize.height - startPosition.y + deltaY;
							//cropCoords.left = (deltaX>=0)? startPosition.x - deltaX : startPosition.x;
							//cropCoords.right = (deltaX>=0)? _private.props.canvasSize.width - startPosition.x : _private.props.canvasSize.width - startPosition.x + deltaX;
							//
							//if(cropCoords.top < 0 ) cropCoords.top = 0;
							//if(cropCoords.left < 0 ) cropCoords.left = 0;
							//if(cropCoords.bottom < 0 ) cropCoords.bottom = 0;
							//if(cropCoords.right < 0 ) cropCoords.right = 0;

							//cropSize.width = _private.props.canvasSize.width - cropCoords.left - cropCoords.right;
							//cropSize.height = _private.props.canvasSize.height - cropCoords.top - cropCoords.bottom;
						}

						_private.methods.updateHandlers();
						_private.methods.changeCropCustom();

						function targetSideCheck(side) {
							return (target.attr('class').indexOf(side) != -1);
						}
					},
					cropDragEnd: function () {
						$(document).off('.crop');
					},
					cropDragEndCreate: function () {
						$(document).off('.crop');

						//_private.props.aspectRatio = _private.props.cropSize.width / _private.props.cropSize.height;

						_private.objects.cropWrap.off('.create');

						_private.objects.cropWrap.on('dragstart.common', false)
							.on('mousedown.common', _private.methods.onCropMouseDown);

						if(typeof _private.methods.createCropAction == 'function'){
							_private.methods.createCropAction();
						}

					},
					moveResize: function(moveX, moveY){

						var image = _private.objects.image;
						var cropStart = _private.props.cropStart;
						var deltaX = cropStart.X - moveX;
						var deltaY = cropStart.Y - moveY;
						var k = _private.props.coeff;

						cropStart.X = moveX;
						cropStart.Y = moveY;

						_private.props.resizeOffset.top -= deltaY;
						_private.props.resizeOffset.left -= deltaX;

						if(_private.props.resizeOffset.top > 0) _private.props.resizeOffset.top = 0;
						if(_private.props.resizeOffset.top < -(_private.props.canvasSize.height*k-_private.props.canvasSize.height)){
							_private.props.resizeOffset.top = -(_private.props.canvasSize.height*k-_private.props.canvasSize.height);
						}

						if(_private.props.resizeOffset.left > 0) _private.props.resizeOffset.left = 0;
						if(_private.props.resizeOffset.left < -(_private.props.canvasSize.width*k-_private.props.canvasSize.width)){
							_private.props.resizeOffset.left = -(_private.props.canvasSize.width*k-_private.props.canvasSize.width);
						}
						_private.methods.clearCanvas();
						_private.objects.ctx.drawImage(image,  _private.props.resizeOffset.left, _private.props.resizeOffset.top, _private.props.canvasSize.width*k, _private.props.canvasSize.height*k);
					},
					createCrop: function(moveX, moveY){

						console.log('createCrop');

						var cropCoords = _private.props.cropCoords;
						var cropStart = _private.props.cropStart;
						var cropSize = _private.props.cropSize;

						var deltaX = cropStart.X - moveX;
						var deltaY = cropStart.Y - moveY;

						var startPosition = {
							y: cropStart.Y - _private.objects.cropWrap.offset().top,
							x:	cropStart.X - _private.objects.cropWrap.offset().left
						};

						cropCoords.top = (deltaY>=0)? startPosition.y - deltaY : startPosition.y;
						cropCoords.bottom = (deltaY>=0)? _private.props.canvasSize.height - startPosition.y: _private.props.canvasSize.height - startPosition.y + deltaY;
						cropCoords.left = (deltaX>=0)? startPosition.x - deltaX : startPosition.x;
						cropCoords.right = (deltaX>=0)? _private.props.canvasSize.width - startPosition.x : _private.props.canvasSize.width - startPosition.x + deltaX;

						if(cropCoords.top < 0 ) cropCoords.top = 0;
						if(cropCoords.left < 0 ) cropCoords.left = 0;
						if(cropCoords.bottom < 0 ) cropCoords.bottom = 0;
						if(cropCoords.right < 0 ) cropCoords.right = 0;

						cropSize.width = _private.props.canvasSize.width - cropCoords.left - cropCoords.right;
						cropSize.height = _private.props.canvasSize.height - cropCoords.top - cropCoords.bottom;


						_private.methods.updateHandlers();
						_private.methods.changeCropCustom();
					},
					cropMoveTo: function (moveX, moveY) {
						console.log('cropMoveTo');

						var cropCoords = _private.props.cropCoords;
						var canvasSize = _private.props.canvasSize;
						var cropSize = _private.props.cropSize;

						var deltaX = _private.props.cropStart.X - moveX;
						var deltaY = _private.props.cropStart.Y - moveY;

						_private.props.cropStart.X = moveX;
						_private.props.cropStart.Y = moveY;

						cropCoords.top = _private.methods.roundNumber(cropCoords.top - deltaY);
						cropCoords.bottom = _private.methods.roundNumber(cropCoords.bottom + deltaY);
						cropCoords.left = _private.methods.roundNumber(cropCoords.left - deltaX);
						cropCoords.right = _private.methods.roundNumber(cropCoords.right + deltaX);

						if ((cropCoords.left <= 0) && (deltaX > 0)) {
							cropCoords.left = 0;
							cropCoords.right = canvasSize.width - cropSize.width;
						}
						if ((cropCoords.left >= (canvasSize.width - cropSize.width)) && deltaX < 0) {
							cropCoords.right = 0;
							cropCoords.left = canvasSize.width - cropSize.width;
						}
						if ((cropCoords.top <= 0) && (deltaY > 0)) {
							cropCoords.top = 0;
							cropCoords.bottom = canvasSize.height - cropSize.height;
						}
						if ((cropCoords.top >= (canvasSize.height - cropSize.height)) && deltaY < 0) {
							cropCoords.bottom = 0;
							cropCoords.top = canvasSize.height - cropSize.height;
						}

						_private.methods.updateHandlers();
						_private.methods.changeCropCustom();
					},
					setCropArea: function () {

						console.log('setCropArea');

						var canvasSize = _private.props.canvasSize;
						var aspectRatio = _private.props.aspectRatio;
						var cropSize = _private.props.cropSize;
						var cropCoords = _private.props.cropCoords;

						if(!_private.props.aspectRatio){

							cropSize.width = cropSize.height = 0;
						}else{

							if (_private.props.horiz) {

								cropSize.height = canvasSize.height * 0.7;
								cropSize.minHeight = canvasSize.height * 0.2;

								cropSize.width = cropSize.height * aspectRatio;
								cropSize.minWidth = cropSize.minHeight * aspectRatio;

							} else {
								cropSize.width = canvasSize.width * 0.7;
								cropSize.minWidth = canvasSize.width * 0.2;

								cropSize.height = cropSize.width / aspectRatio;
								cropSize.minHeight = cropSize.minWidth / aspectRatio;
							}
						}

						cropCoords.top = cropCoords.bottom = _private.methods.roundNumber((canvasSize.height - cropSize.height) / 2);
						cropCoords.left = cropCoords.right = _private.methods.roundNumber((canvasSize.width - cropSize.width) / 2);

						_private.methods.changeCropCustom();
					},
					createCropFromUser: function(){

					},
					roundNumber: function (num) {
						return Math.round(num * 100) / 100;
					},
					updateHandlers: function () {

						var cropHandle = _private.objects.cropHandle;

						for (var side in cropHandle) {

							var marginBottom = parseInt(cropHandle[side].css('margin-bottom'));
							cropHandle[side].css({marginBottom: (marginBottom + Math.random() * 0.1)});

						}
					},
					reset: function(){
						_private.props.resize = false;
						_private.props.rotateStartCoords.y = _private.props.rotateStartCoords.x = 0;
						_private.props.rotateAngle = 0;
					}
					//getPixels: function () {
					//
					//	var ctx = _private.objects.ctx;
					//	return ctx.getImageData(0, 0, _private.props.canvasSize.width, _private.props.canvasSize.height);
					//}
				},
				props: {
					//imageNativeSize: {}
					cropSize: {},
					canvasSize: {},
					cropCoords: {},
					//cropMoveShift: {},
					outCoords: {},
					cropStart: {},
					originalSize: {},
					changesWithPixels: false,
					resizeOffset: {
						top:0,
						left:0
					},
					coeff: 1,
					rotate: false,
					rotateStartCoords: {
						x: 0,
						y: 0
					},
					rotateAngle: 0
				}
			};

			var _public = {
				init: function (args) {

					_private.objects.loadImageSrc = args.image;
					//_private.objects.wrap = $(args.wrap) || null;
					_private.objects.canvas = $(args.canvas) || null;
					_private.props.maxWidth = args.maxWidth || defaults.maxWidth;
					_private.props.maxHeight = args.maxHeight || defaults.maxHeight;
					_private.props.aspectRatio = args.aspectRatio || false;
					_private.props.typeImage = args.type || 'image/png';
					_private.props.cropStartAuto = args.cropStartAuto || false;
					_private.methods.createCropAction = args.createCropAction || null;
					_private.objects.ctx = _private.objects.canvas[0].getContext("2d");

					_private.methods.loadImageToCanvas();

				},
				changeImage: function (image) {
					_public.cropClear();
					_private.objects.loadImageSrc = image;
					_private.methods.loadImageToCanvas();
				},
				cropStart: function () {

					var cropWrap = _private.objects.cropWrap = $('<div>', {class: 'cropper-wrap'});

					if(!_private.props.aspectRatio){
						//cropSize.minHeight = cropSize.minWidth = 5;
						cropWrap.addClass('not-active');
					}

					'top-left top-right bottom-left bottom-right'.split(' ').forEach(function (side) {
						_private.objects.cropHandle[side] = $('<div>', {class: 'cropper-wrap__handle cropper-wrap__handle_' + side});
					});

					for (var side in _private.objects.cropHandle) {

						cropWrap.append(_private.objects.cropHandle[side]);
					}

					_private.objects.canvas.after(cropWrap);

					_private.props.outCoords = cropWrap.offset();

					//if(_private.props.aspectRatio !== false){
					_private.methods.setCropArea();
					//}

					if(!_private.props.aspectRatio){

						_private.objects.cropWrap.on('dragstart.create', false)
							.on('mousedown.create', _private.methods.onCropMouseDownCreate);
					}else{
						_private.objects.cropWrap.on('dragstart.common', false)
							.on('mousedown.common', _private.methods.onCropMouseDown);
					}

				},
				cropClear: function () {

					$(_private.objects.canvas).parent().find('.cropper-wrap').remove();
					_private.props.cropSize = _private.props.cropCoords = _private.props.cropStart = {};
					_private.methods.reset();
				},
				cropAction: function () {
					var ctx = _private.objects.ctx;
					var cropCoords = _private.props.cropCoords;
					var cropSize = _private.props.cropSize;
					var img = _private.objects.image;
					var k = img.width / (_private.props.canvasSize.width * _private.props.coeff);
					var data;
					var imw = cropSize.width, imh = cropSize.height, imx = cropCoords.left, imy = cropCoords.top;

					if(_private.props.changesWithPixels){
						img.src = ctx.canvas.toDataURL();

					}else{
						imw *= k;
						imh *= k;
						imx = (imx -_private.props.resizeOffset.left)*k;
						imy = (imy -_private.props.resizeOffset.top)*k;
					}
					_private.methods.clearCanvas();

					data = _private.methods.calculateSizes(imw, imh, (imw / imh));

					ctx.drawImage(img, imx, imy, imw, imh, 0, 0, data.width, data.height);
					img.src = ctx.canvas.toDataURL();

					//if(_private.props.aspectRatio !== false){
					_private.methods.setCropArea();
					//}

				},
				backChanges: function () {
					var img = _private.objects.image;
					img.src = _private.objects.loadImageSrc;

					$(img).on("load", function () {

						var data = _private.props.originalSize;
						var ctx = _private.objects.ctx;

						ctx.canvas.width = _private.props.canvasSize.width = data.width;
						ctx.canvas.height = _private.props.canvasSize.height = data.height;

						ctx.drawImage(img, 0, 0, data.width, data.height);

						//_private.methods.setCropArea();

						$(img).off("load");
					});
					_private.methods.reset();
				},
				rotate: function (angle) {
					var angleRad = angle * Math.PI / 180;
					var image = _private.objects.image;
					var data;
					var ctx = _private.objects.ctx;
					var cw, ch, cx = 0, cy = 0;
					if (((angle / 90) % 2 !== 0)) {

						data = _private.methods.calculateSizes(image.height, image.width, (image.height / image.width));

					} else {
						data = _private.props.canvasSize;
					}
					_private.props.rotate = (angle % 360 !== 0);
					_private.props.rotateAngle = angle;
					_private.props.rotateStartCoords.y = _private.props.rotateStartCoords.x = 0;

					cw = data.width;
					ch = data.height;

					switch(angle){
						case 90:
							cw = data.height;
							ch = data.width;
							cy = _private.props.rotateStartCoords.y = data.width * (-1);
							//_private.props.rotateStartCoords.y = data.height * (-1);
							break;
						case 180:
							cx = data.width * (-1);
							cy = data.height * (-1);
							_private.props.rotateStartCoords.y = data.height * (-1);
							_private.props.rotateStartCoords.x = data.width * (-1);
							break;
						case 270:
						case -90:
							cw = data.height;
							ch = data.width;
							cx = data.height * (-1);
							_private.props.rotateStartCoords.x = data.height * (-1);
							break;
					}

					_private.methods.clearCanvas();
					ctx.rotate(angleRad);
					ctx.drawImage(image, cx, cy, cw, ch);
					image.src = ctx.canvas.toDataURL();
					//_private.methods.setCropArea();
				},
				brightFilter: function(filter){
					var ctx = _private.objects.ctx;
					var imageData = ctx.getImageData(0, 0, _private.props.canvasSize.width, _private.props.canvasSize.height);
					var data = imageData.data;

					for (var i=0; i<data.length; i+=4) {
						data[i] += filter;
						data[i+1] += filter;
						data[i+2] += filter;
					}
					ctx.putImageData(imageData, 0, 0);
					_private.props.changesWithPixels = true;
				},
				contrastFilter: function(contrast){
					var ctx = _private.objects.ctx;
					var imageData = ctx.getImageData(0, 0, _private.props.canvasSize.width, _private.props.canvasSize.height);
					var data = imageData.data;
					var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

					for (var i=0; i<data.length; i+=4) {
						data[i] = factor * (data[i] - 128) + 128;
						data[i+1] = factor * (data[i+1] - 128) + 128;
						data[i+2] = factor * (data[i+2] - 128) + 128;
					}
					ctx.putImageData(imageData, 0, 0);
					_private.props.changesWithPixels = true;
				},
				getImage: function(){
					var ctx = _private.objects.ctx;
					var dataImage = ctx.canvas.toDataURL(_private.props.typeImage);
					return dataImage;
				},
				resize: function(k){
					if(k < 1) return false;

					_private.props.coeff = k;

					var ctx = _private.objects.ctx;
					var image = _private.objects.image;
					var width = _private.props.canvasSize.width;
					var height = _private.props.canvasSize.height;

					if(_private.props.changesWithPixels && !_private.props.resize){
						image.src = ctx.canvas.toDataURL();
						width = image.width;
						height = image.height;
					}

					_private.props.resize = true;

					_private.methods.clearCanvas();
					ctx.beginPath();
					//width = ((_private.props.rotateAngle / 90) % 2 !== 0) ? height : width;
					//height = ((_private.props.rotateAngle / 90) % 2 !== 0) ? width : height;
					ctx.rotate( (-1)*_private.props.rotateAngle* Math.PI / 180);
					_private.objects.ctx.drawImage(image,  (-1)*width*(k-1)/2, (-1)*height*(k-1)/2, width*k, height*k);

					_private.props.resizeOffset.top = (-1)*_private.props.canvasSize.height*(k-1)/2;
					_private.props.resizeOffset.left = (-1)*_private.props.canvasSize.width*(k-1)/2;
					if(k == 1) {
						_private.props.resize = false;
					}
				}
			};

			return _public;
		};
	}
);