;(function() {
    
    
    const btnArea = document.getElementById('btn-area');

    const log = function(msg) {
        var win = document.getElementById('log'),
            h = win.innerHTML;

        h += msg + '<br>';
        win.innerHTML = h;
    }
    

    /**
    * reduce the image size
    * @returns {undefined}
    */
    const getDataForSmallerImg = function(img) {
        var canvas = document.createElement("canvas");
        canvas = document.getElementById('my-canvas');
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var MAX_WIDTH = 80;
        var MAX_HEIGHT = 60;
        var width = img.width;
        var height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;

        log(`width: ${width}; height: ${height}`);
        var ctx = canvas.getContext("2d");
        // ctx.drawImage(img, 0, 0, width, height);
        ctx.drawImage(img, 0, 0, 60, 45);

        var dataurl = canvas.toDataURL("image/png");
        // console.log('smaller:', dataurl);

        return dataurl;
    };
    

    /**
    * convert the input image to data-url
    * @returns {undefined}
    */
    const processImage = function(e) {
    	const files = e.target.files;
        if (files && files[0]) {
            var reader = new FileReader();

            const capturedImg = document.getElementById('captured-img');
            capturedImg.addEventListener('load', console.log('loaded capturedImg'));

            reader.onload = function (e) {
                const imgData = e.target.result;
                    capturedImg.setAttribute('src', imgData);

                    // capturedImg

                    // console.log('org:', imgData);

                // we need timeout to make sure img is loaded
                setTimeout(() => {
                    console.log('call smallerData');
                    const smallerImgData = getDataForSmallerImg(capturedImg);
                    // console.log('sm:', smallerImgData);

                    // setTimeout(() => {
                        capturedImg.setAttribute('src', smallerImgData);
                    // }, 2000);

                    document.getElementById('swipe-area').classList.add('swipe-area--image-is-loaded');
                    
                    // make body trigger event so other scripts on this page can listen for it
                    const newimagedataEvent = new CustomEvent('newimagedata', {
                        detail: {
                            imgData: smallerImgData
                        }
                    });
                    document.body.dispatchEvent(newimagedataEvent);
                }, 500);
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