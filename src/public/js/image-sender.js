;(function($) {

	'use strict';

	/* global io */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.


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
	* remove a card and call any needed actions
	* @returns {undefined}
	*/
	const removeCard = function() {
		console.log('remove');
		const swipeObj = this,
			elm = swipeObj.elem;

		swipeObj.destroy(true);// has to be called in scope of Swiped
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
				this.destroy(true);
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
		const indicator = document.getElementById('swipe-indicator');
		indicator.classList.add('swipe-indicator--is-active');
		indicator.classList.remove('swipe-indicator--is-hidden');
	};


	/**
	* handle new image data - send data to gallery
	* @returns {undefined}
	*/
	const newImageDataHandler = function(e) {
		console.log('send imagedatatransfer');
		sendEventToSockets('imagedatatransfer', e.detail);
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
		}
	};
	
	
	/**
	* initialize the app
	* (or rather: set a listener for the socket to be ready, the handler will initialize the app)
	* @returns {undefined}
	*/
	var init = function() {
		$(document).on('connectionready.socket', connectionReadyHandler);
        const fileInput = document.getElementById('file-input');
		fileInput.addEventListener('change', newImageHandler);
		document.body.addEventListener('newimagedata', newImageDataHandler);
	};

	$(document).ready(init);


})(jQuery);