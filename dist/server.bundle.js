/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(1);\nmodule.exports = __webpack_require__(2);\n\n\n//////////////////\n// WEBPACK FOOTER\n// multi babel-polyfill ./src/server/index.js\n// module id = 0\n// module chunks = 0\n\n//# sourceURL=webpack:///multi_babel-polyfill_./src/server/index.js?");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

eval("module.exports = require(\"babel-polyfill\");\n\n//////////////////\n// WEBPACK FOOTER\n// external \"babel-polyfill\"\n// module id = 1\n// module chunks = 0\n\n//# sourceURL=webpack:///external_%22babel-polyfill%22?");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _express = __webpack_require__(3);\n\nvar _express2 = _interopRequireDefault(_express);\n\nvar _path = __webpack_require__(4);\n\nvar _path2 = _interopRequireDefault(_path);\n\nvar _bodyParser = __webpack_require__(5);\n\nvar _bodyParser2 = _interopRequireDefault(_bodyParser);\n\nvar _nodeFetch = __webpack_require__(6);\n\nvar _nodeFetch2 = _interopRequireDefault(_nodeFetch);\n\nvar _fs = __webpack_require__(7);\n\nvar _fs2 = _interopRequireDefault(_fs);\n\nvar _config = __webpack_require__(8);\n\nvar _config2 = _interopRequireDefault(_config);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar app = (0, _express2.default)();\n\n//mount the 2 important folders to static\napp.use('/static', _express2.default.static('static'));\napp.use('/static', _express2.default.static('dist'));\n\n//because who wants to have to decode JSON\napp.use(_bodyParser2.default.json());\n\n//handle '/' route\napp.get('*', function (req, res) {\n  return res.sendFile(_path2.default.resolve('index.html'));\n});\n\n//start up the actual app\napp.listen(_config2.default.port, function () {\n  return console.log('App listening on Port:' + _config2.default.port);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/server/index.js\n// module id = 2\n// module chunks = 0\n\n//# sourceURL=webpack:///./src/server/index.js?");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//////////////////\n// WEBPACK FOOTER\n// external \"express\"\n// module id = 3\n// module chunks = 0\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//////////////////\n// WEBPACK FOOTER\n// external \"path\"\n// module id = 4\n// module chunks = 0\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//////////////////\n// WEBPACK FOOTER\n// external \"body-parser\"\n// module id = 5\n// module chunks = 0\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

eval("module.exports = require(\"node-fetch\");\n\n//////////////////\n// WEBPACK FOOTER\n// external \"node-fetch\"\n// module id = 6\n// module chunks = 0\n\n//# sourceURL=webpack:///external_%22node-fetch%22?");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//////////////////\n// WEBPACK FOOTER\n// external \"fs\"\n// module id = 7\n// module chunks = 0\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = {\n  port: process.env.PORT || 8000\n};\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/server/config.js\n// module id = 8\n// module chunks = 0\n\n//# sourceURL=webpack:///./src/server/config.js?");

/***/ })
/******/ ]);