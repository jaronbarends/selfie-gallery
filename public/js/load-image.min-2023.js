!function(u){"use strict";var n=u.URL||u.webkitURL;function f(e){return!!n&&n.createObjectURL(e)}function t(e){return!!n&&n.revokeObjectURL(e)}function l(e,n){!e||"blob:"!==e.slice(0,5)||n&&n.noRevoke||t(e)}function s(e,n,t,o){if(!u.FileReader)return!1;var r=new FileReader;r.onload=function(){n.call(r,this.result)},t&&(r.onabort=r.onerror=function(){t.call(r,this.error)});o=r[o||"readAsDataURL"];return o?(o.call(r,e),r):void 0}function d(e,n){return Object.prototype.toString.call(n)==="[object "+e+"]"}function b(c,e,a){function n(t,o){var r,i=document.createElement("img");function n(e,n){t!==o?e instanceof Error?o(e):((n=n||{}).image=e,t(n)):t&&t(e,n)}function e(e,n){n&&u.console&&console.log(n),e&&d("Blob",e)?r=f(c=e):(r=c,a&&a.crossOrigin&&(i.crossOrigin=a.crossOrigin)),i.src=r}return i.onerror=function(e){l(r,a),o&&o.call(i,e)},i.onload=function(){l(r,a);var e={originalWidth:i.naturalWidth||i.width,originalHeight:i.naturalHeight||i.height};try{b.transform(i,a,n,c,e)}catch(e){o&&o(e)}},"string"==typeof c?(b.requiresMetaData(a)?b.fetchBlob(c,e,a):e(),i):d("Blob",c)||d("File",c)?(r=f(c))?(i.src=r,i):s(c,function(e){i.src=e},o):void 0}return u.Promise&&"function"!=typeof e?(a=e,new Promise(n)):n(e,e)}b.requiresMetaData=function(e){return e&&e.meta},b.fetchBlob=function(e,n){n()},b.transform=function(e,n,t,o,r){t(e,r)},b.global=u,b.readFile=s,b.isInstanceOf=d,b.createObjectURL=f,b.revokeObjectURL=t,"function"==typeof define&&define.amd?define(function(){return b}):"object"==typeof module&&module.exports?module.exports=b:u.loadImage=b}("undefined"!=typeof window&&window||this);