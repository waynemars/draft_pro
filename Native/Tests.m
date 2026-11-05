#import "Core.h"
static int checks=0;
static void Check(BOOL passed,NSString *name) { if(!passed)@throw [NSException exceptionWithName:@"TestFailed"reason:name userInfo:nil];printf("PASS %s\n",name.UTF8String);checks++; }

int SYRunTests(void) {
    NSURL *directory=[NSURL fileURLWithPath:[NSTemporaryDirectory()stringByAppendingPathComponent:[@"shiye-test-"stringByAppendingString:NSUUID.UUID.UUIDString]]isDirectory:YES];
    @try {
        NSError *error=nil;SYStore *store=[[SYStore alloc]initWithDirectory:directory error:&error];Check(store!=nil,@"SQLite 数据库初始化");
        NSMutableDictionary *note=SYNote(@"anti_center 日志排查",@"pdo2 -M -bns <group> \"grep -i 'anti_center' ./log/service.log\"\n会议待办：补充错误码监控",@"draft");note[@"language"]=@"shell";
        note=[[store save:note touch:YES forceRevision:NO error:&error]mutableCopy];Check([[store note:note[@"id"]error:&error][@"content"]isEqual:note[@"content"]],@"文本保存与读取");
        Check([[[store search:@"日志排查"limit:10 error:&error]firstObject][@"note"][@"id"]isEqual:note[@"id"]],@"中文关键词检索");
        Check([[[store search:@"pdo2"limit:10 error:&error]firstObject][@"note"][@"id"]isEqual:note[@"id"]],@"命令检索");
        Check([store search:@"完全不存在的查询"limit:10 error:&error].count==0,@"检索无结果");
        note[@"content"]=[note[@"content"]stringByAppendingString:@"\n新的结论"];note=[[store save:note touch:YES forceRevision:NO error:&error]mutableCopy];Check([store revisions:note[@"id"]error:&error].count==1,@"编辑前创建历史版本");
        NSDictionary *proposal=SYLocalProposal(@[note]);Check([proposal[@"skill"]containsString:@"pdo2"]&&[proposal[@"skill"]containsString:@"待完善"],@"本地模板保留 pdo2 并注明待完善");
        NSArray *created=[store accept:proposal knowledge:YES skill:YES error:&error];Check(created.count==2,@"事务归档生成知识与 Skill");
        Check([created[0][@"sourceIDs"]isEqual:@[note[@"id"]]],@"产物可追溯原始草稿");
        NSDictionary *source=[store note:note[@"id"]error:&error];Check([source[@"archived"]boolValue]&&[source[@"content"]isEqual:note[@"content"]],@"归档后原稿完整保留");
        error=nil;Check([store accept:proposal knowledge:YES skill:NO error:&error]==nil&&error!=nil,@"拒绝重复提交过期预览");error=nil;
        NSMutableDictionary *second=SYNote(@"第二份排查",@"补充 access 日志",@"draft");second=[[store save:second touch:YES forceRevision:NO error:&error]mutableCopy];source=[store note:note[@"id"]error:&error];NSDictionary *multi=SYLocalProposal(@[source,second]);NSArray *merged=[store accept:multi knowledge:YES skill:NO error:&error];Check([merged[0][@"sourceIDs"]count]==2&&[[store note:second[@"id"]error:&error][@"archived"]boolValue],@"多篇聚合归档");
        second=[[store note:second[@"id"]error:&error]mutableCopy];NSMutableDictionary *invalid=[SYLocalProposal(@[second])mutableCopy];invalid[@"skill"]=@"";NSUInteger before=[store all:&error].count;error=nil;Check([store accept:invalid knowledge:YES skill:YES error:&error]==nil&&error!=nil,@"拒绝空内容归档");error=nil;Check([store all:&error].count==before,@"失败事务回滚，无残余产物");
        NSMutableDictionary *trashed=[created[0]mutableCopy];trashed[@"trashed"]=@YES;[store save:trashed touch:YES forceRevision:NO error:&error];BOOL found=NO;for(NSDictionary *hit in [store search:@"anti_center"limit:60 error:&error])if([hit[@"note"][@"id"]isEqual:trashed[@"id"]])found=YES;Check(!found,@"废纸篓不参与搜索");
        NSURL *file=[directory URLByAppendingPathComponent:@"运维草稿.txt"];[@"pdo2 -M 日志排查\n中文不乱码"writeToURL:file atomically:YES encoding:NSUTF8StringEncoding error:&error];Check([[store importFiles:@[file]error:&error][@"count"]integerValue]==1,@"打开 UTF-8 中文文本");Check([[store importFiles:@[file]error:&error][@"count"]integerValue]==0,@"重复打开同内容去重");
        NSURL *backup=[directory URLByAppendingPathComponent:@"backup.json"];Check([store backup:backup error:&error],@"JSON 完整备份");SYStore *restored=[[SYStore alloc]initWithDirectory:[directory URLByAppendingPathComponent:@"restore"]error:&error];Check([restored restore:backup error:&error]==(NSInteger)[store all:&error].count,@"恢复备份");Check([restored restore:backup error:&error]==0,@"恢复保护较新的本地数据");
        Check(![[NSString stringWithContentsOfURL:backup encoding:NSUTF8StringEncoding error:&error]containsString:@"api-key"],@"备份不含模型密钥");
        [store setSetting:@"workspace"value:@"{\"wrap\":true}"error:&error];Check([[store setting:@"workspace"]isEqual:@"{\"wrap\":true}"],@"工作空间状态持久化");SYStore *reopened=[[SYStore alloc]initWithDirectory:directory error:&error];Check([reopened all:&error].count==[store all:&error].count,@"重新打开数据库保留数据");
        NSString *raw=@"curl https://test -H 'Authorization: Bearer super-secret-value' -H 'X-Api-Key: hidden-value' -u 'user:password'\npassword=badsecret&next=true\nCookie: session=secret-session\nhttps://user:pass@example.com";NSString *redacted=SYRedact(raw);for(NSString *secret in @[@"super-secret-value",@"hidden-value",@"user:password",@"badsecret",@"secret-session",@"user:pass@"]){Check(![redacted containsString:secret],[@"请求凭证隐藏："stringByAppendingString:secret]);}Check([redacted containsString:@"curl"]&&[redacted containsString:@"next=true"],@"脱敏保留命令结构");
        NSMutableDictionary *settings=[SYDefaultSettings()mutableCopy];settings[@"baseURL"]=@"https://api.example.com/v1/";Check([SYEndpoint(settings,&error).absoluteString isEqual:@"https://api.example.com/v1/chat/completions"],@"API 地址规范化");settings[@"baseURL"]=@"http://localhost:11434/v1/chat/completions";Check(SYEndpoint(settings,&error)!=nil,@"本机 Ollama 接口");settings[@"baseURL"]=@"http://example.com/v1";error=nil;Check(SYEndpoint(settings,&error)==nil&&error!=nil,@"拒绝远程明文接口");settings[@"baseURL"]=@"https://example.com/v1?api_key=secret";error=nil;Check(SYEndpoint(settings,&error)==nil&&error!=nil,@"拒绝 URL 内嵌密钥");error=nil;
        for(NSString *style in @[@"chat",@"responses",@"anthropic"]){NSMutableDictionary *catalog=[SYDefaultSettings()mutableCopy];catalog[@"apiStyle"]=style;catalog[@"baseURL"]=@"https://api.example.com/gateway/v1/messages/";Check([SYModelsEndpoint(catalog,&error).absoluteString isEqual:@"https://api.example.com/gateway/v1/models"],[@"模型列表地址与协议无关："stringByAppendingString:style]);}
        settings[@"baseURL"]=@"https://api.example.com/v1/models";Check([SYModelsEndpoint(settings,&error).absoluteString isEqual:@"https://api.example.com/v1/models"],@"模型列表完整地址不重复追加");
        NSString *output=@"```json\n{\"title\":\"排查流程\",\"summary\":\"基于原稿\",\"tags\":[\"运维\"],\"knowledge\":\"# 知识\",\"skill\":\"# 步骤\"}\n```";NSDictionary *parsed=SYProposal(output,@[note],&error);Check([parsed[@"skill"]hasPrefix:@"---\nname:"]&&[parsed[@"sourceIDs"]isEqual:@[note[@"id"]]],@"AI JSON 与 Skill 元数据规范化");error=nil;Check(SYProposal(@"{\"title\":\"缺失内容\"}",@[note],&error)==nil&&error!=nil,@"拒绝不完整的模型输出");error=nil;
        NSDictionary *validArchive=@{@"title":@"格式回归",@"summary":@"依据原稿",@"knowledge":@"```sh\ngrep 'errno\\[1\\]' ./log\n```\nJSON 示例：{\"key\":\"value\"}",@"skill":@"# 验证流程",@"tags":@[@"格式"]};
        NSString *validJSON=SYJSON(validArchive);error=nil;
        NSDictionary *withProse=SYProposal([NSString stringWithFormat:@"说明 {invalid}：\n```json\n%@\n```\n状态：{\"ok\":true}",validJSON],@[note],&error);
        Check([withProse[@"knowledge"]isEqual:validArchive[@"knowledge"]]&&!error,@"带前后说明、围栏、代码括号和转义的归档 JSON 可正确解析");
        error=nil;Check(!SYProposal([validJSON stringByAppendingFormat:@"\n%@",validJSON],@[note],&error)&&[error.localizedDescription containsString:@"多个归档对象"],@"拒绝含糊的多个归档对象，不丢弃其中内容");
        NSMutableDictionary *missingField=[validArchive mutableCopy];[missingField removeObjectForKey:@"skill"];error=nil;
        Check(!SYProposal(SYJSON(missingField),@[note],&error)&&[error.localizedDescription containsString:@"skill"],@"缺失字段错误指出具体字段");
        NSMutableDictionary *wrongType=[validArchive mutableCopy];wrongType[@"knowledge"]=@{@"content":@"嵌套正文"};error=nil;
        Check(!SYProposal(SYJSON(wrongType),@[note],&error)&&[error.localizedDescription containsString:@"knowledge"]&&[error.localizedDescription containsString:@"必须是文本"],@"对象和数组类型错误不会冒充合法 Markdown");
        error=nil;Check(!SYProposal(@"{\"title\":\"bad\",\"knowledge\":\"grep \\q\"}",@[note],&error)&&[error.localizedDescription containsString:@"有效 JSON"],@"非法命令转义被识别为 JSON 格式错误");
        error=nil;Check(!SYProposal(validJSON,@[],&error)&&error,@"没有来源时不能接受归档结果");
        error=nil;NSDictionary *chatBlocks=SYDecodeCompletion(@{@"choices":@[@{@"finish_reason":@"stop",@"message":@{@"content":@[@{@"type":@"text",@"text":@"完整正文"}]}}]},@"chat",&error);
        Check([chatBlocks[@"text"]isEqual:@"完整正文"]&&![chatBlocks[@"truncated"]boolValue],@"Chat 支持数组形式的文本块");
        NSDictionary *chatCut=SYDecodeCompletion(@{@"choices":@[@{@"finish_reason":@"length",@"message":@{@"content":@"半截正文"}}]},@"chat",&error);
        Check([chatCut[@"truncated"]boolValue],@"Chat length 识别为输出截断");
        NSDictionary *anthropicCut=SYDecodeCompletion(@{@"stop_reason":@"max_tokens",@"content":@[@{@"type":@"text",@"text":@"半截正文"}]},@"anthropic",&error);
        Check([anthropicCut[@"truncated"]boolValue],@"Anthropic max_tokens 识别为输出截断");
        NSDictionary *responsesCut=SYDecodeCompletion(@{@"status":@"incomplete",@"incomplete_details":@{@"reason":@"max_output_tokens"},@"output":@[]},@"responses",&error);
        Check([responsesCut[@"truncated"]boolValue],@"Responses 即使没有正文也可识别输出限额");
        error=nil;Check(!SYDecodeCompletion(@{@"choices":@[@{@"finish_reason":@"stop",@"message":@{@"refusal":@"拒绝",@"content":@""}}]},@"chat",&error)&&[error.localizedDescription containsString:@"拒绝处理"],@"模型拒绝不进入格式修复重试");
        error=nil;
        NSMutableDictionary *broken=[note mutableCopy];broken[@"kind"]=@"invalid";Check([store save:broken touch:YES forceRevision:NO error:&error]==nil,@"拒绝无效笔记类型");
        NSString *commandSecrets=SYRedact(@"mysql56 -h127.0.0.1 -P3306 -utest -pfixture-db-secret -Dtest\nOFFLINE_PWD=fixture-env-secret ./script\ncurl 'https://example.com?tb_sig=fixture-signature' -d 'robot_sign=fixture-robot'");for(NSString *secret in @[@"fixture-db-secret",@"fixture-env-secret",@"fixture-signature",@"fixture-robot"])Check(![commandSecrets containsString:secret],[@"导入命令凭证隐藏："stringByAppendingString:secret]);
        Check([commandSecrets containsString:@"-P3306"],@"隐藏 MySQL 密码时保留大写 -P 端口参数");
        NSString *encoded=[@"" stringByPaddingToLength:1000000 withString:@"Ab09_" startingAtIndex:0];double redactionStarted=SYNow();Check([SYRedact(encoded)isEqual:encoded]&&SYNow()-redactionStarted<5,@"百万字符连续日志的凭证隐藏保持响应");
        NSString *rawCommand=@"pdo2 -M -bns <group> \"grep -i 'error' ./log/service.log\"\n会议：待确认\n";
        NSURL *disk=[directory URLByAppendingPathComponent:@"saved.txt"];[@"旧磁盘版本"writeToURL:disk atomically:YES encoding:NSUTF8StringEncoding error:&error];
        NSDictionary *live=@{@"format":@"shiye-sublime-v1",@"windows":@[@{@"id":@"w1",@"buffers":@[@{@"id":@"b1",@"title":@"日志排查",@"contents":rawCommand,@"file":@"",@"dirty":@YES},@{@"id":@"b2",@"title":@"saved.txt",@"contents":@"未保存的新版本",@"file":disk.path,@"dirty":@YES},@{@"contents":@" \n"}]},@{@"id":@"w2",@"buffers":@[@{@"contents":rawCommand,@"file":@""}]}]};
        error=nil;NSDictionary *snapshot=SYSublimeSnapshot(live,@"fixture",SYNow(),&error);Check(snapshot!=nil&&[snapshot[@"entries"]count]==2&&[snapshot[@"total"]integerValue]==4,@"Sublime 全窗口、未保存草稿、空白忽略与跨窗口去重");
        NSArray *entries=snapshot[@"entries"];Check([entries[0][@"content"]isEqual:rawCommand]&&[entries[0][@"language"]isEqual:@"shell"],@"Sublime 导入逐字保留 pdo2 与中文");Check([entries[1][@"content"]isEqual:@"未保存的新版本"],@"Sublime 内存内容优先于磁盘旧版本");
        NSDictionary *imported=[store importSublimeEntries:entries error:&error];Check([imported[@"count"]integerValue]==2,@"Sublime 导入写入事务");NSDictionary *copy=[store note:imported[@"ids"][1]error:&error];Check(copy[@"sourcePath"]==nil&&[copy[@"sublimeOrigin"][@"file"]isEqual:disk.path],@"Sublime 保留来源但不绑定原文件写入");Check([[[NSString alloc]initWithContentsOfURL:disk encoding:NSUTF8StringEncoding error:&error]isEqual:@"旧磁盘版本"],@"Sublime 导入不改动原文件");
        Check([[store importSublimeEntries:entries error:&error][@"count"]integerValue]==0,@"重复 Sublime 导入复用已有副本");NSMutableDictionary *editedCopy=[copy mutableCopy];editedCopy[@"content"]=@"拾页独立编辑";[store save:editedCopy touch:YES forceRevision:NO error:&error];Check([[store importSublimeEntries:entries error:&error][@"count"]integerValue]==1,@"已编辑的导入副本不会覆盖再次导入的原内容");
        NSDictionary *session=@{@"file_history":@[@"never-read.txt"],@"windows":@[@{@"buffers":@[@{@"file":disk.path},@{@"contents":@"not-opened"}],@"groups":@[@{@"sheets":@[@{@"buffer":@0,@"type":@"text"},@{@"buffer":@0,@"type":@"text"}]}]}]};NSDictionary *oldSnapshot=SYSublimeSnapshot(session,@"fixture-session",123,&error);Check([oldSnapshot[@"entries"]count]==1&&[oldSnapshot[@"entries"][0][@"content"]isEqual:@"旧磁盘版本"],@"会话仅读取打开的 sheet，回退读取磁盘，不读取历史列表");
        NSMutableDictionary *longNote=SYNote(@"长日志",[@"日志😀\n"stringByPaddingToLength:100003 withString:@"日志😀\n"startingAtIndex:0],@"draft");NSArray *batches=SYArchiveBatches(@[longNote]);NSMutableString *joined=[NSMutableString string];BOOL withinLimits=YES;NSUInteger next=0;for(NSArray *batch in batches){NSUInteger characters=0;for(NSDictionary *part in batch){NSUInteger start=[part[@"start"]unsignedIntegerValue],length=[part[@"length"]unsignedIntegerValue];if(start!=next)withinLimits=NO;next=start+length;[joined appendString:[longNote[@"content"]substringWithRange:NSMakeRange(start,length)]];characters+=length;}if(characters>44000||batch.count>20)withinLimits=NO;}Check(withinLimits&&[joined isEqual:longNote[@"content"]],@"超长草稿分段完整无丢失、无重叠并满足批次上限");
        NSMutableArray *many=[NSMutableArray array];for(NSUInteger i=0;i<45;i++)[many addObject:SYNote(@"batch",@"短记录",@"draft")];Check(SYArchiveBatches(many).count==3,@"超过二十篇自动规划多批次");
        NSMutableDictionary *partial=[[store note:imported[@"ids"][0]error:&error]mutableCopy];NSMutableDictionary *partialProposal=[SYLocalProposal(@[partial])mutableCopy];partialProposal[@"deferArchiveIDs"]=@[partial[@"id"]];Check([store accept:partialProposal knowledge:YES skill:NO error:&error]!=nil&&![[store note:partial[@"id"]error:&error][@"archived"]boolValue],@"长文本中间段归档保留未完成状态");partial=[[store note:partial[@"id"]error:&error]mutableCopy];Check([store accept:SYLocalProposal(@[partial])knowledge:YES skill:NO error:&error]!=nil&&[[store note:partial[@"id"]error:&error][@"archived"]boolValue],@"长文本最后一段完成后标记原稿已归档");
        printf("\n%d 项核心测试通过。\n",checks);
    }@catch(NSException *exception){fprintf(stderr,"FAIL %s\n",exception.reason.UTF8String);[NSFileManager.defaultManager removeItemAtURL:directory error:nil];return 1;}
    [NSFileManager.defaultManager removeItemAtURL:directory error:nil];return 0;
}

static void VerifyAPICounts(NSString *base) {
    NSURLComponents *parts=[NSURLComponents componentsWithString:base];parts.path=@"/fixture/counts";
    [[NSURLSession.sharedSession dataTaskWithURL:parts.URL completionHandler:^(NSData *data,NSURLResponse *response,NSError *error){
        id counts=data?[NSJSONSerialization JSONObjectWithData:data options:0 error:nil]:nil;
        if(error||![counts isKindOfClass:NSDictionary.class]){fprintf(stderr,"FAIL 读取模拟服务调用次数\n");exit(1);}
        NSDictionary *expected=@{@"test-model":@2,@"error-model":@1,@"archive-format-once":@2,@"archive-shape-once":@2,@"archive-cut-once":@2,@"archive-format-always":@2,@"archive-cut-always":@2,@"archive-refusal":@1,@"archive-http":@1};
        for(NSString *path in @[@"/v1/chat/completions",@"/v1/responses",@"/v1/messages"])for(NSString *model in expected){
            NSString *key=[path stringByAppendingFormat:@":%@",model];
            if(![counts[key]isEqual:expected[model]]){fprintf(stderr,"FAIL %s 调用次数不匹配\n",key.UTF8String);exit(1);}
        }
        printf("PASS 三种协议：成功只调用一次；格式或截断最多重试一次；拒绝与 HTTP 错误不重试\n\nOneAPI 模型列表、三种协议、检索引用、凭证隐藏和归档恢复测试通过（本机模拟服务）。\n");exit(0);
    }]resume];
}

static void ArchiveRecoveryStep(NSString *base,NSUInteger index) {
    NSArray *styles=@[@"chat",@"responses",@"anthropic"],*models=@[@"archive-format-once",@"archive-shape-once",@"archive-cut-once",@"archive-format-always",@"archive-cut-always",@"archive-refusal",@"archive-http"];
    if(index>=styles.count*models.count){VerifyAPICounts(base);return;}
    NSUInteger scenario=index%models.count;NSString *style=styles[index/models.count];
    NSMutableDictionary *settings=[SYDefaultSettings()mutableCopy];settings[@"baseURL"]=base;settings[@"model"]=models[scenario];settings[@"apiStyle"]=style;
    NSDictionary *note=SYNote(@"归档异常回归",@"pdo2 -M 日志排查\ncurl -H 'Authorization: Bearer sensitive-test-secret' https://example.com",@"draft");
    SYExtract(@[note],settings,@"fixture-key",^(id proposal,NSError *error){
        BOOL valid=NO;
        if(scenario<3)valid=!error&&[proposal[@"title"]isEqual:@"联调知识"]&&[proposal[@"generationAttempts"]integerValue]==2;
        else if(scenario<5)valid=!proposal&&[error.localizedDescription containsString:scenario==3?@"有效 JSON":@"长度上限"]&&[error.localizedDescription containsString:@"已自动修复重试 1 次"];
        else valid=!proposal&&[error.localizedDescription containsString:scenario==5?@"拒绝处理":@"HTTP 401"];
        if(!valid){fprintf(stderr,"FAIL %s %s：%s\n",style.UTF8String,[models[scenario]UTF8String],(error.localizedDescription?:@"返回结果不匹配").UTF8String);exit(1);}
        printf("PASS %s %s\n",style.UTF8String,[models[scenario]UTF8String]);ArchiveRecoveryStep(base,index+1);
    });
}

static void IntegrationStep(NSString *base,NSUInteger index) {
    NSArray *styles=@[@"chat",@"responses",@"anthropic"];if(index>=styles.count){ArchiveRecoveryStep(base,0);return;}
    NSMutableDictionary *settings=[SYDefaultSettings()mutableCopy];settings[@"baseURL"]=base;settings[@"model"]=@"test-model";settings[@"apiStyle"]=styles[index];
    NSDictionary *note=SYNote(@"内部模型联调",@"curl -H 'Authorization: Bearer sensitive-test-secret' https://example.com\npdo2 -M 日志排查",@"draft");
    SYExtract(@[note],settings,@"fixture-key",^(id proposal,NSError *error){if(error||![proposal[@"title"]isEqual:@"联调知识"]){fprintf(stderr,"FAIL %s\n",(error.localizedDescription?:@"模型结果不匹配").UTF8String);exit(1);}printf("PASS %s 归档、脱敏和结果解析\n",[styles[index]UTF8String]);
        SYAnswer(@"怎么排查日志？",@[@{@"note":note,@"score":@10,@"excerpt":@"排查"}],@[],settings,@"fixture-key",^(id answer,NSError *failure){if(failure||![answer containsString:@"[1]"]){fprintf(stderr,"FAIL 引用回答\n");exit(1);}printf("PASS %s 检索上下文与来源引用\n",[styles[index]UTF8String]);NSMutableDictionary *wrong=[settings mutableCopy];wrong[@"model"]=@"error-model";SYComplete(wrong,@"fixture-key",@[@{@"role":@"user",@"content":@"test"}],^(id result,NSError *httpError){if(![httpError.localizedDescription containsString:@"HTTP 401"]){fprintf(stderr,"FAIL 错误响应处理\n");exit(1);}printf("PASS %s HTTP 401 错误处理\n",[styles[index]UTF8String]);IntegrationStep(base,index+1);});});
    });
}
static void ModelsStep(NSString *base,NSUInteger index) {
    NSArray *suffixes=@[@"",@"/empty",@"/unauthorized",@"/invalid",@"/invalid-items"];
    if(index>=suffixes.count){IntegrationStep(base,0);return;}
    NSMutableDictionary *settings=[SYDefaultSettings()mutableCopy];settings[@"baseURL"]=[base stringByAppendingString:suffixes[index]];settings[@"username"]=@"fixture-user";settings[@"repo"]=@"fixture-repo";
    SYListModels(settings,@"fixture-key",^(id models,NSError *error){
        BOOL valid=index==0?!error&&[models isEqual:@[@"alpha-model",@"test-model",@"zeta-model"]]:index==1?!error&&[models count]==0:index==2?[error.localizedDescription containsString:@"HTTP 401"]:error!=nil;
        if(!valid){fprintf(stderr,"FAIL 模型列表场景 %lu: %s\n",(unsigned long)index,(error.localizedDescription?:@"结果不匹配").UTF8String);exit(1);}
        printf("PASS 模型列表 %s\n",[@[@"鉴权、自定义请求头、去重排序",@"空权限列表",@"鉴权失败提示",@"无效响应格式",@"无效模型条目"][index]UTF8String]);ModelsStep(base,index+1);
    });
}
void SYRunIntegration(NSString *base) { ModelsStep(base,0); }

int SYRunCredentialTest(NSString *mode) {
    if(![NSProcessInfo.processInfo.environment[@"SHIYE_DATA_DIR"]length]){fprintf(stderr,"FAIL 凭证测试必须使用隔离数据目录\n");return 1;}
    NSError *error=nil;BOOL ok=NO;NSString *fixture=@"fixture-token-local-persistence";
    if([mode isEqual:@"write"])ok=SYSetKey(fixture,&error)&&SYHasKey()&&[SYKey()isEqual:fixture];
    else if([mode isEqual:@"read"])ok=[SYKey()isEqual:fixture];
    else if([mode isEqual:@"delete"])ok=SYSetKey(@"",&error)&&!SYHasKey()&&SYKey().length==0;
    if(!ok){fprintf(stderr,"FAIL 钥匙串 %s: %s\n",mode.UTF8String,(error.localizedDescription?:@"结果不匹配").UTF8String);return 1;}
    printf("PASS 隔离钥匙串 %s（未输出令牌）\n",mode.UTF8String);return 0;
}
