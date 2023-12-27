# Selfie gallery

Proof-of-concept for creating gallery you can swipe photos from your camera to

Uses express node-server in combination with socket.io.

build upon https://github.com/jaronbarends/websocket-basics

## File structure

The root folder contains the node-server (_socket-server.js_) and the npm stuff. Everything in the folder _public_ can be served by the node-server.

### socket-server.js

This is the server you run to serve the pages: `node socket-server` or run _START SOCKET SERVER.bat_ which executes the same command

The socket-server serves files in the _public_ directory and handles traffic between sockets. Sockets can send events to the socket-server, and then you can add code to the server to handle that event. 

## Development

connecting mobile device to localhost
from https://www.linkedin.com/pulse/how-access-localhost-other-devices-mobile-laptop-harsh-verma/

Make sure the computer and device are connected to the same network

In windows: windows + r to run command
`ipconfig | findstr /i “ipv4”`

copy the ip address; (e.g. 123.45.67.890)
point browser to port 3000 on that ip address http://123.45.67.890:3000



## Troubleshooting

python needs ms Visual Studio. Default is 2010, but you'll have to adjust this to your own version: 
 npm install --save socket.io --msvs_version=2013
this line can be  put into package.json under "scripts"

uses the library https://github.com/blueimp/JavaScript-Load-Image for processing images from camera.
When updating the 2019 version of the lib to v5.16 in 2023, I didn't get an image. Haven't bothered debugging, just reverted back to the older version.
Images showed up rotated in camera.html; setting `{orientation: 1}` in `processImageFromCamera` fixed that