;(function() {
	
	
	const btnArea = document.getElementById('btn-area');
	const nameAndCompany = document.getElementById('name-and-company');
	const imageLoadedClass = 'body--image-is-loaded';

	const log = function(msg) {
		var win = document.getElementById('log'),
			h = win.innerHTML;

		h += msg + '<br>';
		win.innerHTML = h;
	}
	


	/**
	* convert the input image to data-url
	* @returns {undefined}
	*/
	const processImageFromFile = function(e) {
		const files = e.target.files;
		if (files && files[0]) {
			var reader = new FileReader();

			const capturedImg = document.getElementById('captured-img');
			capturedImg.addEventListener('load', console.log('loaded capturedImg'));

			reader.onload = function (e) {
				const imgData = e.target.result;
					capturedImg.setAttribute('src', imgData);

				// we need timeout to make sure img is loaded
				setTimeout(() => {
					imageReadyHandler(imgData);
				}, 500);
			}

			reader.readAsDataURL(files[0]);// this will trigger onload event when img data is parsed

		}
	};
	

	/**
	* handle processed image
	* @returns {undefined}
	*/
	const processImageHandler = function(img, metaData) {
			const capturedImg = document.getElementById('captured-img');
			let imgData = img.src;
			// console.log(img.tagName);

			if (img.tagName.toLowerCase() === 'canvas') {
				imgData = img.toDataURL("image/png");
				console.log(imgData);
				capturedImg.src = imgData;
			}
			// console.log(metaData);
			imageReadyHandler(imgData);
	};
	

	/**
	* process the uploaded image with loadImage
	* @returns {undefined}
	*/
	const processImageFromCamera = function(e) {
		const file = e.target.files[0],
			callback = processImageHandler,
			options = {
				maxWidth: 200,
				orientation: true,
				meta: true,
				canvas: false
			};

		loadImage(file, callback, options);
	};

	

	/**
	* hide the capture button
	* @returns {undefined}
	*/
	const hideBtnArea = function() {
		btnArea.classList.add('btn-area--is-hidden');
	};


	/**
	* show the capture button
	* @returns {undefined}
	*/
	const showBtnArea = function() {
		btnArea.classList.remove('btn-area--is-hidden');
	};


	/**
	* 
	* @returns {undefined}
	*/
	const hideNameAndCompany = function() {
		nameAndCompany.classList.add('name-and-company--is-hidden');
	};


	/**
	* 
	* @returns {undefined}
	*/
	const showNameAndCompany = function() {
		nameAndCompany.classList.remove('name-and-company--is-hidden');
	};
	

	/**
	* handle new image from camera or file
	* @returns {undefined}
	*/
	const newImageHandler = function(e, source) {
		hideBtnArea();
		hideNameAndCompany();

		if (source === 'camera') {
			processImageFromCamera(e);
		} else if (source === 'file') {
			processImageFromFile(e);
		}
	};
	



	/**
	* handle newly captured image
	* @returns {undefined}
	*/
	const newImageFromFileHandler = function(e) {
		newImageHandler(e, 'file');
	};
	
	
	/**
	 * handle newly captured image
	 * @returns {undefined}
	 */
	const newImageFromCameraHandler = function(e) {
		newImageHandler(e, 'camera');
	};


	/**
	* add classes when image is loaded
	* @returns {undefined}
	*/
	const imageReadyHandler = function(imgData) {
		document.body.classList.add(imageLoadedClass);

		// make body trigger event so other scripts on this page can listen for it
		const newimagedataEvent = new CustomEvent('newimagedata', {
			detail: {
				imgData,
				name: document.getElementById('name').value,
				company: document.getElementById('company').value,
			}
		});
		document.body.dispatchEvent(newimagedataEvent);
	};
	


	/**
	* handle removal of image in gallery - show capture button again
	* @returns {undefined}
	*/
	const removeImageHandler = function() {
		showBtnArea();
		document.body.classList.add(imageLoadedClass);
	};
	

	/**
	* kick off the app once the socket connection is ready
	* @param {event} e The ready.socket event sent by socket js
	* @param {Socket} socket This client's socket
	* @returns {undefined}
	*/
	var connectionReadyHandler = function(e, io) {
		if (io) {
			document.getElementById('file-input-desktop').addEventListener('change', newImageFromFileHandler);
			document.getElementById('file-input-camera').addEventListener('change', newImageFromCameraHandler);
			io.on('removeimage', removeImageHandler);
		}
	};

	/**
	* initialize all
	* @returns {undefined}
	*/
	const init = function() {
		$(document).on('connectionready.socket', connectionReadyHandler);

	};

	document.addEventListener('DOMContentLoaded', init);


})();