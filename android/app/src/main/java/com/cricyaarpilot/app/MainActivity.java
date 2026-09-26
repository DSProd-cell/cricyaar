package com.cricyaarpilot.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(UpiPaymentPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
