# 🪙 대마코인 (DaemaCoin)

GitHub 커밋을 통해 코인을 채굴하는 혁신적인 서비스입니다. 개발자들이 코드를 작성하고 커밋할 때마다 자동으로 대마코인(DMC)이 채굴됩니다.

## ✨ 주요 기능

### 🔐 실제 API 연동 로그인 시스템
- **XQUARE 로그인**: 실제 대마코인 서버와 연동된 안전한 1차 인증
- **GitHub OAuth**: GitHub 공식 OAuth를 통한 리포지토리 접근 권한 획득
- **JWT 토큰 관리**: 액세스/리프레시 토큰 자동 관리

### ⛏️ 스마트 채굴 시스템
- **실시간 커밋 감지**: GitHub Webhook을 통한 자동 커밋 추적
- **품질 기반 보상**: 코드 변경량과 품질에 따른 차등 보상
- **채굴 세션 관리**: 시작/중지 가능한 채굴 세션

### 📊 직관적인 대시보드
- **실시간 코인 잔액**: 서버 동기화된 DMC 잔액 표시
- **커밋 내역**: 실제 GitHub 커밋과 채굴된 코인량 표시
- **채굴 통계**: 세션별 채굴 성과 분석

## 🎨 디자인 시스템

토스(Toss) 디자인 시스템을 완벽하게 구현하여 한국 사용자들에게 친숙한 UI/UX를 제공합니다.

### 디자인 특징
- **토스 컬러 팔레트**: 브랜드 일관성을 위한 색상 시스템
- **Pretendard 폰트**: 한글 최적화 폰트
- **반응형 디자인**: 모바일, 태블릿, 데스크탑 최적화
- **마이크로 인터랙션**: 부드러운 애니메이션과 피드백

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- GitHub 계정
- XQUARE 계정

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-repo/daemacoin-frontend.git
   cd daemacoin-frontend
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

## 🔌 API 연동

### 백엔드 서버
- **Base URL**: `https://daemacoin-server.xquare.app`
- **GitHub OAuth Client ID**: `Ov23liHgU8D73ZmDOReG`

### API 엔드포인트

#### 1. XQUARE 로그인
```http
POST /auth/xquare
Content-Type: application/json

{
  "accountId": "your_account_id",
  "password": "your_password"
}

Response:
{
  "xquareId": "35623138-3434-3933-2d63-3264322d3466"
}
```

#### 2. 회원가입
```http
POST /auth/register
Content-Type: application/json

{
  "xquareId": "63373163-3038-3361-2d30-3538362d3430",
  "githubId": "ljyo2o9"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. GitHub OAuth
```
GET https://github.com/login/oauth/authorize?client_id=Ov23liHgU8D73ZmDOReG&scope=write:repo_hook%20public_repo
```




## 🛠️ 기술 스택

### Frontend
- **Next.js 15**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS v3**: 유틸리티 기반 CSS 프레임워크
- **Zustand**: 가벼운 상태 관리 (로컬스토리지 영속성)
- **Axios**: HTTP 클라이언트 (인터셉터 포함)
- **Lucide React**: 아이콘 라이브러리
- **date-fns**: 날짜 처리

### 인증 시스템
- **JWT**: 액세스/리프레시 토큰 기반 인증
- **OAuth 2.0**: GitHub 공식 OAuth 연동
- **로컬스토리지**: 토큰 영속성 관리

### 디자인 시스템
- **토스 컬러 팔레트**: 브랜드 색상
- **Pretendard**: 한글 웹폰트
- **반응형 그리드**: 모바일 퍼스트 디자인

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── globals.css        # 전역 스타일 (토스 디자인 시스템)
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   │   ├── Button.tsx    # 토스 스타일 버튼
│   │   ├── Card.tsx      # 토스 스타일 카드
│   │   └── Input.tsx     # 토스 스타일 입력필드
│   ├── layout/           # 레이아웃 컴포넌트
│   │   └── Header.tsx    # 헤더 컴포넌트
│   ├── LoginPage.tsx     # 실제 API 연동 로그인 페이지
│   └── MiningDashboard.tsx # 메인 대시보드
├── stores/               # Zustand 상태 관리
│   ├── authStore.ts      # JWT 토큰 관리 포함 인증 상태
│   └── miningStore.ts    # 채굴 상태
├── lib/                  # 유틸리티 함수
│   └── api.ts           # API 클라이언트 (axios 인터셉터)
├── types/                # TypeScript 타입 정의
│   └── index.ts          # API 응답 타입 포함
└── public/               # 정적 파일
    └── default-avatar.svg # 기본 아바타 이미지
```

## 🎯 사용자 플로우

### 1. 실제 로그인 과정
1. **XQUARE 로그인** → 계정 ID/비밀번호로 서버 인증
2. **xquareId 획득** → 서버에서 고유 ID 반환
3. **GitHub OAuth** → GitHub 공식 OAuth 페이지로 리다이렉트
4. **GitHub 권한 승인** → 리포지토리 접근 권한 획득
5. **회원가입 완료** → xquareId + githubId로 서버 등록
6. **JWT 토큰 발급** → 액세스/리프레시 토큰 저장
7. **로그인 완료** → 메인 대시보드 진입

### 2. 채굴 과정
1. **채굴 시작** 버튼 클릭
2. **GitHub Webhook 등록** → 실시간 커밋 감지 설정
3. **커밋 감지** → GitHub에서 자동 알림
4. **코인 지급** → 서버에서 커밋 분석 후 DMC 보상
5. **내역 동기화** → 대시보드에 실시간 반영

## 🔧 개발 가이드

### 환경변수 설정
```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_CLIENT_ID=Ov23liHgU8D73ZmDOReG
GITHUB_CLIENT_SECRET=your-github-client-secret
API_BASE_URL=https://daemacoin-server.xquare.app
```

### API 클라이언트 사용법
```typescript
import { xquareLogin, register, startGithubOAuth } from '@/lib/api';

// XQUARE 로그인
const result = await xquareLogin('accountId', 'password');
if (result.success) {
  console.log('xquareId:', result.data.xquareId);
}

// GitHub OAuth 시작
startGithubOAuth(); // 자동으로 GitHub 페이지로 리다이렉트

// 회원가입
const registerResult = await register(xquareId, githubId);
if (registerResult.success) {
  // JWT 토큰 자동 저장됨
}
```

## 🔮 향후 계획

### 단기 목표 (완료)
- [x] 실제 GitHub API 연동
- [x] XQUARE OAuth 구현
- [x] JWT 토큰 관리 시스템
- [x] 폼 유효성 검사

### 중기 목표
- [ ] GitHub Webhook 실시간 커밋 감지
- [ ] 코인 채굴 알고리즘 고도화
- [ ] 사용자 프로필 관리
- [ ] 채굴 통계 시각화

### 장기 목표
- [ ] 코인 거래소 기능
- [ ] NFT 보상 시스템
- [ ] 팀 채굴 기능
- [ ] 리더보드 시스템

## 🐛 문제 해결

### 자주 발생하는 문제
1. **GitHub OAuth 콜백 오류**: 로컬 개발 시 `http://localhost:3000`이 등록되어 있는지 확인
2. **API 연결 실패**: 서버 상태 확인 및 CORS 설정 점검
3. **토큰 만료**: 자동 리프레시 로직이 동작하는지 확인

### 디버깅
```bash
# 개발 서버 로그 확인
npm run dev

# API 요청 테스트
curl -X POST https://daemacoin-server.xquare.app/auth/xquare \
  -H "Content-Type: application/json" \
  -d '{"accountId":"test","password":"test123"}'
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👥 팀

- **프론트엔드 개발**: 토스 디자인 시스템 기반 React/Next.js 구현
- **백엔드 개발**: GitHub API 연동 및 JWT 인증 시스템
- **인프라**: XQUARE 서버 환경 구축

---

**대마코인으로 개발을 더욱 재미있게! 🚀**

### 🎮 테스트 계정
로컬 테스트를 위한 데모 계정:
- **XQUARE ID**: `dutexion`
- **Password**: `qwer1234!`
