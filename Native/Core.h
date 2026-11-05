#import <Cocoa/Cocoa.h>
#import <sqlite3.h>
#import <Security/Security.h>

NS_ASSUME_NONNULL_BEGIN
typedef void (^SYCompletion)(id _Nullable result, NSError * _Nullable error);
FOUNDATION_EXPORT NSError *SYError(NSString *message);
FOUNDATION_EXPORT double SYNow(void);
FOUNDATION_EXPORT NSString *SYTrim(NSString *text);
FOUNDATION_EXPORT NSString *SYClip(NSString *text, NSUInteger count);
FOUNDATION_EXPORT NSString *SYJSON(id object);
FOUNDATION_EXPORT id _Nullable SYParse(NSString *text);
FOUNDATION_EXPORT NSMutableDictionary *SYNote(NSString *title, NSString *content, NSString *kind);
FOUNDATION_EXPORT NSDictionary *SYDefaultSettings(void);
FOUNDATION_EXPORT NSString *SYKey(void);
FOUNDATION_EXPORT BOOL SYHasKey(void);
FOUNDATION_EXPORT BOOL SYSetKey(NSString *key, NSError **error);
FOUNDATION_EXPORT NSString *SYRedact(NSString *text);
FOUNDATION_EXPORT NSURL * _Nullable SYEndpoint(NSDictionary *settings, NSError **error);
FOUNDATION_EXPORT NSURL * _Nullable SYModelsEndpoint(NSDictionary *settings, NSError **error);
FOUNDATION_EXPORT void SYListModels(NSDictionary *settings, NSString *key, SYCompletion completion);
FOUNDATION_EXPORT NSDictionary * _Nullable SYDecodeCompletion(NSDictionary *object, NSString *style, NSError **error);
FOUNDATION_EXPORT void SYComplete(NSDictionary *settings, NSString *key, NSArray<NSDictionary *> *messages, SYCompletion completion);
FOUNDATION_EXPORT NSDictionary * _Nullable SYProposal(NSString *output, NSArray<NSDictionary *> *notes, NSError **error);
FOUNDATION_EXPORT NSDictionary *SYLocalProposal(NSArray<NSDictionary *> *notes);
FOUNDATION_EXPORT void SYExtract(NSArray<NSDictionary *> *notes, NSDictionary *settings, NSString *key, SYCompletion completion);
FOUNDATION_EXPORT void SYAnswer(NSString *question, NSArray *hits, NSArray *history, NSDictionary *settings, NSString *key, SYCompletion completion);
FOUNDATION_EXPORT NSString *SYSublimeFingerprint(NSString *file, NSString *content);
FOUNDATION_EXPORT NSDictionary * _Nullable SYSublimeSnapshot(NSDictionary *object, NSString *source, double capturedAt, NSError **error);
FOUNDATION_EXPORT NSDictionary * _Nullable SYReadSublimeSession(NSURL *url, NSError **error);
FOUNDATION_EXPORT void SYCaptureSublime(BOOL live, SYCompletion completion);
FOUNDATION_EXPORT NSArray *SYArchiveBatches(NSArray *notes);

@interface SYStore : NSObject
@property(nonatomic,readonly) NSURL *directory;
- (nullable instancetype)initWithDirectory:(NSURL *)directory error:(NSError **)error;
- (nullable NSArray<NSDictionary *> *)all:(NSError **)error;
- (nullable NSDictionary *)note:(NSString *)identifier error:(NSError **)error;
- (nullable NSDictionary *)save:(NSDictionary *)note touch:(BOOL)touch forceRevision:(BOOL)force error:(NSError **)error;
- (nullable NSArray *)revisions:(NSString *)identifier error:(NSError **)error;
- (nullable NSString *)setting:(NSString *)key;
- (BOOL)setSetting:(NSString *)key value:(NSString *)value error:(NSError **)error;
- (nullable NSArray *)search:(NSString *)query limit:(NSUInteger)limit error:(NSError **)error;
- (nullable NSArray *)accept:(NSDictionary *)proposal knowledge:(BOOL)knowledge skill:(BOOL)skill error:(NSError **)error;
- (nullable NSDictionary *)importFiles:(NSArray<NSURL *> *)urls error:(NSError **)error;
- (nullable NSDictionary *)importSublimeEntries:(NSArray *)entries error:(NSError **)error;
- (BOOL)backup:(NSURL *)url error:(NSError **)error;
- (NSInteger)restore:(NSURL *)url error:(NSError **)error;
@end
NS_ASSUME_NONNULL_END
