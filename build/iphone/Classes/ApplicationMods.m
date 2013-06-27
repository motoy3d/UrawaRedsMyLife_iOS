#import "ApplicationMods.h"

@implementation ApplicationMods

+ (NSArray*) compiledMods
{
	NSMutableArray *modules = [NSMutableArray array];
	[modules addObject:[NSDictionary dictionaryWithObjectsAndKeys:@"titanium-social-module",@"name",@"de.marcelpociot.social",@"moduleid",@"1.0.1",@"version",@"61aa3517-3020-4af2-a0d3-8928f3009ba8",@"guid",@"",@"licensekey",nil]];
	return modules;
}

@end