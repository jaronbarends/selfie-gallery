'use strict';

/* global io */ //global io is defined by socket.io

// define semi-global variables (vars that are "global" in this file's scope) and prefix them
// with sg so we can easily distinguish them from "normal" vars
let sgSocket;

/**
 * handle server's connectionready event
 * @returns {undefined}
 */
function connectionreadyHandler() {
  const event = new CustomEvent('connectionready.socket', { detail: sgSocket });
  document.dispatchEvent(event);
}

/**
 * initialize the socket, and send event containing it to the page
 * @returns {undefined}
 */
function initIo() {
  sgSocket = io();
  sgSocket.on('connectionready', connectionreadyHandler);
}

/**
 * initialize all
 * @returns {undefined}
 */
function init() {
  initIo();
}

document.addEventListener('DOMContentLoaded', init);
