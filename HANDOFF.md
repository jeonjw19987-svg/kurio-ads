# KURIO-ADS 인수인계 (2026-11-26, A v4 최종 아트디렉션)

KURIO 미국 Meta 광고(A·B·C·D) 영상 프로젝트입니다. 홈페이지 저장소(`C:\CLAUDE\KRUIO\kurio-public-web`)와는 별개이며, 그쪽은 읽기만 합니다.

| 문서 | 내용 |
|---|---|
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | **확정된 공통 타이포그래피, 색, 레이아웃, 모션** (B·C·D에 그대로 적용) |
| [STORYBOARD.md](STORYBOARD.md) | 스토리보드 사양과 A v4 항목별 충족 여부 |
| [VIDEO_PRODUCTION_PROMPT.md](VIDEO_PRODUCTION_PROMPT.md) | 버전별 제작 지시(v4 요약이 맨 위) |
| [higgsfield/SHOTLIST-A-moon-jar.md](higgsfield/SHOTLIST-A-moon-jar.md) | Higgsfield 생성 계획(v3, 미실행) |

## 1. 현재 상태
| | |
|---|---|
| 브랜치 | `feature/meta-ad-production`. 비공개 GitHub 저장소에 사진째 push합니다(운영자 결정, §6) |
| **A v4 (최신)** | `out/A-moon-jar-v4/`. 소스는 이 브랜치의 최신 커밋입니다. 기획 담당자의 검수를 기다리는 중입니다 |
| 공통 엔드카드 | `out/shared/KURIO_ENDCARD_v4.mp4`(+ `.png`). B·C·D가 이 파일을 그대로 씁니다. v2 마스터도 보존합니다 |
| A v3 | 태그 `ad-a-v3`. Higgsfield 클립 경로 도입, DRAFT 스틸만 있음(`out/A-moon-jar-v3/`) |
| A v2 | 태그 `ad-a-v2`, `out/A-moon-jar-v2/` |
| A v1 | 소스는 `archive/ad-a-v1/`(재구성), 영상은 `out/A-moon-jar-v1/` |
| Higgsfield | 연결 안 됨, 사용 안 함(v4는 기획 담당자가 준비한 이미지 사용) |
| B·C·D | A 검수 후 제작 |

**A v4 결과물** (`C:\CLAUDE\KURIO-ADS\out\A-moon-jar-v4\`):
- `KURIO_AD_A_MOON_JAR_v4.mp4`: 15.000초, 450프레임, 1080×1920, 30fps, H.264 High, yuv420p, bt709, 무음, 4.0MB
- `KURIO_AD_A_THUMBNAIL_v4.png`: ①의 프레임 45
- `stills/KURIO_AD_A_MOON_JAR_v4_Scene_01_PRODUCT.png` … `Scene_05_END-CARD.png`
- `KURIO_AD_A_v3_vs_v4.png`: 비교 자료

## 2. 다른 컴퓨터(회사)에서 이어서 하기
이미지는 모두 git에 들어 있습니다. 결과 영상(`out/`)만 git에 없으니 필요하면 따로 옮깁니다.

```powershell
# 1) 저장소 받기 (비공개 저장소라 GitHub 로그인 필요)
git clone -b feature/meta-ad-production <원격 주소 — 아래 §6> KURIO-ADS
cd KURIO-ADS
# 2) 패키지 설치 (node_modules는 복사하지 말고 새로 설치)
npm ci
# 3) 미리보기
npm run dev            # Remotion Studio → http://localhost:3000/KURIO-AD-A-MOON-JAR
# 4) 렌더링
npm run a:stills       # 스틸 5장 + 썸네일만 (검수용, 빠름)
npm run a:render       # + 최종 MP4 (엔드카드 v4 마스터가 없으면 한 번 새로 만듦)
```
- Node 20.19 이상이 필요합니다(이 PC는 26.13.1).
- 첫 렌더링 때 Remotion이 렌더링용 Chrome Headless Shell(약 130MB)을 자동으로 받습니다.

## 3. 프로젝트 구조
```
src/ads/template/
  tokens.ts       ★ 디자인 시스템 값: 색, 서체, 자막 위치·크기, 레이아웃(PLATE), 모션(MOTION), 클립 슬롯
  types.ts        ProductAd / AdScene(caption: title·subtitle·body[]) / CutVisual(photo full|plate, 초안용 cutout·bleed·missing)
  Caption.tsx     자막 블록과 등장·퇴장 모션
  Visuals.tsx     photo full/plate 레이아웃, 푸시인 / 초안용 화면
  ProductScene.tsx  컷 = (Higgsfield 클립 또는 이미지) + 자막. KeyframeScene
  ProductAdVideo.tsx  5컷 배치, 클립 슬롯 확인, 공통 AudioTrack
  EndCard.tsx     공통 엔드카드(입력값 없음)
src/ads/products/a-moon-jar.ts   A 데이터: 컷별 이미지, 레이아웃, focus, 자막, 이미지 출처
src/ads/audio.json               공통 AudioTrack (null = 무음)
public/fonts/line-seed/          LINE Seed Sans EN V1.003 Thin, Regular, Bold (OFL)
public/assets/A_moonjar/         v4 이미지 (기획 담당자 제공, 비공개 저장소에만)
public/products/a-moon-jar/      와유재 원본 사진 2장 (②의 고해상도 원본)
tools/render-ad.mjs              번들 1회 렌더링: 스틸, 썸네일, 본편, 엔드카드 연결, 클립 검사, DRAFT 표시, 오디오 합치기
tools/watch-clips.mjs            클립 교체 시 자동 렌더링 (Higgsfield 경로)
archive/ad-a-v1/                 v1 소스
```

## 4. 이미지 출처 (A v4)
| 컷 | 파일 | 출처 | 근거·주의 |
|---|---|---|---|
| ① | `public/assets/A_moonjar/01_product_v4.png.png` (941×1672) | 기획 담당자 제공(2026-11-26). 와유재 사진(…/454902a9bbc08.jpg)의 달항아리를 스튜디오 장면으로 만든 이미지로 보이나, **제작 경위는 기록되지 않음** | 생성이나 합성이면 AI 고지 기준을 확인해야 합니다 |
| ② | `public/products/a-moon-jar/02-detail.png`의 왼쪽 절반 (712×900) | 와유재 상세 '\| Detail' (…/b9bbf1a24010e.png). 제공 파일 `02_detail.png`(385×487)는 이 원본을 0.54배로 줄인 것과 같습니다 | 화질을 위해 같은 사진의 원본 해상도를 썼습니다 |
| ③ | `public/assets/A_moonjar/03_making.png` (384×492) | 와유재 제작 과정 사진(…/f8058a54c5197.png)의 오른쪽 절반(손만). 원본 보존: `03_making_original.png` (얼굴 있음, 사용 안 함) | 해상도가 낮아 2.81배 확대했습니다. 720×900 이상 원본이 있으면 선명해집니다 |
| ④ | `public/assets/A_moonjar/04_in_place_v4.png.png` (941×1672) | 기획 담당자 제공(2026-11-26). 콘솔 위 연출 장면, **제작 경위 기록 없음** | 생성 장면이면 'AI 생성'으로 기록하고 Meta 고지 기준을 확인해야 합니다 |

**모든 컷 공통:** 와유재와 신동범 작가의 **서면 사용 허락이 없습니다**. KURIO 운영자 결정(2026-11-25)으로만 쓰고 있으며, 공개 집행 전에 허락이 필요합니다.

## 5. v3 → v4 변경 사항
| 항목 | v3 | v4 |
|---|---|---|
| 이미지 | 컷아웃 누끼 스테이지, 확대 사진, ④ "PHOTO NEEDED" | 기획 담당자 이미지 5장. ①④는 전체 화면, ②③은 플레이트 레이아웃. placeholder 제거 |
| 자막 위치 | 아래쪽 (아래 끝 y=1240) | 좌측 상단 (x 88, y 284), 모든 컷이 밝은 영역 위 |
| 서체 | LINE Seed Sans Regular 64, 한 가지 크기 | 위계: 상품명 Bold 84 / 현지어명 Regular 48 #57534E / 설명 Regular 48. 공식 Bold 추가 |
| ① 자막 | "Shaped like the moon. / Korean moon jar (dalhangari)" 같은 크기 | "Korean moon jar." / "Dalhangari." / "Shaped like the moon." 세 단계 |
| 모션 | 일정 속도 4% 푸시인, 자막 4프레임 페이드 | 2.5% ease-out 푸시인. 자막은 0.3초 후 20px 상승하며 0.3초에 등장, 퇴장 직전 10px 들림 |
| ② ③ | 컷아웃 2배 확대 / 내부 유약 사진 | ② 내부 유약 원본 해상도 / ③ 장인의 손과 물레. ②의 둥근 입구에서 ③의 둥근 몸체로 이어지는 매치 컷 |
| 엔드카드 | v2 마스터, CTA Regular, 페이드만 | v4 마스터, CTA Bold, 16px 상승 등장 (배치는 같음) |
| 오디오 | 없음 | 공통 AudioTrack 구조 (`audio.json`, 무음) |
| 결과 이름 | `…_v3_DRAFT` | `KURIO_AD_A_MOON_JAR_v4.mp4`, `KURIO_AD_A_THUMBNAIL_v4.png`, `Scene_0N` 스틸 |

## 6. Git과 push
- **운영자 결정 (2026-11-26, "사진 포함 push"):** 이 저장소는 **비공개** GitHub 저장소에만 올립니다.
  - 와유재 원본 사진 3장(`public/products/a-moon-jar/`, `archive/ad-a-v1/public/`)과 기획 담당자 이미지(`public/assets/A_moonjar/`, 얼굴이 나온 `03_making_original.png` 포함)를 사진째 올립니다.
  - 사진 사용 허락은 여전히 없습니다. 저장소를 공개로 바꾸거나 외부와 공유하지 않습니다.
- 홈페이지 저장소(`kurio-public-web`)는 브랜치 push마다 Vercel Preview 빌드가 돌아서 쓰지 않습니다.
- 영상(`out/`)과 생성 클립(`public/clips/**/*.mp4`)은 용량 때문에 git에서 제외합니다. 필요하면 따로 옮깁니다.

## 7. 지켜야 할 것
- 디자인 시스템 값(DESIGN_SYSTEM.md)은 상품마다 바꾸지 않습니다. 바꿔야 하면 네 편을 모두 다시 만듭니다.
- 확인되지 않은 제작 과정이나 사실을 자막과 화면에 쓰지 않습니다('Thrown in two halves'는 와유재 확인 전까지 쓰지 않음).
- 엔드카드는 다시 렌더링하지 않고 `KURIO_ENDCARD_v4.mp4`를 재사용합니다. 바꾸면 버전을 올리고 네 편을 모두 다시 만듭니다.
- 홈페이지 저장소, `main`, Production은 건드리지 않습니다.
- 저장공간: 렌더링은 `tools/render-ad.mjs`(번들 1회, 캐시 없음)로 합니다. `node_modules`는 복사하지 않고 `npm ci`로 설치합니다.
