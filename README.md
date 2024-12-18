# Screen Orientation Test

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/5c1b2a41dee048348186f7768e9a265c)](https://app.codacy.com/gh/walitoff/screen-orientation-test/dashboard?utm_source=gh\&utm_medium=referral\&utm_content=\&utm_campaign=Badge_grade)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=bugs)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
[![Codacy Security Scan](https://github.com/walitoff/screen-orientation-test/actions/workflows/codacy.yml/badge.svg)](https://github.com/walitoff/screen-orientation-test/actions/workflows/codacy.yml)
[![Tests](https://github.com/walitoff/screen-orientation-test/actions/workflows/tests.js.yml/badge.svg)](https://github.com/walitoff/screen-orientation-test/actions/workflows/node.js.yml)
[![Deploy Hugo site to Pages](https://github.com/walitoff/screen-orientation-test/actions/workflows/hugo.yml/badge.svg)](https://github.com/walitoff/screen-orientation-test/actions/workflows/hugo.yml)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=walitoff_screen-orientation-test&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=walitoff_screen-orientation-test)
![GitHub](https://img.shields.io/github/license/walitoff/screen-orientation-test?color=blue)

This project builds a web page for testing user's browser if it can report active device screen orientation, and
if it's possible to change and lock the screen orientation programmatically with JS.
It's useful if you need to check if your iPhone or Android device supports this functionality and if
you can use it in your web projects.

**[DEMO IS HERE](https://screen-orientation-test.walitoff.com/)**

![Cover image](https://user-images.githubusercontent.com/16267156/228318924-5fb7f389-9570-4732-b60d-a13960f5c4f6.jpg)

## How to test

1. Open the [demo page](https://screen-orientation-test.walitoff.com/)
2. Rotate your device in the hands, the page should detect screen orientation change and display current state
3. Try to change the screen orientation programmatically by clicking the buttons with the desired screen orientation.
   Please note that your device may support only some orientation types.
   Probably it will not work if you're not in fullscreen mode.
4. Try clicking the fullscreen mode button. Most modern browsers require fullscreen mode activated to allow rotations.
5. Try different browsers. The results can vary a lot.
6. Install the website as an app (PWA) and try the previous steps.

## Sample videos

### Example 1. Android 10 Chrome browser 111.0.5563.116

Supports orientation detection, full-screen mode activation and programmatically change and lock of screen orientation.

<https://user-images.githubusercontent.com/16267156/228314972-484a3d26-2468-4af5-b5d1-ea0756f3d021.mp4>

### Example 2. Android 10, PWA mode, Chrome browser 111.0.0.0

Supports orientation detection,
full-screen mode activation and programmatically change and lock of screen orientation.

<https://user-images.githubusercontent.com/16267156/228315368-6000ce6e-4bb2-48ff-9773-a1669d318094.mp4>

### Example 3. Android 10 DuckDuckGo 5.153.0

Supports orientation detection, full-screen mode activation.
Programmatically change and lock of screen orientation is not supported.

<https://user-images.githubusercontent.com/16267156/228315395-b41aeb8d-45a4-411f-a03d-95c56014cb5b.mp4>

## Some test results

| Browser                      |         OS         |  Type   |  Mode   | Detection | Fullscreen Mode | Rotation |
|------------------------------|:------------------:|:-------:|:-------:|:---------:|:---------------:|:--------:|
| Google Chrome 111.0.5563.116 |  Android 7,10,12   | Mobile  | Browser |     ✅     |        ✅        |    ✅     |
| Google Chrome 111.0.0.0      |  Android 7,10,12   | Mobile  |   PWA   |     ✅     |        ✅        |    ✅     |
| Google Chrome 111.0.5563.147 |     Windows 11     | Desktop | Browser |     ✅     |        ✅        |    ❌     |
| Firefox 111.1.0              |     Android 7      | Mobile  | Browser |     ✅     |        ✅        |    ❌     |
| Brave 1.49.129               |     Android 7      | Mobile  | Browser |     ✅     |        ✅        |    ✅     |
| DuckDuckGo 5.153.0           |   Android 10, 12   | Mobile  | Browser |     ✅     |        ✅        |    ❌     |
| Yandex Browser 23.30.1       |     Android 12     | Mobile  | Browser |     ✅     |        ✅        |    ✅     |
| Safari 15.6.4                | iOS 15.7.3, 15.7.4 | Mobile  | Browser |     ❌     |        ❌        |    ❌     |
| Safari 16.3                  | iOS 13.2.1 Ventura | Desktop | Browser |     ❌     |        ❌        |    ❌     |
| Safari 16.4                  |  iOS 13.3 Ventura  | Desktop | Browser |     ✅     |        ✅        |    ❌     |

If you want to share your test results, please open an issue or PR.

## Technical details

We use two methods to get screen lock:

* old deprecated
  function [`screen.lockOrientation`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation)
  (and screen.mozLockOrientation, screen.msLockOrientation if available)
* new function [`ScreenOrientation.lock`](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock)

Some devices like desktop computers usually don't support screen rotation.
If a device does not support rotation, you will get such a message.
However, such a message may be seen on mobile devices too if the browser does have a full
support for the screen rotation API.

Usually, the screen rotation lock requires the fullscreen mode first to be activated in browser.
There's a button to enter and exit fullscreen mode in the demo
using [`Element.requestFullscreen()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen).\
Fullscreen mode is supported by most [modern browsers](https://caniuse.com/mdn-api_document_fullscreen).

The website is built with Hugo.
