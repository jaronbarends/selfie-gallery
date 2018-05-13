;(function() {
    
    
    const btnArea = document.getElementById('btn-area');

    /**
    * convert the input image to data-url
    * @returns {undefined}
    */
    const processImage = function(e) {
    	const files = e.target.files;
        if (files && files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                const imgData = e.target.result;
                document.getElementById('captured-img').setAttribute('src', imgData);
                document.getElementById('swipe-area').classList.add('swipe-area--image-is-loaded');
                
                // make body trigger event so other scripts on this page can listen for it
                const newimagedataEvent = new CustomEvent('newimagedata', {
                    detail: {
                        imgData
                    }
                });
                document.body.dispatchEvent(newimagedataEvent);
            }

            reader.readAsDataURL(files[0]);// this will trigger onload event when img data is parsed

        }
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
    * handle newly captured image
    * @returns {undefined}
    */
    const newImageHandler = function(e) {
        hideBtnArea();
        processImage(e);
    };

    /**
    * handle removal of image in gallery - show capture button again
    * @returns {undefined}
    */
    const removeImageHandler = function() {
        showBtnArea();
        document.getElementById('swipe-area').classList.remove('swipe-area--image-is-loaded');
    };
    


	/**
	* kick off the app once the socket connection is ready
	* @param {event} e The ready.socket event sent by socket js
	* @param {Socket} socket This client's socket
	* @returns {undefined}
	*/
	var connectionReadyHandler = function(e, io) {
		if (io) {
            document.getElementById('file-input').addEventListener('change', newImageHandler);
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