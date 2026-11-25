# KURIO-ADS 인수인계 (2026-11-26, 제작 방식 v3)

KURIO 미국 Meta 광고(A·B·C·D) 영상 프로젝트입니다. 홈페이지 저장소(`C:\CLAUDE\KRUIO\kurio-public-web`)와는 별개이며, 그쪽은 읽기만 합니다.
- 사양: [STORYBOARD.md](STORYBOARD.md)
- 작업 지시: [VIDEO_PRODUCTION_PROMPT.md](VIDEO_PRODUCTION_PROMPT.md)
- 생성 목록: [higgsfield/SHOTLIST-A-moon-jar.md](higgsfield/SHOTLIST-A-moon-jar.md)

## 1. 현재 상태
| | |
|---|---|
| 브랜치 | `feature/meta-ad-production`. 원격이 없어 push 대상이 정해지지 않았습니다 |
| **제작 방식 (v3~)** | **Higgsfield**가 실제 상품 사진을 바탕으로 컷별 영상을 생성하고, **Remotion**이 편집·자막·공통 엔드카드·최종 MP4를 맡습니다. Remotion에서 사진을 확대·배치만 반복하는 방식(v1·v2)은 중단했습니다 |
| Higgsfield | **아직 연결되지 않았습니다** (MCP·CLI·API 키 없음). 생성 0건, 크레딧 사용 0. 연결 방법과 비용은 §7을 봅니다 |
| A v1 | 영상 `out/A-moon-jar-v1/`. 소스는 `archive/ad-a-v1/`에 재구성해 두었습니다(당시 커밋 안 됨, README 참조) |
| A v2 | 영상 `out/A-moon-jar-v2/`. 소스는 git 태그 `ad-a-v2`(커밋 a895b2e) |
| A v3 | 생성 클립을 기다리는 중입니다. `out/A-moon-jar-v3/`에 시작 이미지(`keyframes/`)와 DRAFT 스틸이 있습니다 |
| 엔드카드 마스터 | `out/shared/KURIO_ENDCARD_v2.mp4`. 모든 광고가 이 파일을 그대로 붙입니다 |
| B·C·D | 아직 만들지 않음 |

`out/`과 `public/clips/**/*.mp4`는 git에 포함되지 않습니다(용량). 영상 파일은 따로 보관합니다.

## 2. 생성 클립 → 최종 광고 흐름
```
public/clips/a-moon-jar/
  01-product.mp4   ① PRODUCT
  02-detail.mp4    ② DETAIL
  03-making.mp4    ③ MAKING
  04-in-place.mp4  ④ IN PLACE
```
- **파일을 넣거나 교체하면 끝입니다.** 렌더링할 때 Remotion이 어느 슬롯에 파일이 있는지 확인합니다(`resolveClips`, 공개 폴더에 HEAD 요청).
  - 파일이 있으면 그 클립을 쓰고, 없으면 그 컷의 대체 화면(v2 화면)을 씁니다.
- 클립 처리:
  - 1080×1920을 덮도록 맞추고 무음으로 씁니다. 앞 3초(90프레임)만 쓰며, `clipTrimSec`으로 시작점을 옮길 수 있습니다.
  - Remotion이 추가 푸시인을 넣지 않습니다. 카메라 움직임은 생성 단계에서 정합니다.
- 모든 클립은 y 820→1080 구간에서 #F4F1EC로 흐려집니다. 그 아래는 자막 띠입니다. #111111 자막이 어떤 영상 위에서도 읽히고, 네 편의 아래 띠가 똑같아집니다.
  - 그래서 생성할 때 **피사체를 화면 위쪽(y 약 160–1000)**에 둡니다.
- 한 컷이라도 대체 화면이면 결과물 이름에 `_DRAFT`가 붙습니다. 최종본과 섞이지 않게 하기 위해서입니다.

**자동 렌더링:**
```
npm run a:watch       # public/clips/a-moon-jar 감시 → 파일이 바뀌고 다운로드가 끝나면(크기 3초간 불변) 자동 렌더링
npm run a:render      # 한 번 렌더링 → out/A-moon-jar-v3/KURIO_AD_A_MOON_JAR_v3(.mp4|_THUMBNAIL.png|stills/)
npm run a:keyframes   # Higgsfield 시작 이미지 + 스틸만
```
렌더링할 때 각 클립을 검사합니다(해상도, fps, 길이, 9:16 여부). 3초보다 짧거나, 9:16이 아니거나, 1080보다 작으면 경고를 출력합니다.

## 3. 렌더링 원리 (tools/render-ad.mjs)
- 번들은 한 번만 만들고 캐시를 쓰지 않습니다. 임시 폴더는 끝나면 지웁니다.
- 12초 본편과 엔드카드 마스터를 **재인코딩 없이** 연결합니다(ffmpeg concat `-c copy`). 둘 다 H.264, crf 18, yuv420p, bt709, 무음입니다.
- 엔드카드 마스터는 없을 때만 렌더링합니다. 엔드카드를 고쳤다면 `--rebuild-endcard --endcard-version=v3`처럼 버전을 올리고 네 편을 모두 다시 만듭니다.
- 확인 결과(v2 및 v3 파이프라인 테스트): 450프레임, 15.000초. 최종본의 엔드카드 프레임 해시가 마스터와 일치합니다.

## 4. 시작 이미지 (keyframes)
`KF-A-01…04`는 Remotion의 정지 화면(`Ad-A` 폴더)으로, 각 컷 대체 화면의 첫 프레임에서 자막을 뺀 것입니다.
- ①② 실제 사진에서 분리한 달항아리를 #F4F1EC 스테이지에 놓고 좌측광 그림자를 넣은 이미지입니다. 네 편의 배경, 조명 방향, 크기를 맞추는 기준이 됩니다.
- ③ 실제 제작 흔적 사진(안쪽 유약과 성형 자국)입니다.
- ④ 공간 장면 생성에 쓸 제품 참고 이미지입니다(①과 같음).

**제품 실루엣 추출**(새 패키지 없이 .NET과 Node 사용):
1. 1000×1000 BGR 원시 파일을 만듭니다(`tools/check-silhouette.ps1` 방식).
2. `node tools/trace-silhouette.cjs <in.bgr> <contour.json>`
3. `powershell -File tools/check-silhouette.ps1 <contour.json> <overlay.png>`로 눈으로 확인합니다.
4. `node tools/contour-to-ts.cjs <contour.json> src/ads/products/<id>.silhouette.ts <name> <사진>`

중심점과 반경 범위는 달항아리 기준값이라 다른 제품은 조정해야 합니다.

## 5. 템플릿 구조
```
src/ads/template/
  tokens.ts         규격·색·안전 영역·자막·스테이지·그림자·푸시인·클립 슬롯·클립 흐림 구간(CLIP_FADE)
  types.ts          ProductAd(slug 포함) / AdScene(visual = 대체 화면, clipTrimSec) / AdProps(clips)
  ProductAdVideo.tsx  컷 배치, resolveClips(슬롯 확인)
  ProductScene.tsx    클립 또는 대체 화면 + 자막. KeyframeScene(시작 이미지)
  Visuals.tsx         대체 화면(컷아웃 스테이지, 위쪽 사진+흐림, PHOTO NEEDED)
  Caption.tsx / EndCard.tsx
src/ads/products/a-moon-jar.ts (+ .silhouette.ts)
tools/  render-ad.mjs · watch-clips.mjs · trace-silhouette.cjs · contour-to-ts.cjs · check-silhouette.ps1
higgsfield/SHOTLIST-A-moon-jar.md   생성 목록·프롬프트·검수 항목·비용 추정
archive/ad-a-v1/                    v1 소스 (빌드 제외)
```

## 6. 지켜야 할 것
- 확인되지 않은 공예 제작 과정을 실제처럼 표현하지 않습니다. ③에서는 손, 물레, 흙, 도구를 생성하지 않고 빛 변화만 줍니다. 실제 제작 영상이 있으면 그것을 씁니다.
- ②의 허리 접합선과 가마 얼룩은 원본에 없으므로 만들지 않습니다.
- ④는 생성한 공간이므로 'AI 생성 공간'으로 기록하고, Meta의 AI 고지 기준을 확인한 뒤 집행합니다.
- 생성 결과는 원본 사진과 형태와 색을 대조해 검수한 뒤에만 슬롯에 넣습니다(SHOTLIST §4).
- 유료 생성은 크레딧(비용)을 확인하고 별도 승인을 받은 뒤 실행합니다.
- 홈페이지 저장소, `main`, Production은 건드리지 않습니다.

## 7. Higgsfield 연결 (2026-11-26 조사, 미연결)
| 방법 | 내용 |
|---|---|
| CLI (권장) | `@higgsfield/cli` 1.2.2 (npm, 공식 저장소 github.com/higgsfield-ai/cli). `npm install -g @higgsfield/cli` → `higgsfield auth login`(사용자가 브라우저에서 로그인) → `higgsfield account`(잔액), `higgsfield model list`, `higgsfield generate cost …`(비용 확인, 무료), `higgsfield generate create <model> --start-image … --wait` |
| MCP | 공식 원격 MCP `https://mcp.higgsfield.ai/mcp`. claude.ai의 커넥터 설정에서 사용자 지정 커넥터로 추가하고 로그인합니다. 도구 목록은 공개되어 있지 않습니다 |
| API / SDK | `@higgsfield/client` 0.2.6 (Node), `higgsfield-client` (Python). 키는 console.higgsfield.ai에서 발급(`HF_API_KEY`/`HF_API_SECRET` 등). 요금은 초당 USD입니다 |

- 구독 플랜(2026-11-25 기준): Starter $19/월(270크레딧), Plus $59(1,200), Ultra $129(3,000) 등.
- **생성별 크레딧 차감량은 공개되어 있지 않습니다.** 로그인 후 `generate cost`로 확인합니다.
- MCP와 CLI 사용은 '무제한' 혜택이 적용되지 않고 크레딧이 차감됩니다.
- **약관 4.4:** Enterprise가 아닌 계정의 입력물과 결과물은 모델 학습에 쓰일 수 있습니다. 상업적 사용은 허용됩니다.
- 와유재 사진은 서면 허락이 없으므로, 업로드하기 전에 운영자 결정이 필요합니다.
