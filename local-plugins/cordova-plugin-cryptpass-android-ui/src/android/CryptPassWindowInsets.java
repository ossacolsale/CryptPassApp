package com.cryptpass.androidui;

import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;

public final class CryptPassWindowInsets extends CordovaPlugin {
    private View targetWebView;
    private boolean insetsListenerInstalled;
    private int initialLeft;
    private int initialTop;
    private int initialRight;
    private int initialBottom;

    @Override
    public boolean execute(String action, CordovaArgs args, CallbackContext callback) throws JSONException {
        if (!"applyInsets".equals(action)) return false;
        cordova.getActivity().runOnUiThread(() -> {
            applyInsets();
            callback.success();
        });
        return true;
    }

    @Override
    public void onResume(boolean multitasking) {
        if (cordova != null && targetWebView != null) {
            cordova.getActivity().runOnUiThread(this::applyInsets);
        }
    }

    private void applyInsets() {
        Activity activity = cordova.getActivity();
        if (targetWebView == null) targetWebView = super.webView.getView();
        if (targetWebView == null) return;

        WindowCompat.setDecorFitsSystemWindows(activity.getWindow(), false);
        View decorView = activity.getWindow().getDecorView();

        if (!insetsListenerInstalled) {
            ViewGroup.LayoutParams initialParams = targetWebView.getLayoutParams();
            if (!(initialParams instanceof ViewGroup.MarginLayoutParams)) {
                targetWebView.post(this::applyInsets);
                return;
            }
            ViewGroup.MarginLayoutParams initialMargins = (ViewGroup.MarginLayoutParams) initialParams;
            initialLeft = initialMargins.leftMargin;
            initialTop = initialMargins.topMargin;
            initialRight = initialMargins.rightMargin;
            initialBottom = initialMargins.bottomMargin;
            int statusBarResource = activity.getResources().getIdentifier("status_bar_height", "dimen", "android");
            final int statusBarFallback = statusBarResource == 0
                    ? 0
                    : activity.getResources().getDimensionPixelSize(statusBarResource);

            ViewCompat.setOnApplyWindowInsetsListener(targetWebView, (view, windowInsets) -> {
                androidx.core.graphics.Insets safeInsets = windowInsets.getInsets(
                        WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
                int topInset = Math.max(safeInsets.top, statusBarFallback);
                ViewGroup.MarginLayoutParams margins = (ViewGroup.MarginLayoutParams) targetWebView.getLayoutParams();
                margins.setMargins(initialLeft + safeInsets.left, initialTop + topInset,
                        initialRight + safeInsets.right, initialBottom + safeInsets.bottom);
                targetWebView.setLayoutParams(margins);
                return windowInsets;
            });
            insetsListenerInstalled = true;
        }

        ViewCompat.requestApplyInsets(targetWebView);
        targetWebView.post(() -> ViewCompat.requestApplyInsets(targetWebView));
        ViewCompat.requestApplyInsets(decorView);
    }
}
