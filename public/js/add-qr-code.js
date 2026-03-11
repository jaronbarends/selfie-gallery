;(function($) {

	'use strict';

	const sgHiddenClass = 'qr-box--is-hidden';

	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var addRemoteQRCode = function() {
		const url = window.location.href;
		const arr = url.split('/');
		const remoteUrl = arr[0]+'//'+arr[2]+'/camera.html';
		const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=20&data='+encodeURIComponent(remoteUrl);
		const $qrElm = $('#qr-code');

		$qrElm.append('<img src="'+qrSrc+'">');
	};


	/**
	* handle new user connecting - hide the qr-box
	* @returns {undefined}
	*/
	const newUserHandler = function() {
		document.getElementById('qr-box').classList.add('qr-box--is-hidden');
	};


	/**
	* handle new user connecting - hide the qr-box
	* @returns {undefined}
	*/
	const disconnectHandler = function() {
		document.getElementById('qr-box').classList.remove('qr-box--is-hidden');
	};
	


	/**
	* kick off the app once the socket connection is ready
	* @param {event} e The ready.socket event sent by socket js
	* @param {Socket} socket This client's socket
	* @returns {undefined}
	*/
	const connectionReadyHandler = function(e, io) {
		io.on('newuser', newUserHandler);
		io.on('disconnect', disconnectHandler);
	};
	


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var init = function() {
		addRemoteQRCode();
		$(document).on('connectionready.socket', connectionReadyHandler);
	};

	$(document).ready(init);

})(jQuery);