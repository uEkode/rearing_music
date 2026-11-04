package cn.muyin.demo;
import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.widget.FrameLayout;

public final class MainActivity extends Activity {
    private WebView web;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFFFAF9F5);
        root.setOnApplyWindowInsetsListener((v,insets)-> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                         insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        web = new WebView(this);
        web.setBackgroundColor(0xFFFAF9F5);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setTextZoom(100);
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request){return true;}
        });
        web.setWebChromeClient(new android.webkit.WebChromeClient(){
            @Override public boolean onJsConfirm(WebView view,String url,String message,android.webkit.JsResult result){
                new AlertDialog.Builder(MainActivity.this).setTitle("重置演示")
                    .setMessage(message).setPositiveButton("重置",(d,w)->result.confirm())
                    .setNegativeButton("取消",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();
                return true;
            }
        });
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));setContentView(root);
        root.requestApplyInsets();
        web.loadUrl("file:///android_asset/index.html");
    }
    @Override public void onBackPressed(){
        web.evaluateJavascript("window.demoBack ? window.demoBack() : false",handled->{
            if(!"true".equals(handled))new AlertDialog.Builder(this).setTitle("退出演示")
                .setMessage("是否退出牧音管家？演示记录会保留在本机。")
                .setPositiveButton("退出",(d,w)->finish()).setNegativeButton("继续使用",null).show();
        });
    }
    @Override protected void onDestroy(){web.destroy();super.onDestroy();}
}
