#!/usr/bin/env python3
"""다국어 홈페이지 빌드 — index.html(국문 원본) → en/ ja/ vi/index.html

  python3 scripts/build_i18n.py extract   # 번역이 필요한 문자열을 i18n/ko.json에 뽑는다
  python3 scripts/build_i18n.py build     # i18n/<lang>.json으로 언어별 페이지를 만든다
  python3 scripts/build_i18n.py check     # 빠진 번역만 보고(빌드 안 함)

번역 단위
  - 블록 단위(UNIT_TAGS): 한글이 든 제목·문단·목록·캡션·버튼·링크 등은 안쪽 HTML 전체가 한 단위다.
    값도 HTML이며, 원문의 인라인 태그(span.g, b, br 등)는 번역문에서 자리를 옮겨도 된다.
  - 속성: alt·aria-label·placeholder·title·content·data-topic·data-auto 에 든 한글.
  - 그 밖의 한글 텍스트 노드(칩, 라벨 앞 글자 등)는 텍스트 노드 단위.
번역이 없는 단위는 국문 그대로 두고 build 끝에 목록을 출력한다.
표준 라이브러리만 쓴다.
"""
import html, json, os, re, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index.html")
I18N = os.path.join(ROOT, "i18n")
LANGS = {"en": "en", "ja": "ja", "vi": "vi"}
OG_LOCALE = {"ko": "ko_KR", "en": "en_US", "ja": "ja_JP", "vi": "vi_VN"}
BASE_URL = "https://wickedstorm.kr/"

HANGUL = re.compile(r"[가-힣]")
UNIT_TAGS = {"title", "h1", "h2", "h3", "p", "li", "figcaption", "button", "option", "a", "dt", "dd"}
INLINE_OK = {"span", "b", "strong", "em", "i", "br", "a", "small", "img"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
# data-auto(유입 경로 자동값)는 서버 집계가 섞이지 않도록 번역하지 않는다
ATTRS = ("alt", "aria-label", "placeholder", "title", "content", "data-topic")
SKIP_TAGS = {"script", "style"}


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


class Node:
    __slots__ = ("tag", "attrs", "children", "parent", "raw")

    def __init__(self, tag, attrs, parent, raw):
        self.tag, self.attrs, self.children, self.parent, self.raw = tag, attrs, [], parent, raw


class TreeBuilder(HTMLParser):
    """원문 서식을 최대한 보존하는 간이 트리. 텍스트는 str, 주석·선언은 ('raw', 문자열)."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node("#root", [], None, "")
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur, self.get_starttag_text())
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur, self.get_starttag_text()))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, d):
        self.cur.children.append(d)

    def handle_entityref(self, name):
        self.cur.children.append(f"&{name};")

    def handle_charref(self, name):
        self.cur.children.append(f"&#{name};")

    def handle_comment(self, d):
        self.cur.children.append(("raw", f"<!--{d}-->"))

    def handle_decl(self, d):
        self.cur.children.append(("raw", f"<!{d}>"))


def parse(text):
    b = TreeBuilder()
    b.feed(text)
    b.close()
    return b.root


def start_tag(n, attrs=None):
    if attrs is None:
        return n.raw
    parts = [n.tag]
    for k, v in attrs:
        parts.append(k if v is None else f'{k}="{html.escape(v, quote=True)}"')
    return "<" + " ".join(parts) + (">" if not n.raw.rstrip().endswith("/>") else " />")


def serialize(n, tr=None):
    """tr: 번역기(없으면 원문 그대로)."""
    out = []
    for c in n.children:
        if isinstance(c, str):
            out.append(tr.text(c) if tr and not tr.skip_depth else c)
        elif isinstance(c, tuple):
            out.append(c[1])
        else:
            out.append(serialize_node(c, tr))
    return "".join(out)


def end_name(n):
    """원문 대소문자 그대로의 태그 이름(SVG linearGradient 등)."""
    m = re.match(r"<\s*([^\s>/]+)", n.raw or "")
    return m.group(1) if m else n.tag


def serialize_node(n, tr=None):
    attrs = tr.attrs(n) if tr else None
    head = start_tag(n, attrs)
    close = f"</{end_name(n)}>"
    if n.tag in VOID:
        return head
    if tr and n.tag in SKIP_TAGS:
        tr.skip_depth += 1
        inner = serialize(n, tr)
        tr.skip_depth -= 1
        return head + inner + close
    if tr and tr.is_unit(n):
        key = norm(serialize(n))
        val = tr.lookup(key)
        if val is not None:
            return head + val + close
    return head + serialize(n, tr) + close


def has_hangul_text(n):
    for c in n.children:
        if isinstance(c, str) and HANGUL.search(c):
            return True
        if isinstance(c, Node) and c.tag not in SKIP_TAGS and has_hangul_text(c):
            return True
    return False


def only_inline(n):
    for c in n.children:
        if isinstance(c, Node):
            if c.tag not in INLINE_OK or not only_inline(c):
                return False
    return True


def contains_unit(n):
    for c in n.children:
        if isinstance(c, Node) and ((c.tag in UNIT_TAGS and has_hangul_text(c)) or contains_unit(c)):
            return True
    return False


class Translator:
    def __init__(self, table, collect=None):
        self.table, self.collect, self.missing, self.skip_depth = table, collect, [], 0

    def is_unit(self, n):
        return n.tag in UNIT_TAGS and has_hangul_text(n) and only_inline(n) and not contains_unit(n)

    def lookup(self, key):
        if self.collect is not None:
            self.collect.setdefault(key, "")
            return None
        v = self.table.get(key)
        if not v:
            self.missing.append(key)
            return None
        return v

    def text(self, s):
        if not HANGUL.search(s):
            return s
        key = norm(s)
        v = self.lookup(key)
        if v is None:
            return s
        lead = s[: len(s) - len(s.lstrip())]
        trail = s[len(s.rstrip()):]
        return lead + v + trail

    def attrs(self, n):
        """바꾼 속성이 있을 때만 새 목록을 돌려준다(없으면 None → 원문 태그 그대로)."""
        res, changed = [], False
        for k, v in n.attrs:
            if v is not None and k in ATTRS and HANGUL.search(v):
                t = self.lookup(norm(v))
                if t is not None:
                    v, changed = t, True
            res.append((k, v))
        return res if changed else None


def extract():
    root = parse(open(SRC, encoding="utf-8").read())
    keys = {}
    tr = Translator({}, collect=keys)
    serialize(root, tr)
    os.makedirs(I18N, exist_ok=True)
    path = os.path.join(I18N, "ko.json")
    json.dump({k: k for k in keys}, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(keys)}개 단위 → {os.path.relpath(path, ROOT)}")


# ---------- 언어별 후처리: 경로·메타·hreflang ----------
def relink(text):
    """하위 폴더(en/ 등)에 놓이므로 ./ 로 시작하는 상대 경로를 ../ 로 바꾼다."""
    return re.sub(r'((?:href|src|poster|content)=")\./', r"\1../", text)


def post(lang, text):
    text = relink(text)
    text = text.replace('<html lang="ko"', f'<html lang="{lang}" data-base="../"', 1)
    text = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{BASE_URL}{lang}/">', text, count=1)
    text = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{BASE_URL}{lang}/">', text, count=1)
    text = re.sub(r'<meta property="og:locale" content="[^"]*">', f'<meta property="og:locale" content="{OG_LOCALE[lang]}">', text, count=1)
    text = text.replace(f"{BASE_URL}img/og-home.jpg", f"{BASE_URL}img/og-home-{lang}.jpg")
    # 언어별 파이프라인 루프 영상(없으면 국문 영상 유지)
    for ext in ("mp4", "webp"):
        name = "pipeline-loop" if ext == "mp4" else "pipeline-poster"
        if os.path.exists(os.path.join(ROOT, "media", f"{name}-{lang}.{ext}")):
            text = text.replace(f"../media/{name}.{ext}", f"../media/{name}-{lang}.{ext}")
    # 언어 스위처 현재 표시
    text = text.replace('aria-current="true" data-lang="ko"', 'data-lang="ko"')
    text = text.replace(f'data-lang="{lang}"', f'aria-current="true" data-lang="{lang}"')
    return text


def build(check_only=False):
    src = open(SRC, encoding="utf-8").read()
    root = parse(src)
    ko_keys = json.load(open(os.path.join(I18N, "ko.json"), encoding="utf-8"))
    report = {}
    for lang in LANGS:
        path = os.path.join(I18N, f"{lang}.json")
        table = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
        tr = Translator(table)
        out = serialize(root, tr)
        missing = sorted(set(tr.missing))
        stale = sorted(k for k in table if k not in ko_keys)
        report[lang] = (missing, stale)
        if check_only:
            continue
        os.makedirs(os.path.join(ROOT, lang), exist_ok=True)
        open(os.path.join(ROOT, lang, "index.html"), "w", encoding="utf-8").write(post(lang, out))
    for lang, (missing, stale) in report.items():
        print(f"[{lang}] 빠진 번역 {len(missing)}개, 원문에 없는 키 {len(stale)}개")
        for k in missing[:20]:
            print("   -", k[:90])
    if any(m for m, _ in report.values()):
        sys.exit(1 if check_only else 0)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
    {"extract": extract, "build": build, "check": lambda: build(True)}[cmd]()
