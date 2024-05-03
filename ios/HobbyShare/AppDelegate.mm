#import "AppDelegate.h"
#import <Firebase.h>
#import <RNKakaoLogins.h>
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>
#import <NaverThirdPartyLogin/NaverThirdPartyLoginConnection.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
   [FIRApp configure];
   [GMSServices provideAPIKey:@"AIzaSyCKEnmMSbRzEbeqOwoO_zKm7qLhNhhhDKs"]; // add this line using the api key obtained from Google Console
  self.moduleName = @"HobbyShare";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}



// Naver
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    // Kakao 로그인 처리
    if ([RNKakaoLogins isKakaoTalkLoginUrl:url]) {
        return [RNKakaoLogins handleOpenUrl:url];
    }
    
    // Naver 로그인 처리
    if ([url.scheme isEqualToString:@"http://localhost:8081"]) {
        return [[NaverThirdPartyLoginConnection getSharedInstance] application:application openURL:url options:options];
    }

    return YES; // 네이버 로그인 처리 완료를 나타냄
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
