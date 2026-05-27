'use strict';

let socket;

const instructionArea = document.getElementById('instruction-area'),
  instructionActiveClass = 'instruction-area--is-active',
  indicator = document.getElementById('swipe-indicator'),
  indicatorActiveClass = 'swipe-indicator--is-active',
  removeBtn = document.getElementById('remove-btn');

const log = function (msg) {
  const win = document.getElementById('log');
  if (!win) {
    return;
  }
  let h = win.innerHTML;

  h += msg + '<br>';
  win.innerHTML = h;
};

/**
 * send an event to the socket server that will be passed on to all sockets
 * @returns {undefined}
 */
var sendEventToSockets = function (eventName, eventData) {
  var data = {
    eventName: eventName,
    eventData: eventData,
  };
  socket.emit('passthrough', data);
};

/**
 * tell sockets to really send image
 * @returns {undefined}
 */
const sendImage = function () {
  sendEventToSockets('imagetransfer');
};

/**
 *
 * @returns {undefined}
 */
const initSwipe = function () {
  const area = document.getElementById('swipe-area'),
    areaHeight = area.offsetHeight;

  Swiped.init({
    query: '#swipe-area',
    animDistanceUp: 400,
    // animDistanceDown: 400,
    tolerance: 100,
    onOpen: function () {
      // user has swiped far enough to send image
      sendImage();
    },
  });

  // pass move values to sockets: y in px and percentage of image swiped
  document.body.addEventListener('swipemove', (e) => {
    const y = e.detail.y,
      yFraction = y / areaHeight,
      data = { y, yFraction };
    sendEventToSockets('swipemove', data);
  });
};

/**
 * initialize sending functionality
 * @returns {undefined}
 */
const initSender = function () {
  // document.getElementById('send-btn').addEventListener('click', sendImage);
  initSwipe();

  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendImage();
    });
  }
};

/**
 * handle capturing of image
 * @returns {undefined}
 */
const newImageHandler = function () {
  instructionArea.classList.add(instructionActiveClass);
  indicator.classList.add(indicatorActiveClass);
};

/**
 * handle new image data - send data to gallery
 * @returns {undefined}
 */
const newImageDataHandler = function (e) {
  sendEventToSockets('imagedatatransfer', e.detail);
};

/**
 * handle image being sent to gallery
 * @returns {undefined}
 */
const imageSentHandler = function () {
  instructionArea.classList.remove(instructionActiveClass);
  indicator.classList.remove(indicatorActiveClass);
  removeBtn.classList.remove('btn--is-hidden');
};

/**
 * handle removing image
 * @returns {undefined}
 */
const removeHandler = function (evt) {
  evt.preventDefault();
  sendEventToSockets('removeimage');
  const area = document.getElementById('swipe-area');
  area.style.transform = 'none';
  area.classList.remove('js-swiped--will-open');
  area.classList.remove('js-swiped--will-open-downwards');
  area.classList.remove('js-swiped--will-open-upwards');
};

/**
 * handle removing of image
 * @returns {undefined}
 */
const removeImageHandler = function () {
  instructionArea.classList.remove(instructionActiveClass);
  indicator.classList.remove(indicatorActiveClass);
  removeBtn.classList.add('btn--is-hidden');
};

/**
 * kick off the app once the socket connection is ready
 * @param {Socket} _socket This client's socket
 * @returns {undefined}
 */
var connectionReadyHandler = function (_socket) {
  if (_socket) {
    socket = _socket;
    initSender();

    document.getElementById('file-input-camera').addEventListener('change', newImageHandler);
    document.body.addEventListener('newimagedata', newImageDataHandler);
    removeBtn.addEventListener('click', removeHandler);
    // remove indicator when user interacts
    document.addEventListener('touchstart', () => {
      indicator.classList.remove(indicatorActiveClass);
    });

    socket.on('imagetransfer', imageSentHandler);
    socket.on('removeimage', removeImageHandler);
  }
};

/**
 * initialize the app
 * (or rather: set a listener for the socket to be ready, the handler will initialize the app)
 * @returns {undefined}
 */
var init = function () {
  // $(document).on('connectionready.socket', connectionReadyHandler);
  document.addEventListener('connectionready.socket', (e) => {
    connectionReadyHandler(e.detail);
  });
};

document.addEventListener('DOMContentLoaded', init);
