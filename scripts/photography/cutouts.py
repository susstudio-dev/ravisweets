# ─── cutouts.py ──────────────────────────────────────────────────────────────
# Background-removed cutouts of every catalogue photograph.
#
#     pip install pillow numpy onnxruntime pooch
#     python scripts/photography/cutouts.py [--force]
#
# WHY CUTOUTS. The Sweet Counter homepage stages each sweet ON the cream paper,
# not inside a photographic box — the sweet floats, plated on a soft glow. That
# reads as "the item on the counter" instead of "a photo of the item", and it
# is what the owner asked for ("remove the bg… it will make the item look
# better", 2026-08-13). The masters stay untouched for the product page and the
# in-box grids; this writes a SECOND rendition beside each one.
#
# WHAT IT DOES. Runs u2net (the same salient-object model rembg wraps, driven
# directly so it installs cleanly) to a soft alpha matte, tightens the edge so
# the old background colour does not halo the sweet, crops to the subject's
# bounding box, and writes `<name>-cutout.webp` (lossy webp WITH alpha).
#
# WHY NOT next/image. The custom loader + variants.mjs contract is built for
# SQUARE, cover-cropped masters; a cutout is an irregular alpha silhouette. So
# cutouts are served as a plain <img> at one size — hence one file per master,
# no -400w/-640w rungs — and are keyed by the IMAGE filename (not the product
# slug) so a product that borrows a family stand-in gets the stand-in's cutout
# for free.
#
# THE MODEL. u2net.onnx (~168 MB) is fetched once to a local cache via pooch,
# or point RAVI_U2NET at an existing copy. It is NOT committed; only the small
# `<name>-cutout.webp` outputs and the generated slug list are.
#
# IDEMPOTENT. A cutout newer than its master is left alone unless --force.

import io
import os
import sys

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

# Red-cloth masters need their cutouts colour-corrected after every rebuild —
# without this, `--force` silently resurrects the red-tinted kaju katli the
# owner flagged on 2026-08-24. The registry of affected masters lives with
# the fix. (Plain module import: this script runs with scripts/photography on
# sys.path.)
from despill import APPLIED as DESPILL_APPLIED, despill

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_DIR = os.path.join(ROOT, "apps", "storefront", "public", "products")
GEN_TS = os.path.join(ROOT, "apps", "storefront", "src", "lib", "cutouts.generated.ts")

FORCE = "--force" in sys.argv

# u2net normalisation (ImageNet mean/std, 320px input) — the model's contract.
SIZE = 320
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
# Cutouts are shown no larger than ~340 CSS px (the hero plate) at up to 2x, so
# a 760px longest edge is plenty and keeps the alpha webps small.
MAX_EDGE = 760
QUALITY = 82


def load_model() -> "ort.InferenceSession":
    env = os.environ.get("RAVI_U2NET")
    if env and os.path.exists(env):
        path = env
    else:
        import pooch

        path = pooch.retrieve(
            url="https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx",
            known_hash="md5:60024c5c889badc19c04ad937298a77b",
            fname="u2net.onnx",
            path=pooch.os_cache("ravisweets-cutouts"),
            progressbar=False,
        )
    return ort.InferenceSession(path, providers=["CPUExecutionProvider"])


def matte(sess, inp_name: str, img: Image.Image) -> Image.Image:
    """Soft alpha matte at the source resolution, edge tightened."""
    im = img.convert("RGB").resize((SIZE, SIZE), Image.LANCZOS)
    x = (np.asarray(im, dtype=np.float32) / 255.0 - MEAN) / STD
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    pred = sess.run(None, {inp_name: x})[0][0, 0]
    pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
    m = Image.fromarray((pred * 255).astype(np.uint8), "L").resize(img.size, Image.LANCZOS)
    # Blur then a contrast ramp: soft edges without dragging the old ground
    # colour (red cloth, white worktop) into the sweet as a halo.
    m = m.filter(ImageFilter.GaussianBlur(1.2))
    lut = [0 if v < 30 else (255 if v > 210 else int((v - 30) / 180 * 255)) for v in range(256)]
    return m.point(lut)


def is_master(name: str) -> bool:
    if not name.endswith(".webp"):
        return False
    if name.endswith("-cutout.webp"):
        return False
    # skip the -400w / -640w srcset rungs
    base = name[: -len(".webp")]
    return not (base.rsplit("-", 1)[-1].endswith("w") and base.rsplit("-", 1)[-1][:-1].isdigit())


def main() -> None:
    masters = sorted(f for f in os.listdir(OUT_DIR) if is_master(f))
    if not masters:
        print("[cutouts] no master photographs in public/products/ — nothing to do.")
        return

    sess = load_model()
    inp_name = sess.get_inputs()[0].name

    done: list[str] = []
    built = skipped = 0
    out_bytes = 0

    for master in masters:
        base = master[: -len(".webp")]
        src = os.path.join(OUT_DIR, master)
        out = os.path.join(OUT_DIR, f"{base}-cutout.webp")

        if not FORCE and os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
            skipped += 1
            done.append(base)
            out_bytes += os.path.getsize(out)
            continue

        img = Image.open(src).convert("RGBA")
        a = matte(sess, inp_name, img)
        img.putalpha(a)

        bbox = a.getbbox()
        if bbox:
            pad = 12
            l, t, r, b = bbox
            img = img.crop((max(0, l - pad), max(0, t - pad),
                            min(img.width, r + pad), min(img.height, b + pad)))

        if max(img.size) > MAX_EDGE:
            scale = MAX_EDGE / max(img.size)
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)

        img.save(out, "WEBP", quality=QUALITY, method=6)
        if base in DESPILL_APPLIED:
            despill(out, out, **DESPILL_APPLIED[base])
            print(f"[cutouts]   {base}: despilled (red-cloth master — see despill.py)")
        built += 1
        out_bytes += os.path.getsize(out)
        done.append(base)
        print(f"[cutouts]   {base}: {img.width}x{img.height}, {os.path.getsize(out)//1024}KB")

    write_manifest(sorted(set(done)))
    print(f"[cutouts] {len(done)} cutouts ({built} built, {skipped} current), "
          f"{out_bytes/1024/1024:.1f} MB on disk")
    print(f"[cutouts] wrote {os.path.relpath(GEN_TS, ROOT)}")


def write_manifest(bases: list[str]) -> None:
    lines = ",\n".join(f"  '{b}'" for b in bases)
    content = (
        "// AUTO-GENERATED by scripts/photography/cutouts.py — do not edit by hand.\n"
        "//\n"
        "// The base filenames in public/products/ that have a `<base>-cutout.webp`\n"
        "// (background removed). Keyed by IMAGE filename, not product slug, so a\n"
        "// product borrowing a family stand-in resolves to the stand-in's cutout.\n"
        "// Regenerate: python scripts/photography/cutouts.py\n\n"
        f"export const CUTOUT_BASES = new Set<string>([\n{lines},\n]);\n"
    )
    with open(GEN_TS, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)


if __name__ == "__main__":
    main()
