# ─── despill.py ──────────────────────────────────────────────────────────────
# Red-cast removal for cutouts whose master was shot on the red cloth.
#
#     python scripts/photography/despill.py <in.webp> <out.webp> \
#         [--kill-sat 1.1] [--desat 0.34] [--rot 0.85]
#
# WHY THIS EXISTS. The 2026-08-13 shoot put several sweets on a bright red
# cloth. u2net cuts the silhouette but cannot un-bounce the light: the red
# ground reflects into the sweet (a pink cast over the whole subject) and the
# matte keeps slivers of raw cloth in concave gaps (between cashews). The
# owner read the hero Kaju Katli as "a red tint on it" (2026-08-24) — this is
# the pixel-level fix.
#
# WHAT IT DOES, in HSV:
#   - REGRADE: hues inside ±16° of red rotate smoothly toward beige (38°) and
#     desaturate, the weight fading to zero by 42° so honest cream/gold pixels
#     never move and there is no banding at the boundary. Raw cloth slivers
#     become neutral shadow tones, which read as the gaps they are.
#   - KILL (off by default, --kill-sat > 1 disables): alpha-zero for very
#     saturated red. Tested and rejected for kaju-katli — the spill on the
#     sweet itself is saturated enough that any kill threshold low enough to
#     catch the cloth also chews holes in the katli. Regrade-only is the safe
#     setting; the kill remains for a future master where slivers survive it.
#
# APPLIED, the registry cutouts.py reads: every master listed here gets this
# treatment automatically after cutouts.py (re)builds its cutout, so a
# `--force` re-run can no longer silently resurrect the red version (that trap
# was confirmed in the 2026-08-24 review). Key is the master's base filename.
#
# WHEN A CUTOUT'S PIXELS CHANGE, BUMP ITS CACHE REVISION TOO: /products/* is
# served with a 30-day no-revalidate cache, so returning browsers keep the old
# bytes under the unchanged URL. CUTOUT_REVISION in
# apps/storefront/src/lib/cutouts.ts is the bust — this exact miss shipped the
# despilled katli to production while every prior visitor still saw it red.
#
# DO NOT add whole categories wholesale: gongura, red karam and the kesar
# range are legitimately red, and this would bleach them. One file at a time,
# eyes on the output.

import sys

import numpy as np
from PIL import Image

APPLIED: dict[str, dict[str, float]] = {
    "kaju-katli": {"kill_sat": 1.1, "desat": 0.34, "rot": 0.85},
}


def despill(
    src: str,
    dst: str,
    kill_sat: float = 1.1,  # > 1 = kill disabled
    desat: float = 0.34,
    rot: float = 0.85,
    target_hue: float = 38.0,  # warm beige — the sweet's honest hue family
) -> None:
    img = Image.open(src).convert("RGBA")
    a = np.asarray(img, dtype=np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3].copy()

    mx = rgb.max(axis=-1)
    mn = rgb.min(axis=-1)
    d = mx - mn
    v = mx
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)

    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.zeros_like(r)
    mask = d > 1e-6
    rm = (mx == r) & mask
    gm = (mx == g) & mask & ~rm
    bm = (mx == b) & mask & ~rm & ~gm
    dd = np.maximum(d, 1e-6)
    h[rm] = ((g - b)[rm] / dd[rm]) % 6
    h[gm] = (b - r)[gm] / dd[gm] + 2
    h[bm] = (r - g)[bm] / dd[bm] + 4
    h *= 60

    # hue as a signed distance from red: -180..180 around 0°
    h_signed = np.where(h > 180, h - 360, h)

    # redness weight: 1 inside ±16°, smoothstep to 0 by 42°; neutrals stay put
    w = np.clip((42.0 - np.abs(h_signed)) / (42.0 - 16.0), 0.0, 1.0)
    w = w * w * (3 - 2 * w)
    w *= np.clip((s - 0.10) / 0.10, 0.0, 1.0)

    red_zone = np.abs(h_signed) < 26
    kill_full = red_zone & (s > kill_sat)
    kill_soft = red_zone & (s > kill_sat - 0.10) & ~kill_full
    al[kill_full] = 0
    al[kill_soft] *= 0.4

    h2 = np.mod(h_signed + (target_hue - h_signed) * (rot * w), 360.0)
    s2 = s * (1 - desat * w)
    # even after desat, nothing in the red zone stays candy-saturated
    s2 = np.where(red_zone, np.minimum(s2, 0.45), s2)

    # HSV -> RGB, vectorised
    c = v * s2
    hp = h2 / 60.0
    x = c * (1 - np.abs(np.mod(hp, 2) - 1))
    z = np.zeros_like(c)
    conds = [
        (0 <= hp) & (hp < 1), (1 <= hp) & (hp < 2), (2 <= hp) & (hp < 3),
        (3 <= hp) & (hp < 4), (4 <= hp) & (hp < 5), (5 <= hp) & (hp <= 6),
    ]
    rr = np.select(conds, [c, x, z, z, x, c])
    gg = np.select(conds, [x, c, c, x, z, z])
    bb = np.select(conds, [z, z, x, c, c, x])
    m = v - c
    out = np.stack([rr + m, gg + m, bb + m, al], axis=-1)
    np.clip(out, 0, 1, out=out)
    Image.fromarray((out * 255).astype(np.uint8), "RGBA").save(dst, "WEBP", quality=82, method=6)
    print(
        f"[despill] regraded {float(np.mean(w > 0.05)):.1%}, "
        f"killed {float(np.mean(kill_full)):.1%} full / {float(np.mean(kill_soft)):.1%} soft"
    )


def _arg(name: str, default: float) -> float:
    return float(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


if __name__ == "__main__":
    despill(
        sys.argv[1],
        sys.argv[2],
        kill_sat=_arg("--kill-sat", 1.1),
        desat=_arg("--desat", 0.34),
        rot=_arg("--rot", 0.85),
    )
