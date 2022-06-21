# CryptPass App

CryptPass App is an app based on the [CryptPass library](https://github.com/ossacolsale/CryptPass). For any details and __downloads__ please see [CryptPass official webpage](https://giancarlomangiagli.it/en/CryptPass_password_manager.html).

This app is also published on [Google Play Store](https://play.google.com/store/apps/details?id=com.cryptpass.app) and here is the source code.

This app is made with [Apache Cordova](https://cordova.apache.org/) and implemented for the following platforms: Android, Linux and Windows.

You can collaborate with me for the development and you can also compile and install it by yourself following the instructions below.

# Compile app

```BASH

#basically locally restore the project

git clone https://github.com/ossacolsale/CryptPassApp.git

npm update

cordova prepare

#then compile or test the app on your favourite platform with one of the above commands:

npm run test-android #to test on android
npm run build-android #to build the aap (find it on "platforms/android/app/build/outputs/bundle/release/")

npm run test-electron #to test on electron
npm run build-electron #to build on electron (zip for windows, deb and zip for linux, find them on "platforms/electron/build/")

```