# Tests for programmatically getting and locking screen orientation with JS

This project builds a web page for testing user's browser if it can report active device screen orientation and 
if it's possible to change and lock the screen orientation programmatically with JS.
It's useful if you need to check if your iPhone or Android device supports this functionality and if
you can use it in your web projects.

Demo https://rvalitov.github.io/screen-orientation-test/

We use two methods to obtain screen lock: 
- old deprecated function [screen.lockOrientation](https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation)
 (and screen.mozLockOrientation, screen.msLockOrientation if available)
- new function [ScreenOrientation.lock](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock)

The website is built with Hugo.
