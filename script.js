(function () {
  var config = window.CONTACT || {};
  var status = document.getElementById("status");

  function notify(message) {
    status.textContent = message;
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function vcardEscape(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function withProtocol(url) {
    var value = String(url || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return "https://" + value;
  }

  var phone = digits(config.whatsapp);
  var email = String(config.email || "").trim();
  var website = withProtocol(config.website);
  var logoPath = String(config.logo || "").trim();

  var whatsapp = document.getElementById("btn-whatsapp");
  if (phone) {
    whatsapp.href = "https://wa.me/" + phone;
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener noreferrer";
  } else {
    whatsapp.addEventListener("click", function (event) {
      event.preventDefault();
      notify("El enlace de WhatsApp todavía no está disponible.");
    });
  }

  var emailLink = document.getElementById("btn-email");
  if (email.indexOf("@") !== -1) {
    emailLink.href = "mailto:" + email;
  } else {
    emailLink.addEventListener("click", function (event) {
      event.preventDefault();
      notify("El enlace de correo todavía no está disponible.");
    });
  }

  if (website) {
    var websiteBox = document.getElementById("website");
    var websiteLink = document.createElement("a");
    websiteLink.href = website;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    websiteLink.textContent = website.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    websiteBox.appendChild(websiteLink);
    websiteBox.hidden = false;
  }

  if (logoPath) {
    var logo = document.getElementById("brand-logo");
    var monogram = document.querySelector(".monogram");
    logo.alt = "Jandira Rodríguez";
    logo.addEventListener("error", function () {
      logo.hidden = true;
      monogram.hidden = false;
    });
    logo.addEventListener("load", function () {
      monogram.hidden = true;
    });
    logo.hidden = false;
    logo.src = logoPath;
  }

  function buildVCard() {
    var fullName = String(config.name || document.querySelector("h1").textContent || "").trim();
    var title = document.querySelector(".tagline").textContent.trim();
    var parts = fullName.split(/\s+/);
    var given = parts[0] || "";
    var family = parts.slice(1).join(" ");
    var services = Array.prototype.map.call(
      document.querySelectorAll("#servicios li"),
      function (item) {
        return item.textContent.trim();
      }
    );

    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N;CHARSET=UTF-8:" + vcardEscape(family) + ";" + vcardEscape(given) + ";;;",
      "FN;CHARSET=UTF-8:" + vcardEscape(fullName),
      "TITLE;CHARSET=UTF-8:" + vcardEscape(title),
      "EMAIL;CHARSET=UTF-8;TYPE=INTERNET:" + vcardEscape(email),
      "NOTE;CHARSET=UTF-8:" + vcardEscape(services.join(". ")),
    ];

    if (phone) lines.splice(5, 0, "TEL;TYPE=CELL:+" + phone);
    if (website) lines.push("URL:" + vcardEscape(website));
    lines.push("END:VCARD");
    return lines.join("\r\n") + "\r\n";
  }

  document.getElementById("btn-save").addEventListener("click", function (event) {
    if (email.indexOf("@") === -1 && !phone) return;
    event.preventDefault();
    var card = buildVCard();
    var blob = new Blob([card], { type: "text/vcard;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) {
      window.location.href = url;
    } else {
      var link = document.createElement("a");
      link.href = url;
      link.download = "jandira-rodriguez.vcf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2500);
    notify("Se está descargando tu contacto.");
  });

  startField();

  function startField() {
    var canvas = document.getElementById("field");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var particles = [];
    var width = 0;
    var height = 0;
    var frame = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = Math.round((width * height) / 22000);
      if (target < 26) target = 26;
      if (target > 64) target = 64;

      particles = [];
      for (var i = 0; i < target; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.3 + 0.7,
        });
      }
    }

    function draw() {
      var link = Math.min(width, height) * 0.22;
      if (link > 140) link = 140;
      if (link < 90) link = 90;
      var i;
      var j;
      var a;
      var b;
      var dx;
      var dy;
      var dist;
      var alpha;

      ctx.clearRect(0, 0, width, height);

      for (i = 0; i < particles.length; i++) {
        a = particles[i];
        if (!reduce) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < -10 || a.x > width + 10) a.vx *= -1;
          if (a.y < -10 || a.y > height + 10) a.vy *= -1;
        }

        for (j = i + 1; j < particles.length; j++) {
          b = particles[j];
          dx = a.x - b.x;
          dy = a.y - b.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < link) {
            alpha = (1 - dist / link) * 0.34;
            ctx.strokeStyle = "rgba(167, 120, 255, " + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (i = 0; i < particles.length; i++) {
        a = particles[i];
        ctx.beginPath();
        ctx.fillStyle = "rgba(176, 132, 255, 0.22)";
        ctx.arc(a.x, a.y, a.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "rgba(237, 224, 255, 0.9)";
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce) frame = window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(frame);
      resize();
      draw();
    });
  }
})();
