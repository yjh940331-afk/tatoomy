/* =============================================================
   tatoomy · 기본값(폴백)
   -------------------------------------------------------------
   ※ 실제 내용은 content/settings.json 에서 관리합니다(관리자 페이지).
     이 파일은 settings.json 을 불러오지 못했을 때만 쓰이는 최소 기본값입니다.
   ============================================================= */
window.SITE_CONFIG = {
  brand: "tatoomy",
  tagline: "당신의 이야기를 피부에 새깁니다",
  policy: "19세 미만 시술 불가 · 예약금 입금 후 예약 확정 · 노쇼 시 예약금 환불 불가",
  phone: "", email: "",
  instagram: "https://instagram.com/tatoomy",
  kakao: "", naverBlog: "", youtube: "",
  hero: { image: "images/uploads/hero.jpg", title: "tatoomy", subtitle: "Fine Line · Blackwork · Lettering" },
  about: { image: "images/uploads/about.jpg", title: "Ink that lasts", body: "" },
  artist: {
    title: "타투이스트 KAI", name: "KAI", role: "tatoomy 대표 타투이스트",
    image: "images/uploads/artist.jpg", countLabel: "누적 작업", workCount: "2,000+",
    body: "", promise: "모든 작업은 대표 타투이스트가 직접 진행합니다.",
  },
  trustBadges: [], portfolioAlbums: [], products: [], reviews: [], process: [], faq: [],
  productGuide: { inclusions: [], options: [], flow: [] },
  aftercare: { title: "시술 후 관리", intro: "", steps: [], cautions: [] },
  availability: { title: "예약 가능 일정", status: "", note: "", items: [] },
  location: { title: "오시는 길", address: "", note: "", mapEmbed: "", transit: [] },
  booking: { endpoint: "", note: "" },
};
