#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

// An offscreen, ephemeral WebKit instance exercises the actual editor CSS.
// No application data directory, model credentials, or native RPC is available.
@interface EditorLayoutTest : NSObject<WKNavigationDelegate>
@property WKWebView *web;
@property NSWindow *window;
@property NSString *scriptPath;
@end

@implementation EditorLayoutTest
- (void)webView:(WKWebView *)web didFinishNavigation:(WKNavigation *)navigation {
    NSError *readError=nil;
    NSString *script=[NSString stringWithContentsOfFile:self.scriptPath encoding:NSUTF8StringEncoding error:&readError];
    if(!script){fprintf(stderr,"FAIL %s\n",readError.localizedDescription.UTF8String);exit(1);}
    [web callAsyncJavaScript:script arguments:@{} inFrame:nil inContentWorld:WKContentWorld.pageWorld completionHandler:^(id result,NSError *error){
        if(error){fprintf(stderr,"FAIL %s\n",[error.userInfo[@"WKJavaScriptExceptionMessage"]?:error.localizedDescription UTF8String]);exit(1);}
        for(NSString *message in result)printf("PASS %s\n",message.UTF8String);
        exit(0);
    }];
}
- (void)webView:(WKWebView *)web didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    fprintf(stderr,"FAIL %s\n",error.localizedDescription.UTF8String);exit(1);
}
@end

int main(int argc,const char *argv[]){@autoreleasepool{
    if(argc!=3)return 2;
    [NSApplication sharedApplication];
    EditorLayoutTest *test=[EditorLayoutTest new];test.scriptPath=@(argv[2]);
    test.window=[[NSWindow alloc]initWithContentRect:NSMakeRect(0,0,1154,736)styleMask:NSWindowStyleMaskBorderless backing:NSBackingStoreBuffered defer:NO];
    WKWebViewConfiguration *configuration=[WKWebViewConfiguration new];configuration.websiteDataStore=WKWebsiteDataStore.nonPersistentDataStore;
    test.web=[[WKWebView alloc]initWithFrame:NSMakeRect(0,0,1154,736)configuration:configuration];
    test.web.navigationDelegate=test;test.window.contentView=test.web;
    NSURL *page=[NSURL fileURLWithPath:@(argv[1])];[test.web loadFileURL:page allowingReadAccessToURL:page.URLByDeletingLastPathComponent];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW,45*NSEC_PER_SEC),dispatch_get_main_queue(),^{fprintf(stderr,"FAIL WebKit layout test timed out\n");exit(1);});
    [[NSRunLoop mainRunLoop]run];
}return 0;}
