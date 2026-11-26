# KURIO Meta 광고 A — 와유재 백자 달항아리 (v1, 2026-11-25)

## 산출물 (`out/A-moon-jar-v1/`)

| 파일 | 내용 |
|---|---|
| `KURIO_AD_A_MOON_JAR_v1.mp4` | 1080×1920, 30fps, 450프레임, 15.0초, H.264 High, yuv420p, bt709, 무음(오디오 트랙 없음), 약 1.9MB |
| `KURIO_AD_A_THUMBNAIL_v1.png` | 프레임 60 (Scene 01) |
| `stills/KURIO_AD_A_S01…S05_*_v1.png` | 장면별 스틸 (프레임 60·150·240·330·435) |

다시 렌더링:

```
npx remotion render KURIO-AD-A-MOON-JAR out/A-moon-jar-v1/KURIO_AD_A_MOON_JAR_v1.mp4 --codec=h264 --pixel-format=yuv420p --color-space=bt709
npx remotion still KURIO-AD-A-MOON-JAR out/A-moon-jar-v1/KURIO_AD_A_THUMBNAIL_v1.png --frame=60
```

## 장면

| # | 프레임 | 자막 | 사진·크롭 | 움직임 |
|---|---|---|---|---|
| 01 | 0–89 | Shaped like the moon. / KOREAN MOON JAR | 01-cover 전체 형태 | 느린 푸시인 (1.00→1.05) |
| 02 | 90–179 | Beauty in imperfection. | 01-cover 입구·어깨 곡선·표면 확대 | 왼쪽으로 느린 이동 |
| 03 | 180–269 | Handcrafted in Korea. | 02-detail 두 장: 안쪽 유광 유약과 물레 자국 / 굽 안 작가 이니셜 | 위아래 서로 반대 방향 이동 |
| 04 | 270–359 | A quiet statement for your home. | 03-texture: 실제 공간에 놓인 달항아리 (와유재 매장, **24cm**) | 느린 풀백 (1.07→1.00) |
| 05 | 360–449 | Curious about Korea / KURIO / LEARN MORE | 공용 EndCard, #B04A3A | 글자만 순서대로 페이드 |

- 모든 컷은 하드컷이고, 가격은 표시하지 않습니다. 색 보정·리터칭 없이 크롭과 움직임만 줍니다.
- 자막 위치는 모든 장면에서 같습니다(y=300, 좌측 여백 96).
- 이미지 틀은 x 96, y 560, 888×1040입니다.
- Reels 안전 영역(위 14%, 아래 35%, 좌우 약 6%) 안에 모든 글자가 들어갑니다. 이미지 틀 아래쪽 일부(y 1248–1600)는 Reels UI에 가려질 수 있는 영역이며, 사진만 놓입니다.

## 이미지 출처와 사용 근거

사용한 3장은 KURIO 홈페이지 프로젝트에 이미 등록된 파일입니다(`kurio-public-web/media/products/p-wayujae-white-moon-jar/`). 이를 그대로 복사했습니다.

**근거:** 2026-11-25 KURIO 사이트 운영자의 게시 결정입니다(`publishDecision`, US demand test 01). 와유재나 신동범 작가의 **서면 허락은 아닙니다**(permission: unverified).

| 파일 | 원본 URL | 출처 위치 |
|---|---|---|
| 01-cover.jpg (3000²) | https://cdn.imweb.me/upload/S20241015519c1144276b8/454902a9bbc08.jpg | 상세 설명 '16cm Semi-matte' 옵션 칸 |
| 02-detail.png (1440×900) | https://cdn.imweb.me/upload/S20241015519c1144276b8/b9bbf1a24010e.png | 상세 설명 '\| Detail' |
| 03-texture.jpg (2983²) | https://cdn.imweb.me/upload/S20241015519c1144276b8/7e9bcd01ab86f.jpg | 상세 설명 '24cm Semi-matte' 옵션 칸 |

### 사용하지 않은 후보 (URL·출처만 기록, 내려받지 않음)

모두 https://wayujae.com/shop/?idx=115 에서 확인했습니다. 내용 설명은 2026-11-25 조사 노트(`C:\CLAUDE\KRUIO\research\us-demand-test\wayujae-white-moon-jar.md` §6)를 따릅니다.

| URL | 크기 | 내용 | 쓰지 않은 이유 |
|---|---|---|---|
| https://cdn.imweb.me/upload/S20241015519c1144276b8/616fe65bafacc.png | 468² | 대표 1: 나무 테이블 위 여러 점의 연출 | KURIO에 미등록, 저해상도 |
| https://cdn.imweb.me/upload/S20241015519c1144276b8/28d5532934cb3.jpeg | 459² | 대표 2: 실내 테이블 위 두 점 | KURIO에 미등록, 저해상도 |
| https://cdn.imweb.me/upload/S20241015519c1144276b8/425c550184aa9.jpeg | 480×430 | 티크 사이드보드 위 한 점 (실내 연출) | KURIO에 미등록, 저해상도 |
| https://cdn.imweb.me/upload/S20241015519c1144276b8/b27ffcba86e8e.jpeg | 640×480 | 선반 위 다른 기형과 함께 | KURIO에 미등록, 다른 상품 섞임 |
| https://cdn.imweb.me/upload/S20241015519c1144276b8/f8058a54c5197.png | 1440×900 | 물레 작업 장면 (작가 얼굴 보임) | KURIO에 미등록, 인물 초상 동의 필요 |
| https://cdn.imweb.me/upload/S20241015519c1144276b8/370b3a4aea9af.jpg | 3024×4032 | 열매 가지를 꽂은 무광 항아리 윗부분 | KURIO에 미등록, 11cm 무광 |
| https://cdn.imweb.me/upload/S20241015519c1144276b8/947dfdac40224.jpg | 2526² | 11cm 무광 단독 컷 | KURIO에 미등록, 다른 크기 |

### 품질을 높이려면 필요한 사진

1. **실제 집 인테리어 연출 사진**(고해상도, 세로 또는 정사각형 1500px 이상)이 필요합니다. 지금 Scene 04는 와유재 매장 창가에 놓인 24cm 사진이라 '집'이 아닙니다.
2. **제작 과정 사진**(물레·시유·가마)과 그 사용 허락, 그리고 인물이 나오면 초상 동의가 필요합니다. 지금 Scene 03은 완성품의 디테일만 보여 줍니다.
3. 16cm 단독 컷이 정말 16cm인지 와유재에 확인해야 합니다. 사진에 크기 기준이 없습니다.
4. 와유재와 신동범세라믹스튜디오의 광고 사용에 대한 서면 허락이 필요합니다.
