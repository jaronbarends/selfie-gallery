(function($) {

	'use strict';

	/* global io */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.

	const imgHolder = document.getElementById('captured-img-holder');
	const qrBox = document.getElementById('qr-box');
	const cloneSrc = document.getElementById('clone-src');

	/**
	* handle receiving image data - load image, but don't show it yet
	* @returns {undefined}
	*/
	const imageDataTransferHandler = function(data) {
		// TODO: get id from data
		const imgFrame = document.querySelector('[data-dynamic-frame-id="-1"]');
		imgFrame.querySelector('.captured-img').setAttribute('src', data.imgData);
		imgFrame.querySelector('.personal-info__name').innerText = data.name;
		imgFrame.querySelector('.personal-info__company').innerText = data.company;
	};


	/**
	* Swipe is confirmed - show the image and personal info
	* @returns {undefined}
	*/
	const imageTransferHandler = function() {
		const imgFrame = document.querySelector('[data-dynamic-frame-id="-1"]');
		imgFrame.querySelector('.captured-img-holder').classList.add('captured-img-holder--received');
		imgFrame.querySelector('.qr-box').classList.add('qr-box--received');
		imgFrame.querySelector('.personal-info').classList.add('personal-info--received');
	};

		
	/**
	* handle removing of image
	* @returns {undefined}
	*/
	const removeImageHandler = function() {
		// reset css vars so imgHolder and qrBox go to right positions
		imgHolder.setAttribute('style', `--y: 100%`);
		qrBox.setAttribute('style', `--y: 0`);
		imgHolder.classList.remove('captured-img-holder--received');
		qrBox.classList.remove('qr-box--received');
		document.getElementById('personal-info').classList.remove('personal-info--received');
	};


	/**
	* handle swiping motion on camera
	* @returns {undefined}
	*/
	const handleSwipe = function(data) {
		const yPercImg = 100 + (100 * data.yFraction),
			yPercQR = 100 * data.yFraction;

		if (yPercImg > 0) {
			imgHolder.setAttribute('style', `--y: ${yPercImg}%`);
			qrBox.setAttribute('style', `--y: ${yPercQR}%`);
		}
	};


	/**
	* add dynamic image frame
	* @returns {undefined}
	*/
	const addDynamicFrame = function() {
		const newFrame = cloneSrc.cloneNode(true);
		const parentNode = cloneSrc.parentNode;

		// remove/adjust id attributes
		newFrame.removeAttribute('id');
		parentNode.insertBefore(newFrame, cloneSrc);
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
		// addDynamicFrame();
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
			const angle = 4*Math.random() -2;
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