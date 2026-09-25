/* WICKED STORM — 사이트 설정
 * ADMIN_API: 관리 API(Function URL)의 베이스 URL.
 *   비어 있으면 admin.html은 "API 미배포" 배너를 띄우고 저장을 비활성화합니다.
 *   배포 후 여기에 URL을 기입하세요 (예: "https://xxxx.lambda-url.ap-northeast-2.on.aws").
 *   자세한 절차는 lambda/admin-api/DEPLOY.md 참조.
 * CONTACT_API: 문의 폼 전송 엔드포인트(Lambda Function URL).
 *   기본값은 현재 운영 URL. 엔드포인트를 옮길 때만 변경하세요.
 *   비우면 main.js가 동일한 URL로 폴백하므로 동작은 불변입니다.
 * SOCIAL: 회사 인스타그램·블로그 주소. 채우면 메인 '최근 소식' 아래 채널 띠와
 *   푸터 링크가 나타나고, 비워 두면 숨겨집니다. https:// 로 시작하는 주소만 씁니다.
 *   label은 채널 띠에 보이는 이름입니다(예: "@wickedstorm_official").
 *   운영 방법은 docs/SNS_채널_연계_가이드.md 참조.
 */
window.WS_CONFIG = {
  ADMIN_API: "",
  CONTACT_API: "https://v6pa5eyigfdkbuzm2rskahdf6y0xfsre.lambda-url.ap-northeast-2.on.aws",
  SOCIAL: {
    instagram: { url: "", label: "" },
    blog: { url: "", label: "" }
  }
};
