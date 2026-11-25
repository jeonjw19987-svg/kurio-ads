# Higgsfield 생성 목록 — 광고 A (와유재 백자 달항아리)

상태: **생성 전, 승인 대기** (2026-11-26). 크레딧 사용 0.
결과 파일은 `public/clips/a-moon-jar/`에 아래 이름으로 저장합니다. Remotion이 자동으로 사용합니다(HANDOFF.md §3).

## 0. 네 편 공통 아트디렉션 (B·C·D도 이 블록을 그대로 씁니다)
**고정 프롬프트 블록 `STUDIO`:**
```
Premium design-store product film, photorealistic, natural colour.
Seamless warm off-white studio sweep (paper tone close to #F4F1EC), no visible horizon line.
One large soft key light from the LEFT (diffused window light, about 45°), white bounce from the right,
a soft natural shadow falling to the RIGHT and slightly back.
Locked-off camera on a tripod at the object's mid-height, 85 mm look, shallow but not extreme depth of field.
Only movement: an extremely slow push-in. Real-time speed, no slow motion.
Keep the subject in the upper half of the vertical 9:16 frame; the lower 45% is plain floor or backdrop.
No text, no logo, no people, no hands, no props other than a plain plinth.
```
**고정 금지 블록 `NEGATIVE`:**
```
no deformation of the object, no change of silhouette or proportions, no added pattern, crack, gloss or reflection,
no colour shift, no extra objects, no hands, no people, no text, no camera shake, no fast motion, no lens flare,
no cinematic colour grade
```
**제품 보존 블록 `KEEP` (상품마다 작성):**
```
The jar must remain exactly as in the input image: white porcelain moon jar with a rolled rim and small foot,
semi-matte exterior, pale blue tint inside the mouth, the same slightly irregular round silhouette.
```

**공통 출력 설정:** 9:16, 1080p, 5초, 무음.
- Remotion은 각 컷에 앞 3초만 씁니다. 다른 구간을 쓰려면 데이터의 `clipTrimSec`을 조정합니다.
- 프레임 레이트는 Remotion이 30fps로 맞춥니다.

## 1. 컷별 생성 계획
| 슬롯 파일 | 컷 | 입력 이미지 | 생성 방식 | 실제 상품·사실과의 관계 |
|---|---|---|---|---|
| `01-product.mp4` | ① PRODUCT | `KF-A-01.png` (실제 사진에서 분리한 달항아리를 #F4F1EC 스테이지에 배치) | (a) 이미지 모델로 제품을 바꾸지 않고 조명만 실사화 → (b) 이미지→영상, 시작·끝 프레임 고정(끝 = 시작 104% 확대), 아주 느린 푸시인 | 실제 제품 사진 기반입니다. 형태와 색은 원본과 대조해 검수합니다 |
| `02-detail.mp4` | ② DETAIL | `KF-A-02.png` (같은 사진의 2배 확대, 입구·어깨·유약면) | 이미지→영상. 빛이 유약 위를 천천히 지나가며 반무광 표면 질감이 드러나게 | 실제 제품 사진 기반입니다. 허리 접합선이나 가마 얼룩은 원본에 없으므로 **만들지 않습니다** |
| `03-making.mp4` | ③ MAKING | `KF-A-03.png` (실제 안쪽 유광 유약과 성형 자국 사진) | 이미지→영상. **빛 변화만** 줍니다 | **제작 과정을 만들지 않습니다.** 손, 물레 회전, 흙, 도구를 넣지 않습니다. 와유재가 손만 나오는 실제 제작 영상을 주면 생성하지 않고 그 영상을 씁니다 |
| `04-in-place.mp4` | ④ IN PLACE | `KF-A-04.png` (제품 참고 이미지 = ①과 같음) | (a) 제품 참고 이미지로 "현대 주거 공간 콘솔 위" 장면 이미지 4안 생성 → 원본과 가장 같은 1안 선택 → (b) 이미지→영상 느린 푸시인 | **생성한 공간**입니다. 실제 집 사진이 아니므로 내부 기록에 'AI 생성 공간'으로 남기고, Meta의 AI 고지 기준을 확인합니다 |

### 컷별 프롬프트 (STUDIO, NEGATIVE, KEEP 블록과 함께 씀)
- **①:**
  ```
  The moon jar stands alone on the studio floor, centred, filling about 70% of the frame width. Soft morning light slowly brightens by a few percent; the shadow stays still.
  ```
- **②:**
  ```
  Extreme close view of the jar's rim and shoulder. A soft band of light drifts very slowly across the semi-matte glaze, revealing its fine surface texture. The silhouette edge stays sharp against the off-white backdrop.
  ```
- **③:**
  ```
  Close view inside the jar: the pale blue glossy glaze and the faint concentric rings left by shaping. Only the light changes, slowly, as if a cloud passes the window. Nothing else moves.
  ```
- **④ (a) 이미지:**
  ```
  The exact jar from the reference image placed on a low light-oak console against a warm off-white plaster wall in a calm, contemporary living room; generous empty space around it; window light from the left, soft shadow to the right; no other decor.
  ```
- **④ (b) 영상:**
  ```
  Locked-off camera, extremely slow push-in towards the jar. Light and shadows stay natural; nothing else moves.
  ```

## 2. 모델 후보 (2026-11-26 확인, 출처: open.higgsfield.ai, github.com/higgsfield-ai/cli MODELS.md)
| 용도 | 1순위 | 이유 | 대안 |
|---|---|---|---|
| ①②③④(b) 이미지→영상 | **Seedance 2.0** (1080p, 9:16, 시작·끝 프레임) | 시작·끝 프레임을 같은 이미지로 고정하면 제품 형태가 흔들릴 여지가 가장 적습니다 | Kling 3.0 pro (9:16, 시작·끝 프레임), Veo 3.1 (9:16, 4·6·8초) |
| ①(a) 조명 실사화, ④(a) 장면 | 제품 참고 이미지를 받는 이미지 모델(Seedream 5.0, Nano Banana, GPT Image 중) 또는 "Product shots" 워크플로 | 제품 정체성은 참고 이미지에 의존합니다. 고정 파라미터가 없어 반드시 사람이 검수합니다 | — |

## 3. 비용 추정 (실행 전 `higgsfield generate cost`로 확정)
공개된 API 단가(USD/초, 2026-11-26 기준)로 계산했습니다. 구독 크레딧 기준의 생성별 차감량은 공개되어 있지 않습니다.
- 8개 영상 = 4컷 × 2테이크, 각 5초
  - Seedance 2.5 1080p ($0.6518/초): 약 **$26**
  - Seedance 2.0 1080p: 최저가 $0.0804/초는 저해상도 기준이고 1080p 단가는 미확인입니다
  - Kling 4.0 ($0.126/초~): 약 **$5~**
- 이미지 약 8장(①(a) 2장, ④(a) 4~6장): $0.05~0.11/장 → 약 **$1 이하**
- 재생성 여유를 포함한 1차 예산 제안: **$30 이내 또는 그에 해당하는 크레딧**. 확정치는 로그인 후 `higgsfield generate cost <model> …`로 컷별로 확인해 승인을 받습니다.

## 4. 생성 후 검수 (통과한 것만 슬롯에 넣음)
- [ ] 실루엣, 입구, 굽, 비례가 원본 사진과 같은가 (`out/A-moon-jar-v2/stills`와 나란히 비교)
- [ ] 색: 백자 흰색, 안쪽의 옅은 청색. 광택을 새로 만들지 않았는가
- [ ] 조명이 왼쪽에서 오고 그림자가 오른쪽으로 떨어지는가. 배경 톤이 #F4F1EC에 가까운가
- [ ] 카메라가 고정이거나 아주 느린 푸시인인가. 실시간 속도인가
- [ ] 손, 사람, 글자, 추가 소품이 없는가. ③에 제작 장면이 생기지 않았는가
- [ ] 피사체가 화면 위쪽(y 약 160–1000)에 있는가. 아래쪽은 Remotion이 배경색으로 흐리게 처리합니다
- [ ] 3초 이상, 9:16, 1080×1920 이상 (`tools/render-ad.mjs`가 자동으로 경고)

## 5. 실행 전 결정이 필요한 것
1. **Higgsfield 연결 방법:**
   - CLI: `npm install -g @higgsfield/cli` → 사용자가 `higgsfield auth login`
   - 또는 MCP: claude.ai 커넥터에 `https://mcp.higgsfield.ai/mcp` 추가
2. **와유재 사진을 Higgsfield에 올리는 것:** Higgsfield 약관 4.4에 따르면 Enterprise가 아닌 계정의 입력물과 결과물은 모델 학습에 쓰일 수 있습니다. 와유재의 서면 허락이 없는 사진이므로 운영자 결정이 필요합니다.
3. **④를 생성 공간으로 쓰는 것:** 실제처럼 보이는 생성 장면을 상품 광고에 쓰는 데 대한 운영자 승인과 AI 고지 방침이 필요합니다.
4. **예산 상한(크레딧 또는 USD)과 1차 테이크 수.**
