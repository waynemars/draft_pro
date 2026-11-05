#import "Core.h"

NSError *SYError(NSString *message) { return [NSError errorWithDomain:@"Shiye" code:1 userInfo:@{NSLocalizedDescriptionKey:message?:@"操作未完成"}]; }
double SYNow(void) { return NSDate.date.timeIntervalSince1970; }
NSString *SYTrim(NSString *text) { return [text?:@"" stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet]; }
NSString *SYClip(NSString *text, NSUInteger count) { if(text.length<=count)return text; NSRange r=[text rangeOfComposedCharacterSequencesForRange:NSMakeRange(0,count)];return [text substringWithRange:r]; }
NSString *SYJSON(id object) { NSData *data=[NSJSONSerialization dataWithJSONObject:object options:0 error:nil];return data?[[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding]:@"null"; }
id SYParse(NSString *text) { return [NSJSONSerialization JSONObjectWithData:[text dataUsingEncoding:NSUTF8StringEncoding]?:[NSData data] options:NSJSONReadingMutableContainers error:nil]; }
NSMutableDictionary *SYNote(NSString *title, NSString *content, NSString *kind) { return [@{@"id":NSUUID.UUID.UUIDString,@"title":title,@"content":content,@"kind":kind,@"language":@"text",@"tags":@[],@"summary":@"",@"sourceIDs":@[],@"pinned":@NO,@"archived":@NO,@"trashed":@NO,@"createdAt":@(SYNow()),@"updatedAt":@(SYNow())} mutableCopy]; }
NSDictionary *SYDefaultSettings(void) { return @{@"baseURL":@"https://oneapi-comate.baidu-int.com/v1",@"model":@"",@"hasKey":@NO,@"redactSecrets":@YES,@"apiStyle":@"chat",@"username":@"",@"repo":@""}; }

@implementation SYStore { sqlite3 *_db; }
- (instancetype)initWithDirectory:(NSURL *)directory error:(NSError **)error {
    if(!(self=[super init]))return nil; _directory=directory;
    if(![NSFileManager.defaultManager createDirectoryAtURL:directory withIntermediateDirectories:YES attributes:nil error:error])return nil;
    if(sqlite3_open([[directory URLByAppendingPathComponent:@"shiye.sqlite"].path UTF8String],&_db)!=SQLITE_OK){if(error)*error=SYError(@"无法打开本地数据库");return nil;}
    sqlite3_busy_timeout(_db,5000);
    for(NSString *sql in @[@"PRAGMA journal_mode=WAL",@"CREATE TABLE IF NOT EXISTS notes(id TEXT PRIMARY KEY,payload TEXT NOT NULL,updated REAL NOT NULL)",@"CREATE TABLE IF NOT EXISTS revisions(id TEXT PRIMARY KEY,note_id TEXT NOT NULL,payload TEXT NOT NULL,created REAL NOT NULL)",@"CREATE INDEX IF NOT EXISTS revisions_note ON revisions(note_id,created DESC)",@"CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL)",@"PRAGMA user_version=1"]){if(![self execute:sql params:@[] error:error])return nil;}
    return self;
}
- (void)dealloc { if(_db)sqlite3_close(_db); }
- (sqlite3_stmt *)statement:(NSString *)sql params:(NSArray *)params error:(NSError **)error {
    sqlite3_stmt *s=NULL;
    if(sqlite3_prepare_v2(_db,sql.UTF8String,-1,&s,NULL)!=SQLITE_OK){if(error)*error=SYError([NSString stringWithFormat:@"数据库操作失败：%s",sqlite3_errmsg(_db)]);return NULL;}
    [params enumerateObjectsUsingBlock:^(id value,NSUInteger index,BOOL *stop){if([value isKindOfClass:NSString.class])sqlite3_bind_text(s,(int)index+1,[value UTF8String],-1,SQLITE_TRANSIENT);else if([value isKindOfClass:NSNumber.class])sqlite3_bind_double(s,(int)index+1,[value doubleValue]);else sqlite3_bind_null(s,(int)index+1);}];return s;
}
- (BOOL)execute:(NSString *)sql params:(NSArray *)params error:(NSError **)error {
    sqlite3_stmt *s=[self statement:sql params:params error:error];if(!s)return NO;int status=sqlite3_step(s);sqlite3_finalize(s);
    if(status!=SQLITE_DONE&&status!=SQLITE_ROW){if(error)*error=SYError(@"数据库写入失败，请检查磁盘空间。");return NO;}return YES;
}
- (NSArray *)rows:(NSString *)sql params:(NSArray *)params error:(NSError **)error {
    sqlite3_stmt *s=[self statement:sql params:params error:error];if(!s)return nil;NSMutableArray *rows=[NSMutableArray array];int status;
    while((status=sqlite3_step(s))==SQLITE_ROW){NSMutableArray *row=[NSMutableArray array];for(int i=0;i<sqlite3_column_count(s);i++){const unsigned char *text=sqlite3_column_text(s,i);[row addObject:text?[NSString stringWithUTF8String:(const char *)text]:@""];}[rows addObject:row];}sqlite3_finalize(s);
    if(status!=SQLITE_DONE){if(error)*error=SYError(@"数据库读取失败。");return nil;}return rows;
}
- (NSArray *)all:(NSError **)error {
    NSArray *rows=[self rows:@"SELECT payload FROM notes ORDER BY updated DESC" params:@[] error:error];if(!rows)return nil;NSMutableArray *notes=[NSMutableArray array];
    for(NSArray *row in rows){id note=SYParse(row[0]);if(![note isKindOfClass:NSDictionary.class]){if(error)*error=SYError(@"存在无法读取的笔记，请从备份恢复。");return nil;}[notes addObject:note];}return notes;
}
- (NSDictionary *)note:(NSString *)identifier error:(NSError **)error { NSArray *rows=[self rows:@"SELECT payload FROM notes WHERE id=?" params:@[identifier] error:error];return rows.count?SYParse(rows[0][0]):nil; }
- (NSDictionary *)save:(NSDictionary *)value touch:(BOOL)touch forceRevision:(BOOL)force error:(NSError **)error {
    if(![value isKindOfClass:NSDictionary.class]||![value[@"id"] isKindOfClass:NSString.class]||![value[@"content"] isKindOfClass:NSString.class]||![@[@"draft",@"knowledge",@"skill"]containsObject:value[@"kind"]]){if(error)*error=SYError(@"无效的笔记内容。");return nil;}
    if([value[@"content"]lengthOfBytesUsingEncoding:NSUTF8StringEncoding]>5000000){if(error)*error=SYError(@"单篇草稿不能超过 5 MB。");return nil;}
    NSMutableDictionary *note=[value mutableCopy];note[@"title"]=SYClip(SYTrim(note[@"title"]).length?SYTrim(note[@"title"]):@"未命名草稿",200);
    NSMutableSet *tags=[NSMutableSet set];for(id tag in note[@"tags"]?:@[])if([tag isKindOfClass:NSString.class]&&SYTrim(tag).length)[tags addObject:SYTrim(tag)];note[@"tags"]=[[tags allObjects]sortedArrayUsingSelector:@selector(compare:)];
    NSDictionary *old=[self note:note[@"id"] error:error];if(error&&*error)return nil;
    if(touch)note[@"updatedAt"]=@(MAX(SYNow(),[old[@"updatedAt"]doubleValue]+0.000001));
    if(old&&![old[@"content"]isEqual:note[@"content"]]){
        NSArray *previous=[self rows:@"SELECT created FROM revisions WHERE note_id=? ORDER BY created DESC LIMIT 1" params:@[note[@"id"]] error:error];if(!previous)return nil;
        double last=previous.count?[previous[0][0]doubleValue]:0;
        if(force||SYNow()-last>30){if(![self execute:@"INSERT INTO revisions VALUES(?,?,?,?)" params:@[NSUUID.UUID.UUIDString,note[@"id"],SYJSON(old),@(SYNow())]error:error])return nil;
            if(![self execute:@"DELETE FROM revisions WHERE note_id=? AND id NOT IN(SELECT id FROM revisions WHERE note_id=? ORDER BY created DESC LIMIT 50)" params:@[note[@"id"],note[@"id"]]error:error])return nil;}
    }
    if(![self execute:@"INSERT OR REPLACE INTO notes VALUES(?,?,?)" params:@[note[@"id"],SYJSON(note),note[@"updatedAt"]?:@(SYNow())]error:error])return nil;return note;
}
- (NSArray *)revisions:(NSString *)identifier error:(NSError **)error {
    NSArray *rows=[self rows:@"SELECT id,payload,created FROM revisions WHERE note_id=? ORDER BY created DESC" params:@[identifier]error:error];if(!rows)return nil;NSMutableArray *result=[NSMutableArray array];for(NSArray *row in rows)[result addObject:@{@"id":row[0],@"note":SYParse(row[1])?:@{},@"createdAt":@([row[2]doubleValue])}];return result;
}
- (NSString *)setting:(NSString *)key { NSArray *rows=[self rows:@"SELECT value FROM settings WHERE key=?" params:@[key]error:nil];return rows.count?rows[0][0]:nil; }
- (BOOL)setSetting:(NSString *)key value:(NSString *)value error:(NSError **)error { return [self execute:@"INSERT OR REPLACE INTO settings VALUES(?,?)" params:@[key,value]error:error]; }
- (NSArray *)tokens:(NSString *)query {
    query=SYTrim(query.lowercaseString);if(!query.length)return @[];NSMutableOrderedSet *tokens=[NSMutableOrderedSet orderedSetWithObject:query];
    NSRegularExpression *regex=[NSRegularExpression regularExpressionWithPattern:@"[A-Za-z0-9_./-]{2,}|[\\p{Han}]{2,}" options:0 error:nil];
    for(NSTextCheckingResult *match in [regex matchesInString:query options:0 range:NSMakeRange(0,query.length)])[tokens addObject:[query substringWithRange:match.range]];
    [query enumerateSubstringsInRange:NSMakeRange(0,query.length) options:NSStringEnumerationByWords usingBlock:^(NSString *word,NSRange range,NSRange enclosing,BOOL *stop){if(word.length>1)[tokens addObject:word];}];
    for(NSUInteger i=0;i+1<query.length;i++){unichar c=[query characterAtIndex:i],next=[query characterAtIndex:i+1];if(c>=0x3400&&c<=0x9fff&&next>=0x3400&&next<=0x9fff)[tokens addObject:[query substringWithRange:NSMakeRange(i,2)]];}
    return tokens.array;
}
- (NSArray *)search:(NSString *)query limit:(NSUInteger)limit error:(NSError **)error {
    NSArray *tokens=[self tokens:query];if(!tokens.count)return @[];NSArray *notes=[self all:error];if(!notes)return nil;NSMutableArray *hits=[NSMutableArray array];
    for(NSDictionary *note in notes){if([note[@"trashed"]boolValue])continue;NSString *title=[note[@"title"]lowercaseString],*body=[note[@"content"]lowercaseString],*meta=[[NSString stringWithFormat:@"%@ %@",[note[@"tags"]componentsJoinedByString:@" "],note[@"summary"]?:@""]lowercaseString];double score=0;NSUInteger first=NSNotFound;
        for(NSString *token in tokens){double boost=[token isEqual:SYTrim(query.lowercaseString)]?3:1;if([title containsString:token])score+=7*boost;if([meta containsString:token])score+=4*boost;NSRange range=[body rangeOfString:token];if(range.location!=NSNotFound){score+=2*boost;first=MIN(first,range.location);}}
        if(!score)continue;if([note[@"kind"]isEqual:@"knowledge"])score+=0.7;if([note[@"pinned"]boolValue])score+=0.2;
        NSString *content=note[@"content"];NSUInteger start=first!=NSNotFound&&first>55?MIN(first-55,content.length):0;NSString *excerpt=[(start?@"…":@"")stringByAppendingString:SYClip([content substringFromIndex:start],220)];[hits addObject:@{@"note":note,@"score":@(score),@"excerpt":excerpt}];
    }
    [hits sortUsingComparator:^NSComparisonResult(NSDictionary *a,NSDictionary *b){NSComparisonResult r=[b[@"score"]compare:a[@"score"]];return r==NSOrderedSame?[b[@"note"][@"updatedAt"]compare:a[@"note"][@"updatedAt"]]:r;}];return hits.count>limit?[hits subarrayWithRange:NSMakeRange(0,limit)]:hits;
}
- (NSArray *)accept:(NSDictionary *)proposal knowledge:(BOOL)knowledge skill:(BOOL)skill error:(NSError **)error {
    if(!knowledge&&!skill){if(error)*error=SYError(@"请至少选择一种产物。");return nil;}
    NSArray *ids=proposal[@"sourceIDs"];if(!ids.count){if(error)*error=SYError(@"没有原始草稿。");return nil;}NSMutableArray *sources=[NSMutableArray array];
    for(NSString *identifier in ids){NSDictionary *note=[self note:identifier error:error];if(!note||[note[@"trashed"]boolValue]){if(error)*error=SYError(@"原始草稿不存在。");return nil;}if(!proposal[@"sourceVersions"][identifier]||[note[@"updatedAt"]doubleValue]!=[proposal[@"sourceVersions"][identifier]doubleValue]){if(error)*error=SYError(@"草稿已更新，请重新整理后再归档。");return nil;}[sources addObject:note];}
    if(![self execute:@"BEGIN IMMEDIATE TRANSACTION" params:@[] error:error])return nil;NSMutableArray *created=[NSMutableArray array];BOOL ok=YES;
    for(NSString *kind in @[@"knowledge",@"skill"]){if(([kind isEqual:@"knowledge"]&&!knowledge)||([kind isEqual:@"skill"]&&!skill))continue;NSString *content=proposal[kind];if(!SYTrim(content).length){if(error)*error=SYError(@"归档内容为空。");ok=NO;break;}NSMutableDictionary *note=SYNote([proposal[@"title"]stringByAppendingString:[kind isEqual:@"skill"]?@" · Skill":@""],content,kind);note[@"language"]=@"markdown";note[@"summary"]=proposal[@"summary"]?:@"";note[@"tags"]=proposal[@"tags"]?:@[];note[@"sourceIDs"]=ids;NSDictionary *saved=[self save:note touch:YES forceRevision:NO error:error];if(!saved){ok=NO;break;}[created addObject:saved];}
    if(ok)for(NSDictionary *value in sources){NSMutableDictionary *note=[value mutableCopy];if(![proposal[@"deferArchiveIDs"]containsObject:value[@"id"]])note[@"archived"]=@YES;note[@"summary"]=proposal[@"summary"]?:@"";NSMutableSet *tags=[NSMutableSet setWithArray:note[@"tags"]?:@[]];[tags addObjectsFromArray:proposal[@"tags"]?:@[]];note[@"tags"]=tags.allObjects;if(![self save:note touch:YES forceRevision:NO error:error]){ok=NO;break;}}
    if(ok)ok=[self execute:@"COMMIT" params:@[]error:error];if(!ok){[self execute:@"ROLLBACK" params:@[]error:nil];return nil;}return created;
}
- (NSString *)language:(NSString *)ext { return @{@"json":@"json",@"sql":@"sql",@"curl":@"shell",@"http":@"shell",@"sh":@"shell",@"zsh":@"shell",@"bash":@"shell",@"py":@"python",@"js":@"javascript",@"ts":@"javascript",@"md":@"markdown",@"markdown":@"markdown"}[ext.lowercaseString]?:@"text"; }
- (NSDictionary *)importFiles:(NSArray<NSURL *> *)urls error:(NSError **)error {
    NSSet *extensions=[NSSet setWithArray:@[@"txt",@"md",@"markdown",@"sql",@"sh",@"zsh",@"bash",@"py",@"js",@"ts",@"json",@"yaml",@"yml",@"toml",@"log",@"curl",@"http",@"xml",@"csv",@"ini",@"conf",@"pdo2",@"php",@"go",@"rs",@"c",@"h",@"swift"]];NSMutableArray *candidates=[NSMutableArray array],*skipped=[NSMutableArray array];
    for(NSURL *url in urls){BOOL directory=NO;[NSFileManager.defaultManager fileExistsAtPath:url.path isDirectory:&directory];if(!directory){[candidates addObject:url];continue;}NSDirectoryEnumerator *enumerator=[NSFileManager.defaultManager enumeratorAtURL:url includingPropertiesForKeys:@[NSURLIsRegularFileKey]options:NSDirectoryEnumerationSkipsHiddenFiles|NSDirectoryEnumerationSkipsPackageDescendants errorHandler:nil];for(NSURL *file in enumerator){if([@[@"node_modules",@"vendor",@".git",@"build",@"dist"]containsObject:file.lastPathComponent]){[enumerator skipDescendants];continue;}NSNumber *regular=nil;[file getResourceValue:&regular forKey:NSURLIsRegularFileKey error:nil];if(regular.boolValue&&[extensions containsObject:file.pathExtension.lowercaseString])[candidates addObject:file];if(candidates.count>=2000){[skipped addObject:@"每次最多打开 2000 个文件"];break;}}}
    NSArray *existing=[self all:error];if(!existing)return nil;NSMutableSet *fingerprints=[NSMutableSet set];for(NSDictionary *note in existing)[fingerprints addObject:[NSString stringWithFormat:@"%@\n%@",note[@"sourcePath"]?:@"",note[@"content"]]];
    if(![self execute:@"BEGIN IMMEDIATE TRANSACTION" params:@[]error:error])return nil;NSInteger count=0;BOOL ok=YES;
    for(NSURL *url in candidates){NSDictionary *attrs=[NSFileManager.defaultManager attributesOfItemAtPath:url.path error:nil];if(!attrs||[attrs[NSFileSize]unsignedLongLongValue]>5000000){[skipped addObject:[url.lastPathComponent stringByAppendingString:@"：无法读取或超过 5 MB"]];continue;}NSData *data=[NSData dataWithContentsOfURL:url];NSString *content=[[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];if(!content)content=[[NSString alloc]initWithData:data encoding:NSUTF16StringEncoding];if(!content)content=[[NSString alloc]initWithData:data encoding:CFStringConvertEncodingToNSStringEncoding(kCFStringEncodingGB_18030_2000)];
        unichar zero=0;NSString *nullChar=[NSString stringWithCharacters:&zero length:1];if(!content||[content containsString:nullChar]){[skipped addObject:[url.lastPathComponent stringByAppendingString:@"：非文本文件"]];continue;}NSString *fingerprint=[NSString stringWithFormat:@"%@\n%@",url.path,content];if([fingerprints containsObject:fingerprint])continue;
        NSMutableDictionary *note=SYNote(url.URLByDeletingPathExtension.lastPathComponent,content,@"draft");note[@"sourcePath"]=url.path;note[@"sourceModifiedAt"]=@([attrs[NSFileModificationDate]timeIntervalSince1970]);note[@"language"]=[self language:url.pathExtension];if(![self save:note touch:YES forceRevision:NO error:error]){ok=NO;break;}[fingerprints addObject:fingerprint];count++;
    }
    if(ok)ok=[self execute:@"COMMIT" params:@[]error:error];if(!ok){[self execute:@"ROLLBACK" params:@[]error:nil];return nil;}return @{@"count":@(count),@"skipped":skipped};
}
- (NSDictionary *)importSublimeEntries:(NSArray *)entries error:(NSError **)error {
    NSArray *all=[self all:error];if(!all)return nil;NSMutableDictionary *existing=[NSMutableDictionary dictionary];for(NSDictionary *note in all)if(note[@"sublimeFingerprint"]&&![note[@"trashed"]boolValue]&&[note[@"sublimeFingerprint"]isEqual:SYSublimeFingerprint(note[@"sublimeOrigin"][@"file"]?:@"",note[@"content"])])existing[note[@"sublimeFingerprint"]]=note;
    if(![self execute:@"BEGIN IMMEDIATE TRANSACTION"params:@[]error:error])return nil;BOOL ok=YES;NSUInteger count=0;NSMutableOrderedSet *ids=[NSMutableOrderedSet orderedSet];
    for(NSDictionary *entry in entries){NSString *fingerprint=entry[@"fingerprint"];NSDictionary *previous=existing[fingerprint];if(previous){[ids addObject:previous[@"id"]];continue;}
        NSMutableDictionary *note=SYNote(entry[@"title"],entry[@"content"],@"draft");note[@"language"]=entry[@"language"]?:@"text";note[@"tags"]=@[@"Sublime 导入"];note[@"sublimeFingerprint"]=fingerprint;note[@"sublimeOrigin"]=@{@"file":entry[@"file"]?:@"",@"title":entry[@"title"]?:@"",@"window":entry[@"window"]?:@1,@"bufferID":entry[@"bufferID"]?:@"",@"capturedAt":entry[@"capturedAt"]?:@(SYNow()),@"unsaved":entry[@"unsaved"]?:@NO};
        // Imported buffers are independent copies. Saving must never overwrite their Sublime file.
        NSDictionary *saved=[self save:note touch:YES forceRevision:NO error:error];if(!saved){ok=NO;break;}existing[fingerprint]=saved;[ids addObject:saved[@"id"]];count++;
    }
    if(ok)ok=[self execute:@"COMMIT"params:@[]error:error];if(!ok){[self execute:@"ROLLBACK"params:@[]error:nil];return nil;}return @{@"count":@(count),@"duplicates":@(entries.count-count),@"ids":ids.array};
}
- (BOOL)backup:(NSURL *)url error:(NSError **)error { NSArray *notes=[self all:error];if(!notes)return NO;NSData *data=[NSJSONSerialization dataWithJSONObject:notes options:NSJSONWritingPrettyPrinted error:error];return data&&[data writeToURL:url options:NSDataWritingAtomic error:error]; }
- (NSInteger)restore:(NSURL *)url error:(NSError **)error {
    NSData *data=[NSData dataWithContentsOfURL:url options:0 error:error];if(!data)return -1;if(data.length>100000000){if(error)*error=SYError(@"备份超过 100 MB。");return -1;}NSArray *notes=[NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:error];if(![notes isKindOfClass:NSArray.class]){if(error)*error=SYError(@"请选择拾页 JSON 备份。");return -1;}
    if(![self execute:@"BEGIN IMMEDIATE TRANSACTION" params:@[]error:error])return -1;NSInteger count=0;BOOL ok=YES;
    for(id note in notes){if(![note isKindOfClass:NSDictionary.class]||![note[@"id"]isKindOfClass:NSString.class]){if(error)*error=SYError(@"备份中存在无效的笔记。");ok=NO;break;}NSDictionary *current=[self note:note[@"id"]error:error];if(current&&[current[@"updatedAt"]doubleValue]>=[note[@"updatedAt"]doubleValue])continue;if(![self save:note touch:NO forceRevision:YES error:error]){ok=NO;break;}count++;}
    if(ok)ok=[self execute:@"COMMIT" params:@[]error:error];if(!ok){[self execute:@"ROLLBACK" params:@[]error:nil];return -1;}return count;
}
@end

static NSString *SYKeychainService(void) {
    // An isolated workspace must also isolate credentials from the user's normal workspace.
    NSString *directory=NSProcessInfo.processInfo.environment[@"SHIYE_DATA_DIR"];
    return directory.length?[@"local.shiye.mac.provider.test."stringByAppendingString:directory]:@"local.shiye.mac.provider";
}
NSString *SYKey(void) {
    NSDictionary *query=@{(__bridge id)kSecClass:(__bridge id)kSecClassGenericPassword,(__bridge id)kSecAttrService:SYKeychainService(),(__bridge id)kSecAttrAccount:@"api-key",(__bridge id)kSecReturnData:@YES,(__bridge id)kSecMatchLimit:(__bridge id)kSecMatchLimitOne};CFTypeRef result=NULL;OSStatus status=SecItemCopyMatching((__bridge CFDictionaryRef)query,&result);if(status!=errSecSuccess)return @"";NSData *data=CFBridgingRelease(result);return [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding]?:@"";
}
BOOL SYHasKey(void) {
    NSDictionary *query=@{(__bridge id)kSecClass:(__bridge id)kSecClassGenericPassword,(__bridge id)kSecAttrService:SYKeychainService(),(__bridge id)kSecAttrAccount:@"api-key",(__bridge id)kSecReturnAttributes:@YES,(__bridge id)kSecMatchLimit:(__bridge id)kSecMatchLimitOne,(__bridge id)kSecUseAuthenticationUI:(__bridge id)kSecUseAuthenticationUIFail};
    CFTypeRef result=NULL;OSStatus status=SecItemCopyMatching((__bridge CFDictionaryRef)query,&result);if(result)CFRelease(result);
    return status==errSecSuccess||status==errSecInteractionNotAllowed;
}
BOOL SYSetKey(NSString *key,NSError **error) {
    NSDictionary *query=@{(__bridge id)kSecClass:(__bridge id)kSecClassGenericPassword,(__bridge id)kSecAttrService:SYKeychainService(),(__bridge id)kSecAttrAccount:@"api-key"};OSStatus status;
    if(!key.length){status=SecItemDelete((__bridge CFDictionaryRef)query);if(status==errSecItemNotFound)status=errSecSuccess;}
    else {NSDictionary *attrs=@{(__bridge id)kSecValueData:[key dataUsingEncoding:NSUTF8StringEncoding]};status=SecItemUpdate((__bridge CFDictionaryRef)query,(__bridge CFDictionaryRef)attrs);if(status==errSecItemNotFound){NSMutableDictionary *item=[query mutableCopy];[item addEntriesFromDictionary:attrs];item[(__bridge id)kSecAttrAccessible]=(__bridge id)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly;status=SecItemAdd((__bridge CFDictionaryRef)item,NULL);}}
    if(status!=errSecSuccess){if(error)*error=SYError([NSString stringWithFormat:@"系统钥匙串操作失败（%d）",(int)status]);return NO;}return YES;
}
