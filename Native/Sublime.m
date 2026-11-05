#import "Core.h"
#import <CommonCrypto/CommonDigest.h>

NSString *SYSublimeFingerprint(NSString *file,NSString *content) {
    NSData *data=[[NSString stringWithFormat:@"sublime\n%@\n%@",file?:@"",content?:@""]dataUsingEncoding:NSUTF8StringEncoding];
    unsigned char digest[CC_SHA256_DIGEST_LENGTH];CC_SHA256(data.bytes,(CC_LONG)data.length,digest);NSMutableString *hash=[NSMutableString string];for(NSUInteger i=0;i<sizeof(digest);i++)[hash appendFormat:@"%02x",digest[i]];return hash;
}
static NSString *SYText(id value) { return [value isKindOfClass:NSString.class]?value:@""; }
static NSString *SYSublimeLanguage(NSString *syntax,NSString *file,NSString *content) {
    NSString *s=syntax.lowercaseString,*ext=file.pathExtension.lowercaseString;
    for(NSString *language in @[@"json",@"sql",@"python",@"javascript",@"markdown"])if([s containsString:language])return language;
    if([s containsString:@"shell"]||[@[@"sh",@"curl",@"pdo2"]containsObject:ext]||[content containsString:@"pdo2 "]||[content containsString:@"curl "])return @"shell";
    return @{@"json":@"json",@"sql":@"sql",@"py":@"python",@"js":@"javascript",@"ts":@"javascript",@"md":@"markdown"}[ext]?:@"text";
}
NSDictionary *SYSublimeSnapshot(NSDictionary *object,NSString *source,double capturedAt,NSError **error) {
    if(![object isKindOfClass:NSDictionary.class]||![object[@"windows"]isKindOfClass:NSArray.class]){if(error)*error=SYError(@"无法识别 Sublime 会话格式。");return nil;}
    BOOL live=[object[@"format"]isEqual:@"shiye-sublime-v1"];NSMutableArray *entries=[NSMutableArray array],*skipped=[NSMutableArray array];NSMutableSet *seen=[NSMutableSet set];NSUInteger windowIndex=0,total=0,empty=0;
    for(id window in object[@"windows"]){windowIndex++;if(![window isKindOfClass:NSDictionary.class])continue;NSArray *buffers=[window[@"buffers"]isKindOfClass:NSArray.class]?window[@"buffers"]:@[];NSMutableArray *opened=[NSMutableArray array];
        if(live){for(NSUInteger i=0;i<buffers.count;i++)[opened addObject:@{@"buffer":@(i)}];}
        else {for(id group in window[@"groups"]){if(![group isKindOfClass:NSDictionary.class])continue;for(id sheet in group[@"sheets"])if([sheet isKindOfClass:NSDictionary.class]&&(!sheet[@"type"]||[sheet[@"type"]isEqual:@"text"]))[opened addObject:sheet];}}
        NSMutableSet *windowSeen=[NSMutableSet set];
        for(NSDictionary *sheet in opened){id value=sheet[@"buffer"];if(![value isKindOfClass:NSNumber.class]||[value integerValue]<0||[value unsignedIntegerValue]>=buffers.count)continue;NSUInteger index=[value unsignedIntegerValue];if([windowSeen containsObject:@(index)])continue;[windowSeen addObject:@(index)];total++;
            NSDictionary *buffer=[buffers[index]isKindOfClass:NSDictionary.class]?buffers[index]:nil;if(!buffer)continue;
            NSDictionary *settings=[buffer[@"settings"]isKindOfClass:NSDictionary.class]?buffer[@"settings"]:@{};
            NSDictionary *viewSettings=[sheet[@"settings"]isKindOfClass:NSDictionary.class]?sheet[@"settings"]:@{};NSDictionary *syntaxSettings=[viewSettings[@"settings"]isKindOfClass:NSDictionary.class]?viewSettings[@"settings"]:@{};
            NSString *file=SYText(buffer[@"file"]);if(!file.length)file=SYText(sheet[@"file"]);NSString *content=SYText(buffer[@"contents"]);
            if(![buffer[@"contents"]isKindOfClass:NSString.class]&&file.length){NSDictionary *attrs=[NSFileManager.defaultManager attributesOfItemAtPath:file error:nil];if([attrs[NSFileSize]unsignedLongLongValue]>5000000){[skipped addObject:[file.lastPathComponent stringByAppendingString:@"：超过 5 MB"]];continue;}NSData *data=[NSData dataWithContentsOfFile:file];if(data){content=[[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];if(!content)content=[[NSString alloc]initWithData:data encoding:NSUTF16StringEncoding];if(!content)content=[[NSString alloc]initWithData:data encoding:CFStringConvertEncodingToNSStringEncoding(kCFStringEncodingGB_18030_2000)];}if(!content){[skipped addObject:[file.lastPathComponent stringByAppendingString:@"：文件无法读取"]];continue;}}
            if(!SYTrim(content).length){empty++;continue;}NSString *title=SYText(buffer[@"title"]);if(!title.length)title=SYText(settings[@"name"]);if(!title.length)title=file.lastPathComponent;if(!title.length){for(NSString *line in [content componentsSeparatedByCharactersInSet:NSCharacterSet.newlineCharacterSet])if(SYTrim(line).length){title=SYClip(SYTrim(line),100);break;}}if(!title.length)title=@"未命名草稿";
            if([content lengthOfBytesUsingEncoding:NSUTF8StringEncoding]>5000000){[skipped addObject:[SYClip(title,100)stringByAppendingString:@"：超过 5 MB"]];continue;}
            unichar zero=0;if([content containsString:[NSString stringWithCharacters:&zero length:1]]){[skipped addObject:[SYClip(title,100)stringByAppendingString:@"：非文本内容"]];continue;}
            NSString *fingerprint=SYSublimeFingerprint(file,content);if([seen containsObject:fingerprint])continue;[seen addObject:fingerprint];
            [entries addObject:@{@"id":NSUUID.UUID.UUIDString,@"title":SYClip(title,200),@"content":content,@"file":file,@"fingerprint":fingerprint,@"window":@(windowIndex),@"windowID":[window[@"id"]description]?:[window[@"window_id"]description]?:@"",@"bufferID":[buffer[@"id"]description]?:[@(index)description],@"capturedAt":@(capturedAt),@"source":source,@"language":SYSublimeLanguage(SYText(buffer[@"syntax"]).length?SYText(buffer[@"syntax"]):SYText(syntaxSettings[@"syntax"]),file,content),@"unsaved":@(!file.length||[buffer[@"dirty"]boolValue]||[settings[@"unsaved"]boolValue])}];
            if(entries.count>=2000){[skipped addObject:@"每次最多读取 2000 篇打开的文本"];break;}
        }if(entries.count>=2000)break;
    }
    return @{@"entries":entries,@"total":@(total),@"empty":@(empty),@"skipped":skipped,@"windowCount":@(windowIndex),@"capturedAt":@(capturedAt),@"mode":live?@"live":@"session"};
}
NSDictionary *SYReadSublimeSession(NSURL *url,NSError **error) {
    NSDictionary *attrs=[NSFileManager.defaultManager attributesOfItemAtPath:url.path error:error];if(!attrs)return nil;if([attrs[NSFileSize]unsignedLongLongValue]>100000000){if(error)*error=SYError(@"Sublime 会话超过 100 MB，建议使用实时读取。");return nil;}
    NSData *data=[NSData dataWithContentsOfURL:url options:0 error:error];if(!data)return nil;id object=[NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingFragmentsAllowed error:error];if(!object)return nil;
    return SYSublimeSnapshot(object,url.path,[attrs[NSFileModificationDate]timeIntervalSince1970],error);
}
static NSURL *SYSublimeSupport(void) {return [[[NSFileManager.defaultManager URLsForDirectory:NSApplicationSupportDirectory inDomains:NSUserDomainMask]firstObject]URLByAppendingPathComponent:@"Sublime Text"isDirectory:YES];}
void SYCaptureSublime(BOOL live,SYCompletion completion) {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED,0),^{@autoreleasepool{
        NSError *failure=nil;NSDictionary *snapshot=nil;
        if(!live){NSMutableArray *candidates=[NSMutableArray array];NSURL *support=SYSublimeSupport();for(NSString *edition in @[@"Sublime Text",@"Sublime Text 3"]){NSURL *local=[[support.URLByDeletingLastPathComponent URLByAppendingPathComponent:edition]URLByAppendingPathComponent:@"Local"];for(NSString *name in @[@"Auto Save Session.sublime_session",@"Session.sublime_session"]){NSURL *url=[local URLByAppendingPathComponent:name];NSDictionary *attrs=[NSFileManager.defaultManager attributesOfItemAtPath:url.path error:nil];if(attrs)[candidates addObject:@{@"url":url,@"date":attrs[NSFileModificationDate]}];}}[candidates sortUsingComparator:^NSComparisonResult(NSDictionary *a,NSDictionary *b){return [b[@"date"]compare:a[@"date"]];}];for(NSDictionary *candidate in candidates){failure=nil;snapshot=SYReadSublimeSession(candidate[@"url"],&failure);if(snapshot)break;}if(!snapshot&&!failure)failure=SYError(@"没有找到 Sublime 会话。请打开 Sublime 后使用实时读取。");}
        else {
            NSURL *application=[NSWorkspace.sharedWorkspace URLForApplicationWithBundleIdentifier:@"com.sublimetext.4"];if(!application)application=[NSWorkspace.sharedWorkspace URLForApplicationWithBundleIdentifier:@"com.sublimetext.3"];
            NSURL *cli=[application URLByAppendingPathComponent:@"Contents/SharedSupport/bin/subl"];
            if(!application||![NSFileManager.defaultManager isExecutableFileAtPath:cli.path])failure=SYError(@"未找到 Sublime Text，请安装并打开 Sublime，或改用会话快照。");
            NSURL *packages=[SYSublimeSupport()URLByAppendingPathComponent:@"Packages/User"isDirectory:YES];if([application.lastPathComponent containsString:@"3"]||[application.path containsString:@"Sublime Text 3"])packages=[[[SYSublimeSupport().URLByDeletingLastPathComponent URLByAppendingPathComponent:@"Sublime Text 3"]URLByAppendingPathComponent:@"Packages/User"]URLByStandardizingPath];
            NSURL *bridge=[packages URLByAppendingPathComponent:@"ShiyeBridge.py"],*source=[NSBundle.mainBundle URLForResource:@"ShiyeBridge"withExtension:@"py"];
            NSData *bridgeData=source?[NSData dataWithContentsOfURL:source]:nil;if(!failure&&!bridgeData)failure=SYError(@"缺少 Sublime 实时读取组件，请重新安装拾页。");
            if(!failure){[NSFileManager.defaultManager createDirectoryAtURL:packages withIntermediateDirectories:YES attributes:nil error:&failure];if(!failure&&![[NSData dataWithContentsOfURL:bridge]isEqual:bridgeData])[bridgeData writeToURL:bridge options:NSDataWritingAtomic error:&failure];}
            NSString *requestID=NSUUID.UUID.UUIDString;NSURL *temp=[NSURL fileURLWithPath:[NSTemporaryDirectory()stringByAppendingPathComponent:[@"shiye-sublime-"stringByAppendingString:requestID]]isDirectory:YES];NSURL *output=[temp URLByAppendingPathComponent:@"open-files.json"];
            if(!failure)[NSFileManager.defaultManager createDirectoryAtURL:temp withIntermediateDirectories:YES attributes:@{NSFilePosixPermissions:@0700}error:&failure];
            if(!failure){NSString *command=[@"shiye_export_open_files "stringByAppendingString:SYJSON(@{@"destination":output.path,@"request_id":requestID})];for(NSUInteger attempt=0;attempt<3&&!snapshot&&!failure;attempt++){
                if(attempt==0)[NSThread sleepForTimeInterval:.8];NSTask *task=[NSTask new];task.executableURL=cli;task.arguments=@[@"-b",@"--command",command];task.standardOutput=NSFileHandle.fileHandleWithNullDevice;task.standardError=NSFileHandle.fileHandleWithNullDevice;if(![task launchAndReturnError:&failure])break;
                for(NSUInteger poll=0;poll<40;poll++){if([NSFileManager.defaultManager fileExistsAtPath:output.path]){NSData *data=[NSData dataWithContentsOfURL:output];NSDictionary *object=data?[NSJSONSerialization JSONObjectWithData:data options:0 error:nil]:nil;if([object[@"requestID"]isEqual:requestID])snapshot=SYSublimeSnapshot(object,@"实时读取",[object[@"capturedAt"]doubleValue],&failure);break;}[NSThread sleepForTimeInterval:.1];}
            }if(!snapshot&&!failure)failure=SYError(@"Sublime 未返回打开的文本。请确认 Sublime 没有停在对话框，并重试实时读取，或使用会话快照。");}
            [NSFileManager.defaultManager removeItemAtURL:temp error:nil];
        }
        dispatch_async(dispatch_get_main_queue(),^{completion(snapshot,failure);});
    }});
}

NSArray *SYArchiveBatches(NSArray *notes) {
    NSMutableArray *batches=[NSMutableArray array],*batch=[NSMutableArray array];NSUInteger length=0;NSMutableSet *ids=[NSMutableSet set];
    for(NSDictionary *note in notes){NSString *content=note[@"content"];NSUInteger start=0;while(start<content.length){NSUInteger size=MIN(42000,content.length-start);if(start+size<content.length){NSRange newline=[content rangeOfString:@"\n"options:NSBackwardsSearch range:NSMakeRange(start+size/2,size-size/2)];if(newline.location!=NSNotFound)size=newline.location+1-start;}
        NSRange range=[content rangeOfComposedCharacterSequencesForRange:NSMakeRange(start,size)];size=NSMaxRange(range)-start;
        if(batch.count&&(batch.count>=20||length+size>44000||[ids containsObject:note[@"id"]])){[batches addObject:[batch copy]];[batch removeAllObjects];[ids removeAllObjects];length=0;}
        [batch addObject:@{@"id":note[@"id"],@"start":@(start),@"length":@(size),@"contentFingerprint":SYSublimeFingerprint(@"",content),@"last":@(start+size>=content.length)}];[ids addObject:note[@"id"]];length+=size;start+=size;
    }}if(batch.count)[batches addObject:batch];return batches;
}
