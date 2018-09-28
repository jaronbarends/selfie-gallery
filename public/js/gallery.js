(function($) {

	'use strict';

	/* global io */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.

	// const imgHolder = document.getElementById('captured-img-holder');
	// const qrBox = document.getElementById('qr-box');
	
	let frameCounter = 0;

	/**
	* get elements of dynamic frame
	* @returns {object} an object containing all elements
	*/
	const getImgFrame = function(id) {
		const imgFrame = document.querySelector(`[data-dynamic-frame-id="${id}"]`);
		const imgHolder = imgFrame.querySelector('.captured-img-holder');
		const img = imgFrame.querySelector('.captured-img');
		const personalInfo = imgFrame.querySelector('.personal-info')
		const name = imgFrame.querySelector('.personal-info__name');
		const company = imgFrame.querySelector('.personal-info__company');
		const qrBox = imgFrame.querySelector('.qr-box');

		return {
			elm: imgFrame,
			imgHolder,
			img,
			personalInfo,
			name,
			company,
			qrBox
		};
	};


	/**
	* handle receiving image data - load image, but don't show it yet
	* @returns {undefined}
	*/
	const imageDataTransferHandler = function(data) {
		// TODO: get id from data
		const imgFrame = getImgFrame(frameCounter);
		imgFrame.img.setAttribute('src', data.imgData);
		imgFrame.name.innerText = data.name;
		imgFrame.company.innerText = data.company;
	};


	/**
	* Swipe is confirmed - show the image and personal info
	* @returns {undefined}
	*/
	const imageTransferHandler = function() {
		// TODO: get id
		const imgFrame = getImgFrame(frameCounter);
		imgFrame.imgHolder.classList.add('captured-img-holder--received');
		imgFrame.qrBox.classList.add('qr-box--received');
		imgFrame.personalInfo.classList.add('personal-info--received');

		setTimeout(addDynamicFrame, 1000);
	};

		
	/**
	* handle removing of image
	* @returns {undefined}
	*/
	const removeImageHandler = function() {
		// TODO: get id
		const imgFrame = getImgFrame(frameCounter-1);
		// reset css vars so imgHolder and qrBox go to right positions
		imgFrame.imgHolder.setAttribute('style', `--y: 100%`);
		imgFrame.qrBox.setAttribute('style', `--y: 0`);
		imgFrame.imgHolder.classList.remove('captured-img-holder--received');
		imgFrame.qrBox.classList.remove('qr-box--received');
		imgFrame.personalInfo.classList.remove('personal-info--received');

		removeDynamicFrame();
	};


	/**
	* handle swiping motion on camera
	* @returns {undefined}
	*/
	const handleSwipe = function(data) {
		// TODO: get id
		const imgFrame = getImgFrame(frameCounter);
		const yPercImg = 100 + (100 * data.yFraction);
		const yPercQR = 100 * data.yFraction;

		if (yPercImg > 0) {
			imgFrame.imgHolder.setAttribute('style', `--y: ${yPercImg}%`);
			imgFrame.qrBox.setAttribute('style', `--y: ${yPercQR}%`);
		}
	};


	/**
	* add dynamic image frame
	* @returns {undefined}
	*/
	const addDynamicFrame = function() {
		console.log('add dyn');
		const cloneSrc = document.getElementById('clone-src');
		const parentNode = cloneSrc.parentNode;
		const newFrame = cloneSrc.cloneNode(true);
		frameCounter++;

		// remove/adjust id attributes
		newFrame.removeAttribute('id');
		newFrame.setAttribute('data-dynamic-frame-id', frameCounter);
		newFrame.classList.remove('clone-src');

		parentNode.insertBefore(newFrame, cloneSrc);
	};


	/**
	* remove the last dynamic frame
	* @returns {undefined}
	*/
	const removeDynamicFrame = function() {
		const imgFrame = getImgFrame(frameCounter);
		imgFrame.elm.remove();
		frameCounter--;
	};
	
	


	/**
	* add event listeners for socket
	* @returns {undefined}
	*/
	var initSocketListeners = function() {
		io.on('imagedatatransfer', imageDataTransferHandler);
		io.on('imagetransfer', imageTransferHandler);
		io.on('swipemove', handleSwipe);
		io.on('removeimage', removeImageHandler);

		io.on('meta', (e) => {
			console.log(e)
		});
	};


	
	/**
	* send event to server to request entry to room
	* @returns {undefined}
	*/
	var joinRoom = function() {
		var data = {
				id: io.id,
			};

		//tell socket we want to join the session
		io.emit('join', data);
	};

	
	/**
	* initialize this hub when
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initHub = function() {
		initSocketListeners();
		joinRoom();
		addDynamicFrame();
	};

	
	/**
	* kick off the app once the socket is ready
	* @param {event} e The ready.socket event sent by socket js
	* @param {Socket} socket This client's socket
	* @returns {undefined}
	*/
	var connectionReadyHandler = function(e, io) {
		if (io) {
			initHub();
		}
	};


	/**
	* initialize frames (rotate them slightly)
	* @returns {undefined}
	*/
	const initFrames = function() {
		document.querySelectorAll('.img-list > li').forEach((frame) => {
			const range = 3;
			const angle = range * Math.random() - 0.5 * range;
			frame.setAttribute('style', 'transform: rotate('+angle+'deg);');
		});
	};
	
	
	/**

	* initialize the app
	* (or rather: set a listener for the socket connection to be ready, the handler will initialize the app)
	* @returns {undefined}
	*/
	var init = function() {
		initFrames();
		$(document).on('connectionready.socket', connectionReadyHandler);
	};

	document.addEventListener('DOMContentLoaded', init);

})(jQuery);