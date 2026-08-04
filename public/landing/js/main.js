 $('.realcustomerslider').slick({
    cssEase: 'linear',
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    autoplay: false,
    centerMode: true,
    centerPadding: "400px",
    prevArrow: `<button type="button" class="slick-prev">
        <svg xmlns="http://www.w3.org/2000/svg" width="65" height="71" viewBox="0 0 65 71" fill="none">
        <mask id="path-1-inside-1_738_1100" fill="white">
        <path d="M0 0L0 70.5681H65V0L0 0Z"/>
        </mask>
        <path d="M0 0L0 70.5681H65V0L0 0Z" fill="#FFFBF3"/>
        <path d="M65 70.5681H64.1889V0L65 0L65.8111 0V70.5681H65Z" fill="#D1CEC9" mask="url(#path-1-inside-1_738_1100)"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.2422 34.8721C20.0396 35.0819 19.9258 35.3663 19.9258 35.6628C19.9258 35.9594 20.0396 36.2437 20.2422 36.4535L28.8983 45.4051C28.9974 45.515 29.1168 45.6032 29.2495 45.6643C29.3823 45.7255 29.5255 45.7584 29.6708 45.761C29.8161 45.7637 29.9604 45.736 30.0951 45.6798C30.2299 45.6235 30.3523 45.5397 30.455 45.4335C30.5577 45.3272 30.6387 45.2007 30.6932 45.0613C30.7476 44.922 30.7743 44.7728 30.7717 44.6225C30.7692 44.4723 30.7374 44.3241 30.6782 44.1869C30.6191 44.0496 30.5338 43.9261 30.4275 43.8236L23.6181 36.7818H44.0897C44.3767 36.7818 44.6519 36.6639 44.8548 36.454C45.0577 36.2442 45.1717 35.9596 45.1717 35.6628C45.1717 35.3661 45.0577 35.0815 44.8548 34.8716C44.6519 34.6618 44.3767 34.5439 44.0897 34.5439H23.6181L30.4275 27.502C30.5338 27.3996 30.6191 27.2761 30.6782 27.1388C30.7374 27.0015 30.7692 26.8534 30.7717 26.7031C30.7743 26.5529 30.7476 26.4037 30.6932 26.2643C30.6387 26.125 30.5577 25.9984 30.455 25.8922C30.3523 25.7859 30.2299 25.7022 30.0951 25.6459C29.9604 25.5896 29.8161 25.562 29.6708 25.5646C29.5255 25.5673 29.3823 25.6002 29.2495 25.6613C29.1168 25.7225 28.9974 25.8107 28.8983 25.9206L20.2422 34.8721Z" fill="#666462"/>
        </svg>
    </button>`,

    nextArrow: `<button type="button" class="slick-next">
        <svg xmlns="http://www.w3.org/2000/svg" width="65" height="71" viewBox="0 0 65 71" fill="none"  style="transform: rotate(-180deg);">
        <mask id="path-1-inside-1_738_1100" fill="white">
        <path d="M0 0L0 70.5681H65V0L0 0Z"/>
        </mask>
        <path d="M0 0L0 70.5681H65V0L0 0Z" fill="#FFFBF3"/>
        <path d="M65 70.5681H64.1889V0L65 0L65.8111 0V70.5681H65Z" fill="#D1CEC9" mask="url(#path-1-inside-1_738_1100)"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.2422 34.8721C20.0396 35.0819 19.9258 35.3663 19.9258 35.6628C19.9258 35.9594 20.0396 36.2437 20.2422 36.4535L28.8983 45.4051C28.9974 45.515 29.1168 45.6032 29.2495 45.6643C29.3823 45.7255 29.5255 45.7584 29.6708 45.761C29.8161 45.7637 29.9604 45.736 30.0951 45.6798C30.2299 45.6235 30.3523 45.5397 30.455 45.4335C30.5577 45.3272 30.6387 45.2007 30.6932 45.0613C30.7476 44.922 30.7743 44.7728 30.7717 44.6225C30.7692 44.4723 30.7374 44.3241 30.6782 44.1869C30.6191 44.0496 30.5338 43.9261 30.4275 43.8236L23.6181 36.7818H44.0897C44.3767 36.7818 44.6519 36.6639 44.8548 36.454C45.0577 36.2442 45.1717 35.9596 45.1717 35.6628C45.1717 35.3661 45.0577 35.0815 44.8548 34.8716C44.6519 34.6618 44.3767 34.5439 44.0897 34.5439H23.6181L30.4275 27.502C30.5338 27.3996 30.6191 27.2761 30.6782 27.1388C30.7374 27.0015 30.7692 26.8534 30.7717 26.7031C30.7743 26.5529 30.7476 26.4037 30.6932 26.2643C30.6387 26.125 30.5577 25.9984 30.455 25.8922C30.3523 25.7859 30.2299 25.7022 30.0951 25.6459C29.9604 25.5896 29.8161 25.562 29.6708 25.5646C29.5255 25.5673 29.3823 25.6002 29.2495 25.6613C29.1168 25.7225 28.9974 25.8107 28.8983 25.9206L20.2422 34.8721Z" fill="#666462"/>
        </svg>
    </button>`,
    responsive: [
        {
            breakpoint: 1025,
            settings: {
                centerPadding: "200px",
            }
        },
        {
            breakpoint: 800,
            settings: {
                centerPadding: "100px",
            }
        },
        {
            breakpoint: 600,
            settings: {
                centerPadding: "50px",
            }
        }
        ]
});

document.querySelectorAll(".faqitem").forEach((item) => {
  item.querySelector(".question").addEventListener("click", () => {

    // close others (optional)
    document.querySelectorAll(".faqitem").forEach((el) => {
      if (el !== item) el.classList.remove("active");
    });

    // toggle current
    item.classList.toggle("active");
  });
});


document.querySelectorAll('.cloudsquare svg g').forEach(g => {
  // Pehle se jo rect/path hai uska fill save karo
  const shapes = g.querySelectorAll('rect, path');

  g.addEventListener('mouseenter', () => {
    shapes.forEach(shape => {
      shape.setAttribute('data-original-fill', shape.getAttribute('fill') || '');
      shape.setAttribute('fill', '#f9f9f9');
    });
  });

  g.addEventListener('mouseleave', () => {
    shapes.forEach(shape => {
      const original = shape.getAttribute('data-original-fill');
      if (original) {
        shape.setAttribute('fill', original);
      } else {
        shape.removeAttribute('fill');
      }
    });
  });
});

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.matchMedia({

  // 👉 Sirf desktop (481px se upar)
  "(min-width: 481px)": function () {

    const MAX_SCALE  = 2.8;
    const TEXT_SHIFT = "55vw";
    const SCRUB      = 1.5;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#pinWrap",
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB,
        pin: "#pinInner",
      }
    });

    tl
      .to("#mediaBox", {
        scale: MAX_SCALE,
        borderRadius: 0,
        ease: "none",
      }, 0)
      .to("#textLeft", {
        x: "-" + TEXT_SHIFT,
        opacity: 0,
        ease: "none",
      }, 0)
      .to("#textRight", {
        x: TEXT_SHIFT,
        opacity: 0,
        ease: "none",
      }, 0);
  },

  // 👉 Mobile (optional reset)
  "(max-width: 480px)": function () {
    // ensure everything normal on mobile
    gsap.set("#mediaBox", { clearProps: "all" });
    gsap.set("#textLeft", { clearProps: "all" });
    gsap.set("#textRight", { clearProps: "all" });
  }

});
$('.stackholderslider').slick({
slidesToShow: 2.5,
slidesToScroll: 1,
infinite: false,
arrows: false,
dots: false,
swipe: true,
responsive: [
    {
    breakpoint: 800,
    settings: {
        slidesToShow: 1.5,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: "50px",
                swipe: true,
      }
    },
    {
    breakpoint: 480,
    settings: {
        slidesToShow: 1.1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: "30px",
        swipe: true,
    }
    }
]
});
if ($(window).width() > 480) { 
  gsap.registerPlugin(ScrollTrigger);

    /* ── tweakable values ── */
    const PEEK         = 120;  /* xPercent shift for half-visible side card       */
    const GONE         = 300;  /* xPercent shift for fully off-screen card        */
    const ROT          = 10;   /* rotation degrees on peeking/exiting cards       */
    const SCRUB        = 1;    /* scrub smoothness (number = lag, true = instant) */
    const SIDE_SCALE   = 0.8;  /* scale of peeking side cards (center = 1)        */
    const SIDE_OPACITY = 0.5;  /* opacity of peeking side cards (center = 1)      */
    const PAUSE        = 0.2;  /* hold duration at each center position           */
                              /* timeline unit: MOVE=1, PAUSE=0.2 per beat       */

    /* ── set pin-wrap height based on timeline length ── */
    const TOTAL_DURATION = 2 * (1 + PAUSE);
    /* each timeline unit = 1 viewport height of scroll */
    document.getElementById('pinWrapper').style.height =
      (TOTAL_DURATION + 1) * 100 + 'vh';

    /* ── initial positions (view 1: teal center, yellow peeks right, purple gone) ── */
    gsap.set("#c1", { xPercent: 0,     rotation: 0,    scale: 1,          opacity: 1,            zIndex: 3 });
    gsap.set("#c2", { xPercent: PEEK,  rotation: ROT,  scale: SIDE_SCALE, opacity: SIDE_OPACITY,  zIndex: 2 });
    gsap.set("#c3", { xPercent: GONE,  rotation: ROT,  scale: SIDE_SCALE, opacity: SIDE_OPACITY,  zIndex: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#pinWrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB,
        pin: "#stager",
      }
    });

    /* ── beat 1: cards move → yellow centers ── */
    tl
      .to("#c1", { xPercent: -PEEK, rotation: -ROT, scale: SIDE_SCALE, opacity: SIDE_OPACITY, zIndex: 2, ease: "none", duration: 1 }, 0)
      .to("#c2", { xPercent: 0,     rotation: 0,    scale: 1,          opacity: 1,            zIndex: 3, ease: "none", duration: 1 }, 0)
      .to("#c3", { xPercent: PEEK,  rotation: ROT,  scale: SIDE_SCALE, opacity: SIDE_OPACITY, zIndex: 2, ease: "none", duration: 1 }, 0)

    /* ── pause 1: yellow is centered, scroll burns here ── */
    /* (empty label advances timeline time by PAUSE without animating anything) */
      .addLabel("pause1", 1)
      .addLabel("pause1end", 1 + PAUSE)

    /* ── beat 2: cards move → purple centers ── */
      .to("#c1", { xPercent: -GONE, rotation: -ROT, scale: SIDE_SCALE, opacity: SIDE_OPACITY, zIndex: 1, ease: "none", duration: 1 }, 1 + PAUSE)
      .to("#c2", { xPercent: -PEEK, rotation: -ROT, scale: SIDE_SCALE, opacity: SIDE_OPACITY, zIndex: 2, ease: "none", duration: 1 }, 1 + PAUSE)
      .to("#c3", { xPercent: 0,     rotation: 0,    scale: 1,          opacity: 1,            zIndex: 3, ease: "none", duration: 1 }, 1 + PAUSE)

    /* ── pause 2: purple is centered, scroll burns here ── */
      .addLabel("pause2",    2 + PAUSE)
      .addLabel("pause2end", 2 + PAUSE * 2);
}
// Sabse end mein add karo
$(window).on("load", function() {
    ScrollTrigger.refresh();  // ✅ Sahi heights calculate karega
});

$('.humburgurmenu').click(function(){
  $('.menuwrapper').show();
});

$('.closemenu').click(function(){
  $('.menuwrapper').hide();
});