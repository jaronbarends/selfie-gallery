;(function() {
    

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
                document.getElementById('swipe-area').classList.add('swipe-area--image-is-loaded')
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
    const hideBtn = function() {
        const btn = document.getElementById('btn-area');
        btn.classList.add('btn-area--is-hidden');
    };



    /**
    * handle newly captured image
    * @returns {undefined}
    */
    const newImageHandler = function(e) {
        hideBtn();
        processImage(e);

    };



    /**
    * initialize all
    * @returns {undefined}
    */
    const init = function() {
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', newImageHandler);
    };

    document.addEventListener('DOMContentLoaded', init);


})();