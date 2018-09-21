;(function($) {

	'use strict';

	/* global io */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.

	const instructionArea = document.getElementById('instruction-area'),
		instructionActiveClass = 'instruction-area--is-active',
		indicator = document.getElementById('swipe-indicator'),
		indicatorActiveClass = 'swipe-indicator--is-active',
		removeBtn = document.getElementById('remove-btn');

	/**
	* send an event to the socket server that will be passed on to all sockets
	* @returns {undefined}
	*/
	var sendEventToSockets = function(eventName, eventData) {
		var data = {
			eventName: eventName,
			eventData: eventData
		};
		io.emit('passthrough', data);
	};
	

	/**
	* tell sockets to really send image
	* @returns {undefined}
	*/
	const sendImage = function() {
		sendEventToSockets('imagetransfer');
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const initSwipe = function() {
		const area = document.getElementById('swipe-area'),
			areaHeight = area.offsetHeight;

		Swiped.init({
			query: '#swipe-area',
			bottom: 400,
			onOpen: function() {
				sendImage();
				// this.destroy(true);
			}
		});

		// pass move values to sockets: y in px and percentage of image swiped
		document.body.addEventListener('swipemove', (e) => {
			const y = e.detail.y,
				yFraction = y/areaHeight,
				data = { y, yFraction };
			sendEventToSockets('swipemove', data);
		});
	};
	


	/**
	* initialize sending functionality
	* @returns {undefined}
	*/
	const initSender = function() {
		// document.getElementById('send-btn').addEventListener('click', sendImage);
		initSwipe();
		
		const sendBtn = document.getElementById('send-btn');
		if (sendBtn) {
			sendBtn.addEventListener('click', (e) => {
				e.preventDefault();
				sendImage();
			})
		}
	};
	



	/**
	* handle capturing of image
	* @returns {undefined}
	*/
	const newImageHandler = function() {
		instructionArea.classList.add(instructionActiveClass);
		indicator.classList.add(indicatorActiveClass);
	};


	/**
	* handle new image data - send data to gallery
	* @returns {undefined}
	*/
	const newImageDataHandler = function(e) {
		sendEventToSockets('imagedatatransfer', e.detail);
	};

	/**
	* handle image being sent to gallery
	* @returns {undefined}
	*/
	const imageSentHandler = function() {
		instructionArea.classList.remove(instructionActiveClass);
		indicator.classList.remove(indicatorActiveClass);
		removeBtn.classList.remove('btn--is-hidden');
	};

	/**
	* handle removing image
	* @returns {undefined}
	*/
	const removeHandler = function(evt) {
		evt.preventDefault();
		console.log('remove');
		sendEventToSockets('removeimage');
		const area = document.getElementById('swipe-area');
		area.style.transform = 'none';
	};
	
	
	/**
	* handle removing of image
	* @returns {undefined}
	*/
	const removeImageHandler = function() {
		instructionArea.classList.remove(instructionActiveClass);
		indicator.classList.remove(indicatorActiveClass);
		removeBtn.classList.add('btn--is-hidden');
	};
	
	
	

	/**
	* kick off the app once the socket connection is ready
	* @param {event} e The ready.socket event sent by socket js
	* @param {Socket} socket This client's socket
	* @returns {undefined}
	*/
	var connectionReadyHandler = function(e, io) {
		if (io) {
			initSender();
			
			document.getElementById('file-input-camera').addEventListener('change', newImageHandler);
			document.body.addEventListener('newimagedata', newImageDataHandler);
			removeBtn.addEventListener('click', removeHandler);
			// remove indicator when user interacts
			document.addEventListener('touchstart', () => {
				indicator.classList.remove(indicatorActiveClass);
			});

			io.on('imagetransfer', imageSentHandler);
			io.on('removeimage', removeImageHandler);
		}
	};
	
	
	/**
	* initialize the app
	* (or rather: set a listener for the socket to be ready, the handler will initialize the app)
	* @returns {undefined}
	*/
	var init = function() {
		$(document).on('connectionready.socket', connectionReadyHandler);
	};

	$(document).ready(init);


})(jQuery);