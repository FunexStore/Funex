// ================================
// FUNEX COMPLETE APP.JS
// Copy Paste & Forget
// ================================

document.addEventListener("DOMContentLoaded", () => {

    // ============================
    // FADE IN ANIMATIONS
    // ============================

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        },
        {
            threshold: 0.15
        }
    );

    document
        .querySelectorAll(".card, .process-step")
        .forEach(el => {
            el.classList.add("fade-up");
            observer.observe(el);
        });

    // ============================
    // ACTIVE NAV LINK
    // ============================

    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-links a").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {

            link.style.color = "var(--accent)";
            link.style.fontWeight = "700";

        }

    });

    // ============================
    // SMOOTH SCROLL
    // ============================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            e.preventDefault();

            const target =
                document.querySelector(
                    this.getAttribute("href")
                );

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

    // ============================
    // BUTTON EFFECT
    // ============================

    document.querySelectorAll(".btn").forEach(btn => {

        btn.addEventListener("click", () => {

            btn.style.transform = "scale(.96)";

            setTimeout(() => {

                btn.style.transform = "";

            }, 150);

        });

    });

    // ============================
    // FORM VALIDATION
    // ============================

    const forms = document.querySelectorAll("form");

    forms.forEach(form => {

        form.addEventListener("submit", function (e) {

            const email =
                form.querySelector(
                    'input[type="email"]'
                );

            if (email) {

                const regex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!regex.test(email.value)) {

                    e.preventDefault();

                    alert(
                        "Please enter a valid email address."
                    );

                    return;

                }

            }

        });

    });

    // ============================
    // DYNAMIC FOOTER YEAR
    // ============================

    document
        .querySelectorAll(".current-year")
        .forEach(el => {

            el.textContent =
                new Date().getFullYear();

        });

    // ============================
    // BACK TO TOP BUTTON
    // ============================

    const topBtn =
        document.createElement("button");

    topBtn.innerHTML = "↑";

    topBtn.style.position = "fixed";
    topBtn.style.bottom = "25px";
    topBtn.style.right = "25px";
    topBtn.style.width = "45px";
    topBtn.style.height = "45px";
    topBtn.style.border = "none";
    topBtn.style.borderRadius = "50%";
    topBtn.style.cursor = "pointer";
    topBtn.style.display = "none";
    topBtn.style.zIndex = "999";
    topBtn.style.fontSize = "18px";
    topBtn.style.background = "#8B6B4A";
    topBtn.style.color = "white";

    document.body.appendChild(topBtn);

    window.addEventListener("scroll", () => {

        if (window.scrollY > 400) {

            topBtn.style.display = "block";

        } else {

            topBtn.style.display = "none";

        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    // ============================
    // IMAGE LAZY LOADING
    // ============================

    document.querySelectorAll("img").forEach(img => {

        img.loading = "lazy";

    });

    // ============================
    // CONSOLE BRANDING
    // ============================

    console.log(
        "%cFUNEX",
        "font-size:28px;font-weight:bold;color:#8B6B4A;"
    );

    console.log(
        "Editing that tells stories."
    );

});
