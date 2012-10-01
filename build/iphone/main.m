//
//  Appcelerator Titanium Mobile
//  WARNING: this is a generated file and should not be modified
//

#import <UIKit/UIKit.h>
#define _QUOTEME(x) #x
#define STRING(x) _QUOTEME(x)

NSString * const TI_APPLICATION_DEPLOYTYPE = @"test";
NSString * const TI_APPLICATION_ID = @"urawareds.my.life";
NSString * const TI_APPLICATION_PUBLISHER = @"motoy3d";
NSString * const TI_APPLICATION_URL = @"http://motoy3d.blogspot.com";
NSString * const TI_APPLICATION_NAME = @"UrawaRedsMyLife_iOS";
NSString * const TI_APPLICATION_VERSION = @"1.0";
NSString * const TI_APPLICATION_DESCRIPTION = @"Infomation hub for Urawa Reds Supporter";
NSString * const TI_APPLICATION_COPYRIGHT = @"2012 by motoy3d";
NSString * const TI_APPLICATION_GUID = @"e1d254b0-6409-4ca9-8a7f-31ffff8acd33";
BOOL const TI_APPLICATION_ANALYTICS = false;

#ifdef TARGET_IPHONE_SIMULATOR
NSString * const TI_APPLICATION_RESOURCE_DIR = @"";
#endif

int main(int argc, char *argv[]) {
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];

#ifdef __LOG__ID__
	NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
	NSString *documentsDirectory = [paths objectAtIndex:0];
	NSString *logPath = [documentsDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%s.log",STRING(__LOG__ID__)]];
	freopen([logPath cStringUsingEncoding:NSUTF8StringEncoding],"w+",stderr);
	fprintf(stderr,"[INFO] Application started\n");
#endif

	int retVal = UIApplicationMain(argc, argv, nil, @"TiApp");
    [pool release];
    return retVal;
}
