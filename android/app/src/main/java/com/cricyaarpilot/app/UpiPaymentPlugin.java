package com.cricyaarpilot.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

/**
 * Launches a upi://pay intent via startActivityForResult instead of a plain
 * `window.location.href` redirect, so we get the UPI app's own response back
 * instead of firing blind. Per the NPCI UPI Linking Specification, a UPI app
 * that supports the "collect" intent flow returns a `response` extra on the
 * result Intent — a URL-encoded string with keys like Status, txnId,
 * responseCode, approvalRefNo. Not every UPI app implements this cleanly, so
 * callers should still treat anything other than an explicit SUCCESS/FAILURE
 * as unverified and fall back to asking the user.
 */
@CapacitorPlugin(name = "UpiPayment")
public class UpiPaymentPlugin extends Plugin {

    @PluginMethod
    public void pay(PluginCall call) {
        String vpa = call.getString("vpa");
        String amount = call.getString("amount");

        if (vpa == null || vpa.isEmpty() || amount == null || amount.isEmpty()) {
            call.reject("vpa and amount are required");
            return;
        }

        String payeeName = call.getString("payeeName", "");
        String note = call.getString("note");
        String refId = call.getString("refId");

        Uri.Builder builder = new Uri.Builder()
            .scheme("upi")
            .authority("pay")
            .appendQueryParameter("pa", vpa)
            .appendQueryParameter("pn", payeeName)
            .appendQueryParameter("am", amount)
            .appendQueryParameter("cu", "INR");
        if (note != null && !note.isEmpty()) builder.appendQueryParameter("tn", note);
        if (refId != null && !refId.isEmpty()) builder.appendQueryParameter("tr", refId);

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(builder.build());

        try {
            startActivityForResult(call, intent, "handlePaymentResult");
        } catch (ActivityNotFoundException e) {
            call.reject("No UPI app found on this device", e);
        }
    }

    @ActivityCallback
    private void handlePaymentResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        JSObject ret = new JSObject();

        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            // The user backed out of the UPI app, or it was killed, without
            // ever returning a response payload. Not a confirmed failure —
            // just nothing we can verify either way.
            ret.put("status", "CANCELLED");
            call.resolve(ret);
            return;
        }

        String response = result.getData().getStringExtra("response");
        if (response == null || response.isEmpty()) {
            ret.put("status", "UNKNOWN");
            call.resolve(ret);
            return;
        }

        Map<String, String> parsed = parseUpiResponse(response);
        String status = parsed.get("Status");
        if (status == null) status = parsed.get("status");
        ret.put("status", status != null ? status.toUpperCase() : "UNKNOWN");
        ret.put("raw", response);
        for (Map.Entry<String, String> entry : parsed.entrySet()) {
            ret.put(entry.getKey(), entry.getValue());
        }
        call.resolve(ret);
    }

    private Map<String, String> parseUpiResponse(String response) {
        Map<String, String> map = new HashMap<>();
        for (String pair : response.split("&")) {
            int idx = pair.indexOf('=');
            if (idx <= 0) continue;
            try {
                String key = URLDecoder.decode(pair.substring(0, idx), "UTF-8");
                String value = URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
                map.put(key, value);
            } catch (Exception ignored) {
                // Skip any pair we can't decode rather than failing the whole parse.
            }
        }
        return map;
    }
}
