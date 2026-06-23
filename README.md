# tatoomy 🖤

타투이스트 **tatoomy** 개인 홈페이지입니다.
HTML/CSS/JavaScript로만 만든 가벼운 정적 사이트라, 서버 없이 바로 동작합니다.
다크 / 모노톤 톤으로 디자인되었습니다.

## 📁 폴더 구조

```
tatoomy/
├─ index.html              ← 페이지 본문
├─ css/style.css           ← 디자인 (색상·폰트는 맨 위 :root 변수만 수정)
├─ js/
│  ├─ site-config.js       ← settings.json 이 없을 때 쓰는 기본값(폴백)
│  └─ main.js              ← 동작 코드 (수정 불필요)
├─ content/settings.json   ← ★ 실제 내용(사진·문구·가격·후기 …)
├─ admin/                  ← 사장님용 관리자(Decap CMS)
└─ images/uploads/         ← 업로드 사진 보관 폴더
```

> 현재 `images/uploads/`의 사진들은 **Pexels 무료 라이선스 스톡사진**(상업적 사용·출처표기 불필요)으로
> 채운 **샘플**입니다. 실제 작가님의 작업 사진으로 교체해 주세요.

## ⭐ 사장님용 관리자 (Decap CMS · 코딩/토큰 필요 없음)

**이메일·비밀번호로 로그인 → 사진 드래그 업로드 → Publish(게시)** 만 하면 됩니다.

### 여는 법
- 주소: **`https://www.tatoo.my/admin/`** (배포 후)
- Netlify에서 받은 **초대 메일**로 비밀번호를 한 번 설정하면, 이후엔 이메일/비번으로 로그인.

### 할 수 있는 것 (모두 한 화면에서)
- 📷 포트폴리오 앨범 추가/삭제/순서, 앨범 안 사진 업로드 (🎬 유튜브 영상 ID로 영상도 가능)
- 🏠 기본 정보(인스타·카카오·블로그·유튜브), 메인/소개 문구·사진
- 👤 타투이스트 소개, 🧼 위생·안전 포인트, 💰 가격, 🧭 진행 절차
- 🩹 애프터케어, 💬 후기, 📅 예약 현황, 📍 오시는 길, ❓ Q&A, 📩 상담 폼 설정
- 수정 후 우측 상단 **Publish** → 1~2분 뒤 사이트 자동 반영

### 작동 구조
- 모든 내용은 `content/settings.json` 에 저장되고, 사이트가 이 파일을 읽어 화면을 그립니다.
- CMS 설정/스키마: `admin/config.yml`, 편집 UI: `admin/index.html`
- `js/site-config.js` 는 `settings.json` 이 없을 때를 대비한 기본값(폴백)입니다.

> 🔧 **개발자 1회 설정(Netlify)**: 저장소를 Netlify에 연결 → **Identity** 켜고 **invite only** →
> **Git Gateway** 켜기 → 사장님 이메일 **Invite** → 도메인(www.tatoo.my)을 Netlify로 연결.

## 🎨 색상·폰트 변경
`css/style.css` 맨 위의 `:root { ... }` 변수 값만 바꾸면 전체 톤이 바뀝니다.
포인트 색은 `--accent`(기본 골드)입니다.

## 🖼️ (개발자용) 사진을 코드로 직접 관리하기
관리자 페이지 대신 코드로 직접 바꾸려면 `content/settings.json` 의
`portfolioAlbums`, `hero.image`, `about.image`, `artist.image` 등을 수정합니다.

### 포트폴리오 스타일 분류(필터)
`linework`(라인워크) / `blackwork`(블랙워크) / `color`(컬러) /
`lettering`(레터링) / `minimal`(미니멀) / `coverup`(커버업)

### 영상 넣기 🎬
앨범 안 사진 목록에서 유튜브 영상 ID(`youtu.be/ABCD1234` 의 `ABCD1234`)만 넣으면 영상이 됩니다.

## 🌐 배포 (GitHub → Netlify)
1. 이 폴더를 GitHub 저장소(`yjh940331-afk/tatoomy`)에 push 합니다.
2. Netlify에 저장소를 연결합니다. (빌드 명령 없음 / publish: `.`)
3. Identity + Git Gateway 설정 후 도메인 `www.tatoo.my` 를 연결합니다.

## 💻 로컬에서 미리보기
정적 파일이라 로컬 서버에서 열면 됩니다. (`content/settings.json` 을 `fetch` 하므로
`file://` 직접 열기보다 간단한 로컬 서버 권장)

```bash
python3 -m http.server 8000
# → http://localhost:8000
```
