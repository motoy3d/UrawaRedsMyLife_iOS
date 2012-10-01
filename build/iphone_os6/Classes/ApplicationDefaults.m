/**
* Appcelerator Titanium Mobile
* This is generated code. Do not modify. Your changes *will* be lost.
* Generated code is Copyright (c) 2009-2011 by Appcelerator, Inc.
* All Rights Reserved.
*/
#import <Foundation/Foundation.h>
#import "TiUtils.h"
#import "ApplicationDefaults.h"
 
@implementation ApplicationDefaults
  
+ (NSMutableDictionary*) copyDefaults
{
    NSMutableDictionary * _property = [[NSMutableDictionary alloc] init];

    [_property setObject:[TiUtils stringValue:@"fDpMdUzYt3VMFgpcIIr5fUytmto2xRpx"] forKey:@"acs-oauth-secret-production"];
    [_property setObject:[TiUtils stringValue:@"BOfVDKY9ZUmkUvw2iV3HrDex6iOaVACK"] forKey:@"acs-oauth-key-production"];
    [_property setObject:[TiUtils stringValue:@"BUJIL7lotBPWeV4QJSDd7KjdW8vYVA8r"] forKey:@"acs-api-key-production"];
    [_property setObject:[TiUtils stringValue:@"GSMGKp4Nn25nScRiYLyMyXGVcXbh4YHs"] forKey:@"acs-oauth-secret-development"];
    [_property setObject:[TiUtils stringValue:@"NJzmFgftsJv826awLg8WfbYVJu0eJCVb"] forKey:@"acs-oauth-key-development"];
    [_property setObject:[TiUtils stringValue:@"HE1Wy7aYf7R5DBSQdkQzZjjDpPYmyI9g"] forKey:@"acs-api-key-development"];
    [_property setObject:[NSNumber numberWithInt:[TiUtils intValue:@"32768"]] forKey:@"ti.android.threadstacksize"];
    [_property setObject:[TiUtils stringValue:@"system"] forKey:@"ti.ui.defaultunit"];

    return _property;
}
@end
