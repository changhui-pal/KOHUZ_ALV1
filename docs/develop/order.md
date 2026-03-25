# 🚀 Project Control Center: kohzuApp - 작업 지시 템플릿
> **AI 가이드:** 본 문서는 작업 지시를 위한 템플릿입니다.
> 새로운 작업 지시를 내릴 때는 문서의 **가장 아래(최신 날짜 섹션)**에 추가하십시오.
> 각 작업은 Todo List, Result, 변경 사항, 검증 결과 순으로 작성합니다.

- 파일위치 : docs/develop/order.md

---
## GUI 화면 구성시 준수할것
- docs/guides/GUI_Design_Guide.md







# 작업 지시 템플릿 (참고용)
## 📋 1. 작업지시 (User Instruction)
1.
2.
- **참조 파일:** - `kohzuApp/src/motor_control.c`
    - `kohzuApp/include/config.h`

### ✅ 1.1 Todo List (AI Analysis)
- [ ] **Step 1: Context Analysis** - 기존 코드의 의존성 및 제어 흐름 파악
- [ ] **Step 2: Core Implementation** - 요구사항에 따른 로직 수정 및 최적화
- [ ] **Step 3: Validation** - 빌드 확인 및 에러 핸들링 검증
- [ ] **Step 4: Documentation** - 변경 사항 주석 및 결과 보고


### 📝 1.2 Result (Execution Summary)

### 🛠 1.3  변경 사항 (Summary of Changes)
- **수정 위치:** `Line XX` in `file_path`
- **주요 로직:** ### 🔍 검증 결과 (Validation)
- [x] 컴파일 성공 여부
- [ ] 런타임 테스트 (시뮬레이션/실기기)

### 💡 사용예시
- order.md : ?? 라인의 지시사항을 반영하여 수행해. (템플릿 적용)





# 2026.03.25
## 📋 1. 작업지시 (User Instruction)
1. 수정 사항 :
    1) KOHUZ_ALV1App/Db/Makefile 의 DB += KOHZU_Motor.db 바로 아래 라인에 DB += KOHZU_HomingMethod.db 추가하여 빌드 시 KOHZU_HomingMethod.db 파일이 포함될 수 있도록 함.
    2) KOHUZ_ALV1/ 위치에서 bear make를 통해 실제 컴파일러가 사용하는 include 경로를 IDE가 확인할 수 있도록 compile_commands.json 생성하고 .gitignore 에 compile_commands.json 추가하여 타 개발자와의 충돌을 방지함.
2. KOHUZ_ALV1 프로젝트 빌드.
- **참조 파일:**
    - `KOHUZ_ALV1App/Db/Makefile`
    - `.gitignore`
