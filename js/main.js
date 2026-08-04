document.addEventListener('DOMContentLoaded', function () {

    // ── Navigation ───────────────────────────────────────────────
    var navList = document.querySelector('.nav-links');
    var toggle  = document.querySelector('.mobile-toggle');
    if (toggle && navList) {
        toggle.addEventListener('click', function () {
            navList.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true'));
        });
    }
    document.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () {
            if (navList) navList.classList.remove('open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // ── Contact form (mailto fallback — no backend) ───────────────
    var form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var name     = (form.querySelector('#name')     || {}).value || '';
            var org      = (form.querySelector('#org')      || {}).value || '';
            var email    = (form.querySelector('#email')    || {}).value || '';
            var interest = (form.querySelector('#interest') || {}).value || '';
            var message  = (form.querySelector('#message')  || {}).value || '';
            if (!name.trim() || !email.trim()) { alert('Please fill in your name and email.'); return; }
            var subject = encodeURIComponent('Enquiry from ' + name + (org ? ' (' + org + ')' : ''));
            var body    = encodeURIComponent('Name: ' + name + '\nOrganisation: ' + org + '\nEmail: ' + email + '\nInterest: ' + interest + '\n\n' + message);
            window.location.href = 'mailto:alberto@wildfireintelligence.co.nz?subject=' + subject + '&body=' + body;
        });
    }

    // ── Animated topographic fire-risk mesh ──────────────────────
    // Rotating terrain grid; edge colour runs violet → cyan → amber → fire
    // with height, and signal particles propagate across the mesh.
    (function () {
        var canvas = document.getElementById('hero-field');
        if (!canvas) return;
        var ctx  = canvas.getContext('2d');
        var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        var t = 0, last = 0, rotY = 0;
        var rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

        var COLS = 32, ROWS = 20;
        var SPAN_X = 880, SPAN_Z = 680;
        var MAX_H = 155, Y_OFF = 20;
        var FOV = 680, CAM_PUSH = 360;
        var REF_SC = FOV / (FOV + CAM_PUSH);
        var CX = Math.cos(-0.46), SX = Math.sin(-0.46);
        var SIG_N = 15;

        var nodes = [], signals = [];

        function resize() {
            var r = canvas.parentElement.getBoundingClientRect();
            W = r.width  || 760;
            H = r.height || W * 9 / 16;
            canvas.width  = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function project(ox, oy, oz) {
            var cy = Math.cos(rotY), sinY = Math.sin(rotY);
            var rx  =  ox * cy + oz * sinY;
            var rz0 = -ox * sinY + oz * cy;
            var ry  = oy * CX - rz0 * SX;
            var rz  = oy * SX + rz0 * CX;
            var sc  = FOV / (FOV + rz + CAM_PUSH);
            return { sx: W * 0.5 + rx * sc, sy: H * 0.5 + ry * sc, sc: sc, depth: rz };
        }

        function terrainH(x, z) {
            return MAX_H * (
                0.38 * Math.sin(x * 0.0085 + z * 0.0072 + t * 0.30)
              + 0.24 * Math.sin(x * 0.0152 - z * 0.0118 + t * 0.47 + 1.3)
              + 0.18 * Math.sin(x * 0.0238 + z * 0.0185 - t * 0.26 + 2.5)
              + 0.12 * Math.sin(x * 0.0381 - z * 0.0297 + t * 0.61 + 0.7)
              + 0.08 * Math.sin(x * 0.0512 + z * 0.0423 - t * 0.39 + 3.2)
            );
        }

        // Respawn a signal at a random grid node
        function spawnSig(sig) {
            for (var tries = 0; tries < 20; tries++) {
                var from = (Math.random() * nodes.length) | 0;
                var c = from % COLS, r = (from / COLS) | 0, nbrs = [];
                if (c > 0)       nbrs.push(from - 1);
                if (c < COLS-1)  nbrs.push(from + 1);
                if (r > 0)       nbrs.push(from - COLS);
                if (r < ROWS-1)  nbrs.push(from + COLS);
                if (!nbrs.length) continue;
                sig.from    = from;
                sig.to      = nbrs[(Math.random() * nbrs.length) | 0];
                sig.t       = 0;
                sig.speed   = 1.4 + Math.random() * 1.0;
                sig.hops    = 0;
                sig.maxHops = 10 + (Math.random() * 16) | 0;
                return;
            }
        }

        function build() {
            nodes = []; signals = [];
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    nodes.push({
                        ox: (c / (COLS-1) - 0.5) * SPAN_X,
                        oz: (r / (ROWS-1) - 0.5) * SPAN_Z,
                        oy: 0, h: 0, sx: 0, sy: 0, sc: 1, depth: 0
                    });
                }
            }
            for (var s = 0; s < SIG_N; s++) {
                var sig = {};
                spawnSig(sig);
                sig.t = Math.random();  // stagger starting positions
                signals.push(sig);
            }
        }

        // Theme-aware colour ramps, low ground → peaks.
        //   dark:  violet → cyan → amber → fire red
        //   light: pale steel → teal → amber → deep red, with denser ink so
        //          the mesh survives on a bone background
        var RAMPS = {
            // active — indigo-navy dark
            navy: {
                stops: [[37,99,235], [56,189,248], [251,191,36], [220,38,38]],
                sig:   [[56,189,248], [237,242,250], [220,38,38]],
                aBase: 0.17, aSpan: 0.78,
                diag:  ['rgba(30,58,138,0.14)', 'rgba(56,189,248,0.08)', 'rgba(234,88,12,0.13)'],
                glow:  'rgba(239,68,68,'
            },
            // retired — plum-violet dark
            plum: {
                stops: [[109,40,217], [34,211,238], [251,191,36], [220,38,38]],
                sig:   [[34,211,238], [237,242,250], [220,38,38]],
                aBase: 0.17, aSpan: 0.78,
                diag:  ['rgba(109,40,217,0.16)', 'rgba(34,211,238,0.08)', 'rgba(234,88,12,0.13)'],
                glow:  'rgba(239,68,68,'
            },
            // retired — bone light. Note the high alpha floor and the inverted
            // ink: a ramp tuned for a dark page is invisible on paper.
            bone: {
                stops: [[147,197,253], [8,145,178], [217,119,6], [185,28,28]],
                sig:   [[8,145,178], [249,115,22], [153,27,27]],
                aBase: 0.36, aSpan: 0.60,
                diag:  ['rgba(76,29,149,0.10)', 'rgba(8,145,178,0.09)', 'rgba(217,119,6,0.12)'],
                glow:  'rgba(185,28,28,'
            }
        };
        // Must match the token block in css/style.css: 'navy' | 'plum' | 'bone'.
        var THEME = 'navy';
        var ramp = RAMPS[THEME] || RAMPS.navy;

        function lerp3(a, b, t) {
            return [(a[0] + (b[0] - a[0]) * t) | 0,
                    (a[1] + (b[1] - a[1]) * t) | 0,
                    (a[2] + (b[2] - a[2]) * t) | 0];
        }

        // Height-based colour across the three segments of the active ramp
        function edgeStyle(hn, alpha) {
            var s = ramp.stops, c;
            if (hn < 0.45)      c = lerp3(s[0], s[1], hn / 0.45);
            else if (hn < 0.78) c = lerp3(s[1], s[2], (hn - 0.45) / 0.33);
            else                c = lerp3(s[2], s[3], (hn - 0.78) / 0.22);
            return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + ((alpha * 100 | 0) / 100) + ')';
        }

        // Signal colour: cool → bright → hot as the particle propagates
        function sigColor(prog) {
            var s = ramp.sig, c;
            if (prog < 0.55) c = lerp3(s[0], s[1], prog / 0.55);
            else             c = lerp3(s[1], s[2], (prog - 0.55) / 0.45);
            return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
        }

        function frame(now) {
            var dt = Math.min((now - (last||now)) / 1000, 0.05);
            last = now;
            if (!rm) { t += dt; rotY += dt * 0.016; }
            if (!W || !H) { if (!rm) requestAnimationFrame(frame); return; }

            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                n.h  = terrainH(n.ox, n.oz);
                n.oy = -n.h - Y_OFF;
                var p = project(n.ox, n.oy, n.oz);
                n.sx = p.sx; n.sy = p.sy; n.sc = p.sc; n.depth = p.depth;
            }

            ctx.clearRect(0, 0, W, H);

            // ── 1. Primary grid edges (rows back-to-front) ─────────
            for (var r = 0; r < ROWS; r++) {
                var rowFade = 0.28 + 0.72 * (r / (ROWS - 1));
                for (var c = 0; c < COLS - 1; c++) {
                    var na = nodes[r*COLS+c], nb = nodes[r*COLS+c+1];
                    var hn = ((na.h+nb.h)*0.5 + MAX_H) / (MAX_H * 2);
                    if (hn < 0) hn = 0; else if (hn > 1) hn = 1;
                    ctx.strokeStyle = edgeStyle(hn, (ramp.aBase + hn * ramp.aSpan) * rowFade);
                    ctx.lineWidth   = Math.max(0.3, 0.80 * (na.sc+nb.sc) / (2*REF_SC));
                    ctx.beginPath(); ctx.moveTo(na.sx, na.sy); ctx.lineTo(nb.sx, nb.sy); ctx.stroke();
                }
                if (r < ROWS - 1) {
                    for (var c2 = 0; c2 < COLS; c2++) {
                        var ma = nodes[r*COLS+c2], mb = nodes[(r+1)*COLS+c2];
                        var hn2 = ((ma.h+mb.h)*0.5 + MAX_H) / (MAX_H * 2);
                        if (hn2 < 0) hn2 = 0; else if (hn2 > 1) hn2 = 1;
                        ctx.strokeStyle = edgeStyle(hn2, (ramp.aBase + hn2 * ramp.aSpan) * rowFade);
                        ctx.lineWidth   = Math.max(0.3, 0.80 * (ma.sc+mb.sc) / (2*REF_SC));
                        ctx.beginPath(); ctx.moveTo(ma.sx, ma.sy); ctx.lineTo(mb.sx, mb.sy); ctx.stroke();
                    }
                }
            }

            // ── 2. Diagonal triangulation edges (3 colour passes) ──
            var dPaths = [[], [], []];
            for (var dr = 0; dr < ROWS - 1; dr++) {
                for (var dc = 0; dc < COLS - 1; dc++) {
                    var pa, pb;
                    if ((dc + dr) % 2 === 0) { pa = nodes[dr*COLS+dc];   pb = nodes[(dr+1)*COLS+dc+1]; }
                    else                     { pa = nodes[dr*COLS+dc+1]; pb = nodes[(dr+1)*COLS+dc];   }
                    var dhn = ((pa.h+pb.h)*0.5 + MAX_H) / (MAX_H * 2);
                    if (dhn < 0) dhn = 0; else if (dhn > 1) dhn = 1;
                    dPaths[dhn < 0.45 ? 0 : dhn < 0.75 ? 1 : 2].push(pa.sx, pa.sy, pb.sx, pb.sy);
                }
            }
            var dStyles = ramp.diag;
            ctx.lineWidth = 0.38;
            for (var b2 = 0; b2 < 3; b2++) {
                if (!dPaths[b2].length) continue;
                ctx.strokeStyle = dStyles[b2];
                ctx.beginPath();
                for (var j = 0; j < dPaths[b2].length; j += 4) {
                    ctx.moveTo(dPaths[b2][j], dPaths[b2][j+1]);
                    ctx.lineTo(dPaths[b2][j+2], dPaths[b2][j+3]);
                }
                ctx.stroke();
            }

            // ── 3. Peak dot accents (pulsing hotspots) ─────────────
            var peakPulse = 0.5 + 0.5 * Math.sin(t * 1.8);
            for (var k = 0; k < nodes.length; k++) {
                var pn = nodes[k];
                var phn = (pn.h + MAX_H) / (MAX_H * 2);
                if (phn < 0.60) continue;
                var row = (k / COLS) | 0;
                var rowFade2 = 0.28 + 0.72 * (row / (ROWS - 1));
                var a2  = ((phn - 0.60) / 0.40) * 0.88 * rowFade2;
                var sz0 = Math.max(0.5, (0.9 + (phn - 0.60) * 5.0 + peakPulse * 1.2) * pn.sc / REF_SC);
                ctx.fillStyle = edgeStyle(phn, a2);
                ctx.beginPath(); ctx.arc(pn.sx, pn.sy, sz0, 0, 6.2832); ctx.fill();
            }

            // ── 4. Signal particles ────────────────────────────────
            for (var si = 0; si < signals.length; si++) {
                var sig = signals[si];
                if (!rm) sig.t += dt * sig.speed;
                while (sig.t >= 1) {
                    sig.t -= 1; sig.hops++;
                    if (sig.hops >= sig.maxHops) { spawnSig(sig); break; }
                    var cc = sig.to % COLS, rr = (sig.to / COLS) | 0, fwd = [];
                    if (cc > 0)       fwd.push(sig.to - 1);
                    if (cc < COLS-1)  fwd.push(sig.to + 1);
                    if (rr > 0)       fwd.push(sig.to - COLS);
                    if (rr < ROWS-1)  fwd.push(sig.to + COLS);
                    fwd = fwd.filter(function (nn) { return nn !== sig.from; });
                    if (!fwd.length) { spawnSig(sig); break; }
                    sig.from = sig.to;
                    sig.to   = fwd[(Math.random() * fwd.length) | 0];
                }
                var sa = nodes[sig.from], sb = nodes[sig.to];
                var px = sa.sx + (sb.sx - sa.sx) * sig.t;
                var py = sa.sy + (sb.sy - sa.sy) * sig.t;
                var dFade = Math.max(0.2, 1 - ((sa.depth+sb.depth)*0.5 + 300) / 900);
                var prog  = Math.min(1, sig.hops / sig.maxHops);
                var scN   = (sa.sc + sb.sc) * 0.5 / REF_SC;
                var sz    = Math.max(1.0, 2.8 * scN);

                ctx.globalAlpha = Math.min(0.92, 0.65 * dFade);
                ctx.fillStyle   = sigColor(prog);
                ctx.beginPath(); ctx.arc(px, py, sz, 0, 6.2832); ctx.fill();
                if (prog > 0.45) {
                    ctx.globalAlpha = ((prog - 0.45) / 0.55) * 0.30 * dFade;
                    ctx.fillStyle = ramp.glow + '1)';
                    ctx.beginPath(); ctx.arc(px, py, sz * 2.2, 0, 6.2832); ctx.fill();
                }
            }
            ctx.globalAlpha = 1;

            if (!rm) requestAnimationFrame(frame);
        }

        window.addEventListener('resize', function () { resize(); build(); });
        resize();
        build();
        if (rm) { t = 2.5; rotY = 0.4; last = 0; frame(0); }
        else requestAnimationFrame(frame);
    })();
});
