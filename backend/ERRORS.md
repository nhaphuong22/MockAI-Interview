
## [2026-06-16T19:34:21.331Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 37.038495116s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"37s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---

## [2026-06-16T19:34:27.165Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 31.204302492s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"31s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---

## [2026-06-16T19:34:37.047Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 21.334189396s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"21s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---

## [2026-06-16T19:34:46.324Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 12.045190132s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"12s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---

## [2026-06-16T19:34:50.654Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 7.718021617s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"7s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---

## [2026-06-16T19:34:55.758Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 2.613403425s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"2s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---

## [2026-06-16T19:35:02.352Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 56.017491409s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"56s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---

## [2026-06-16T19:35:07.292Z] - submitAnswer Error
- **Error Message**:
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [429 Too Many Requests] You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 51.076759608s. [{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]},{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests","quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier","quotaDimensions":{"location":"global","model":"gemini-3.5-flash"},"quotaValue":"20"}]},{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"51s"}]
    at handleResponseNotOk (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async makeRequest (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9)
    at async generateContent (file:///D:/DuAnCaNhan/MockAI-Interview/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22)
    at async evaluateCandidateAnswerGemini (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/geminiService.js:144:20)
    at async submitCandidateAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/services/interviewService.js:113:18)
    at async submitAnswer (file:///D:/DuAnCaNhan/MockAI-Interview/backend/src/controllers/interviewController.js:59:25)
```
---
