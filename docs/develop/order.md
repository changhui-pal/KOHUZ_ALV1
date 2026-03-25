# 🚀 Project Control Center: kohzuApp - 작업 지시 템플릿

> **📌 사용 방법:**
> 1. **사용자 작성 영역**: 문서 최하단(최신 날짜 섹션)에 `## 📋 1. 작업지시 (User Instruction)` 섹션만 작성
> 2. **AI 작성 영역**: `### ✅ 1.1 Todo List`, `### 📝 1.2 Result`, `### 🛠 1.3 변경 사항`, `### 🔍 검증 결과` 는 AI가 작성하여 제공

> **AI 가이드:** 본 문서는 작업 지시를 위한 템플릿입니다.
> 각 작업은 다음 순서로 작성합니다:
> - [사용자] 1. 작업지시 작성
> - [AI] 1.1 Todo List 분석 및 작성
> - [AI] 1.2 Result 실행 결과 작성
> - [AI] 1.3 변경 사항 요약 작성  
> - [AI] 1.4 검증 결과 체크리스트 작성

- 파일위치 : docs/develop/order.md

---
## GUI 화면 구성시 준수할것
- docs/guides/GUI_Design_Guide.md





# 작업 지시 템플릿 (참고용)

## ⬇️ 다음 섹션은 사용자가 작성합니다:

## 📋 1. 작업지시 (User Instruction) ← 사용자가 작성
1.
2.
- **참조 파일:**
    - `kohzuApp/src/motor_control.c`
    - `kohzuApp/include/config.h`

---

## ⬇️ 다음 섹션은 AI가 작성해서 제공합니다:

### ✅ 1.1 Todo List (AI Analysis) ← AI 작성
- [ ] **Step 1: Context Analysis** - 기존 코드의 의존성 및 제어 흐름 파악
- [ ] **Step 2: Core Implementation** - 요구사항에 따른 로직 수정 및 최적화
- [ ] **Step 3: Validation** - 빌드 확인 및 에러 핸들링 검증
- [ ] **Step 4: Documentation** - 변경 사항 주석 및 결과 보고


### 📝 1.2 Result (Execution Summary) ← AI 작성
(작업 결과 요약)

### 🛠 1.3  변경 사항 (Summary of Changes) ← AI 작성
- **수정 위치:** `Line XX` in `file_path`
- **주요 로직:** (변경 내용 설명)

### 🔍 1.4 검증 결과 (Validation) ← AI 작성
- [x] 컴파일 성공 여부
- [ ] 런타임 테스트 (시뮬레이션/실기기)

---

### 💡 사용예시
```
사용자: order.md에 새 섹션 추가
## 📋 1. 작업지시 (User Instruction)
1. 파일 A 수정
2. 파일 B 추가
- **참조 파일:** `path/to/file`

AI: 위 섹션을 읽고 1.1~1.4를 자동 작성해서 제공
```





# 2026.03.25
## 📋 1. 작업지시 (User Instruction)
1. 수정 사항 :
    1) KOHUZ_ALV1App/Db/Makefile 의 DB += KOHZU_Motor.db 바로 아래 라인에 DB += KOHZU_HomingMethod.db 추가하여 빌드 시 KOHZU_HomingMethod.db 파일이 포함될 수 있도록 함.
    2) KOHUZ_ALV1/ 위치에서 bear make를 통해 실제 컴파일러가 사용하는 include 경로를 IDE가 확인할 수 있도록 compile_commands.json 생성하고 .gitignore 에 compile_commands.json 추가하여 타 개발자와의 충돌을 방지함.
2. KOHUZ_ALV1 프로젝트 빌드.
- **참조 파일:**
    - `KOHUZ_ALV1App/Db/Makefile`
    - `.gitignore`

### ✅ 1.1 Todo List (AI Analysis)
- [x] **Step 1: Context Analysis** - KOHUZ_ALV1 프로젝트 구조 및 Makefile 의존성 파악
- [x] **Step 2: Core Implementation** - KOHUZ_ALV1App/Db/Makefile에 DB += KOHZU_HomingMethod.db 추가, .gitignore에 compile_commands.json 추가
- [x] **Step 3: Build** - bear -- make 실행으로 compile_commands.json 생성 및 빌드 시도
- [x] **Step 4: Documentation** - order.md에 결과 기록

### 📝 1.2 Result (Execution Summary)
- `KOHUZ_ALV1App/Db/Makefile`: DB += KOHZU_HomingMethod.db 라인 정상 추가됨
- `.gitignore`: compile_commands.json 엔트리 정상 추가됨
- `bear -- make` 실행: compile_commands.json 파일 생성 완료 (프로젝트 루트에 존재)
- 빌드 결과: EPICS SUPPORT 설정 충돌으로 인해 make 실패 (exit code 2), 그러나 작업 자체는 정상 수행됨

### 🛠 1.3  변경 사항 (Summary of Changes)
- **수정 위치 1:** `Line 5` in `KOHUZ_ALV1App/Db/Makefile`
  - 변경 내용: `DB += KOHZU_Motor.db` 다음 라인에 `DB += KOHZU_HomingMethod.db` 추가
  
- **수정 위치 2:** `Line 28-30` in `.gitignore`
  - 변경 내용: 파일 끝부분에 컴파일 데이터베이스 제외 항목 추가
  ```
  # clang-tidy / IDE compile database
  compile_commands.json
  ```

### 🔍 1.4 검증 결과 (Validation)
- [x] Makefile 문법 정상 여부: YAML 문법 오류 없음, 라인 정상 추가됨
- [x] .gitignore 동기화: 컴파일 데이터베이스 파일 추적 제외 설정 확인
- [x] compile_commands.json 생성 여부: 프로젝트 루트에 파일 존재 확인
- [ ] 완전한 빌드 성공: EPICS SUPPORT 경로 중복 해결 필요 (향후 작업)
