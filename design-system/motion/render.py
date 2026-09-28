"""AStra motion system — procedural particle renderer.

Renders the three concept loops (and the hero intro) as raw RGB frames piped to ffmpeg.
Everything is deterministic (seeded) and periodic in t, so loops are seamless.

usage: python3 render.py <concept> <W> <H> <seconds> <fps> <out_basename> [--frames t0,t1,...]
concepts: hero, hero-intro, collab, loyalty
"""
import sys, subprocess, math
import numpy as np
from scipy.ndimage import gaussian_filter, zoom

# ---- palette (Cinema treatment tokens) --------------------------------------
BG_TOP = np.array([4, 6, 13]) / 255.0          # --bg (cinema)
BG_GLOW = np.array([16, 26, 58]) / 255.0       # navy haze
CORAL = np.array([255, 90, 60]) / 255.0        # --accent (cinema)
ORANGE = np.array([255, 138, 61]) / 255.0      # red-orange / aurora-4
BLUE = np.array([61, 107, 255]) / 255.0        # --glow-2 loyalty blue
BLUE_L = np.array([154, 180, 255]) / 255.0     # --points (cinema)
NAVY_L = np.array([125, 147, 214]) / 255.0     # --action-edge
WHITE = np.array([244, 241, 238]) / 255.0      # --ink (cinema)

DISCIPLINES = [  # name, colour
    ("painter", CORAL), ("musician", BLUE), ("filmmaker", WHITE),
    ("dancer", ORANGE), ("photographer", BLUE_L), ("writer", NAVY_L),
]

def smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)

def ease_io(x):
    x = np.clip(x, 0.0, 1.0)
    return np.where(x < 0.5, 4 * x ** 3, 1 - (-2 * x + 2) ** 3 / 2)


class Camera:
    def __init__(self, W, H, fov=1.0, dist=6.0, tilt=0.30, yaw=0.0, cy=0.0, scale=None):
        self.W, self.H, self.dist, self.tilt, self.yaw, self.cy = W, H, dist, tilt, yaw, cy
        self.f = (scale or min(W, H * 16 / 9)) * 0.62 * fov

    def project(self, P):
        x, y, z = P[:, 0], P[:, 1] - self.cy, P[:, 2]
        cyw, syw = math.cos(self.yaw), math.sin(self.yaw)
        x, z = cyw * x + syw * z, -syw * x + cyw * z
        ct, st = math.cos(self.tilt), math.sin(self.tilt)
        y, z = ct * y - st * z, st * y + ct * z
        zz = z + self.dist
        k = self.f / np.maximum(zz, 0.2)
        return self.W / 2 + x * k, self.H / 2 - y * k, zz


class Frame:
    def __init__(self, W, H):
        self.W, self.H = W, H
        self.fg = np.zeros((H * W, 3), np.float32)
        self.refl = np.zeros((H * W, 3), np.float32)

    def splat(self, sx, sy, col, inten, target="fg"):
        m = (sx >= 0) & (sx < self.W - 1) & (sy >= 0) & (sy < self.H - 1) & (inten > 0.002)
        if not m.any():
            return
        sx, sy, col, inten = sx[m], sy[m], col[m], inten[m]
        # bilinear splat for smooth sub-pixel motion
        x0 = np.floor(sx).astype(np.int64); y0 = np.floor(sy).astype(np.int64)
        fx = (sx - x0).astype(np.float32); fy = (sy - y0).astype(np.float32)
        buf = self.fg if target == "fg" else self.refl
        for dx, dy, w in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
            idx = (y0 + dy) * self.W + (x0 + dx)
            ww = (w * inten).astype(np.float32)
            for c in range(3):
                buf[:, c] += np.bincount(idx, weights=col[:, c] * ww, minlength=self.W * self.H).astype(np.float32)

    def compose(self, floor_y=None, rings=None, vignette=True, exposure=1.35, haze=(0.5, 0.62)):
        W, H = self.W, self.H
        fg = self.fg.reshape(H, W, 3)
        # soft point + bloom
        core = np.stack([gaussian_filter(fg[:, :, c], 0.9) for c in range(3)], -1)
        small = fg[::4, ::4] * 16
        bloom = np.stack([gaussian_filter(small[:, :, c], 7) for c in range(3)], -1)
        bloom = zoom(bloom, (H / bloom.shape[0], W / bloom.shape[1], 1), order=1)[:H, :W]
        wide = np.stack([gaussian_filter(small[:, :, c], 22) for c in range(3)], -1)
        wide = zoom(wide, (H / wide.shape[0], W / wide.shape[1], 1), order=1)[:H, :W]
        img = core * 1.0 + bloom * 0.07 + wide * 0.03
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        # background: navy haze
        d = np.sqrt(((xx - W * haze[0]) / (W * 0.55)) ** 2 + ((yy - H * haze[1]) / (H * 0.6)) ** 2)
        bg = BG_TOP[None, None, :] + (BG_GLOW - BG_TOP)[None, None, :] * np.clip(1 - d, 0, 1)[:, :, None] ** 2 * 0.9
        if floor_y is not None:
            refl = self.refl.reshape(H, W, 3)
            rb = np.stack([gaussian_filter(refl[:, :, c], (3.5, 1.4)) for c in range(3)], -1)
            fade = np.clip((yy - floor_y) / (H - floor_y + 1), 0, 1)[:, :, None]
            img += rb * 0.22 * (1 - fade) ** 1.5 * (yy[:, :, None] > floor_y)
        if rings:
            for (cx, cy, rx, ry, a, col) in rings:
                if a <= 0.003 or rx < 2:
                    continue
                q = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
                band = np.exp(-((q - 1) * rx / 1.6) ** 2)
                img += band[:, :, None] * col[None, None, :] * a
                img += np.exp(-((q - 1) * rx / 9) ** 2)[:, :, None] * col[None, None, :] * a * 0.12
        out = 1 - np.exp(-img * exposure)
        out = bg + out * (1 - bg)
        if vignette:
            v = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
            out *= np.clip(1.12 - 0.45 * v ** 2, 0.55, 1)[:, :, None]
        return (np.clip(out, 0, 1) ** (1 / 1.08) * 255).astype(np.uint8)


def rings_for(t, T, cx, cy, base, n=4, period=None, col=CORAL, col2=BLUE, strength=0.3, aspect=0.24):
    """Expanding floor rings, emitted every T/n, seamless over T."""
    out = []
    for i in range(n):
        u = ((t / T) * (T / (period or T)) + i / n) % 1.0
        r = base * (0.35 + 1.9 * u)
        a = strength * math.sin(math.pi * u) ** 1.5
        out.append((cx, cy, r, r * aspect, a, col if i % 2 == 0 else col2))
    # static reference rings (quiet)
    for k, rr in enumerate((0.55, 1.0, 1.6)):
        out.append((cx, cy, base * rr, base * rr * aspect, 0.07, NAVY_L))
    return out


# ---- shapes -----------------------------------------------------------------
def knot(s, p=2, q=3, R=1.25, r=0.5):
    """(p,q) torus knot lying flat (axis = vertical y)."""
    phi = 2 * np.pi * s
    rr = R + r * np.cos(q * phi)
    x = rr * np.cos(p * phi); z = rr * np.sin(p * phi); y = r * np.sin(q * phi)
    return np.stack([x, y, z], -1)


def cluster_shape(kind, n, rng):
    """Signature form for each discipline, centred at origin, ~unit size."""
    u = rng.random(n); v = rng.random(n); w = rng.standard_normal((n, 3)) * 0.03
    if kind == "painter":        # sweeping brush ribbon
        a = u * 2.6 - 1.3
        P = np.stack([a, 0.35 * np.sin(a * 2.2), (v - 0.5) * 0.35 * (1 - np.abs(a) / 1.4)], -1)
    elif kind == "musician":     # waveform
        a = u * 2.4 - 1.2
        amp = 0.45 * np.exp(-a * a * 1.2)
        P = np.stack([a, amp * np.sin(a * 14 + v * 0.3), (v - 0.5) * 0.08], -1)
    elif kind == "filmmaker":    # three frames of a strip
        k = rng.integers(0, 3, n); e = rng.integers(0, 4, n); tt = v
        fx = (k - 1) * 0.72
        ex = np.where(e < 2, fx - 0.3 + tt * 0.6, fx + np.where(e == 2, -0.3, 0.3))
        ey = np.where(e < 2, np.where(e == 0, -0.22, 0.22), -0.22 + tt * 0.44)
        P = np.stack([ex, ey, np.zeros(n)], -1)
    elif kind == "dancer":       # rising spiral
        a = u * 4 * np.pi
        P = np.stack([0.45 * np.cos(a) * (0.4 + u), u * 1.4 - 0.7, 0.45 * np.sin(a) * (0.4 + u)], -1)
    elif kind == "photographer": # aperture: hexagonal iris blades
        a = u * 2 * np.pi; blade = np.floor(a / (np.pi / 3))
        rad = 0.55 + 0.12 * np.cos(6 * a) + (v - 0.5) * 0.08
        P = np.stack([rad * np.cos(a + v * 0.15), rad * np.sin(a + v * 0.15), np.zeros(n)], -1)
    else:                        # writer: lines of text
        line = rng.integers(0, 5, n); length = 1.0 - 0.25 * (line == 4)
        P = np.stack([-0.6 + u * 1.2 * length, 0.4 - line * 0.2, np.zeros(n)], -1)
        P[:, 0] += (np.floor(u * 38) % 7 == 0) * 0.02  # word gaps
    return P + w


# ---- concept 1: creative convergence (hero) ---------------------------------
class Hero:
    def __init__(self, W, H, seed=7, per=3400, portrait=False):
        rng = np.random.default_rng(seed)
        self.W, self.H, self.portrait = W, H, portrait
        # sculpture placed right of centre on desktop (text-safe left 44%), upper on portrait
        self.center = np.array([1.6, 0.2, 0.0]) if not portrait else np.array([0.0, 1.75, 0.0])
        ring_r = 2.9 if not portrait else 2.15
        P, C, K, S, ph, T0 = [], [], [], [], [], []
        for i, (name, col) in enumerate(DISCIPLINES):
            n = per
            ang = -np.pi / 2 + i * (2 * np.pi / 6) + 0.3
            home = self.center + np.array([np.cos(ang) * ring_r * (0.68 if not portrait else 1.0), (0.62 if not portrait else 0.77) * np.sin(ang) * 1.6 + 0.15, np.sin(ang + 0.9) * 1.1])
            shape = cluster_shape(name, n, rng) * (0.62 if not portrait else 0.6)
            P.append(home + shape); C.append(np.repeat(col[None], n, 0))
            K.append(np.full(n, i)); S.append(rng.random(n)); ph.append(rng.random(n))
            T0.append(np.repeat(home[None], n, 0))
        self.home = np.concatenate(P); self.col = np.concatenate(C); self.kind = np.concatenate(K)
        self.s = np.concatenate(S); self.phase = np.concatenate(ph)
        n = len(self.s)
        self.tube = rng.random(n) * 2 * np.pi
        self.tr = 0.05 + 0.13 * rng.random(n) ** 2
        self.size = 0.45 + rng.random(n) ** 3 * 1.6
        self.bright = 0.55 + 0.45 * rng.random(n)
        # core motes (always in sculpture)
        m = 5000
        self.core_s = rng.random(m); self.core_t = rng.random(m) * 2 * np.pi; self.core_r = 0.02 + 0.1 * rng.random(m)
        self.core_c = np.where(rng.random(m)[:, None] < 0.5, WHITE, np.where(rng.random(m)[:, None] < 0.5, CORAL, BLUE_L))
        self.core_b = 0.3 + 0.7 * rng.random(m)
        self.scale = 0.95 if not portrait else 0.9

    def sculpt(self, s, tube, tr, t, T):
        base = knot(s) * self.scale
        # tube offset (approximate normal = radial + vertical)
        rad = np.stack([np.cos(tube), np.sin(tube), np.zeros_like(tube)], -1)
        wob = 1 + 0.08 * np.sin(2 * np.pi * (t / T) + s * 12)
        return base + rad * (tr * wob)[:, None]

    def rot(self, P, t, T):
        a = 0.35 * math.sin(2 * math.pi * t / T)         # gentle sway, periodic
        b = 0.10 * math.sin(2 * math.pi * t / T + 1.3)
        ca, sa = math.cos(a), math.sin(a); cb, sb = math.cos(b), math.sin(b)
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        x, z = ca * x + sa * z, -sa * x + ca * z
        y, z = cb * y - sb * z, sb * y + cb * z
        return np.stack([x, y, z], -1)

    def state(self, t, T, intro=None):
        u = (t / T + self.phase) % 1.0
        # life: 0-.22 at home (cluster), .22-.5 travel, .5-1 in sculpture
        inside_s = (self.s + (u - 0.5) * 0.35) % 1.0
        tgt = self.center + self.rot(self.sculpt(inside_s, self.tube + u * 3, self.tr, t, T), t, T)
        # home drifts with its own signature motion
        homej = self.home + 0.03 * np.stack([np.sin(2 * np.pi * (t / T) + self.s * 9), np.cos(2 * np.pi * (t / T) * 2 + self.s * 7), 0 * self.s], -1)
        k = ease_io((u - 0.22) / 0.28)
        # curved path: lift through a control point above the midpoint
        mid = (homej + tgt) / 2 + np.array([0, 0.9, 0]) * (1 - np.abs(self.kind[:, None] - 2.5) / 3)
        P = (1 - k)[:, None] ** 2 * homej + 2 * ((1 - k) * k)[:, None] * mid + (k ** 2)[:, None] * tgt
        a = np.where(u < 0.06, u / 0.06, np.where(u > 0.93, (1 - u) / 0.07, 1.0))
        a = a * np.where(u < 0.22, 0.55, 1.0) * self.bright
        col = self.col.copy()
        # warm up as they arrive: blend towards white at the join
        glow = np.exp(-((u - 0.5) / 0.05) ** 2)[:, None]
        col = col * (1 - 0.35 * glow) + WHITE * 0.35 * glow
        if intro is not None:  # build from scattered clusters into the loop's frame-0 state
            d = np.clip((intro - self.kind / 12.0 * 0.8 - 0.05) / 0.6, 0, 1)
            e = ease_io(d)
            P = homej * (1 - e)[:, None] + P * e[:, None]
            a = a * (0.6 + 0.4 * e)
        # core
        cs = (self.core_s + t / T) % 1.0
        CP = self.center + self.rot(self.sculpt(cs, self.core_t + t / T * 6, self.core_r, t, T), t, T)
        ca = self.core_b * (0.7 + 0.3 * np.sin(2 * np.pi * (t / T) * 2 + self.core_s * 20))
        if intro is not None:
            ca = ca * smooth((intro - 0.35) / 0.5)
        return np.concatenate([P, CP]), np.concatenate([col, self.core_c]), np.concatenate([a, ca]), np.concatenate([self.size, np.full(len(cs), 0.7)])

    def render(self, t, T, intro=None):
        W, H = self.W, self.H
        cam = Camera(W, H, dist=5.6 if not self.portrait else 6.4, tilt=0.26, cy=0.25 if not self.portrait else 0.45,
                     scale=W if not self.portrait else W * 1.35)
        P, col, a, sz = self.state(t, T, intro)
        fr = Frame(W, H)
        sx, sy, zz = cam.project(P)
        depth = np.clip(1.25 - (zz - 6) * 0.18, 0.4, 1.4)
        fr.splat(sx, sy, col, a * sz * depth * (1.0 if not self.portrait else 0.72))
        # reflection on the floor plane y = floor
        floor = -1.05 if not self.portrait else 0.55
        Pr = P.copy(); Pr[:, 1] = 2 * floor - Pr[:, 1]
        rx, ry, _ = cam.project(Pr)
        fr.splat(rx, ry, col, a * sz * 0.5, target="refl")
        fx, fy, _ = cam.project(np.array([[self.center[0], floor, 0.0]]))
        ring_on = 1.0 if intro is None else smooth((intro - 0.2) / 0.6)
        rings = [(cx, cy, rx_, ry_, al * ring_on, c) for (cx, cy, rx_, ry_, al, c) in
                 rings_for(t, T, fx[0], fy[0], W * (0.13 if not self.portrait else 0.36), n=3, aspect=0.22)]
        return fr.compose(floor_y=fy[0] - 4, rings=rings, haze=(0.62, 0.55) if not self.portrait else (0.5, 0.3))


# ---- concept 2: cross-discipline collaboration ------------------------------
class Collab:
    def __init__(self, W, H, seed=11, n=9000):
        rng = np.random.default_rng(seed)
        self.W, self.H = W, H
        self.n = n
        # form A: coral brush sphere (painter). form B: blue waveform ring (musician/filmmaker)
        th = np.arccos(1 - 2 * rng.random(n)); ph = rng.random(n) * 2 * np.pi
        self.A = np.stack([np.sin(th) * np.cos(ph), np.cos(th), np.sin(th) * np.sin(ph)], -1) * (0.72 + 0.06 * rng.standard_normal(n))[:, None]
        a = rng.random(n) * 2 * np.pi
        rb = 0.85 + 0.07 * rng.standard_normal(n)
        self.B = np.stack([np.cos(a) * rb, 0.22 * np.sin(a * 7) + 0.06 * rng.standard_normal(n), np.sin(a) * rb], -1)
        self.bph = a
        # shared composition: interlocking double helix ribbon (coral + blue braided)
        s = rng.random(n); strand = rng.integers(0, 2, n)
        ang = s * 4 * np.pi + strand * np.pi
        self.S = np.stack([np.cos(ang) * 0.55 * (1 - 0.3 * np.abs(s - 0.5)), (s - 0.5) * 2.3, np.sin(ang) * 0.55], -1) + rng.standard_normal((n, 3)) * 0.03
        self.strand = strand
        self.cross = rng.random(n) < 0.3           # particles that travel to the other form
        self.delay = rng.random(n)
        self.size = 0.5 + rng.random(n) ** 3 * 1.5
        self.bright = 0.5 + 0.5 * rng.random(n)

    def render(self, t, T):
        W, H = self.W, self.H
        u = t / T
        n = self.n; half = n // 2
        spin = 2 * np.pi * u
        # forms
        ca, sa = math.cos(spin), math.sin(spin)
        A = self.A.copy(); A[:, 0], A[:, 2] = ca * self.A[:, 0] + sa * self.A[:, 2], -sa * self.A[:, 0] + ca * self.A[:, 2]
        B = self.B.copy(); B[:, 1] = 0.22 * np.sin(self.bph * 7 + spin * 2)
        tilt = 0.6; cb, sb = math.cos(tilt), math.sin(tilt)
        B[:, 1], B[:, 2] = cb * B[:, 1] - sb * B[:, 2], sb * B[:, 1] + cb * B[:, 2]
        # timeline (periodic): approach .0-.3, exchange .25-.55, merge .45-.75, separate .8-1
        approach = smooth(u / 0.3) * (1 - smooth((u - 0.8) / 0.2))
        merge = smooth((u - 0.45) / 0.25) * (1 - smooth((u - 0.78) / 0.14))
        sep = 1.5 - 0.75 * approach
        OFF = np.array([1.25, 0, 0])
        posA = np.array([-sep, 0.1, 0]) + OFF; posB = np.array([sep, 0.1, 0]) + OFF
        isA = np.arange(n) < half
        base = np.where(isA[:, None], A[:] + posA, B[:] + posB)
        # exchange arcs: crossing particles travel to the other form and back
        ex = smooth((u - 0.25 - self.delay * 0.15) / 0.2) * (1 - smooth((u - 0.82 - self.delay * 0.06) / 0.14))
        other = np.where(isA[:, None], B + posB, A + posA)
        k = (ex * self.cross)[:, None]
        mid = (base + other) / 2 + np.array([0, 0.9, 0]) * np.where(isA, 1, -1)[:, None]
        cross_pos = (1 - k) ** 2 * base + 2 * (1 - k) * k * mid + k ** 2 * other
        # shared composition
        Srot = self.S.copy(); Srot[:, 0], Srot[:, 2] = ca * self.S[:, 0] + sa * self.S[:, 2], -sa * self.S[:, 0] + ca * self.S[:, 2]
        P = cross_pos * (1 - merge) + (Srot + np.array([0, 0.1, 0]) + OFF) * merge
        colA = np.where(isA[:, None], CORAL, BLUE)
        colX = np.where(isA[:, None], BLUE_L, ORANGE)
        col = colA * (1 - k) + colX * k
        colS = np.where(self.strand[:, None] == 0, CORAL, BLUE_L)
        col = col * (1 - merge) + (colS * 0.8 + WHITE * 0.2) * merge
        cam = Camera(W, H, dist=6.2, tilt=0.18, cy=0.1, scale=W)
        sx, sy, zz = cam.project(P)
        a = self.bright * self.size * np.clip(1.25 - (zz - 6) * 0.2, 0.4, 1.4) * 1.05
        fr = Frame(W, H)
        fr.splat(sx, sy, col, a)
        floor = -1.35
        Pr = P.copy(); Pr[:, 1] = 2 * floor - Pr[:, 1]
        rx, ry, _ = cam.project(Pr); fr.splat(rx, ry, col, a * 0.5, target="refl")
        fx, fy, _ = cam.project(np.array([[OFF[0], floor, 0.0]]))
        rings = rings_for(t, T, fx[0], fy[0], W * 0.13, n=2, strength=0.35 * (0.3 + 0.7 * merge + 0.3), aspect=0.2)
        return fr.compose(floor_y=fy[0] - 4, rings=rings, haze=(0.64, 0.55))


# ---- concept 3: shared support (loyalty) ------------------------------------
class Loyalty:
    def __init__(self, W, H, seed=23, per=2200):
        rng = np.random.default_rng(seed)
        self.W, self.H = W, H
        cols = [CORAL, ORANGE, WHITE, NAVY_L, BLUE_L]
        starts = [(-3.0, 2.0), (-1.6, 2.6), (0.2, 2.9), (1.8, 2.5), (3.1, 1.8)]
        S, C, ph, off = [], [], [], []
        for i, (c, st) in enumerate(zip(cols, starts)):
            S.append(np.repeat(np.array([[st[0] * 0.8 + 1.15, st[1], -0.4 + 0.2 * i]]), per, 0)); C.append(np.repeat(c[None], per, 0))
            ph.append(rng.random(per)); off.append(rng.standard_normal((per, 3)) * np.array([0.06, 0.06, 0.06]))
        self.start = np.concatenate(S); self.col = np.concatenate(C); self.phase = np.concatenate(ph); self.off = np.concatenate(off)
        n = len(self.phase)
        self.size = 0.5 + rng.random(n) ** 3 * 1.4
        self.bright = 0.5 + 0.5 * rng.random(n)
        # reservoir: lens-shaped pool of light
        m = 9000
        r = np.sqrt(rng.random(m)) * 1.35; a = rng.random(m) * 2 * np.pi
        self.pool_r, self.pool_a = r, a
        self.pool_y = (rng.random(m) - 0.5) * 0.18 * (1 - (r / 1.35) ** 2)
        self.pool_b = 0.35 + 0.65 * rng.random(m)
        self.pool_c = np.where(rng.random(m)[:, None] < 0.75, BLUE, np.where(rng.random(m)[:, None] < 0.6, BLUE_L, WHITE))

    def render(self, t, T):
        W, H = self.W, self.H
        u = (t / T + self.phase) % 1.0
        pool = np.array([1.15, -0.75, 0.0])
        k = ease_io(u)
        mid = (self.start + pool) / 2 + np.array([0, 0.6, 0])
        P = (1 - k)[:, None] ** 2 * self.start + 2 * ((1 - k) * k)[:, None] * mid + (k ** 2)[:, None] * pool + self.off * (1 - k)[:, None] * 3
        # arriving particles turn loyalty blue — all points become one shared balance
        tb = smooth((u - 0.7) / 0.3)[:, None]
        col = self.col * (1 - tb) + BLUE_L * tb
        a = self.bright * self.size * np.where(u < 0.08, u / 0.08, np.where(u > 0.9, (1 - u) / 0.1, 1.0)) * 0.5
        # pool swirl (periodic)
        ang = self.pool_a + 2 * np.pi * (t / T) * (0.5 / (0.3 + self.pool_r))
        ang = self.pool_a + 2 * np.pi * (t / T) * np.round(1.5 / (0.3 + self.pool_r))
        PP = np.stack([np.cos(ang) * self.pool_r, self.pool_y + 0.03 * np.sin(2 * np.pi * t / T * 2 + self.pool_r * 6), np.sin(ang) * self.pool_r * 0.9], -1) + pool
        pb = self.pool_b * (0.75 + 0.25 * np.sin(2 * np.pi * t / T + self.pool_a * 3))
        Pall = np.concatenate([P, PP]); call = np.concatenate([col, self.pool_c]); aall = np.concatenate([a, pb * 0.6])
        cam = Camera(W, H, dist=6.4, tilt=0.42, cy=0.3, scale=W)
        sx, sy, zz = cam.project(Pall)
        fr = Frame(W, H)
        fr.splat(sx, sy, call, aall * np.clip(1.25 - (zz - 6) * 0.2, 0.4, 1.4))
        fx, fy, _ = cam.project(pool[None])
        rings = rings_for(t, T, fx[0], fy[0], W * 0.2, n=3, col=BLUE, col2=BLUE_L, strength=0.4, aspect=0.3)
        return fr.compose(rings=rings, haze=(0.64, 0.7))


def main():
    concept, W, H, secs, fps, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
    stills = None
    if len(sys.argv) > 7 and sys.argv[7] == "--frames":
        stills = [float(x) for x in sys.argv[8].split(",")]
    portrait = H > W
    T = 12.0 if concept.startswith("hero") else 10.0
    if concept in ("hero", "hero-intro"):
        scene = Hero(W, H, portrait=portrait)
    elif concept == "collab":
        scene = Collab(W, H)
    else:
        scene = Loyalty(W, H)
    def frame(i_t, intro=None):
        if concept == "hero-intro":
            return scene.render(0.0, T, intro=i_t)
        return scene.render(i_t, T) if concept != "hero" else scene.render(i_t, T)
    if stills:
        from PIL import Image
        for k, ft in enumerate(stills):
            img = frame(ft if concept != "hero-intro" else ft)
            Image.fromarray(img).save(f"{out}_{k}.png")
        return
    n = int(round(secs * fps))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{out}.mp4"], stdin=subprocess.PIPE)
    for i in range(n):
        if concept == "hero-intro":
            img = scene.render((i / fps - secs) % T, T, intro=i / (n - 1))
        else:
            img = scene.render(i / fps, T)
        ff.stdin.write(img.tobytes())
    ff.stdin.close(); ff.wait()


if __name__ == "__main__":
    main()
