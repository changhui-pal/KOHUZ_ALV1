# 🚀 Project Control Center: kohzuApp
> **AI 가이드:** 본 문서 상단의 '표준 템플릿' 섹션은 참고용입니다. 
> 모든 신규 작업과 결과 기록은 문서의 **가장 아래(최신 날짜 섹션)**에 추가하십시오.
> 자동 기록 문서는 Todo List, Result, 변경 사항, 검증 결과 순으로 작성한다.

- 파일위치 : kohzuApp/doc/Instruction.md

---
## GUI 화면 구성시 준수할것
- docs/guides/GUI_Design_Guide.md







# Instruction.md 표준 템플릿 (참고용)
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
- Instruction.md : ?? 라인의 지시사항을 반영하여 수행해. (템플릿 적용)











# 2026.03.05
---
## 📋 1. 작업지시 (User Instruction)
1. README.md 파일 최하단에 참고용으로 docs/image/ 파일들 삽입
2. 삽입한 이미지 경로에 각각 간단한 설명을 추가 (메인 대시보드, 모터 설정 창)

### ✅ 1.1 Todo List (AI Analysis)
- [x] **Step 1: Context Analysis** - `docs/image/` 디렉터리 내의 이미지 파일 목록 확인
- [x] **Step 2: Core Implementation** - `README.md` 파일 하단에 마크다운 문법으로 이미지 링크 및 설명 단락 추가
- [x] **Step 3: Validation** - 파일 변경 내용이 올바른지 확인
- [x] **Step 4: Documentation** - `Instruction.md`에 결과 기록

### 📝 1.2 Result (Execution Summary)
- `README.md` 파일의 가장 하단에 `## 6. UI 참고 이미지 (UI Reference)` 섹션을 생성하였습니다.
- 6.1과 6.2 하위 섹션을 두고, `dashboard_motor.png`와 `moto_popup.png` 이미지를 삽입함과 동시에 각 창이 어떤 역할을 하는지 간단한 텍스트 설명을 추가하였습니다.

### 🛠 1.3 변경 사항 (Summary of Changes)
- **수정 위치:** `Line 137-146` in `README.md`
- **주요 로직:** 
  - 각 창에 대한 설명(개요) 텍스트 추가
  - 마크다운 이미지 태그(`![Alt](path)`)를 사용하여 이미지 삽입

### 🔍 검증 결과 (Validation)
- [x] 마크다운 이미지 렌더링 정상 여부 확인 (경로 일치)