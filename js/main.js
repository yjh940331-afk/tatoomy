/* ============================================================
   tatoomy · 동작 스크립트
   site-config.js / settings.json 내용을 화면에 그려주고,
   갤러리/메뉴/라이트박스를 제어합니다.
   ============================================================ */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function lines(v) {
    if (Array.isArray(v)) return v.map(function (x) {
      return typeof x === "string" ? x : (x && (x.line || x.item || x.feature || x.text || x.step)) || "";
    }).filter(function (s) { return s !== ""; });
    if (typeof v === "string") return v.split("\n").filter(function (s) { return s.trim() !== ""; });
    return [];
  }
  function listHtml(items) {
    return lines(items).map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("");
  }

  /* ---------- 포트폴리오 스타일 분류 ---------- */
  var STYLES = {
    linework: "라인워크", blackwork: "블랙워크", color: "컬러",
    lettering: "레터링", minimal: "미니멀", coverup: "커버업",
  };
  function categoryLabel(v) { return STYLES[v] || "Tattoo"; }
  function normalizeCategory(v) { return STYLES[v] ? v : (v || "linework"); }

  function normItem(it) {
    if (!it) return { type: "photo", src: "" };
    if (it.youtube || it.id) return { type: "youtube", id: it.youtube || it.id, category: it.category, caption: it.caption, poster: it.poster || it.cover };
    if (it.type === "youtube" || it.type === "video") return it;
    var src = it.src || it.image || "";
    return { type: "photo", src: src, category: it.category, caption: it.caption, poster: it.poster || src };
  }
  function hasMedia(item) { return !!(item && ((item.type === "youtube" && item.id) || item.src)); }
  function thumbOf(item) {
    if (!item) return "";
    if (item.type === "youtube") return item.poster || ("https://img.youtube.com/vi/" + item.id + "/hqdefault.jpg");
    return item.poster || item.src;
  }

  function normalizeAlbum(album, i) {
    var rawItems = album.images || album.items || album.photos || [];
    if (!rawItems.length && (album.image || album.src || album.youtube || album.id)) rawItems = [album];
    var items = rawItems.map(normItem).filter(hasMedia);
    var first = items[0] || {};
    var title = album.title || album.name || album.caption || categoryLabel(album.category || first.category) || ("작업 " + (i + 1));
    return {
      title: title,
      category: normalizeCategory(album.category || first.category),
      description: album.description || album.desc || "",
      cover: album.cover || album.image || thumbOf(first),
      healed: !!album.healed,
      items: items,
    };
  }

  function buildAlbums() {
    var rawAlbums = C.portfolioAlbums || C.albums || [];
    if (rawAlbums.length) return rawAlbums.map(normalizeAlbum).filter(function (album) { return album.items.length; });
    var groups = [];
    var byKey = {};
    (C.portfolio || []).forEach(function (item) {
      var normalized = normItem(item);
      if (!hasMedia(normalized)) return;
      var title = item.album || item.caption || categoryLabel(normalized.category);
      var key = (normalized.category || "all") + "|" + title;
      if (!byKey[key]) {
        byKey[key] = { title: title, category: normalizeCategory(normalized.category), description: "", cover: thumbOf(normalized), healed: false, items: [] };
        groups.push(byKey[key]);
      }
      byKey[key].items.push(normalized);
    });
    return groups;
  }

  var ALBUMS = buildAlbums();

  /* ---------- 기본 텍스트/이미지 채우기 ---------- */
  $$("[data-brand]").forEach(function (el) { if (C.brand) el.textContent = C.brand; });
  if (C.tagline) { var tg = $("[data-tagline]"); if (tg) tg.textContent = C.tagline; }

  if (C.hero) {
    var hb = $("[data-hero-bg]");
    if (hb && C.hero.image) hb.style.backgroundImage = "url('" + C.hero.image + "')";
    if (C.hero.title && $("[data-hero-title]")) $("[data-hero-title]").textContent = C.hero.title;
    if (C.hero.subtitle && $("[data-hero-sub]")) $("[data-hero-sub]").textContent = C.hero.subtitle;
  }

  if (C.about) {
    var ai = $("[data-about-img]");
    if (ai && C.about.image) ai.src = C.about.image;
    if (C.about.title && $("[data-about-title]")) $("[data-about-title]").textContent = C.about.title;
    var ab = $("[data-about-body]");
    if (ab && C.about.body) ab.innerHTML = lines(C.about.body).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  }

  /* ---------- 타투이스트 프로필 ---------- */
  var artist = C.artist || C.photographer;
  if (artist) {
    if ($("[data-artist-title]")) $("[data-artist-title]").textContent = artist.title || ("타투이스트 " + (artist.name || ""));
    if ($("[data-artist-role]")) $("[data-artist-role]").textContent = artist.role || "";
    if ($("[data-artist-img]")) $("[data-artist-img]").src = artist.image || "";
    var aBody = $("[data-artist-body]");
    if (aBody) aBody.innerHTML = lines(artist.body || artist.philosophy || "").map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    if ($("[data-artist-promise]")) $("[data-artist-promise]").textContent = artist.promise || "";
    if ($("[data-artist-count]")) $("[data-artist-count]").textContent = artist.workCount || artist.shootCount || artist.count || "";
    if ($("[data-artist-count-label]") && artist.countLabel) $("[data-artist-count-label]").textContent = artist.countLabel;
  }

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 위생·안전 배지 ---------- */
  var trustGrid = $("#trustGrid");
  if (trustGrid && C.trustBadges) {
    trustGrid.innerHTML = C.trustBadges.map(function (b, i) {
      return '<article class="trust-card reveal" style="transition-delay:' + (Math.min(i, 5) * 0.06) + 's">' +
        '<div class="trust-icon">' + esc(b.icon || String(i + 1).padStart(2, "0")) + "</div>" +
        "<h3>" + esc(b.title || "") + "</h3>" +
        "<p>" + esc(b.text || b.desc || "") + "</p>" +
      "</article>";
    }).join("");
  }

  /* ---------- 플래시 섹션 ---------- */
  var flashGrid = $("#flashGrid");
  if (flashGrid && C.flash && C.flash.length) {
    flashGrid.innerHTML = C.flash.map(function (item) {
      var avail = item.available !== false;
      var cardClass = "flash-card reveal" + (avail ? "" : " booked");
      var bookBtn = avail
        ? '<button class="flash-book-btn" type="button" data-flash-title="' + esc(item.title) + '">예약하기</button>'
        : "";
      var bookedOverlay = avail ? "" : '<div class="flash-booked-overlay"><span>BOOKED</span></div>';
      var info = [item.size, item.part].filter(Boolean).join(" · ");
      return '<div class="' + cardClass + '">' +
        '<img src="' + esc(item.image || "") + '" alt="' + esc(item.title || "") + '" loading="lazy" />' +
        '<div class="flash-price-tag">' + esc(item.price || "") + '</div>' +
        '<div class="flash-card-info">' +
          '<strong>' + esc(item.title || "") + '</strong>' +
          (info ? '<small>' + esc(info) + '</small>' : '') +
        '</div>' +
        bookBtn +
        bookedOverlay +
      '</div>';
    }).join("");

    $$(".flash-book-btn", flashGrid).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var title = btn.dataset.flashTitle;
        var contact = document.getElementById("contact");
        if (contact) {
          contact.scrollIntoView({ behavior: "smooth" });
          var msgBox = contact.querySelector("textarea[name='message']");
          if (msgBox && !msgBox.value) msgBox.value = "[플래시 예약] " + title + " 예약 문의드립니다.";
        }
      });
    });
  } else {
    var flashSection = document.getElementById("flash");
    if (flashSection) flashSection.hidden = true;
  }

  /* ---------- 포트폴리오 갤러리 ---------- */
  var gallery = $("#gallery");
  var galleryAlbums = [];
  function renderGallery(filter) {
    if (!gallery || !ALBUMS.length) return;
    gallery.innerHTML = "";
    galleryAlbums = [];
    ALBUMS.forEach(function (album) {
      if (filter === "healed") {
        if (!album.healed) return;
      } else if (filter && filter !== "all") {
        if (album.category !== filter) return;
      }
      var index = galleryAlbums.length;
      galleryAlbums.push(album);
      var fig = document.createElement("div");
      fig.className = "gallery-item album-card reveal";
      fig.dataset.index = index;
      fig.style.transitionDelay = ((galleryAlbums.length % 3) * 0.08) + "s";
      var healedBadge = album.healed ? '<span class="badge-healed">HEALED</span>' : "";
      fig.innerHTML =
        '<img src="' + esc(album.cover) + '" alt="' + esc(album.title) + '" loading="lazy" />' +
        '<span class="album-count">' + album.items.length + "장</span>" +
        healedBadge +
        '<span class="cap"><span class="album-meta">' +
          "<strong>" + esc(album.title) + "</strong>" +
          '<em>' + esc(album.description || categoryLabel(album.category)) + " · 클릭해서 보기</em>" +
        "</span></span>";
      fig.addEventListener("click", function () { openAlbum(index); });
      gallery.appendChild(fig);
    });
    observeReveal();
  }

  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".filter").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderGallery(btn.dataset.filter);
    });
  });

  /* ---------- 영상 섹션 ---------- */
  (function () {
    var videos = C.videos || [];
    var real = videos.filter(function (v) { return v.id && v.id.length > 3 && !v.id.toLowerCase().includes("replace"); });
    var videoSection = document.getElementById("videos");
    var videoGrid = document.getElementById("videoGrid");
    if (!real.length || !videoSection || !videoGrid) return;
    videoSection.hidden = false;
    videoGrid.innerHTML = real.map(function (v) {
      return '<div class="video-embed reveal">' +
        '<iframe src="https://www.youtube.com/embed/' + esc(v.id) + '?rel=0" loading="lazy" allow="encrypted-media; fullscreen" allowfullscreen title="' + esc(v.caption || "작업 영상") + '"></iframe>' +
        '<p class="video-caption">' + esc(v.caption || "") + "</p>" +
      "</div>";
    }).join("");
  })();

  /* ---------- 가격 카드 ---------- */
  var priceGrid = $("#priceGrid");
  if (priceGrid && C.products) {
    priceGrid.innerHTML = C.products.map(function (p) {
      var feats = lines(p.features).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
      return '<div class="price-card reveal">' +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="pc-desc">' + esc(p.desc || "") + "</p>" +
        '<p class="pc-price">' + esc(p.price || "") + "</p>" +
        "<ul>" + feats + "</ul></div>";
    }).join("");
  }

  var productGuide = $("#productGuide");
  if (productGuide && C.productGuide) {
    var pg = C.productGuide;
    var cards = pg.cards || [
      { title: "포함사항", items: pg.inclusions },
      { title: "추가 옵션", items: pg.options },
      { title: "진행 방식", items: pg.flow },
    ];
    productGuide.innerHTML = cards.filter(function (card) {
      return card && card.title && lines(card.items).length;
    }).map(function (card) {
      return '<article class="product-detail">' +
        "<h3>" + esc(card.title) + "</h3>" +
        "<ul>" + listHtml(card.items) + "</ul>" +
      "</article>";
    }).join("");
  }

  /* ---------- 진행 절차 ---------- */
  var processList = $("#processList");
  if (processList && C.process) {
    processList.innerHTML = C.process.map(function (s, i) {
      return '<div class="process-step reveal" style="transition-delay:' + (i * 0.08) + 's">' +
        '<div class="num">' + (i + 1) + "</div>" +
        '<div><div class="p-title">' + esc(s.title || "") + "</div>" +
        '<div class="p-desc">' + esc(s.desc || "") + "</div></div></div>";
    }).join("");
  }

  /* ---------- 게스트워크 섹션 ---------- */
  (function () {
    var guestwork = C.guestwork || [];
    var gwSection = document.getElementById("guestwork");
    var gwGrid = document.getElementById("guestworkGrid");
    if (!guestwork.length || !gwSection || !gwGrid) return;
    gwSection.hidden = false;
    gwGrid.innerHTML = guestwork.map(function (g, i) {
      var dmLink = g.link
        ? '<a class="gw-dm-btn" href="' + esc(g.link) + '" target="_blank" rel="noopener">예약 DM →</a>'
        : '<a class="gw-dm-btn" href="' + esc(C.instagram || "#") + '" target="_blank" rel="noopener">예약 DM →</a>';
      return '<div class="guestwork-card reveal" style="transition-delay:' + (i * 0.07) + 's">' +
        '<div class="gw-date">' + esc(g.date || "") + '</div>' +
        '<div class="gw-studio">' + esc(g.studio || "") + '</div>' +
        '<div class="gw-city">' + esc(g.city || "") + '</div>' +
        '<div class="gw-footer">' +
          '<span class="gw-slots">잔여 <strong>' + esc(String(g.slots != null ? g.slots : "")) + '</strong> 슬롯</span>' +
          dmLink +
        '</div>' +
      '</div>';
    }).join("");
  })();

  /* ---------- 애프터케어 ---------- */
  if (C.aftercare) {
    var ac = C.aftercare;
    if ($("[data-aftercare-title]") && ac.title) $("[data-aftercare-title]").textContent = ac.title;
    if ($("[data-aftercare-intro]")) $("[data-aftercare-intro]").textContent = ac.intro || "";
    var acSteps = $("#aftercareSteps");
    var acCautions = $("#aftercareCautions");
    if (acSteps) acSteps.innerHTML = listHtml(ac.steps);
    if (acCautions) acCautions.innerHTML = listHtml(ac.cautions);
  }

  /* ---------- 후기 ---------- */
  var reviewGrid = $("#reviewGrid");
  if (reviewGrid && C.reviews) {
    reviewGrid.innerHTML = C.reviews.map(function (r, i) {
      var photo = r.image ? '<img class="r-photo" src="' + esc(r.image) + '" alt="후기 사진" loading="lazy" />' : "";
      var sub = [r.part || r.venue, r.date].filter(Boolean).join(" · ");
      return '<div class="review-card reveal" style="transition-delay:' + (Math.min(i, 5) * 0.07) + 's">' +
        photo +
        '<div class="stars">★★★★★</div>' +
        '<p class="r-text">' + esc(r.text || "") + "</p>" +
        '<div class="r-meta"><div class="r-name">' + esc(r.name || "") + "</div>" +
        (sub ? '<div class="r-sub">' + esc(sub) + "</div>" : "") + "</div></div>";
    }).join("");
  }

  /* ---------- 예약 가능 일정 ---------- */
  if (C.availability) {
    var av = C.availability;
    if ($("[data-availability-title]") && av.title) $("[data-availability-title]").textContent = av.title;
    if ($("[data-availability-status]") && av.status) $("[data-availability-status]").textContent = av.status;
    if ($("[data-availability-note]")) $("[data-availability-note]").textContent = av.note || "";
    var avList = $("#availabilityList");
    if (avList) avList.innerHTML = listHtml(av.items);
  }

  /* ---------- 오시는 길 ---------- */
  if (C.location) {
    var loc = C.location;
    if ($("[data-location-title]") && loc.title) $("[data-location-title]").textContent = loc.title;
    if ($("[data-location-address]")) $("[data-location-address]").textContent = loc.address || "";
    if ($("[data-location-note]")) $("[data-location-note]").textContent = loc.note || "";
    var locTransit = $("#locationTransit");
    if (locTransit) locTransit.innerHTML = listHtml(loc.transit);
    var locMap = $("#locationMap");
    if (locMap) {
      if (loc.mapEmbed) {
        locMap.innerHTML = '<iframe src="' + esc(loc.mapEmbed) + '" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="지도"></iframe>';
      } else if (loc.address) {
        locMap.innerHTML = '<a class="map-empty" href="https://map.kakao.com/?q=' + encodeURIComponent(loc.address) + '" target="_blank" rel="noopener">지도에서 보기 →</a>';
      }
    }
  }

  /* ---------- Q&A 아코디언 ---------- */
  var faqList = $("#faqList");
  if (faqList && C.faq) {
    C.faq.forEach(function (item, i) {
      var row = document.createElement("div");
      row.className = "faq-item reveal";
      row.style.transitionDelay = (Math.min(i, 6) * 0.05) + "s";
      var ans = esc(item.a || "").replace(/\n/g, "<br />");
      row.innerHTML =
        '<button class="faq-q" type="button">' +
          '<span class="faq-qmark">Q</span><span class="faq-qtext">' + esc(item.q) + "</span>" +
          '<span class="faq-icon"></span>' +
        "</button>" +
        '<div class="faq-a"><div class="faq-a-inner">' + ans + "</div></div>";
      var btn = row.querySelector(".faq-q");
      var panel = row.querySelector(".faq-a");
      btn.addEventListener("click", function () {
        var open = row.classList.contains("open");
        $$(".faq-item.open").forEach(function (r) {
          r.classList.remove("open");
          r.querySelector(".faq-a").style.maxHeight = null;
        });
        if (!open) { row.classList.add("open"); panel.style.maxHeight = panel.scrollHeight + "px"; }
      });
      faqList.appendChild(row);
    });
  }

  /* ---------- 뉴스레터 ---------- */
  (function () {
    var nlSection = document.getElementById("newsletter");
    var nlForm = document.getElementById("nlForm");
    var nlStatus = document.getElementById("nlStatus");
    var nl = C.newsletter;
    if (!nl || (!nl.endpoint && !nl.title) || !nlSection) return;
    nlSection.hidden = false;
    if (nl.title && document.getElementById("nlTitle")) document.getElementById("nlTitle").textContent = nl.title;
    if (nl.desc && document.getElementById("nlDesc")) document.getElementById("nlDesc").textContent = nl.desc;
    if (!nlForm) return;
    nlForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (nlForm.querySelector("input[name='email']") || {}).value;
      if (!email) return;
      if (nl.endpoint) {
        fetch(nl.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
          .then(function (r) {
            nlStatus.className = r.ok ? "nl-status ok" : "nl-status err";
            nlStatus.textContent = r.ok ? "알림 신청이 완료되었어요!" : "오류가 발생했어요. 다시 시도해 주세요.";
          }).catch(function () {
            nlStatus.className = "nl-status err";
            nlStatus.textContent = "오류가 발생했어요.";
          });
      } else {
        nlStatus.className = "nl-status ok";
        nlStatus.textContent = "감사합니다! 예약이 열리면 알려드릴게요.";
        nlForm.reset();
      }
    });
  })();

  /* ---------- 문의 링크 ---------- */
  var cl = $("#contactLinks");
  if (cl) {
    var links = [];
    if (C.instagram) links.push('<a href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram DM</a>');
    if (C.kakao) links.push('<a href="' + esc(C.kakao) + '" target="_blank" rel="noopener">카카오톡 채널</a>');
    if (C.naverBlog) links.push('<a href="' + esc(C.naverBlog) + '" target="_blank" rel="noopener">네이버 블로그</a>');
    if (C.youtube) links.push('<a href="' + esc(C.youtube) + '" target="_blank" rel="noopener">YouTube</a>');
    if (C.phone) links.push('<a href="tel:' + C.phone.replace(/[^0-9+]/g, "") + '">' + esc(C.phone) + "</a>");
    if (C.email) links.push('<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a>");
    cl.innerHTML = links.join("");
  }

  /* ---------- 예약 정책 모달 ---------- */
  var policyModal = document.getElementById("policyModal");
  var policyList = document.getElementById("policyList");
  var policyCheck = document.getElementById("policyCheck");

  if (policyList && C.policy && C.policy.items) {
    policyList.innerHTML = C.policy.items.map(function (item) {
      return "<li>" + esc(item) + "</li>";
    }).join("");
    if ($(".pm-title") && C.policy.title) $(".pm-title").textContent = C.policy.title;
  }

  function openPolicyModal() {
    if (policyModal) policyModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closePolicyModal() {
    if (policyModal) policyModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  var openPolicyBtn = document.getElementById("openPolicy");
  if (openPolicyBtn) openPolicyBtn.addEventListener("click", openPolicyModal);

  var pmClose = document.getElementById("pmClose");
  if (pmClose) pmClose.addEventListener("click", closePolicyModal);

  var pmBackdrop = document.getElementById("pmBackdrop");
  if (pmBackdrop) pmBackdrop.addEventListener("click", closePolicyModal);

  var pmAgreeBtn = document.getElementById("pmAgreeBtn");
  if (pmAgreeBtn) pmAgreeBtn.addEventListener("click", function () {
    if (policyCheck) policyCheck.checked = true;
    closePolicyModal();
  });

  document.addEventListener("keydown", function (e) {
    if (policyModal && policyModal.classList.contains("open") && e.key === "Escape") closePolicyModal();
  });

  /* ---------- 상담 문의 폼 ---------- */
  var bForm = $("#bookingForm");
  if (bForm) {
    if (C.booking && C.booking.note) {
      var bn = $("#bookingNote");
      if (bn) bn.innerHTML = C.booking.note;
    }
    bForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("#bookingStatus");
      var fd = new FormData(bForm);
      var d = {
        name: (fd.get("name") || "").trim(),
        phone: (fd.get("phone") || "").trim(),
        part: (fd.get("part") || "").trim(),
        size: (fd.get("size") || "").trim(),
        message: (fd.get("message") || "").trim(),
      };
      if (!d.name || !d.phone) { status.className = "bf-status err"; status.textContent = "이름과 연락처를 입력해 주세요."; return; }

      var endpoint = C.booking && C.booking.endpoint;
      if (endpoint) {
        var submitBtn = bForm.querySelector(".bf-submit");
        submitBtn.disabled = true; status.className = "bf-status"; status.textContent = "보내는 중...";
        fetch(endpoint, { method: "POST", headers: { "Accept": "application/json" }, body: fd })
          .then(function (r) {
            if (r.ok) {
              bForm.reset(); status.className = "bf-status ok";
              status.textContent = "상담 문의가 접수되었어요! 빠르게 연락드릴게요.";
            } else { throw new Error("fail"); }
          }).catch(function () {
            status.className = "bf-status err";
            status.textContent = "전송에 실패했어요. 카카오톡/인스타그램으로 연락 부탁드려요.";
          }).then(function () { submitBtn.disabled = false; });
      } else if (C.email) {
        var subject = "[상담문의] " + d.name + "님";
        var body = "이름/닉네임: " + d.name + "\n연락처: " + d.phone +
          "\n희망 부위: " + (d.part || "-") + "\n크기: " + (d.size || "-") +
          "\n\n문의내용:\n" + (d.message || "-");
        window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        status.className = "bf-status ok";
        status.textContent = "메일 앱이 열렸어요. 전송을 완료해 주세요.";
      } else {
        var txt = "[상담문의] " + d.name + " / " + d.phone +
          " / 부위 " + (d.part || "-") + " / 크기 " + (d.size || "-") +
          (d.message ? "\n" + d.message : "");
        if (navigator.clipboard) { try { navigator.clipboard.writeText(txt); } catch (ex) {} }
        status.className = "bf-status ok";
        status.textContent = "문의 내용이 복사되었어요. 카카오톡 채널 또는 인스타그램으로 붙여넣어 보내주세요!";
        if (C.kakao) window.open(C.kakao, "_blank");
        else if (C.instagram) window.open(C.instagram, "_blank");
      }
    });
  }

  /* ---------- 인스타그램 CTA ---------- */
  (function () {
    var instaGrid = document.getElementById("instaGrid");
    var instaHandle = document.getElementById("instaHandle");
    var instaFollowBtn = document.getElementById("instaFollowBtn");
    var instaLink = C.instagram || "https://instagram.com/tatoomy";
    var handle = instaLink.replace(/.*instagram\.com\//, "@").replace(/\/$/, "");

    if (instaHandle) instaHandle.textContent = handle;
    if (instaFollowBtn) instaFollowBtn.href = instaLink;

    if (!instaGrid) return;
    var tileImages = ALBUMS.slice(0, 6).map(function (album) { return album.cover; }).filter(Boolean);
    if (!tileImages.length && C.flash) {
      C.flash.slice(0, 6).forEach(function (f) { if (f.image) tileImages.push(f.image); });
    }
    while (tileImages.length < 6 && tileImages.length) {
      tileImages.push(tileImages[tileImages.length % tileImages.length]);
    }
    instaGrid.innerHTML = tileImages.slice(0, 6).map(function (src) {
      return '<a class="insta-tile" href="' + esc(instaLink) + '" target="_blank" rel="noopener">' +
        '<img src="' + esc(src) + '" alt="Instagram" loading="lazy" />' +
      '</a>';
    }).join("");
  })();

  /* ---------- 라이트박스 ---------- */
  var lb = $("#lightbox"), lbStage = $("#lbStage");
  var activeItems = [];
  var activeAlbumTitle = "";
  var pos = 0;
  function openAlbum(albumIndex) {
    var album = galleryAlbums[albumIndex];
    if (!album || !album.items.length) return;
    activeItems = album.items;
    activeAlbumTitle = album.title;
    pos = 0;
    showLb();
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function showLb() {
    var item = activeItems[pos];
    if (!item) return;
    lbStage.innerHTML = "";
    var el;
    if (item.type === "youtube") {
      el = document.createElement("iframe");
      el.className = "lb-media";
      el.src = "https://www.youtube.com/embed/" + item.id + "?autoplay=1&rel=0";
      el.allow = "autoplay; encrypted-media; fullscreen";
      el.setAttribute("allowfullscreen", "");
    } else if (item.type === "video") {
      el = document.createElement("video");
      el.className = "lb-media";
      el.src = item.src;
      if (item.poster) el.poster = item.poster;
      el.controls = true; el.autoplay = true; el.playsInline = true;
    } else {
      el = document.createElement("img");
      el.className = "lb-media";
      el.src = item.src;
      el.alt = item.caption || "";
    }
    lbStage.appendChild(el);
    var info = document.createElement("div");
    info.className = "lb-info";
    info.innerHTML =
      "<strong>" + esc(activeAlbumTitle) + "</strong>" +
      '<span>' + esc(item.caption || categoryLabel(item.category)) + " · " + (pos + 1) + " / " + activeItems.length + "</span>";
    lbStage.appendChild(info);
  }
  function move(d) {
    if (!activeItems.length) return;
    pos = (pos + d + activeItems.length) % activeItems.length;
    showLb();
  }
  function closeLb() { lb.classList.remove("open"); lbStage.innerHTML = ""; activeItems = []; document.body.style.overflow = ""; }

  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () { move(-1); });
  $("#lbNext").addEventListener("click", function () { move(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });

  /* ---------- 헤더 스크롤 효과 + 히어로 패럴랙스 ---------- */
  var header = $("#header");
  var heroBg = $("[data-hero-bg]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      header.classList.toggle("scrolled", y > 60);
      if (heroBg && !reduceMotion && y > 0 && y < window.innerHeight) {
        heroBg.style.transform = "scale(1.06) translateY(" + (y * 0.18) + "px)";
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- 모바일 메뉴 ---------- */
  var toggle = $("#navToggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open"); toggle.classList.toggle("open");
  });
  $$(".nav a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); toggle.classList.remove("open"); });
  });

  /* ---------- 스크롤 등장 애니메이션 ---------- */
  var io;
  function observeReveal() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
    }
    $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }

  /* ---------- 초기 실행 ---------- */
  renderGallery("all");
  observeReveal();
})();
